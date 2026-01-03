import fs from "node:fs";
import dotenv from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";
import { parseEnv } from "../../src/types";

const envConfig = dotenv.config();
expand(envConfig);

try {
  console.log("🔄 Syncing .env to .dev.vars...");

  const parsedEnv = parseEnv(process.env);

  const devVarsContent = Object.entries(parsedEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  fs.writeFileSync(".dev.vars", devVarsContent);

  console.log("✅ .dev.vars generated successfully based on Zod schema.");
  console.log("   Included keys:", Object.keys(parsedEnv).join(", "));
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Environment validation failed against src/types.ts:");
    error.issues.forEach((err) => {
      console.error(`   - ${err.path.join(".")}: ${err.message}`);
    });
  } else {
    console.error("❌ An unexpected error occurred:", error);
  }
  process.exit(1);
}
