import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWKS_URI: z.string().optional(),
});

export type Bindings = z.infer<typeof envSchema>;

export function parseEnv(env: unknown): Bindings {
  return envSchema.parse(env);
}
