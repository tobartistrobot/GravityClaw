import cron from "node-cron";

/**
 * Servicio para programar tareas dinámicamente.
 */
class DynamicScheduler {
    private tasks: Map<string, cron.ScheduledTask> = new Map();

    /**
     * Programa una tarea usando una expresión cron.
     */
    public schedule(id: string, cronExpression: string, callback: () => void) {
        // Cancelar si ya existe una tarea con ese ID
        if (this.tasks.has(id)) {
            this.tasks.get(id)?.stop();
        }

        const task = cron.schedule(cronExpression, () => {
            console.log(`⏰ Ejecutando tarea programada: ${id}`);
            callback();
            // Si es una tarea de una sola vez (esto es simplificado), podríamos detenerla aquí.
            // Para cron estándar, seguirá ejecutándose según el patrón.
        });

        this.tasks.set(id, task);
        console.log(`📅 Tarea '${id}' programada con: ${cronExpression}`);
    }

    /**
     * Detiene una tarea específica.
     */
    public stop(id: string) {
        if (this.tasks.has(id)) {
            this.tasks.get(id)?.stop();
            this.tasks.delete(id);
            console.log(`🛑 Tarea '${id}' detenida.`);
        }
    }
}

export const dynamicScheduler = new DynamicScheduler();
