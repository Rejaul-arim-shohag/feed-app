import Constants from "expo-constants";
import * as Device from "expo-device";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

type NotificationsModule = typeof import("expo-notifications");
type NotificationType = import("expo-notifications").Notification;

export interface PushNotificationState {
    expoPushToken?: string;
    notification?: NotificationType;
}

export const usePushNotifications = (): PushNotificationState => {
    const [expoPushToken, setExpoPushToken] = useState<string>();
    const [notification, setNotification] = useState<NotificationType>();

    const notificationListener = useRef<{ remove: () => void } | null>(null);
    const responseListener = useRef<{ remove: () => void } | null>(null);

    const isExpoGoAndroid =
        Platform.OS === "android" && Constants.appOwnership === "expo";

    const registerForPushNotificationsAsync = async (
        Notifications: NotificationsModule,
    ): Promise<string | undefined> => {
        if (!Device.isDevice) {
            console.warn("Push notifications require a physical device.");
            return;
        }

        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();

            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.warn("Push notifications permission not granted.");
            return;
        }

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }

        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId;

        if (!projectId) {
            throw new Error("Project ID not found.");
        }

        const token = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        return token.data;
    };

    useEffect(() => {
        let isMounted = true;

        if (isExpoGoAndroid) {
            return () => {
                isMounted = false;
            };
        }

        const setupNotifications = async () => {
            try {
                const Notifications = await import("expo-notifications");

                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowBanner: true,
                        shouldShowList: true,
                        shouldPlaySound: false,
                        shouldSetBadge: false,
                    }),
                });

                const token =
                    await registerForPushNotificationsAsync(Notifications);
                if (isMounted && token) {
                    setExpoPushToken(token);
                }

                notificationListener.current =
                    Notifications.addNotificationReceivedListener(
                        (incomingNotification) => {
                            if (isMounted) {
                                setNotification(incomingNotification);
                            }
                        },
                    );

                responseListener.current =
                    Notifications.addNotificationResponseReceivedListener(
                        (response) => {
                            console.log("Notification Response:", response);
                        },
                    );
            } catch (error) {
                console.warn("Push notifications setup skipped:", error);
            }
        };

        setupNotifications();

        return () => {
            isMounted = false;
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [isExpoGoAndroid]);

    return {
        expoPushToken,
        notification,
    };
};
