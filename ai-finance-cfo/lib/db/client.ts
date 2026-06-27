import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";

config({ path: ".env.local" });

export const db = drizzle(process.env.DB_FILE_NAME!);