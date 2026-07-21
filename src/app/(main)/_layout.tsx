import { Stack } from "expo-router";

export default function MainTabsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="explore" />
        </Stack>
    );
}
