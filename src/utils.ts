import FastImage from "@d11/react-native-fast-image";
import migrations from "@drizzle/migrations";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { showNotification } from "@services/notifyService";
import { setOverlay } from "@services/overlayService";
import { showPopup } from "@services/popupService";
import { UpdateModule } from "@specs/UpdateModule";
import { sql } from "drizzle-orm";
import React from "react";
import { Alert } from "react-native";
import RNFS from "react-native-fs";
import { AppHandler } from "./App";
import db, { sqliteClient } from "./db/client";
import { APP_VERSION, AUTO_UPDATE_ENABLED, EXPO_PUBLIC_REPO_NAME, GITHUB_REPO_AUTHOR } from "./env";
import Storage from "./storage";
import { ThemeData } from "./style";
import { t } from "./translation";

export const appRef = React.createRef<AppHandler>();

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
    FastImage.clearDiskCache();
    FastImage.clearMemoryCache();
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

// Converts hex color to rgba
export function hexToRgba(hex: string): string {
    const hexWithoutHash = hex.replace("#", "");
    const r = parseInt(hexWithoutHash.substring(0, 2), 16);
    const g = parseInt(hexWithoutHash.substring(2, 4), 16);
    const b = parseInt(hexWithoutHash.substring(4, 6), 16);
    const a = parseInt(hexWithoutHash.substring(6, 8), 16) / 255;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
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

// Check for updates and prompt the user to update if necessary
export async function checkForUpdates(silent: boolean = false) {
    if (!silent) setOverlay("loading");
    if (APP_VERSION) {
        if (AUTO_UPDATE_ENABLED) {
            const result = await fetch(
                `https://api.github.com/repos/${GITHUB_REPO_AUTHOR}/${EXPO_PUBLIC_REPO_NAME}/releases/latest`,
            );
            const data = await result.json();
            const latestVersion = data.tag_name?.slice(1);
            if (latestVersion && latestVersion !== APP_VERSION) {
                const confirmUpdate = () => {
                    const downloadUrl = data?.assets?.[0]?.browser_download_url;
                    console.log("Downloading", downloadUrl);
                    if (downloadUrl) {
                        UpdateModule?.downloadAndInstall(downloadUrl);
                    }
                };
                if (!silent) setOverlay("none");
                showPopup(t.update_available, (t.update_popup_content || "").replace("[version]", latestVersion), [
                    {
                        text: t.update || "",
                        onPress: () => {
                            confirmUpdate();
                        },
                    },
                    { text: t.later || "" },
                ]);
            } else if (!silent) {
                setOverlay("none");
                showPopup(t.no_update_available, t.no_update_popup_content);
            }
        }
    }
}

export async function saveImageToGallery(uri: string) {
    try {
        const ext = uri.split(".").pop() || "jpg";
        const dest = `${RNFS.TemporaryDirectoryPath}/min_${Date.now()}.${ext}`;

        await RNFS.downloadFile({ fromUrl: uri, toFile: dest }).promise;
        await CameraRoll.saveAsset(`file://${dest}`, { type: "photo" });
    } catch {
        showNotification("Error");
    }
}

export function blurApp(blur: boolean) {
    if (appRef.current) {
        appRef.current.setBlurEnabled(blur);
    }
}
