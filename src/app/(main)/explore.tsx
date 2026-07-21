import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

const tips = [
    "Swap placeholder auth actions with real API calls.",
    "Store tokens safely with expo-secure-store.",
    "Add field-level error messages from backend responses.",
    "Gate protected routes by auth state in root layout.",
];

export default function ExploreScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ThemedText style={styles.title}>Next steps</ThemedText>
            <ThemedText style={styles.subtitle}>
                Use this checklist to continue building your auth flow.
            </ThemedText>

            <View style={styles.list}>
                {tips.map((tip) => (
                    <View key={tip} style={styles.item}>
                        <ThemedText style={styles.bullet}>•</ThemedText>
                        <ThemedText style={styles.itemText}>{tip}</ThemedText>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        gap: 14,
        backgroundColor: "#F6F8FC",
    },
    title: {
        fontSize: 32,
        lineHeight: 40,
        fontWeight: 700,
        color: "#0D1D2E",
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
        color: "#4A6180",
    },
    list: {
        marginTop: 8,
        gap: 10,
    },
    item: {
        flexDirection: "row",
        gap: 8,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DFE7F0",
        padding: 12,
    },
    bullet: {
        color: "#0D6EFD",
        fontWeight: 700,
        marginTop: 1,
    },
    itemText: {
        flex: 1,
        color: "#203349",
        lineHeight: 20,
    },
});
