import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { getAuthToken } from "@/services/auth/auth-token-storage";

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
    process.env.EXPO_PUBLIC_PUSH_TOKEN_PATH ?? "/notifications/register-token";

let lastRegisteredToken: string | null = null;

export function configurePushForegroundBehavior() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

async function ensureAndroidNotificationChannel() {
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

async function getExpoPushToken() {
    if (!Device.isDevice) {
        return null;
    }

    await ensureAndroidNotificationChannel();

    const permissionStatus = await Notifications.getPermissionsAsync();
    let finalStatus = permissionStatus.status;

    if (finalStatus !== "granted") {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = requested.status;
    }

    if (finalStatus !== "granted") {
        return null;
    }

    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

    if (!projectId) {
        throw new Error(
            "Missing EAS projectId. Add extra.eas.projectId to app config.",
        );
    }

    const tokenResult = await Notifications.getExpoPushTokenAsync({
        projectId,
    });

    return tokenResult.data;
}

async function sendPushTokenToServer(pushToken: string) {
    const authToken = await getAuthToken();

    if (!authToken) {
        return;
    }

    const response = await fetch(`${API_BASE_URL}${REGISTER_PUSH_TOKEN_PATH}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            token: pushToken,
            platform: Platform.OS,
        }),
    });

    if (!response.ok) {
        throw new Error("Unable to register push token on server.");
    }
}

export async function registerDeviceForPushNotifications() {
    try {
        const pushToken = await getExpoPushToken();

        if (!pushToken) {
            return;
        }

        if (lastRegisteredToken === pushToken) {
            return;
        }

        await sendPushTokenToServer(pushToken);
        lastRegisteredToken = pushToken;
    } catch (error) {
        // Do not block auth/navigation flow if notification setup fails.
        console.warn("Push registration failed", error);
    }
}
