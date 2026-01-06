import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { defineConfig } from "drizzle-kit";

const env: Record<string, string> = {};
const parsed = dotenv.config({ processEnv: env });
dotenvExpand.expand({ ...parsed, processEnv: env });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL ?? "",
  },
});
