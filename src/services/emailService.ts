import nodemailer from "nodemailer";
import { env } from "../config/env.js";

/**
 * Servicio de correo electrónico para OpenGravity.
 * Gestiona el envío de correos a través de SMTP.
 */
class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        this.initTransporter();
    }

    private initTransporter() {
        if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: env.SMTP_HOST,
                port: Number(env.SMTP_PORT) || 587,
                secure: env.SMTP_PORT === "465",
                auth: {
                    user: env.SMTP_USER,
                    pass: env.SMTP_PASS,
                },
            });
            console.log("📧 Servicio de Email inicializado.");
        } else {
            console.warn("⚠️ SMTP no configurado. El servicio de email no estará disponible.");
        }
    }

    /**
     * Envía un correo electrónico.
     */
    public async send(to: string, subject: string, body: string): Promise<string> {
        if (!this.transporter) {
            return "Error: El servicio de email no está configurado (faltan variables en .env).";
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"OpenGravity Assistant" <${env.SMTP_USER}>`,
                to,
                subject,
                text: body,
                html: body.replace(/\n/g, "<br>"), // Conversión básica a HTML
            });

            console.log(`✉️ Email enviado a ${to}: ${info.messageId}`);
            return `Éxito: Email enviado correctamente a ${to}. ID: ${info.messageId}`;
        } catch (error) {
            console.error("❌ Error enviando email:", error);
            return `Error enviando email: ${error}`;
        }
    }
}

export const emailService = new EmailService();
