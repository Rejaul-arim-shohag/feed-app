import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type AuthSwitchLinkProps = {
    helperText: string;
    actionText: string;
    onPress: () => void;
};

export function AuthSwitchLink({
    helperText,
    actionText,
    onPress,
}: AuthSwitchLinkProps) {
    return (
        <View style={styles.row}>
            <ThemedText style={styles.helperText}>{helperText}</ThemedText>
            <Pressable
                onPress={onPress}
                style={({ pressed }) => pressed && styles.linkPressed}
            >
                <ThemedText style={styles.actionText}>{actionText}</ThemedText>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    helperText: {
        color: "#B8CADB",
        fontSize: 14,
        fontWeight: 500,
    },
    actionText: {
        color: "#8FD9FF",
        fontSize: 14,
        fontWeight: 700,
    },
    linkPressed: {
        opacity: 0.7,
    },
});
