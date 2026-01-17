import migrations from "@drizzle/migrations";
import { sql } from "drizzle-orm";
import { Alert } from "react-native";
import db, { sqliteClient } from "./db/Client";
import Storage from "./Storage";

export function CreateUserData(obj: any = {}): UserData {
    const o = obj || {};
    return {
        id: o.id || -1,
        username: o.username || "Unknown",
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
