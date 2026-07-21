import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert } from "react-native";

import {
  AuthButton,
  AuthInput,
  AuthShell,
  AuthSwitchLink,
} from "@/components/auth";
import { signIn } from "@/services/auth/auth-api";
import { saveAuthToken } from "@/services/auth/auth-token-storage";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = useMemo(
        () =>
            email.trim().length > 4 &&
            password.trim().length >= 6 &&
            !isSubmitting,
        [email, password, isSubmitting],
    );

    const onLogin = async () => {
        if (!canSubmit) {
            Alert.alert(
                "Missing details",
                "Enter a valid email and a 6+ character password.",
            );
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await signIn({
                email: email.trim(),
                password,
            });

            await saveAuthToken(response.data.token);

            router.replace("/(main)/home");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to sign in. Please try again.";
            Alert.alert("Sign in failed", message);
        } finally {
            setIsSubmitting(false);
        }
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
                label={isSubmitting ? "Signing in..." : "Sign in"}
                onPress={onLogin}
                disabled={!canSubmit}
            />
        </AuthShell>
    );
}
