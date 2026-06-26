import { drizzle, ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";
import * as schema from "./schema";

export async function deleteDb() {}

let dbInstance:
    | (ExpoSQLiteDatabase<typeof schema> & {
          $client: SQLiteDatabase;
      })
    | null = null;
let initPromise: Promise<any> | null = null;

export default async function getDb(): Promise<
    | ExpoSQLiteDatabase<typeof schema> & {
          $client: SQLiteDatabase;
      }
> {
    if (dbInstance) return dbInstance;
    if (!initPromise) {
        initPromise = (async () => {
            const client = await openDatabaseAsync("min-mobile.db");
            dbInstance = drizzle<typeof schema>(client, { schema });
            return dbInstance;
        })();
    }
    return initPromise;
}
