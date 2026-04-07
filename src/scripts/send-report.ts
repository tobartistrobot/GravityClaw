import { sendBroadcast } from "../bot/bot.js";
import { env } from "../config/env.js";

/**
 * Script de utilidad para que los agentes envíen reportes a Telegram.
 * Uso: node dist/scripts/send-report.js "Mi mensaje de reporte"
 */

const main = async () => {
    const message = process.argv[2];
    if (!message) {
        console.error("❌ Falta el mensaje del reporte.");
        process.exit(1);
    }

    const userIds = env.TELEGRAM_ALLOWED_USER_IDS;

    console.log(`📤 Enviando reporte a ${userIds.length} usuarios...`);

    for (const userId of userIds) {
        await sendBroadcast(userId, message);
    }

    console.log("✅ Reporte enviado con éxito.");
};

main();
