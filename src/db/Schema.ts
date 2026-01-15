import { relations, sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Types of chats
export const chatTypes = {
    private: "private",
    group: "group",
};

// DB structure

export const chatsTable = sqliteTable("chats", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type").notNull().default(chatTypes.group),
    title: text("title").notNull().default(""),
});

export const usersTable = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull().default(""),
});

export const messagesTable = sqliteTable("messages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    content: text("content").default(""),
    senderId: integer("sender").notNull(),
    chatId: integer("chat").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

export const chatUsersTable = sqliteTable(
    "chat_users",
    {
        chatId: integer("chat").notNull(),
        userId: integer("user").notNull(),
    },
    table => {
        return [primaryKey({ columns: [table.chatId, table.userId] })];
    },
);

// Relations

export const chatsRelations = relations(chatsTable, ({ many }) => ({
    chatUsers: many(chatUsersTable),
}));

export const chatUsersRelations = relations(chatUsersTable, ({ one }) => ({
    chat: one(chatsTable, {
        fields: [chatUsersTable.chatId],
        references: [chatsTable.id],
    }),
    user: one(usersTable, {
        fields: [chatUsersTable.userId],
        references: [usersTable.id],
    }),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
    sender: one(usersTable, {
        fields: [messagesTable.senderId],
        references: [usersTable.id],
    }),
    chat: one(chatsTable, {
        fields: [messagesTable.chatId],
        references: [chatsTable.id],
    }),
}));
