import { router } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ThemedText style={styles.eyebrow}>Dashboard</ThemedText>
                <ThemedText style={styles.title}>Welcome back</ThemedText>
                <ThemedText style={styles.subtitle}>
                    This is your signed-in area. Start replacing this screen
                    with your app content.
                </ThemedText>

                <Pressable
                    onPress={() => router.replace("/")}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                >
                    <ThemedText style={styles.buttonText}>Sign out</ThemedText>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F6F8FC",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        gap: 12,
    },
    eyebrow: {
        fontSize: 13,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1.8,
        color: "#4A6180",
    },
    title: {
        fontSize: 36,
        lineHeight: 42,
        fontWeight: 700,
        color: "#0D1D2E",
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        color: "#4A6180",
        marginBottom: 10,
    },
    button: {
        alignSelf: "flex-start",
        backgroundColor: "#0D6EFD",
        borderRadius: 14,
        paddingHorizontal: 18,
        minHeight: 48,
        justifyContent: "center",
    },
    buttonPressed: {
        opacity: 0.9,
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: 700,
    },
});
