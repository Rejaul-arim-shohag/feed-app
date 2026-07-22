import * as Notifications from "expo-notifications";

export const requestNotificationPermission = async () => {
    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();

        finalStatus = status;
    }

    return finalStatus === "granted";
};
