import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const client = openDatabaseSync("min-mobile.db");

export function deleteDB() {
    // TODO
}

const db = drizzle<typeof schema>(client, { schema });

export default db;
