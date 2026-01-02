import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import postgres from "postgres";

const env = dotenv.config();
dotenvExpand.expand(env);

const POSTGRES_URL = process.env.POSTGRES_URL;
const POSTGRES_DB = process.env.POSTGRES_DB;

if (!POSTGRES_URL) {
  console.error("✗ POSTGRES_URL is not defined in environment variables");
  process.exit(1);
}

if (!POSTGRES_DB) {
  console.error("✗ POSTGRES_DB is not defined in environment variables");
  process.exit(1);
}

async function dropDatabase() {
  console.log("Dropping database...\n");

  const adminSql = postgres(`${POSTGRES_URL}/postgres`);

  try {
    await adminSql.unsafe(`DROP DATABASE IF EXISTS ${POSTGRES_DB}`);

    console.log(`✓ Dropped database: ${POSTGRES_DB}`);
  } catch (error) {
    console.error(`\n✗ Failed to drop database: ${(error as Error).message}`);
    await adminSql.end();
    process.exit(1);
  }

  await adminSql.end();
}

dropDatabase()
  .then(() => {
    console.log("\n✓ Database drop completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Unexpected error:", error);
    process.exit(1);
  });
