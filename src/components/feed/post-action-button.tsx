import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type PostActionButtonProps = {
    label: string;
    count: number;
    icon?: string;
    active?: boolean;
    onPress: () => void;
};

export function PostActionButton({
    label,
    count,
    icon,
    active = false,
    onPress,
}: PostActionButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                active && styles.buttonActive,
                pressed && styles.buttonPressed,
            ]}
        >
            <View style={styles.content}>
                <View style={[styles.dot, active && styles.dotActive]} />
                {icon ? (
                    <ThemedText
                        style={[styles.icon, active && styles.labelActive]}
                    >
                        {icon}
                    </ThemedText>
                ) : null}
                <ThemedText
                    style={[styles.label, active && styles.labelActive]}
                >
                    {label}
                </ThemedText>
                <ThemedText
                    style={[styles.count, active && styles.labelActive]}
                >
                    {count}
                </ThemedText>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flex: 1,
        minHeight: 42,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#D4DEEB",
        backgroundColor: "#F5F8FD",
        justifyContent: "center",
    },
    buttonActive: {
        backgroundColor: "#E7F0FF",
        borderColor: "#1666D9",
    },
    buttonPressed: {
        opacity: 0.85,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: "#9BACBF",
    },
    dotActive: {
        backgroundColor: "#1666D9",
    },
    icon: {
        color: "#2C435F",
        fontSize: 13,
        lineHeight: 16,
        fontWeight: 800,
    },
    label: {
        color: "#2C435F",
        fontSize: 13,
        fontWeight: 800,
    },
    count: {
        color: "#5E738B",
        fontSize: 13,
        fontWeight: 700,
    },
    labelActive: {
        color: "#1666D9",
    },
});
