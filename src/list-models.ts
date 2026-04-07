import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
    try {
        // En el SDK de Node no hay un método directo listModels() como en Python, 
        // pero podemos probar con un fetch manual a la API de Google AI
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`);
        const data = await response.json();
        if (data.models) {
            console.log("Modelos disponibles:");
            data.models.forEach((m: any) => console.log(`- ${m.name}`));
        } else {
            console.log("Respuesta inesperada:", data);
        }
    } catch (error) {
        console.error("Error al listar modelos:", error);
    }
}

listModels();
