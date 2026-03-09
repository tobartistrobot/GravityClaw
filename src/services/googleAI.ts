import { env } from "../config/env.js";

class GoogleAIService {
    /**
     * Genera un resumen mañanero con imagen.
     * Versión simplificada para asegurar funcionamiento: Prompt estático de alta calidad.
     */
    public async generateMorningImage(weather: string, events: string): Promise<Buffer | null> {
        try {
            // PROMPT DINÁMICO CON ESTILO ANIME (Refinado: UN SOLO pollito y monito)
            const finalPrompt = `Anime style illustration, Studio Ghibli inspired, high detail. Center focus on a single cute small yellow chick and exactly one friendly little monkey walking side-by-side as best friends. They are the only characters in the foreground, clearly visible. Background: a beautiful sunny morning in Muelle Uno, Malaga, Spain, with the sea and lighthouse. Weather: ${weather}. Event: ${events}. Vibrant colors, magical atmosphere, cinematic lighting. Artistic text overlay clearly says "BUENOS DIAS MALAGA" in a stylish font.`;

            console.log("🎨 Usando prompt ANIME para Imagen:");
            console.log(finalPrompt);

            // Generar imagen real con Imagen 4 (Sabemos que este endpoint funciona)
            const imagenModel = "models/imagen-4.0-fast-generate-001";
            const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/${imagenModel}:predict?key=${env.GOOGLE_AI_API_KEY}`;

            console.log(`📡 Solicitando imagen a ${imagenModel}...`);
            const imagenResponse = await fetch(imagenUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    instances: [{ prompt: finalPrompt }],
                    parameters: { sampleCount: 1 }
                })
            });

            if (!imagenResponse.ok) {
                console.error("❌ Error API Imagen:", await imagenResponse.text());
                return null;
            }

            const imagenData = await imagenResponse.json() as any;
            const b64Data = imagenData.predictions?.[0]?.bytesBase64Encoded;

            if (b64Data) {
                console.log("✅ Imagen generada con éxito.");
                return Buffer.from(b64Data, "base64");
            }

            console.warn("⚠️ No se recibió data de imagen.");
            return null;
        } catch (error) {
            console.error("❌ Error crítico en GoogleAIService:", error);
            return null;
        }
    }
}

export const googleAI = new GoogleAIService();
