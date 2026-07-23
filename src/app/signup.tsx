import {
    AuthButton,
    AuthInput,
    AuthShell,
    AuthSwitchLink,
} from "@/components/auth";
import { signUp } from "@/services/auth/auth-api";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert } from "react-native";

export default function SignupScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = useMemo(() => {
        return (
            name.trim().length >= 2 &&
            email.trim().length > 4 &&
            password.trim().length >= 6 &&
            confirmPassword.trim().length >= 6 &&
            !isSubmitting
        );
    }, [name, email, password, confirmPassword, isSubmitting]);

    const onSignup = async () => {
        if (!canSubmit) {
            Alert.alert(
                "Incomplete form",
                "Fill out all fields with valid values.",
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert(
                "Password mismatch",
                "Password and confirm password do not match.",
            );
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await signUp({
                name: name.trim(),
                email: email.trim(),
                password,
            });

            Alert.alert("Sign up successful", response.message);
            router.replace("/");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to create account. Please try again.";
            Alert.alert("Sign up failed", message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Create account"
            subtitle="Set up your account in under a minute and continue to your dashboard."
            footer={
                <AuthSwitchLink
                    helperText="Already have an account?"
                    actionText="Sign in"
                    onPress={() => router.replace("/")}
                />
            }
        >
            <AuthInput
                label="Full name"
                value={name}
                onChangeText={setName}
                placeholder="Alex Johnson"
                textContentType="name"
            />

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
                placeholder="At least 6 characters"
                secureTextEntry
                textContentType="newPassword"
            />

            <AuthInput
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat password"
                secureTextEntry
                textContentType="newPassword"
            />

            <AuthButton
                label={isSubmitting ? "Creating account..." : "Create account"}
                onPress={onSignup}
                disabled={!canSubmit}
            />
        </AuthShell>
    );
}
