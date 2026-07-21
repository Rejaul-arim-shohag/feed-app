import Constants from "expo-constants";
import { Platform } from "react-native";

import { FeedPost } from "@/components/feed";
import { getMe } from "@/services/auth/auth-api";
import {
    AuthUser,
    getAuthToken,
    getAuthUser,
    saveAuthUser,
} from "@/services/auth/auth-token-storage";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

type ApiSuccessOnly = {
    success: boolean;
    message: string;
};

type PostApiComment = {
    id: number;
    comment: string;
    name: string;
};

type PostApiLike = {
    id: number;
    userId: number;
    email: string;
};

type PostApiPost = {
    id: number;
    content: string;
    createdAt: string;
    name: string;
    email: string;
    likesCount: number;
    likes: PostApiLike[];
    comments: PostApiComment[];
};

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

function getDefaultPostsBaseUrl() {
    const expoHost = getExpoHost();

    if (expoHost) {
        return `http://${expoHost}:3000/api/v1`;
    }

    if (Platform.OS === "android") {
        return "http://10.0.2.2:3000/api/v1";
    }

    return "http://localhost:3000/api/v1";
}

const POSTS_BASE_URL = normalizeBaseUrl(
    process.env.EXPO_PUBLIC_API_BASE_URL ?? getDefaultPostsBaseUrl(),
);

async function requestWithAuth(
    path: string,
    method: "GET" | "POST" | "DELETE",
) {
    const token = await getAuthToken();

    let response: Response;
    try {
        response = await fetch(`${POSTS_BASE_URL}${path}`, {
            method,
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
    } catch {
        throw new Error(
            `Network error. Check API reachability: ${POSTS_BASE_URL}${path}`,
        );
    }

    const rawBody = await response.text();
    const hasJsonBody = rawBody.trim().length > 0;

    let body: ApiSuccessOnly | { message?: string } | null = null;
    if (hasJsonBody) {
        try {
            body = JSON.parse(rawBody) as ApiSuccessOnly | { message?: string };
        } catch {
            if (!response.ok) {
                throw new Error("Invalid server response. Expected JSON.");
            }
        }
    }

    if (!response.ok) {
        const message =
            body && "message" in body && typeof body.message === "string"
                ? body.message
                : "Request failed.";
        throw new Error(message);
    }

    if (body && "success" in body && body.success !== true) {
        throw new Error(body.message || "Request failed.");
    }

    return body;
}

function formatRelativeTime(dateIso: string) {
    const createdAt = new Date(dateIso).getTime();
    const now = Date.now();
    const diffSeconds = Math.max(1, Math.floor((now - createdAt) / 1000));

    if (diffSeconds < 60) {
        return `${diffSeconds}s`;
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
        return `${diffMinutes}m`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours}h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
}

function toHandle(email: string) {
    const [handle] = email.split("@");
    return handle || "user";
}

function isLikedByCurrentUser(post: PostApiPost, currentUser: AuthUser | null) {
    if (!currentUser || typeof currentUser.id !== "number") {
        return false;
    }

    return post.likes.some((like) => {
        if (like.userId === currentUser.id) {
            return true;
        }

        if (currentUser.email && like.email === currentUser.email) {
            return true;
        }

        return false;
    });
}

function mapPost(post: PostApiPost, currentUser: AuthUser | null): FeedPost {
    return {
        id: String(post.id),
        author: post.name,
        handle: toHandle(post.email),
        createdAt: formatRelativeTime(post.createdAt),
        text: post.content,
        likes: post.likesCount,
        reaction: isLikedByCurrentUser(post, currentUser) ? "like" : null,
        comments: post.comments.map((comment) => ({
            id: String(comment.id),
            author: comment.name,
            text: comment.comment,
        })),
    };
}

export async function getFeedPosts(): Promise<FeedPost[]> {
    const token = await getAuthToken();
    let currentUser = await getAuthUser();

    if (!currentUser && token) {
        try {
            const meResponse = await getMe();
            currentUser = meResponse.data;
            await saveAuthUser(currentUser);
        } catch {
            currentUser = null;
        }
    }

    let response: Response;
    try {
        response = await fetch(`${POSTS_BASE_URL}/posts`, {
            method: "GET",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
    } catch {
        throw new Error(
            `Network error. Check API reachability: ${POSTS_BASE_URL}/posts`,
        );
    }

    let body: ApiResponse<PostApiPost[]> | { message?: string };
    try {
        body = await response.json();
    } catch {
        throw new Error("Invalid server response. Expected JSON.");
    }

    if (!response.ok || !("success" in body) || body.success !== true) {
        const message =
            "message" in body && typeof body.message === "string"
                ? body.message
                : "Failed to fetch posts.";
        throw new Error(message);
    }

    return body.data.map((post) => mapPost(post, currentUser));
}

export async function likePost(postId: string) {
    await requestWithAuth(`/posts/${postId}/like`, "POST");
}

export async function unlikePost(postId: string) {
    await requestWithAuth(`/posts/${postId}/unlike`, "DELETE");
}
