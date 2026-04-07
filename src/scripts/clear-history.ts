import { dbService } from "../database/sqlite.js";
import { env } from "../config/env.js";

const main = async () => {
    console.log("Iniciando borrado de historial...");
    try {
        for (const userId of env.TELEGRAM_ALLOWED_USER_IDS) {
            console.log(`Borrando historial del usuario: ${userId}`);
            await dbService.clearHistory(userId);
            console.log(`✅ Historial de ${userId} borrado con éxito.`);
        }
    } catch (error) {
        console.error("❌ Error durante el borrado:", error);
    }

    console.log("Operación completada.");
    process.exit(0);
};

main();
