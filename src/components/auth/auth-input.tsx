import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type AuthInputProps = TextInputProps & {
    label: string;
};

export function AuthInput({ label, style, ...props }: AuthInputProps) {
    return (
        <View style={styles.wrapper}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor="#6E7E8D"
                autoCorrect={false}
                {...props}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        gap: 8,
    },
    label: {
        color: "#11253A",
        fontSize: 14,
        fontWeight: 700,
    },
    input: {
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#C4D4E2",
        paddingHorizontal: 14,
        color: "#0D1D2E",
        fontSize: 15,
        fontWeight: 500,
        backgroundColor: "#FFFFFF",
    },
});
