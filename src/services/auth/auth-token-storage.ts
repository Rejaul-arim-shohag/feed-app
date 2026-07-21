import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
};

export async function saveAuthToken(token: string) {
    if (Platform.OS === "web") {
        localStorage.setItem(TOKEN_KEY, token);
        return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, token, {
        keychainService: "techzu-auth",
    });
}

export async function getAuthToken() {
    if (Platform.OS === "web") {
        return localStorage.getItem(TOKEN_KEY);
    }

    return SecureStore.getItemAsync(TOKEN_KEY, {
        keychainService: "techzu-auth",
    });
}

export async function clearAuthToken() {
    if (Platform.OS === "web") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY, {
        keychainService: "techzu-auth",
    });

    await SecureStore.deleteItemAsync(USER_KEY, {
        keychainService: "techzu-auth",
    });
}

export async function saveAuthUser(user: AuthUser) {
    const serialized = JSON.stringify(user);

    if (Platform.OS === "web") {
        localStorage.setItem(USER_KEY, serialized);
        return;
    }

    await SecureStore.setItemAsync(USER_KEY, serialized, {
        keychainService: "techzu-auth",
    });
}

export async function getAuthUser(): Promise<AuthUser | null> {
    const raw =
        Platform.OS === "web"
            ? localStorage.getItem(USER_KEY)
            : await SecureStore.getItemAsync(USER_KEY, {
                  keychainService: "techzu-auth",
              });

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}
