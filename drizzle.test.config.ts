import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { defineConfig } from "drizzle-kit";

const testEnv: Record<string, string> = {};
const parsed = dotenv.config({ path: ".env.test" });
dotenvExpand.expand({ ...parsed, processEnv: testEnv });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: testEnv.DATABASE_URL ?? "",
  },
});
