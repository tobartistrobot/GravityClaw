import { llm } from "../llm/provider.js";
import { tools, getLLMTools } from "../tools/index.js";
import { dbService } from "../database/sqlite.js";

const MAX_ITERATIONS = 5;

/**
 * AgentLoop: El núcleo del pensamiento del agente.
 * Gestiona el ciclo Cognición -> Herramienta -> Cognición.
 */
export class AgentLoop {
    /**
     * Procesa un mensaje del usuario y genera una respuesta final.
     */
    public async run(userId: string, userMessage: string): Promise<string> {
        // 1. Cargar historial para contexto
        const history = await dbService.getHistory(userId);

        // 2. Preparar los mensajes para el LLM
        const messages: any[] = [
            { role: "system", content: "Eres OpenGravity, un asistente de IA personal, seguro y eficiente. Tienes acceso a herramientas para ayudar al usuario. Responde de forma clara y directa." },
            ...history,
            { role: "user", content: userMessage },
        ];

        let currentIteration = 0;

        while (currentIteration < MAX_ITERATIONS) {
            currentIteration++;

            // 3. Consultar al LLM
            const response = await llm.chat(messages, getLLMTools());

            if (!response) {
                throw new Error("No se recibió respuesta del LLM");
            }

            // 4. ¿Quiere usar una herramienta?
            if (response.tool_calls && response.tool_calls.length > 0) {
                // Añadir el mensaje de asistencia con los tool_calls al historial interno
                messages.push(response);

                for (const toolCall of response.tool_calls) {
                    const toolName = toolCall.function.name;
                    const toolArgs = JSON.parse(toolCall.function.arguments);
                    const tool = tools[toolName];

                    console.log(`🛠️ Ejecutando herramienta: ${toolName}(${JSON.stringify(toolArgs)})`);

                    if (tool) {
                        try {
                            const result = await tool.handler(toolArgs);
                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                name: toolName,
                                content: result,
                            });
                        } catch (err) {
                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                name: toolName,
                                content: `Error ejecutando herramienta: ${err}`,
                            });
                        }
                    } else {
                        messages.push({
                            role: "tool",
                            tool_call_id: toolCall.id,
                            name: toolName,
                            content: "Error: Herramienta no encontrada",
                        });
                    }
                }
                // Continuar el loop para que el LLM analice el resultado de la herramienta
                continue;
            }

            // 5. Es una respuesta final de texto
            const finalContent = response.content || "No pude generar una respuesta.";

            // Guardar en persistencia (usuario y asistente)
            await dbService.saveMessage(userId, "user", userMessage);
            await dbService.saveMessage(userId, "assistant", finalContent);

            return finalContent;
        }

        return "Lo siento, he alcanzado el límite de iteraciones de pensamiento sin llegar a una conclusión.";
    }
}

export const agent = new AgentLoop();
