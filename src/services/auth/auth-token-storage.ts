import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";

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
        return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY, {
        keychainService: "techzu-auth",
    });
}
