import { z } from "zod";

// Define the strict schema for environment variables
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1, "VITE_API_BASE_URL is required"),
  VITE_USE_PROXY: z.string().transform((v) => v === "true").default("true"),
  VITE_CURRENCY_CODE: z.string().default("INR"),
  VITE_BACKEND_URL: z.string().url("VITE_BACKEND_URL must be a valid URL"),
  VITE_COMPANY_NAME: z.string().default("ZYNITHIC "),
});

// Parse and validate the environment variables at boot time
export const env = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_USE_PROXY: import.meta.env.VITE_USE_PROXY,
  VITE_CURRENCY_CODE: import.meta.env.VITE_CURRENCY_CODE,
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  VITE_COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME,
});
