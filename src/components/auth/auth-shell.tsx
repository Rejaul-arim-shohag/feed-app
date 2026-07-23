import { PropsWithChildren, ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";

type AuthShellProps = PropsWithChildren<{
    title: string;
    subtitle: string;
    footer?: ReactNode;
}>;

export function AuthShell({
    title,
    subtitle,
    footer,
    children,
}: AuthShellProps) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <View style={styles.background}>
                <View style={[styles.blob, styles.blobTop]} />
                <View style={[styles.blob, styles.blobBottom]} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.select({
                    ios: "padding",
                    default: undefined,
                })}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <ThemedText style={styles.eyebrow}>Techzu</ThemedText>
                        <ThemedText style={styles.title}>{title}</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            {subtitle}
                        </ThemedText>
                    </View>

                    <View style={styles.card}>{children}</View>

                    {footer ? (
                        <View style={styles.footer}>{footer}</View>
                    ) : null}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0B1B2B",
    },
    flex: {
        flex: 1,
    },
    background: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflow: "hidden",
    },
    blob: {
        position: "absolute",
        borderRadius: 999,
        opacity: 0.35,
    },
    blobTop: {
        width: 280,
        height: 280,
        backgroundColor: "#1AA8FF",
        top: -90,
        right: -60,
    },
    blobBottom: {
        width: 320,
        height: 320,
        backgroundColor: "#FF7A59",
        bottom: -150,
        left: -80,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 28,
        gap: 20,
    },
    header: {
        gap: 8,
    },
    eyebrow: {
        color: "#8FD9FF",
        fontSize: 13,
        letterSpacing: 2,
        textTransform: "uppercase",
        fontWeight: 700,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 40,
        lineHeight: 46,
        fontWeight: 700,
    },
    subtitle: {
        color: "#B8CADB",
        fontSize: 16,
        lineHeight: 24,
        fontWeight: 500,
    },
    card: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 24,
        padding: 18,
        gap: 14,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.45)",
    },
    footer: {
        alignItems: "center",
    },
});
