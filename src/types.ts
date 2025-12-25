import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWKS_URI: z.string().optional(),
});

export type Bindings = z.infer<typeof envSchema>;
