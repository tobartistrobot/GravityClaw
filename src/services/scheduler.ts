import cron from "node-cron";
import { getMalagaData } from "./malaga.js";
import { googleAI } from "./googleAI.js";
import { env } from "../config/env.js";
import { sendBroadcast } from "../bot/bot.js";

/**
 * Programa el resumen mañanero diario.
 */
export const initScheduler = () => {
    // Configurado para las 08:30 AM todos los días
    cron.schedule("30 8 * * *", async () => {
        console.log("⏰ Iniciando resumen mañanero programado...");

        const { weather, event } = await getMalagaData();

        console.log("🎨 Generando imagen real...");
        const imageBuffer = await googleAI.generateMorningImage(weather, event);

        const message = `☀️ *¡Buenos días Málaga!*
    
📍 *Hoy en nuestra ciudad*: ${weather}.
📅 *Evento destacado*: ${event}.

Espero que tengas un día fantástico. 🐥🐒`;

        for (const userId of env.TELEGRAM_ALLOWED_USER_IDS) {
            if (imageBuffer) {
                await sendBroadcast(userId, message, imageBuffer);
            } else {
                await sendBroadcast(userId, message);
            }
        }
    });

    console.log("📅 Scheduler de resumen mañanero activo (08:30 AM).");
};
