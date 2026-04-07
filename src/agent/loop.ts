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
        const systemPrompt = `Eres OpenGravity, tu Asistente Personal de Élite, altamente profesional y eficiente.
Tu misión es asistir al usuario en cualquier tarea, desde la gestión de sus proyectos hasta labores de asistente personal (agenda, notas, investigación).

Proyectos bajo tu supervisión (rutas absolutas):
1. GravityClaw (Núcleo): c:\\Users\\USER\\Desktop\\Gravity Claw
2. tupresulisto: c:\\Users\\USER\\Desktop\\tupresulisto (si existe)
3. RanxPanx-Team: c:\\Users\\USER\\RanxPanx Team

REGLAS CRÍTICAS:
1. Si el usuario te pide arreglar un bug o auditar código, usa 'list_dir' y 'read_file' para ver la realidad antes de actuar.
2. Si el usuario te pide enviar un email, DEBES usar la herramienta 'send_email' inmediatamente. NO redactes borradores a menos que se te pida.
3. Si el usuario te pide programar algo a futuro, DEBES usar 'schedule_email'.
Comunícate siempre en español, con un tono educado, extremadamente profesional y ejecutivo.`;

        const messages: any[] = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: userMessage },
        ];

        console.log("--- 🧠 INICIO DE CICLO DE PENSAMIENTO ---");
        console.log(`Prompt del sistema: ${systemPrompt.substring(0, 100)}...`);
        console.log(`Herramientas enviadas: ${getLLMTools().map(t => t.function.name).join(", ")}`);

        let currentIteration = 0;

        while (currentIteration < MAX_ITERATIONS) {
            currentIteration++;

            // 3. Consultar al LLM
            const response = await llm.chat(messages, getLLMTools());

            if (!response) {
                throw new Error("No se recibió respuesta del LLM");
            }

            console.log(`Paso ${currentIteration}: LLM respondió con ${response.tool_calls?.length || 0} tool_calls`);

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
