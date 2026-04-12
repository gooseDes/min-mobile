import { CreateChat, CreateMessage, CreateUserData, timestampToDate } from "@/Utils";
import db from "./Client";
import { chatsTable, chatTypes, chatUsersTable, messagesTable, usersTable } from "./Schema";

export function ProcessHistoryAndReturn(history_payload: any): Promise<MessageData[]> {
    return Promise.all(
        history_payload.messages.slice().map(async (msg: any) => {
            await db
                .insert(usersTable)
                .values({
                    id: msg.author_id,
                    username: msg.author,
                    avatar: msg.author_avatar,
                })
                .onConflictDoUpdate({
                    target: [usersTable.id],
                    set: {
                        username: msg.author,
                        avatar: msg.author_avatar,
                    },
                });
            await db
                .insert(messagesTable)
                .values({
                    id: msg.id,
                    content: msg.text,
                    senderId: msg.author_id,
                    chatId: msg.chat_id,
                    sentAt: timestampToDate(msg.sent_at),
                })
                .onConflictDoUpdate({
                    target: [messagesTable.id],
                    set: {
                        content: msg.text,
                        senderId: msg.author_id,
                        chatId: msg.chat_id,
                        sentAt: timestampToDate(msg.sent_at),
                    },
                });
            return CreateMessage({
                id: msg.id,
                text: msg.text,
                sender: CreateUserData({ id: msg.author_id, username: msg.author, avatar: msg.author_avatar }),
                chatId: msg.chat_id,
                sentAt: timestampToDate(msg.sent_at),
            });
        }),
    );
}

export function ProcessChatsAndReturn(chats_payload: any): Promise<ChatData[]> {
    const promises: Promise<any>[] = [];

    // Default chat
    const defaultChatPromise = async (): Promise<ChatData> => {
        await db.insert(chatsTable).values({ id: 1, type: chatTypes.group, title: "Default Chat" }).onConflictDoNothing();
        return CreateChat({ id: 1, title: "Default Chat", participants: [] });
    };
    promises.push(defaultChatPromise());

    // Saving chats to db
    promises.push(
        ...chats_payload.chats.slice().map(async (chat: any) => {
            await db.insert(chatsTable).values({ id: chat.id, type: chatTypes.private, title: chat.name || "Unknown" });
            await Promise.all(
                chat.participants.map(async (user: any) => {
                    await db
                        .insert(usersTable)
                        .values({ id: user.id, username: user.name, avatar: user.avatar })
                        .onConflictDoUpdate({ target: usersTable.id, set: { username: user.name, avatar: user.avatar } });
                    await db.insert(chatUsersTable).values({ chatId: chat.id, userId: user.id }).onConflictDoNothing();
                }),
            );
            return CreateChat({
                id: chat.id,
                title: chat.name || "Unknown",
                participants: chat.participants.map((user: any) => {
                    user.username = user.name;
                    delete user.name;
                    return user;
                }),
            });
        }),
    );

    return Promise.all(promises);
}
