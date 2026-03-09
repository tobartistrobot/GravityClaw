import { startBot } from "./bot/bot.js";

/**
 * OpenGravity - Punto de entrada principal.
 */

console.log("-----------------------------------------");
console.log("🌌 Inicializando OpenGravity...");
console.log("-----------------------------------------");

try {
    startBot();
} catch (error) {
    console.error("💥 Error crítico al iniciar OpenGravity:", error);
    process.exit(1);
}
