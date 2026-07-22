import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export const getExpoPushToken = async () => {
    if (!Device.isDevice) {
        throw new Error("Push notifications require a physical device.");
    }

    const token = await Notifications.getExpoPushTokenAsync({
        projectId:
            Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId,
    });

    return token.data;
};
