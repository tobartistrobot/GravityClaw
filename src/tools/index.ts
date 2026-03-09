/**
 * Definición y registro de herramientas disponibles para el agente.
 */

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: object;
    handler: (args: any) => Promise<string>;
}

/**
 * Herramienta: get_current_time
 * Devuelve la hora actual del sistema.
 */
const getCurrentTime: ToolDefinition = {
    name: "get_current_time",
    description: "Obtiene la hora actual del sistema.",
    parameters: {
        type: "object",
        properties: {},
    },
    handler: async () => {
        return new Date().toLocaleString();
    },
};

/**
 * Registro de todas las herramientas.
 */
export const tools: Record<string, ToolDefinition> = {
    get_current_time: getCurrentTime,
};

/**
 * Genera el esquema de herramientas para el LLM.
 */
export const getLLMTools = () => {
    return Object.values(tools).map((t) => ({
        type: "function",
        function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
        },
    }));
};
