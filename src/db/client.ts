import { open } from "@op-engineering/op-sqlite";
import { drizzle } from "drizzle-orm/op-sqlite";
import * as schema from "./schema";

export const sqliteClient = open({
    name: "min-mobile.db",
});

const db = drizzle<typeof schema>(sqliteClient, { schema });

export default db;
