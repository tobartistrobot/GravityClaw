import admin from "firebase-admin";
import { env } from "../config/env.js";
import { readFileSync } from "fs";

/**
 * Gestión de la base de datos en la nube usando Firebase Firestore.
 */
class DatabaseService {
    private db: admin.firestore.Firestore;

    constructor() {
        // Inicializar Firebase Admin
        try {
            let serviceAccount;

            // Intentar cargar desde variable de entorno (ideal para Railway/Cloud)
            if (process.env.FIREBASE_SERVICE_ACCOUNT) {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                // Normalizar la clave privada: los saltos de línea pueden venir escapados como "\\n"
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
                }
                console.log("🌟 Cargando credenciales de Firebase desde variable de entorno.");
            } else if (env.GOOGLE_APPLICATION_CREDENTIALS) {
                // Cargar desde archivo local
                const path = env.GOOGLE_APPLICATION_CREDENTIALS;
                serviceAccount = JSON.parse(readFileSync(path, "utf8"));
                console.log(`📂 Cargando credenciales de Firebase desde archivo: ${path}`);
            } else {
                throw new Error("❌ No se encontraron credenciales de Firebase (ni en FIREBASE_SERVICE_ACCOUNT ni en GOOGLE_APPLICATION_CREDENTIALS)");
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });

            this.db = admin.firestore();
            console.log("🔥 Firebase Firestore inicializado correctamente.");
        } catch (error) {
            console.error("❌ Error inicializando Firebase:", error);
            process.exit(1);
        }
    }

    /**
     * Guarda un mensaje en el historial del usuario en Firestore.
     */
    public async saveMessage(userId: string, role: "user" | "assistant" | "system", content: string) {
        try {
            const userRef = this.db.collection("chats").doc(userId);
            const messagesRef = userRef.collection("messages");

            await messagesRef.add({
                role,
                content,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error("❌ Error guardando mensaje en Firestore:", error);
        }
    }

    /**
     * Recupera los últimos N mensajes de un usuario para contexto.
     */
    public async getHistory(userId: string, limit: number = 20) {
        try {
            const messagesRef = this.db.collection("chats").doc(userId).collection("messages");
            const snapshot = await messagesRef
                .orderBy("timestamp", "desc")
                .limit(limit)
                .get();

            return snapshot.docs
                .map((doc) => ({
                    role: doc.data().role as string,
                    content: doc.data().content as string,
                }))
                .reverse();
        } catch (error) {
            console.error("❌ Error obteniendo historial de Firestore:", error);
            return [];
        }
    }

    /**
     * Limpia el historial de un usuario.
     */
    public async clearHistory(userId: string) {
        try {
            const messagesRef = this.db.collection("chats").doc(userId).collection("messages");
            const snapshot = await messagesRef.get();

            const batch = this.db.batch();
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
        } catch (error) {
            console.error("❌ Error limpiando historial en Firestore:", error);
        }
    }
}

export const dbService = new DatabaseService();
