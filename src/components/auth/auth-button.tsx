import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";

type AuthButtonProps = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
};

export function AuthButton({
    label,
    onPress,
    disabled = false,
}: AuthButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.button,
                pressed && !disabled ? styles.buttonPressed : null,
                disabled ? styles.buttonDisabled : null,
            ]}
        >
            <ThemedText style={styles.label}>{label}</ThemedText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#0D6EFD",
        minHeight: 52,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 14,
        paddingHorizontal: 16,
    },
    buttonPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.9,
    },
    buttonDisabled: {
        opacity: 0.45,
    },
    label: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: 700,
    },
});
