import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

import {
  AuthButton,
  AuthInput,
  AuthShell,
  AuthSwitchLink,
} from "@/components/auth";
import { getMe, signIn } from "@/services/auth/auth-api";
import {
  getAuthToken,
  getAuthUser,
  saveAuthToken,
  saveAuthUser,
} from "@/services/auth/auth-token-storage";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const token = await getAuthToken();
                if (!token) {
                    return;
                }

                const existingUser = await getAuthUser();
                if (!existingUser) {
                    const meResponse = await getMe();
                    await saveAuthUser(meResponse.data);
                }

                router.replace("/(main)/home");
            } catch {
                // If session validation fails, keep user on login.
            } finally {
                setCheckingSession(false);
            }
        };

        checkSession();
    }, []);

    const canSubmit = useMemo(
        () =>
            email.trim().length > 4 &&
            password.trim().length >= 6 &&
            !isSubmitting &&
            !isCheckingSession,
        [email, password, isSubmitting, isCheckingSession],
    );

    if (isCheckingSession) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#0B1B2B",
                }}
            >
                <ActivityIndicator size="small" color="#8FD9FF" />
            </View>
        );
    }

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
            const meResponse = await getMe();
            await saveAuthUser(meResponse.data);

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
