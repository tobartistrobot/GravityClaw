import { getMalagaData } from "./services/malaga.js";
import { googleAI } from "./services/googleAI.js";
import { sendBroadcast } from "./bot/bot.js";
import { env } from "./config/env.js";

const testBriefing = async () => {
    console.log("🧪 Iniciando prueba de Resumen Mañanero con IMAGEN REAL...");

    const { weather, event } = await getMalagaData();

    console.log("🎨 Solicitando generación de imagen a Imagen 3...");
    const imageBuffer = await googleAI.generateMorningImage(weather, event);

    const message = `☀️ *PRUEBA DE IMAGEN REAL*
    
📍 *Málaga*: ${weather}.
📅 *Evento*: ${event}.

✅ Si recibes esto con una imagen, la integración con Imagen 3 es correcta.`;

    for (const userId of env.TELEGRAM_ALLOWED_USER_IDS) {
        console.log(`📤 Enviando imagen a: ${userId}`);
        if (imageBuffer) {
            await sendBroadcast(userId, message, imageBuffer);
        } else {
            await sendBroadcast(userId, message + "\n\n⚠️ Error: No se pudo generar la imagen.");
        }
    }

    console.log("✅ Prueba completada.");
    process.exit(0);
};

// Pequeño delay
setTimeout(testBriefing, 2000);
