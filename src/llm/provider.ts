import Groq from "groq-sdk";
import { env } from "../config/env.js";

/**
 * Proveedor principal de LLM usando Groq SDK.
 */
class LLMProvider {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({
            apiKey: env.GROQ_API_KEY,
        });
    }

    /**
     * Realiza una petición de inferencia con soporte para herramientas.
     */
    public async chat(messages: any[], tools?: any[]) {
        try {
            const response = await this.groq.chat.completions.create({
                messages,
                model: "llama-3.3-70b-specdec", // Modelo gratuito recomendado
                tools: tools as any,
                tool_choice: "auto",
            });

            return response.choices[0].message;
        } catch (error) {
            console.error("❌ Error en LLM Provider (Groq):", error);

            // Fallback a OpenRouter si está configurado (implementación simplificada para el ejemplo)
            if (env.OPENROUTER_API_KEY) {
                return this.openRouterChat(messages, tools);
            }

            throw error;
        }
    }

    /**
     * Fallback opcional a OpenRouter si Groq falla o llega al límite.
     */
    private async openRouterChat(messages: any[], tools?: any[]) {
        console.log("🔄 Intentando fallback con OpenRouter...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: env.OPENROUTER_MODEL,
                messages,
                tools,
            }),
        });

        const data = await response.json();
        return data.choices[0].message;
    }
}

export const llm = new LLMProvider();
