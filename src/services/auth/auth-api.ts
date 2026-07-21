import Constants from "expo-constants";
import { Platform } from "react-native";

function normalizeBaseUrl(url: string) {
    return url.replace(/\/$/, "");
}

function getExpoHost() {
    const hostUri =
        Constants.expoConfig?.hostUri ??
        Constants.expoGoConfig?.debuggerHost ??
        null;

    if (!hostUri) {
        return null;
    }

    return hostUri.split(":")[0] ?? null;
}

function getDefaultAuthBaseUrl() {
    const expoHost = getExpoHost();

    if (expoHost) {
        return `http://${expoHost}:3000/api/v1/auth`;
    }

    if (Platform.OS === "android") {
        return "http://10.0.2.2:3000/api/v1/auth";
    }

    return "http://localhost:3000/api/v1/auth";
}

const AUTH_BASE_URL = normalizeBaseUrl(
    process.env.EXPO_PUBLIC_AUTH_API_URL ?? getDefaultAuthBaseUrl(),
);

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

type SignInPayload = {
    email: string;
    password: string;
};

type SignUpPayload = {
    name: string;
    email: string;
    password: string;
};

export type SignInData = {
    userId: number;
    name: string;
    email: string;
    token: string;
};

async function postJson<T>(
    path: string,
    payload: unknown,
): Promise<ApiResponse<T>> {
    let response: Response;

    try {
        response = await fetch(`${AUTH_BASE_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
    } catch {
        throw new Error(
            `Network error. Check API reachability: ${AUTH_BASE_URL}`,
        );
    }

    let parsedBody: ApiResponse<T> | { message?: string };
    try {
        parsedBody = await response.json();
    } catch {
        throw new Error("Invalid server response. Expected JSON.");
    }

    if (
        !response.ok ||
        !("success" in parsedBody) ||
        parsedBody.success !== true
    ) {
        const message =
            "message" in parsedBody && typeof parsedBody.message === "string"
                ? parsedBody.message
                : "Request failed. Please try again.";
        throw new Error(message);
    }

    return parsedBody;
}

export async function signIn(payload: SignInPayload) {
    return postJson<SignInData>("/signin", payload);
}

export async function signUp(payload: SignUpPayload) {
    return postJson<SignInData>("/signup", payload);
}
