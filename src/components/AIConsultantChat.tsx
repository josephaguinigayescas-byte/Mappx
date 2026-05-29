import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, Info, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { ChatMessage } from "../types";

export default function AIConsultantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "👋 ¡Hola! Soy tu asistente técnico experto en mapeadores de control, Android, ADB y Shizuku.\n\n¿Tienes alguna duda sobre cómo activar la Depuración Inalámbrica en tu teléfono, por qué Shizuku no inicia, o cómo corregir la latencia de tu mando Bluetooth? Pregúntame lo que necesites o pulsa alguna de las consultas rápidas.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presetQuestions = [
    { title: "MIUI / Xiaomi", query: "Cómo activar depuración inalámbrica en un móvil Xiaomi / MIUI y solucionar de seguridad" },
    { title: "Shizuku No Inicia", query: "Shizuku se queda buscando el servicio o no conecta por depuración inalámbrica, ¿cómo lo soluciono?" },
    { title: "Optimizar Latencia", query: "Siento retraso / delay en mi control de PS4 / Xbox por Bluetooth, ¿cómo optimizo mi móvil Android?" },
    { title: "Qué es Shizuku", query: "Explícame qué es Shizuku, para qué sirve y por qué los mapeadores como Mantis lo prefieren frente a Octopus" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          chatHistory: messages.map(m => ({ role: m.role, content: m.text }))
        }),
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        text: data.reply || "No he podido obtener una respuesta. Por favor, asegúrate de que tu conexión está activa.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Error connecting with Gemini service:", error);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        text: "❌ Ocurrió un inconveniente al conectar con el servidor de IA de Google AI Studio. Asegúrate de configurar la clave de API `GEMINI_API_KEY` o usar el simulador local.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Safe markdown styles formatter
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Check for headings (e.g. ### Header)
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-semibold text-gray-100 mt-3 mb-1">{line.slice(4)}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-base font-bold text-emerald-400 mt-4 mb-2">{line.slice(3)}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} className="text-lg font-black text-emerald-400 mt-5 mb-3">{line.slice(2)}</h2>;
      }

      // Check for bullet lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const cleanContent = line.replace(/^\s*[-*]\s+/, "");
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-2 text-xs text-gray-300">
            <span className="text-emerald-500 mt-1">•</span>
            <span>{parseInlineStyles(cleanContent)}</span>
          </div>
        );
      }

      // Check for numbered lists
      const numberMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numberMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-2 text-xs text-gray-300">
            <span className="text-emerald-400 font-mono font-medium">{numberMatch[1]}.</span>
            <span>{parseInlineStyles(numberMatch[2])}</span>
          </div>
        );
      }

      // Regular line
      if (line.trim() === "") {
        return <div key={idx} className="h-2"></div>;
      }

      return (
        <p key={idx} className="my-1 text-xs text-gray-300 leading-relaxed">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  const parseInlineStyles = (content: string) => {
    // Basic bold **text** parsing
    const parts = [];
    let temp = content;
    
    // Bold regex: \*\*(.*?)\*\*
    // Backticks regex: `(.*?)`
    
    let regex = /(\*\*.*?\*\*|`.*?`)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(temp)) !== null) {
      const matchIndex = match.index;
      const matchStr = match[0];
      
      // Push text before match
      if (matchIndex > lastIndex) {
        parts.push(temp.substring(lastIndex, matchIndex));
      }
      
      if (matchStr.startsWith("**") && matchStr.endsWith("**")) {
        parts.push(
          <strong key={matchIndex} className="font-semibold text-emerald-300">
            {matchStr.slice(2, -2)}
          </strong>
        );
      } else if (matchStr.startsWith("`") && matchStr.endsWith("`")) {
        parts.push(
          <code key={matchIndex} className="bg-slate-900 border border-slate-700 text-teal-300 px-1 py-0.5 rounded font-mono text-[10px]">
            {matchStr.slice(1, -1)}
          </code>
        );
      }
      
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < temp.length) {
      parts.push(temp.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="flex flex-col h-[580px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Bot Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/10">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100">AI Consultor Técnico</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Gemini 3.5
              </span>
            </div>
            <p className="text-[10px] text-slate-400">ADB, Shizuku, Mandos, Latencia</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] bg-slate-900/60 border border-slate-800 px-2 py-1 rounded-lg">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span>Soporte Experto</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${
                msg.role === "user"
                  ? "bg-slate-800 border-slate-700 text-slate-100"
                  : "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
              }`}
            >
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs space-y-1 shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-slate-100 rounded-tr-none"
                  : "bg-slate-900/40 border border-slate-800/80 text-gray-200 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-line">{msg.role === "assistant" ? renderFormattedText(msg.text) : msg.text}</div>
              <div className="text-[9px] text-slate-500 text-right mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-[85%]">
            <div className="h-7 w-7 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50 text-gray-400 rounded-tl-none flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span className="text-xs">El Consultor IA está analizando tu caso...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Queries */}
      <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/60">
        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Info className="h-3 w-3" /> Preguntas sugeridas
        </p>
        <div className="flex flex-wrap gap-1.5">
          {presetQuestions.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(pq.query)}
              disabled={loading}
              className="text-[10px] text-left px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-900 text-slate-300 border border-slate-800/80 transition-all duration-155 hover:border-slate-700 flex items-center gap-1 disabled:opacity-55 cursor-pointer"
            >
              <span>{pq.title}</span>
              <ArrowUpRight className="h-3 w-3 opacity-60 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-slate-900/80 border-t border-slate-800 flex gap-2 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu consulta (ej. 'solución MIUI')"
          disabled={loading}
          className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="h-9 w-9 bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-40 disabled:hover:bg-emerald-500 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
