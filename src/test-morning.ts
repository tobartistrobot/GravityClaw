import { getMalagaData } from "./services/malaga.js";
import { googleAI } from "./services/googleAI.js";
import { env } from "./config/env.js";
import { sendBroadcast } from "./bot/bot.js";

async function testMorningMessage() {
    console.log("⏰ Iniciando prueba manual de resumen mañanero...");

    try {
        const { weather, event } = await getMalagaData();
        console.log(`📍 Datos obtenidos: Clima: ${weather}, Evento: ${event}`);

        console.log("🎨 Generando imagen real (esto puede tardar)...");
        const imageBuffer = await googleAI.generateMorningImage(weather, event);

        const message = `☀️ *¡Buenos días Málaga!* (PRUEBA MANUAL)
    
📍 *Hoy en nuestra ciudad*: ${weather}.
📅 *Evento destacado*: ${event}.

Espero que tengas un día fantástico. 🐥🐒`;

        for (const userId of env.TELEGRAM_ALLOWED_USER_IDS) {
            console.log(`📤 Enviando a ${userId}...`);
            if (imageBuffer) {
                await sendBroadcast(userId, message, imageBuffer);
                console.log("✅ Mensaje con imagen enviado con éxito.");
            } else {
                await sendBroadcast(userId, message);
                console.log("⚠️ Mensaje enviado SIN imagen (no se pudo generar).");
            }
        }
    } catch (error) {
        console.error("❌ Error en la prueba manual:", error);
    }
}

testMorningMessage();
