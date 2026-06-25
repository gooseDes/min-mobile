import { CreateChat, CreateMessage, CreateUserData } from "@/utils";
import { FetchChatMessagesResult, FetchChatsResult } from "@min/api-client";
import db from "./client";
import { chatsTable, chatTypes, chatUsersTable, messagesTable, usersTable } from "./schema";

export function ProcessHistoryAndReturn(history_payload: FetchChatMessagesResult): Promise<MessageData[]> {
    if (!history_payload.success) return Promise.resolve([]);
    const messages = history_payload.messages;

    return Promise.all(
        messages.slice().map(async msg => {
            await db
                .insert(usersTable)
                .values(msg.sender)
                .onConflictDoUpdate({
                    target: [usersTable.id],
                    set: {
                        username: msg.sender.username,
                        avatar: msg.sender.avatar,
                    },
                });
            await db
                .insert(messagesTable)
                .values({
                    id: msg.id,
                    content: msg.content,
                    senderId: msg.sender.id,
                    chatId: msg.chatId,
                    sentAt: msg.sentAt,
                })
                .onConflictDoUpdate({
                    target: [messagesTable.id],
                    set: {
                        content: msg.content,
                        senderId: msg.sender.id,
                        chatId: msg.chatId,
                        sentAt: msg.sentAt,
                    },
                });
            return CreateMessage({
                id: msg.id,
                text: msg.content,
                sender: CreateUserData(msg.sender),
                chatId: msg.chatId,
                sentAt: msg.sentAt,
            });
        }),
    );
}

export function ProcessChatsAndReturn(chats_payload: FetchChatsResult): Promise<ChatData[]> {
    if (!chats_payload.success) return Promise.resolve([]);
    const chats = chats_payload.chats;

    const promises: Promise<any>[] = [];

    // Default chat
    const defaultChatPromise = async (): Promise<ChatData> => {
        await db.insert(chatsTable).values({ id: 1, type: chatTypes.group, title: "Default Chat" }).onConflictDoNothing();
        return CreateChat({ id: 1, title: "Default Chat", participants: [] });
    };
    promises.push(defaultChatPromise());

    // Saving chats to db
    promises.push(
        ...chats.slice().map(async chat => {
            await db.insert(chatsTable).values({ id: chat.id, type: chatTypes.private, title: chat.name || "Unknown" });
            await Promise.all(
                chat.participants.map(async user => {
                    await db
                        .insert(usersTable)
                        .values(user)
                        .onConflictDoUpdate({ target: usersTable.id, set: { username: user.username, avatar: user.avatar } });
                    await db.insert(chatUsersTable).values({ chatId: chat.id, userId: user.id }).onConflictDoNothing();
                }),
            );
            return CreateChat({
                id: chat.id,
                title: chat.name || "Unknown",
                participants: chat.participants,
            });
        }),
    );

    return Promise.all(promises);
}
