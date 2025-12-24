interface MessageData {
    id: number;
    text: string;
    authorId: number;
    authorName: string;
    chatId: number;
}

interface ChatData {
    id: number;
    title: string;
    participants: any[];
}

interface RemoteMessageAdditionalData {
    chatId: number;
    authorId: number;
    messageId: number;
    sentAt: number;
}
