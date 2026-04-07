import { env } from "./config/env.js";

async function debugAtomic() {
    console.log("🚀 INICIANDO PRUEBA ATÓMICA...");
    console.log("🔑 API KEY (primeros 5):", env.GOOGLE_AI_API_KEY.substring(0, 5));

    const finalPrompt = "A cute yellow chick and a small monkey walking together in Malaga Muelle Uno, vibrant photography, BUENOS DIAS MALAGA text.";
    const modelName = "models/imagen-4.0-fast-generate-001";
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:predict?key=${env.GOOGLE_AI_API_KEY}`;

    console.log(`📡 Llamando directamente a: ${url}`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [{ prompt: finalPrompt }],
                parameters: { sampleCount: 1 }
            })
        });

        console.log("📊 Status:", response.status);
        console.log("📊 Status Text:", response.statusText);

        const data = await response.json() as any;
        if (response.ok) {
            console.log("✅ ÉXITO ATÓMICO. Predictions recibidas.");
            if (data.predictions?.[0]?.bytesBase64Encoded) {
                console.log("🖼️ IMAGEN RECIBIDA EN BASE64.");
            } else {
                console.log("⚠️ No hay bytes en la respuesta.");
            }
        } else {
            console.error("❌ ERROR ATÓMICO:", JSON.stringify(data));
        }
    } catch (e) {
        console.error("🔥 EXCEPCIÓN ATÓMICA:", e);
    }
}

debugAtomic();
