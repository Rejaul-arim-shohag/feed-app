import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert } from "react-native";

import {
    AuthButton,
    AuthInput,
    AuthShell,
    AuthSwitchLink,
} from "@/components/auth";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const canSubmit = useMemo(
        () => email.trim().length > 4 && password.trim().length >= 6,
        [email, password],
    );

    const onLogin = () => {
        if (!canSubmit) {
            Alert.alert(
                "Missing details",
                "Enter a valid email and a 6+ character password.",
            );
            return;
        }

        router.replace("/(main)/home");
    };

    return (
        <AuthShell
            title="Sign in"
            subtitle="Access your workspace with a clean and fast auth flow."
            footer={
                <AuthSwitchLink
                    helperText="New here?"
                    actionText="Create account"
                    onPress={() => router.push("/signup")}
                />
            }
        >
            <AuthInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCapitalize="none"
            />

            <AuthInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry
                textContentType="password"
            />

            <AuthButton
                label="Sign in"
                onPress={onLogin}
                disabled={!canSubmit}
            />
        </AuthShell>
    );
}
