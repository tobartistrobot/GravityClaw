import axios from "axios";

/**
 * Herramienta para obtener clima y eventos en Málaga.
 * Nota: En una versión real usaríamos APIs de OpenWeather o similares.
 * Aquí simulamos la respuesta para agilizar la puesta en marcha.
 */
export const getMalagaData = async () => {
    try {
        // Simulación de fetch a una API de clima
        const weather = "Soleado, 22°C, brisa suave del Mediterráneo";
        const event = "Feria gastronómica en el Muelle Uno";

        return { weather, event };
    } catch (error) {
        console.error("❌ Error obteniendo datos de Málaga:", error);
        return { weather: "Despejado", event: "Ninguno reportado" };
    }
};
