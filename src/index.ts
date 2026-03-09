import { startBot } from "./bot/bot.js";
import { initScheduler } from "./services/scheduler.js";

/**
 * OpenGravity - Punto de entrada principal.
 */

console.log("-----------------------------------------");
console.log("🌌 Inicializando OpenGravity...");
console.log("-----------------------------------------");

try {
    startBot();
    initScheduler(); // Arrancar el programador de tareas
} catch (error) {
    console.error("💥 Error crítico al iniciar OpenGravity:", error);
    process.exit(1);
}
