import migrations from "@drizzle/migrations";
import { sql } from "drizzle-orm";
import { Alert, ToastAndroid } from "react-native";
import db, { sqliteClient } from "./db/Client";
import NativeUpdateModule from "./specs/NativeUpdateModule";
import Storage from "./Storage";
import { ThemeData } from "./Style";
import { t } from "./Translation";

export function CreateUserData(obj: any = {}): UserData {
    const o = obj || {};
    return {
        id: o.id || -1,
        username: o.username || "Unknown",
        avatar: o.avatar || undefined,
    };
}

export function CreateMessage(obj: any = {}): MessageData {
    return {
        id: obj.id || -1,
        text: obj.text || "",
        sender: CreateUserData(obj.sender || {}),
        chatId: obj.chatId || -1,
        sentAt: obj.sentAt || "",
    };
}

export function CreateChat(obj: any): ChatData {
    return {
        id: obj.id || -1,
        title: obj.title || "",
        participants: obj.participants || [],
    };
}

export function CreateRemoteMessagePayload(obj: any): RemoteMessagePayload {
    return {
        authorName: obj.authorName || "",
        text: obj.text || "",
        chatId: parseInt(obj.chatId, 10) || -1,
        authorId: parseInt(obj.authorId, 10) || -1,
        authorAvatar: obj.authorAvatar || "",
        messageId: parseInt(obj.messageId, 10) || -1,
        sentAt: parseInt(obj.sentAt, 10) || -1,
    };
}

export async function CreateDatabase() {
    console.log("Creating Database");
    const migrationEntries = Object.entries(migrations.migrations || {});

    for (const [key, migration] of migrationEntries) {
        try {
            console.log(`Attempting migration: ${key}`);

            const query = migration as string;

            const subqueries = query.split("--> statement-breakpoint");

            for (const subquery of subqueries) {
                if (subquery) {
                    try {
                        await db.run(sql.raw(subquery));
                    } catch (error: any) {
                        console.warn(`Safe-skipping submigration from ${key}:`, error.message);
                    }
                }
            }
        } catch (error: any) {
            console.warn(`Safe-skipping migration ${key}:`, error.message);
        }
    }

    console.log("Database created successfully");
}

export async function ClearCache() {
    sqliteClient.delete();
    Storage.set("createNewDB", true);
    Alert.alert("Cache Cleared", "Now we need you to restart the app");
}

// Converts a Date object to a localized string representation
export function dateToString(date: Date): string {
    const timeFormat: Intl.LocalesArgument = t.code;
    const force24Hour = Storage.getBoolean("use24HourTime") || false;
    const now = new Date(Date.now());

    const time = date.toLocaleTimeString(timeFormat, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: force24Hour ? false : undefined,
    });

    // Show only time for today, otherwise show date
    if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        return time;
    } else {
        if (
            date.getDate() === now.getDate() - 1 &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        ) {
            return `${t.yesterday}, ${time}`;
        }
        return `${date.toLocaleDateString(timeFormat, { month: "short", day: "numeric" })}, ${time}`;
    }
}

// Converts a unix timestamp to a Date object
export function timestampToDate(timestamp: number): Date {
    return new Date(timestamp * 1000);
}

// Sets the alpha for a given color and returns it
export function setAlphaForColor(color: string, alpha: number): string {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function countChars(str: string, char: string): number {
    return str.split(char).length - 1;
}

// Generate boxShadow style prop from theme data
export function getShadow(theme: ThemeData): string {
    return `${theme.shadowInset ? "inset " : ""}${theme.shadowOffsetX}px ${theme.shadowOffsetY}px ${theme.shadowBlur}px ${
        theme.shadowSpread
    }px ${theme.shadowColor}`;
}

// Install update by the link
export function installUpdate(link: string): void {
    NativeUpdateModule?.downloadAndInstall(link);
    ToastAndroid.showWithGravity(t.downloading_started || "", ToastAndroid.LONG, ToastAndroid.BOTTOM);
}
