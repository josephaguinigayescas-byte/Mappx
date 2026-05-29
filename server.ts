import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Endpoints
  app.post("/api/gemini/assist", async (req: express.Request, res: express.Response) => {
    try {
      const { prompt, chatHistory } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({
          reply: "⚠️ No has proporcionado tu propia clave de API de Gemini o estás usando el valor por defecto. Recuerda agregar `GEMINI_API_KEY` en la sección **Settings > Secrets** para habilitar la inteligencia artificial. Mientras tanto, ¡todas las simulaciones, tutoriales y mapeadores interactivos de la app siguen totalmente disponibles para que juegues y practiques!"
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Prepare system instruction and contents array
      const systemInstruction = 
        "Eres un asistente experto en Android, depuración inalámbrica (ADB), el uso de Shizuku y mapeo de mandos/controles Bluetooth para videojuegos móviles. " +
        "Tu objetivo es guiar al usuario para conectar su mando físico, solucionar problemas de emparejamiento por terminal (ADB pairing y connecting), " +
        "iniciar Shizuku (con o sin root, por depuración inalámbrica LADB o apps similares) y resolver dudas sobre mapeadores como Mantis Gamepad, " +
        "Panda Mouse Pro u Octopus a fin de jugar cómodamente en su móvil. " +
        "Responde en español de forma amigable, organizada, dando pasos claros, numerados y con un estilo elegante y profesional. " +
        "Si el usuario pregunta por marcas de móviles (Xiaomi/MIUI, Samsung/OneUI, Motorola, OnePlus), dale consejos específicos adaptados " +
        "como problemas de 'Optimización de batería' o de los ajustes de seguridad adicionales en desarrolladores.";

      const contents = [];
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const msg of chatHistory) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.text || msg.content }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      return res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini assistance error:", error);
      return res.status(500).json({ 
        error: "INTERNAL_ERROR", 
        reply: "Lo siento, ocurrió un error procesando tu consulta con la IA. Por favor, revisa tus credenciales o vuelve a intentarlo más tarde." 
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup failed:", err);
});
