import { readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import { emailService } from "../services/emailService.js";
import { dynamicScheduler } from "../services/dynamicScheduler.js";

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
 * Herramienta: read_file
 * Lee el contenido de un archivo en el sistema.
 */
const readFileTool: ToolDefinition = {
    name: "read_file",
    description: "Lee el contenido de un archivo. Úsalo para auditar código o ver archivos de configuración.",
    parameters: {
        type: "object",
        properties: {
            path: { type: "string", description: "Ruta absoluta del archivo." },
        },
        required: ["path"],
    },
    handler: async ({ path: filePath }) => {
        try {
            const content = await readFile(filePath, "utf-8");
            return content;
        } catch (err) {
            return `Error leyendo archivo: ${err}`;
        }
    },
};

/**
 * Herramienta: list_dir
 * Lista el contenido de un directorio.
 */
const listDirTool: ToolDefinition = {
    name: "list_dir",
    description: "Lista archivos y carpetas en un directorio.",
    parameters: {
        type: "object",
        properties: {
            path: { type: "string", description: "Ruta absoluta del directorio." },
        },
        required: ["path"],
    },
    handler: async ({ path: dirPath }) => {
        try {
            const files = await readdir(dirPath);
            return files.join(", ");
        } catch (err) {
            return `Error listando directorio: ${err}`;
        }
    },
};

/**
 * Herramienta: send_email
 * Envía un correo electrónico inmediatamente.
 */
const sendEmail: ToolDefinition = {
    name: "send_email",
    description: "Envía un correo electrónico inmediatamente. Requiere destinatario, asunto y cuerpo.",
    parameters: {
        type: "object",
        properties: {
            to: { type: "string", description: "Email del destinatario." },
            subject: { type: "string", description: "Asunto del correo." },
            body: { type: "string", description: "Contenido del mensaje (texto plano)." },
        },
        required: ["to", "subject", "body"],
    },
    handler: async ({ to, subject, body }) => {
        return await emailService.send(to, subject, body);
    },
};

/**
 * Herramienta: schedule_email
 * Programa un correo electrónico para ser enviado en el futuro.
 */
const scheduleEmail: ToolDefinition = {
    name: "schedule_email",
    description: "Programa el envío de un correo usando una expresión cron (ej: '0 9 * * *' para las 9 AM).",
    parameters: {
        type: "object",
        properties: {
            to: { type: "string", description: "Email del destinatario." },
            subject: { type: "string", description: "Asunto del correo." },
            body: { type: "string", description: "Contenido del mensaje." },
            cronExpression: { type: "string", description: "Expresión CRON estándar para la programación." },
        },
        required: ["to", "subject", "body", "cronExpression"],
    },
    handler: async ({ to, subject, body, cronExpression }) => {
        const taskId = `email_${Date.now()}`;
        dynamicScheduler.schedule(taskId, cronExpression, async () => {
            await emailService.send(to, subject, body);
        });
        return `Éxito: Email programado con ID '${taskId}' para la expresión: ${cronExpression}`;
    },
};

/**
 * Registro de todas las herramientas.
 */
export const tools: Record<string, ToolDefinition> = {
    get_current_time: getCurrentTime,
    read_file: readFileTool,
    list_dir: listDirTool,
    send_email: sendEmail,
    schedule_email: scheduleEmail,
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
