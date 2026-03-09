import { Bot, Context } from "grammy";
import { env } from "../config/env.js";
import { agent } from "../agent/loop.js";

/**
 * Configuración y arranque del bot de Telegram.
 */
export const startBot = () => {
    const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

    /**
     * Middleware de seguridad: Whitelist de usuarios.
     */
    bot.use(async (ctx, next) => {
        const userId = ctx.from?.id.toString();

        if (!userId || !env.TELEGRAM_ALLOWED_USER_IDS.includes(userId)) {
            console.warn(`🚨 Intento de acceso denegado de User ID: ${userId}`);
            if (ctx.from) {
                await ctx.reply("Acceso denegado. Este agente es de uso privado.");
            }
            return;
        }

        await next();
    });

    /**
     * Comando de inicio.
     */
    bot.command("start", (ctx) => {
        ctx.reply("🤖 ¡Hola! Soy OpenGravity, tu agente personal. ¿En qué puedo ayudarte hoy?");
    });

    /**
     * Handler principal de mensajes.
     */
    bot.on("message:text", async (ctx) => {
        const userId = ctx.from.id.toString();
        const userText = ctx.message.text;

        // Mostrar estado de "escribiendo"
        await ctx.replyWithChatAction("typing");

        try {
            const response = await agent.run(userId, userText);
            await ctx.reply(response);
        } catch (error) {
            console.error("❌ Error procesando mensaje:", error);
            await ctx.reply("Lo siento, hubo un error interno procesando tu solicitud.");
        }
    });

    // Manejo de errores de Grammy
    bot.catch((err) => {
        console.error("❌ Error en el Bot de Telegram:", err);
    });

    console.log("🚀 Bot de Telegram arrancando (Long Polling)...");
    bot.start();
};
