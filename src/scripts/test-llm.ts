import { llm } from "../llm/provider.js";
import { getLLMTools } from "../tools/index.js";

const main = async () => {
    try {
        console.log("Lista de herramientas registradas:");
        console.log(getLLMTools().map(t => t.function.name));

        const messages = [
            { role: "system", content: "Eres un Asistente Personal. Tu tarea es responder al usuario usando las herramientas disponibles. Tienes una herramienta llamada send_email." },
            { role: "user", content: "Envía un email a kevinetegonzalez@gmail.com diciendo que nos vemos mañana." }
        ];

        console.log("\nMandando petición al LLM...");
        const response = await llm.chat(messages, getLLMTools());

        console.log("\nRespuesta del LLM:");
        console.log(JSON.stringify(response, null, 2));
    } catch (e) {
        console.error("Error en LLM test:", e);
    }
    process.exit(0);
};

main();
