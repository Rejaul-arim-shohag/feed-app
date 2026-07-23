import { usePushNotifications } from "@/services/notification/usePushNotifications";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CreatePostSheet, FeedPost, PostCard } from "@/components/feed";
import { ThemedText } from "@/components/themed-text";
import {
    addCommentToPost,
    createPost as createPostInApi,
    getFeedPosts,
    likePost,
    unlikePost,
} from "@/services/posts/post-api";

function applyLikeReaction(post: FeedPost) {
    if (post.reaction === "like") {
        return {
            ...post,
            likes: Math.max(0, post.likes - 1),
            reaction: null,
        };
    }

    return {
        ...post,
        likes: post.likes + 1,
        reaction: "like" as const,
    };
}

export default function HomeScreen() {
    const { expoPushToken, notification } = usePushNotifications();
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [isCreateSheetVisible, setCreateSheetVisible] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [isRefreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [pendingLikePostIds, setPendingLikePostIds] = useState<string[]>([]);

    const loadFeed = useCallback(async (isManualRefresh = false) => {
        if (isManualRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const fetchedPosts = await getFeedPosts();
            setPosts(fetchedPosts);
            setErrorMessage(null);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to load posts.";
            setErrorMessage(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadFeed();
    }, [loadFeed]);

    useEffect(() => {
        if (!expoPushToken) {
            return;
        }

        console.log("Expo Push Token:", expoPushToken);
    }, [expoPushToken]);

    useEffect(() => {
        if (!notification) {
            return;
        }

        console.log("Notification:", notification);
    }, [notification]);

    const updateReaction = async (postId: string) => {
        if (pendingLikePostIds.includes(postId)) {
            return;
        }

        const targetPost = posts.find((post) => post.id === postId);
        if (!targetPost) {
            return;
        }
        const wasLiked = targetPost.reaction === "like";

        setPosts((previous) =>
            previous.map((post) =>
                post.id === postId ? applyLikeReaction(post) : post,
            ),
        );
        setPendingLikePostIds((previous) => [...previous, postId]);

        try {
            if (wasLiked) {
                await unlikePost(postId);
            } else {
                await likePost(postId);
            }
        } catch (error) {
            setPosts((previous) =>
                previous.map((post) =>
                    post.id === postId ? applyLikeReaction(post) : post,
                ),
            );

            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to update like. Please try again.";
            Alert.alert("Like update failed", message);
        } finally {
            setPendingLikePostIds((previous) =>
                previous.filter((id) => id !== postId),
            );
        }
    };

    const addComment = async (postId: string, text: string) => {
        const temporaryCommentId = `temp-${Date.now()}-${Math.random()}`;

        setPosts((previous) =>
            previous.map((post) => {
                if (post.id !== postId) {
                    return post;
                }

                return {
                    ...post,
                    comments: [
                        ...post.comments,
                        {
                            id: temporaryCommentId,
                            author: "You",
                            text,
                        },
                    ],
                };
            }),
        );

        try {
            await addCommentToPost(postId, text);
        } catch (error) {
            setPosts((previous) =>
                previous.map((post) => {
                    if (post.id !== postId) {
                        return post;
                    }

                    return {
                        ...post,
                        comments: post.comments.filter(
                            (comment) => comment.id !== temporaryCommentId,
                        ),
                    };
                }),
            );

            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to add comment. Please try again.";
            Alert.alert("Comment failed", message);
        }
    };

    const createPost = async (text: string) => {
        const temporaryPostId = `temp-post-${Date.now()}-${Math.random()}`;

        setPosts((previous) => [
            {
                id: temporaryPostId,
                author: "You",
                handle: "you",
                createdAt: "now",
                text,
                likes: 0,
                reaction: null,
                comments: [],
            },
            ...previous,
        ]);
        setCreateSheetVisible(false);

        try {
            const createdPost = await createPostInApi(text);

            if (createdPost) {
                setPosts((previous) =>
                    previous.map((post) =>
                        post.id === temporaryPostId ? createdPost : post,
                    ),
                );
            }
        } catch (error) {
            setPosts((previous) =>
                previous.filter((post) => post.id !== temporaryPostId),
            );

            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to create post. Please try again.";
            Alert.alert("Create post failed", message);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <View pointerEvents="none" style={styles.backgroundLayer}>
                <View style={styles.blobTop} />
                <View style={styles.blobBottom} />
            </View>
            <View style={styles.header}>
                <Pressable
                    onPress={() => setCreateSheetVisible(true)}
                    style={({ pressed }) => [
                        styles.createButtonTop,
                        pressed && styles.createButtonTopPressed,
                    ]}
                >
                    <ThemedText style={styles.createButtonTopIcon}>
                        +
                    </ThemedText>
                    <ThemedText style={styles.createButtonTopText}>
                        Create Post
                    </ThemedText>
                </Pressable>
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => loadFeed(true)}
                    />
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={styles.stateContainer}>
                            <ActivityIndicator size="small" color="#0E63D8" />
                            <ThemedText style={styles.stateText}>
                                Loading posts...
                            </ThemedText>
                        </View>
                    ) : errorMessage ? (
                        <View style={styles.stateContainer}>
                            <ThemedText style={styles.errorText}>
                                {errorMessage}
                            </ThemedText>
                            <Pressable
                                onPress={() => loadFeed()}
                                style={({ pressed }) => [
                                    styles.retryButton,
                                    pressed && styles.retryButtonPressed,
                                ]}
                            >
                                <ThemedText style={styles.retryButtonText}>
                                    Retry
                                </ThemedText>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.stateContainer}>
                            <ThemedText style={styles.stateText}>
                                No posts yet.
                            </ThemedText>
                        </View>
                    )
                }
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onLike={updateReaction}
                        isLikeUpdating={pendingLikePostIds.includes(item.id)}
                        onAddComment={addComment}
                    />
                )}
            />

            <CreatePostSheet
                visible={isCreateSheetVisible}
                onClose={() => setCreateSheetVisible(false)}
                onSubmit={createPost}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#EAF2FF",
    },
    backgroundLayer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    blobTop: {
        position: "absolute",
        top: -120,
        right: -90,
        width: 280,
        height: 280,
        borderRadius: 999,
        backgroundColor: "#93C5FD",
        opacity: 0.35,
    },
    blobBottom: {
        position: "absolute",
        bottom: -160,
        left: -120,
        width: 340,
        height: 340,
        borderRadius: 999,
        backgroundColor: "#FCA5A5",
        opacity: 0.22,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    createButtonTop: {
        borderRadius: 14,
        backgroundColor: "#0E63D8",
        borderWidth: 1,
        borderColor: "#3E88EC",
        paddingHorizontal: 16,
        minHeight: 46,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
        shadowColor: "#0D1D2E",
        shadowOpacity: 0.2,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5,
    },
    createButtonTopPressed: {
        opacity: 0.9,
    },
    createButtonTopIcon: {
        color: "#FFFFFF",
        fontSize: 20,
        lineHeight: 20,
        fontWeight: 800,
        marginTop: -2,
    },
    createButtonTopText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: 800,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 24,
        gap: 14,
        flexGrow: 1,
    },
    stateContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 24,
    },
    stateText: {
        color: "#395678",
        fontSize: 14,
        fontWeight: 700,
    },
    errorText: {
        color: "#A53232",
        fontSize: 14,
        textAlign: "center",
        fontWeight: 700,
    },
    retryButton: {
        minHeight: 42,
        borderRadius: 12,
        backgroundColor: "#0E63D8",
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    retryButtonPressed: {
        opacity: 0.85,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontWeight: 800,
    },
});
