import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

/**
 * Every environment variable this site reads, validated once at build time.

 * Add a variable in two places: its schema below, and `runtimeEnv`. Client variables
 * must be prefixed `NEXT_PUBLIC_` — Next inlines them at build time, so
 * `process.env[key]` can never be looked up dynamically.
 */
export const env = createEnv({
  server: {},

  client: {},

  shared: {
    NODE_ENV: z.enum(["development", "test", "production"]),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
});
