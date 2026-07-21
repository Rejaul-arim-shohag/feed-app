import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type CreatePostFabProps = {
    onPress: () => void;
};

export function CreatePostFab({ onPress }: CreatePostFabProps) {
    return (
        <View style={styles.wrapper} pointerEvents="box-none">
            <View style={styles.glow} />
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                ]}
            >
                <ThemedText style={styles.plus}>+</ThemedText>
                <ThemedText style={styles.label}>Create Post</ThemedText>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 16,
    },
    glow: {
        position: "absolute",
        left: 30,
        right: 30,
        bottom: -6,
        height: 30,
        borderRadius: 999,
        backgroundColor: "#93C5FD",
        opacity: 0.32,
    },
    button: {
        minHeight: 58,
        borderRadius: 18,
        backgroundColor: "#0E63D8",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        shadowColor: "#0D1D2E",
        shadowOpacity: 0.28,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
        borderColor: "#3E88EC",
    },
    buttonPressed: {
        opacity: 0.9,
    },
    plus: {
        color: "#FFFFFF",
        fontSize: 24,
        lineHeight: 24,
        fontWeight: 800,
        marginTop: -3,
    },
    label: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: 800,
    },
});
