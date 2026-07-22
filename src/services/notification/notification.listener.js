import * as Notifications from "expo-notifications";

export const addNotificationReceivedListener = (callback) => {
    return Notifications.addNotificationReceivedListener(callback);
};

export const addNotificationResponseListener = (callback) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
};
