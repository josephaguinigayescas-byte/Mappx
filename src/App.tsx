import React, { useState } from "react";
import { Gamepad2, Play, Terminal, HelpCircle, Laptop, Wifi, ShieldCheck, Heart, Sparkles, BookOpen } from "lucide-react";
import BluetoothMapper from "./components/BluetoothMapper";
import GameEmulatorPlayground from "./components/GameEmulatorPlayground";
import WirelessDebuggingTutorial from "./components/WirelessDebuggingTutorial";
import AIConsultantChat from "./components/AIConsultantChat";
import { ButtonMapping } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"mapper" | "playground" | "tutorial" | "chat">("mapper");
  const [mappings, setMappings] = useState<ButtonMapping[]>([]);
  const [activePreset, setActivePreset] = useState("Genshin Impact");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Ambient Header Glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-64 bg-indigo-500/10 rounded-full filter blur-[120px] pointer-events-none z-0" />
      
      {/* Header Bar */}
      <header className="relative z-10 border-b border-slate-900 bg-slate-950/65 backdrop-blur-xl sticky top-0 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between py-4 gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-indigo-500/10">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                  Control &amp; Depuración
                </h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                  Android LADB
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Mapeador Bluetooth, Shizuku &amp; ADB Inalámbrico</p>
            </div>
          </div>

          {/* Quick status counters */}
          <div className="flex items-center gap-2 sm:gap-4 text-[10px]">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LADB status: SIM READY</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-400">
              <Wifi className="h-3 w-3 text-indigo-400" />
              <span>Red: Local Host 3000</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 relative z-10">
        
        {/* Navigation Tabs Bar */}
        <div className="grid grid-cols-2 md:flex md:items-center bg-slate-950 border border-slate-900 p-1.5 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab("mapper")}
            className={`flex-1 md:flex-initial py-2.5 px-5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "mapper"
                ? "bg-slate-900 text-indigo-400 shadow-md border border-slate-800"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <Gamepad2 className="h-4 w-4" />
            <span>Mapeador HUD</span>
          </button>

          <button
            onClick={() => setActiveTab("playground")}
            className={`flex-1 md:flex-initial py-2.5 px-5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "playground"
                ? "bg-slate-900 text-emerald-400 shadow-md border border-slate-800"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <Play className="h-4 w-4" />
            <span>Probar Mapeo en Juegos</span>
          </button>

          <button
            onClick={() => setActiveTab("tutorial")}
            className={`flex-1 md:flex-initial py-2.5 px-5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "tutorial"
                ? "bg-slate-900 text-teal-400 shadow-md border border-slate-800"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Tutorial ADB &amp; Shizuku</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 md:flex-initial py-2.5 px-5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "chat"
                ? "bg-slate-900 text-purple-400 shadow-md border border-slate-800"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Asistente Técnico IA</span>
          </button>
        </div>

        {/* Tab content view area */}
        <div className="transition-all duration-150">
          {activeTab === "mapper" && (
            <BluetoothMapper
              mappings={mappings}
              setMappings={setMappings}
              activePreset={activePreset}
              setActivePreset={setActivePreset}
            />
          )}

          {activeTab === "playground" && (
            <GameEmulatorPlayground mappings={mappings} />
          )}

          {activeTab === "tutorial" && (
            <WirelessDebuggingTutorial />
          )}

          {activeTab === "chat" && (
            <AIConsultantChat />
          )}
        </div>

        {/* Info card footer notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/10 border border-slate-905 p-5 rounded-2xl">
          <div className="flex gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-505/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/10">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">Inyección Segura</h4>
              <p className="text-[10px] text-slate-400 leading-normal mt-1">
                La API de Shizuku permite el mapeo nativo directo a nivel de ADB. Esto es 100% indetectable por sistemas antitrampas y evita baneos.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-505/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/10">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">Cero Retraso (No Latency)</h4>
              <p className="text-[10px] text-slate-400 leading-normal mt-1">
                A diferencia de los retransmisores inalámbricos, los toques táctiles locales de Android por comando se inyectan en menos de 1 milisegundo.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-teal-505/10 flex items-center justify-center text-teal-400 shrink-0 border border-teal-500/10">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">Asistencia de Modelos</h4>
              <p className="text-[10px] text-slate-400 leading-normal mt-1">
                Usa el Asistente Técnico IA en caso de que tu fabricante móvil (Xiaomi, Samsung, Oppo) imponga restricciones adicionales de energía.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Footer */}
      <footer className="mt-auto py-6 border-t border-slate-950 text-center text-[10px] text-slate-500 bg-slate-950/40 relative z-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>🎮 Control &amp; Depuración Inalámbrica — Mapeador Educativo interactivo de Mandos Bluetooth</span>
          <span className="flex items-center gap-1">
            Hecho en español con <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> para Gamers Android
          </span>
        </div>
      </footer>

    </div>
  );
}
