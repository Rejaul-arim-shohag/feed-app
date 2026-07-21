import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { PostActionButton } from "@/components/feed/post-action-button";
import { FeedPost } from "@/components/feed/post-types";
import { ThemedText } from "@/components/themed-text";

type PostCardProps = {
    post: FeedPost;
    onLike: (postId: string) => void;
    isLikeUpdating?: boolean;
    onAddComment: (postId: string, text: string) => void;
};

export function PostCard({
    post,
    onLike,
    isLikeUpdating = false,
    onAddComment,
}: PostCardProps) {
    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(false);

    const hasCommentDraft = commentText.trim().length > 0;

    const submitComment = () => {
        if (!hasCommentDraft) {
            return;
        }

        onAddComment(post.id, commentText.trim());
        setCommentText("");
        setShowComments(true);
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.authorRow}>
                    <View style={styles.avatar}>
                        <ThemedText style={styles.avatarLabel}>
                            {post.author.slice(0, 1).toUpperCase()}
                        </ThemedText>
                    </View>
                    <View>
                        <ThemedText style={styles.author}>
                            {post.author}
                        </ThemedText>
                        <ThemedText style={styles.meta}>
                            @{post.handle} · {post.createdAt}
                        </ThemedText>
                    </View>
                </View>
            </View>

            <ThemedText style={styles.body}>{post.text}</ThemedText>

            <View style={styles.divider} />

            <View style={styles.actionRow}>
                <PostActionButton
                    label="Like"
                    icon="♥"
                    count={post.likes}
                    active={post.reaction === "like"}
                    disabled={isLikeUpdating}
                    onPress={() => onLike(post.id)}
                />
                <PostActionButton
                    label="Comment"
                    count={post.comments.length}
                    active={showComments}
                    onPress={() => setShowComments((previous) => !previous)}
                />
            </View>

            {showComments ? (
                <View style={styles.commentsBlock}>
                    {post.comments.map((comment) => (
                        <View key={comment.id} style={styles.commentRow}>
                            <ThemedText style={styles.commentAuthor}>
                                {comment.author}
                            </ThemedText>
                            <ThemedText style={styles.commentText}>
                                {comment.text}
                            </ThemedText>
                        </View>
                    ))}

                    {post.comments.length === 0 ? (
                        <ThemedText style={styles.emptyComments}>
                            No comments yet. Start the conversation.
                        </ThemedText>
                    ) : null}

                    <View style={styles.commentComposer}>
                        <TextInput
                            value={commentText}
                            onChangeText={setCommentText}
                            placeholder="Write a comment"
                            placeholderTextColor="#7A8896"
                            style={styles.commentInput}
                        />
                        <Pressable
                            onPress={submitComment}
                            disabled={!hasCommentDraft}
                            style={({ pressed }) => [
                                styles.commentSubmit,
                                !hasCommentDraft &&
                                    styles.commentSubmitDisabled,
                                pressed &&
                                    hasCommentDraft &&
                                    styles.commentSubmitPressed,
                            ]}
                        >
                            <ThemedText style={styles.commentSubmitLabel}>
                                Send
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#D6E0ED",
        backgroundColor: "#FFFFFFF2",
        padding: 14,
        gap: 12,
        shadowColor: "#0D1D2E",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    authorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DCEAFF",
        borderWidth: 1,
        borderColor: "#9FC0EE",
    },
    avatarLabel: {
        color: "#184986",
        fontSize: 16,
        fontWeight: 800,
    },
    author: {
        color: "#0A1A2E",
        fontSize: 16,
        fontWeight: 800,
    },
    meta: {
        color: "#58708B",
        fontSize: 12,
        fontWeight: 600,
    },
    body: {
        color: "#132B45",
        fontSize: 15,
        lineHeight: 23,
        fontWeight: 600,
    },
    divider: {
        height: 1,
        backgroundColor: "#E2EAF5",
    },
    actionRow: {
        flexDirection: "row",
        gap: 8,
    },
    commentsBlock: {
        gap: 8,
        paddingTop: 2,
    },
    commentRow: {
        backgroundColor: "#F1F6FD",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 2,
        borderWidth: 1,
        borderColor: "#D9E6F6",
    },
    commentAuthor: {
        color: "#24425F",
        fontSize: 12,
        fontWeight: 800,
    },
    commentText: {
        color: "#1D334A",
        fontSize: 14,
        lineHeight: 20,
        fontWeight: 600,
    },
    emptyComments: {
        color: "#58708B",
        fontSize: 13,
        fontWeight: 600,
    },
    commentComposer: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        marginTop: 2,
    },
    commentInput: {
        flex: 1,
        minHeight: 42,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#C7D6EA",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 12,
        color: "#0D1D2E",
        fontSize: 14,
        fontWeight: 600,
    },
    commentSubmit: {
        minHeight: 42,
        paddingHorizontal: 16,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1666D9",
    },
    commentSubmitDisabled: {
        opacity: 0.45,
    },
    commentSubmitPressed: {
        opacity: 0.85,
    },
    commentSubmitLabel: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: 800,
    },
});
