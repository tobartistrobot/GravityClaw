import "dotenv/config";
import { z } from "zod";

/**
 * Esquema de validación para las variables de entorno.
 * Asegura que el proyecto no arranque si faltan credenciales críticas.
 */
const envSchema = z.object({
    TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN es obligatorio"),
    TELEGRAM_ALLOWED_USER_IDS: z.string().transform((val) => val.split(",").map(id => id.trim())),
    GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY es obligatorio"),
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_MODEL: z.string().default("openrouter/free"),
    DB_PATH: z.string().default("./memory.db"),
    GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1, "GOOGLE_APPLICATION_CREDENTIALS es obligatorio para Firebase"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Error de configuración en .env:");
    console.error(parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;
