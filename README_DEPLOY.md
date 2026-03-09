# 🚀 Despliegue de OpenGravity en Railway

Este documento detalla los pasos para desplegar tu agente 24/7.

## 1. Variables de Entorno (Environment Variables)

Debes copiar las siguientes variables de tu archivo `.env` local a la pestaña **Variables** de tu proyecto en Railway:

| Variable | Descripción | Valor ejemplo |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Token de tu bot (de @BotFather) | `123456:ABC...` |
| `TELEGRAM_ALLOWED_USER_IDS` | Tu ID de usuario de Telegram | `8523658898` |
| `GROQ_API_KEY` | Tu clave de API de Groq | `gsk_...` |
| `OPENROUTER_API_KEY` | Clave de OpenRouter (opcional) | `sk-or-...` |
| `OPENROUTER_MODEL` | Modelo de fallback | `openrouter/free` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Ruta al archivo JSON de Firebase | `./firebase-auth.json` |

## 2. Gestión del Archivo de Firebase

Dado que Railway construye tu imagen desde el repositorio de GitHub:

### Opción A (Recomendada por Seguridad):
1. **NO subas tu archivo JSON real a GitHub.**
2. En Railway, crea una variable llamada `FIREBASE_SERVICE_ACCOUNT` y pega como valor **todo el contenido** de tu archivo JSON.
3. Modificaremos el código para que lea de esa variable si el archivo no existe (o puedes usar un script de pre-despliegue que cree el archivo).

### Opción B (Más simple pero menos segura):
1. Renombra tu archivo de Firebase a `firebase-auth.json`.
2. Asegúrate de que `GOOGLE_APPLICATION_CREDENTIALS="./firebase-auth.json"` está en tus variables de Railway.
3. Sube el archivo al repositorio (solo si el repositorio es **PRIVADO**).

## 3. Comandos de Railway

Railway detectará automáticamente el `Dockerfile` y el `railway.toml`. El bot se mantendrá vivo usando `npm start`, que ejecuta el código compilado en `dist/index.js`.
