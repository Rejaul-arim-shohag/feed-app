import {
    addNotificationResponseListener,
    registerDeviceForPushNotifications,
} from "@/services/notification/push-registration";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

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

                const token = await registerDeviceForPushNotifications();
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
                    await addNotificationResponseListener((response) => {
                        console.log("Notification Response:", response);
                    });
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
