import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { getAuthToken } from "@/services/auth/auth-token-storage";

type NotificationsModule = typeof import("expo-notifications");

function normalizeBaseUrl(url: string) {
    return url.replace(/\/$/, "");
}

function getExpoHost() {
    const hostUri =
        Constants.expoConfig?.hostUri ??
        Constants.expoGoConfig?.debuggerHost ??
        null;

    if (!hostUri) {
        return null;
    }

    return hostUri.split(":")[0] ?? null;
}

function getDefaultApiBaseUrl() {
    const expoHost = getExpoHost();

    if (expoHost) {
        return `http://${expoHost}:3000/api/v1`;
    }

    if (Platform.OS === "android") {
        return "http://10.0.2.2:3000/api/v1";
    }

    return "http://localhost:3000/api/v1";
}

const API_BASE_URL = normalizeBaseUrl(
    process.env.EXPO_PUBLIC_API_BASE_URL ?? getDefaultApiBaseUrl(),
);

const REGISTER_PUSH_TOKEN_PATH =
    process.env.EXPO_PUBLIC_PUSH_TOKEN_PATH ?? "/device-tokens/save-token";

let lastRegisteredToken: string | null = null;

function isUnsupportedExpoGoAndroid() {
    return Platform.OS === "android" && Constants.appOwnership === "expo";
}

async function getNotificationsModule(): Promise<NotificationsModule | null> {
    if (isUnsupportedExpoGoAndroid()) {
        return null;
    }

    return import("expo-notifications");
}

async function ensureAndroidNotificationChannel(
    Notifications: NotificationsModule,
) {
    if (Platform.OS !== "android") {
        return;
    }

    await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#3E88EC",
    });
}

async function fetchDevicePushToken(Notifications: NotificationsModule) {
    if (!Device.isDevice) {
        return null;
    }

    await ensureAndroidNotificationChannel(Notifications);

    const permissionStatus = await Notifications.getPermissionsAsync();
    let finalStatus = permissionStatus.status;

    if (finalStatus !== "granted") {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = requested.status;
    }

    if (finalStatus !== "granted") {
        return null;
    }

    const tokenResult = await Notifications.getDevicePushTokenAsync();

    return tokenResult.data;
}

async function sendPushTokenToServer(pushToken: string) {
    const authToken = await getAuthToken();
    if (!authToken) {
        return;
    }

    const deviceName =
        Device.deviceName ??
        Device.modelName ??
        Device.modelId ??
        Platform.select({
            ios: "iOS Device",
            android: "Android Device",
            default: "Unknown Device",
        });

    const response = await fetch(`${API_BASE_URL}${REGISTER_PUSH_TOKEN_PATH}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            fcmToken: pushToken,
            deviceName,
        }),
    });

    if (!response.ok) {
        throw new Error("Unable to register push token on server.");
    }
}

export async function configurePushForegroundBehavior() {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
        return;
    }

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

export async function registerDeviceForPushNotifications() {
    try {
        const Notifications = await getNotificationsModule();
        if (!Notifications) {
            return null;
        }

        const pushToken = await fetchDevicePushToken(Notifications);
        if (!pushToken) {
            return null;
        }

        if (lastRegisteredToken === pushToken) {
            return pushToken;
        }

        await sendPushTokenToServer(pushToken);
        lastRegisteredToken = pushToken;
        return pushToken;
    } catch (error) {
        console.warn("Push registration failed", error);
        return null;
    }
}

export async function addPushTokenRefreshListener(
    onNewToken?: (token: string) => Promise<void> | void,
) {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
        return null;
    }

    return Notifications.addPushTokenListener(async ({ data }) => {
        lastRegisteredToken = null;
        await registerDeviceForPushNotifications();
        if (onNewToken) {
            await onNewToken(data);
        }
    });
}

export async function addNotificationResponseListener(
    callback: (
        response: import("expo-notifications").NotificationResponse,
    ) => void,
) {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
        return null;
    }

    return Notifications.addNotificationResponseReceivedListener(callback);
}

export async function getInitialNotificationResponse() {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
        return null;
    }

    return Notifications.getLastNotificationResponseAsync();
}

export function getNotificationRouteFromResponse(
    response: import("expo-notifications").NotificationResponse | null,
) {
    if (!response) {
        return null;
    }

    const maybeUrl = (
        response.notification.request.content.data as { url?: unknown }
    ).url;
    return typeof maybeUrl === "string" ? maybeUrl : null;
}
