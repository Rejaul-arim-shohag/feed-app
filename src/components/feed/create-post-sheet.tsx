import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";

type CreatePostSheetProps = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (text: string) => void;
};

export function CreatePostSheet({
    visible,
    onClose,
    onSubmit,
}: CreatePostSheetProps) {
    const [text, setText] = useState("");

    useEffect(() => {
        if (!visible) {
            setText("");
        }
    }, [visible]);

    const canSubmit = text.trim().length > 0;

    const handleSubmit = () => {
        if (!canSubmit) {
            return;
        }

        onSubmit(text.trim());
        setText("");
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.modalRoot}
                behavior={Platform.select({
                    ios: "padding",
                    default: undefined,
                })}
            >
                <Pressable style={styles.backdrop} onPress={onClose} />

                <View style={styles.sheet}>
                    <View style={styles.handle} />

                    <ThemedText style={styles.title}>Create post</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Share what is on your mind.
                    </ThemedText>

                    <TextInput
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={500}
                        style={styles.input}
                        placeholder="Write your post text..."
                        placeholderTextColor="#7A8896"
                        textAlignVertical="top"
                    />

                    <ThemedText style={styles.count}>
                        {text.length}/500
                    </ThemedText>

                    <View style={styles.actions}>
                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => [
                                styles.secondaryButton,
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            <ThemedText style={styles.secondaryLabel}>
                                Cancel
                            </ThemedText>
                        </Pressable>

                        <Pressable
                            onPress={handleSubmit}
                            disabled={!canSubmit}
                            style={({ pressed }) => [
                                styles.primaryButton,
                                pressed && canSubmit && styles.buttonPressed,
                                !canSubmit && styles.primaryButtonDisabled,
                            ]}
                        >
                            <ThemedText style={styles.primaryLabel}>
                                Post
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(8, 22, 38, 0.56)",
    },
    sheet: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 12,
        borderTopWidth: 1,
        borderColor: "#D9E3F1",
    },
    handle: {
        width: 48,
        height: 5,
        borderRadius: 999,
        backgroundColor: "#C3CFDF",
        alignSelf: "center",
        marginBottom: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 800,
        color: "#0A1A31",
    },
    subtitle: {
        fontSize: 14,
        color: "#4B607B",
        lineHeight: 20,
        fontWeight: 600,
    },
    input: {
        minHeight: 160,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#C8D6E9",
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: "#0D1D2E",
        fontSize: 15,
        fontWeight: 600,
        backgroundColor: "#F5F8FE",
    },
    count: {
        alignSelf: "flex-end",
        marginTop: -6,
        color: "#60758F",
        fontSize: 12,
        fontWeight: 700,
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 2,
    },
    secondaryButton: {
        flex: 1,
        minHeight: 50,
        borderRadius: 14,
        backgroundColor: "#EDF2FA",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D4DEEB",
    },
    secondaryLabel: {
        color: "#344A66",
        fontWeight: 800,
    },
    primaryButton: {
        flex: 1,
        minHeight: 50,
        borderRadius: 14,
        backgroundColor: "#0E63D8",
        justifyContent: "center",
        alignItems: "center",
    },
    primaryButtonDisabled: {
        opacity: 0.45,
    },
    primaryLabel: {
        color: "#FFFFFF",
        fontWeight: 800,
    },
    buttonPressed: {
        opacity: 0.86,
    },
});
