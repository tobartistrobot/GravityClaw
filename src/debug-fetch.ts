import "dotenv/config";

async function directTest() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const model = "models/imagen-4.0-fast-generate-001";
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:predict?key=${apiKey}`;

    const body = {
        instances: [
            {
                prompt: "A cute yellow chick and a monkey walking together in Malaga, cinematic photography, vibrant lighting"
            }
        ],
        parameters: {
            sampleCount: 1
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Cuerpo:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error en fetch directo:", error);
    }
}

directTest();
