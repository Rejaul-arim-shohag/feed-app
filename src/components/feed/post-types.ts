export type PostReaction = "like" | null;

export type FeedComment = {
    id: string;
    author: string;
    text: string;
};

export type FeedPost = {
    id: string;
    author: string;
    handle: string;
    createdAt: string;
    text: string;
    likes: number;
    comments: FeedComment[];
    reaction: PostReaction;
};
