import {
    DarkTheme,
    DefaultTheme,
    Stack,
    ThemeProvider,
    router,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import {
    addNotificationResponseListener,
    addPushTokenRefreshListener,
    configurePushForegroundBehavior,
    getInitialNotificationResponse,
    getNotificationRouteFromResponse,
} from "@/services/notification/push-registration";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();

    useEffect(() => {
        let isActive = true;
        let responseSubscription: { remove: () => void } | null = null;
        let tokenSubscription: { remove: () => void } | null = null;

        const bootstrapPush = async () => {
            await configurePushForegroundBehavior();

            const initialResponse = await getInitialNotificationResponse();
            if (isActive) {
                const route = getNotificationRouteFromResponse(initialResponse);
                if (route) {
                    router.push(route as never);
                }
            }

            responseSubscription = await addNotificationResponseListener(
                (response) => {
                    const route = getNotificationRouteFromResponse(response);
                    if (route) {
                        router.push(route as never);
                    }
                },
            );

            tokenSubscription = await addPushTokenRefreshListener();
        };

        bootstrapPush();

        return () => {
            isActive = false;
            responseSubscription?.remove();
            tokenSubscription?.remove();
        };
    }, []);

    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <AnimatedSplashOverlay />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="signup" />
                <Stack.Screen name="(main)" />
            </Stack>
        </ThemeProvider>
    );
}
