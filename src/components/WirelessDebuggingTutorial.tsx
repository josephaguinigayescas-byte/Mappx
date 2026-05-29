import React, { useState, useEffect } from "react";
import { Terminal, Lightbulb, Smartphone, HelpCircle, Wifi, ShieldAlert, CheckCircle2, Play, RefreshCw, Layers } from "lucide-react";
import { PairingState } from "../types";

export default function WirelessDebuggingTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const [ipAddress, setIpAddress] = useState("192.168.1.88");
  const [pairPort, setPairPort] = useState("37941");
  const [connectPort, setConnectPort] = useState("41553");
  const [pairingCode, setPairingCode] = useState("482103");
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simStatus, setSimStatus] = useState<"idle" | "pairing" | "paired" | "connecting" | "connected" | "error">("idle");

  const steps = [
    {
      title: "1. Activar Opciones de Desarrollador",
      desc: "Ve a Ajustes > Acerca del teléfono y presiona repetidamente 'Número de compilación' (o 'Versión de MIUI' en Xiaomi) unas 7 veces hasta que aparezca '¡Ya eres desarrollador!'.",
      tip: "Te pedirá tu PIN o contraseña de pantalla para confirmar.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "2. Activar Depuración Inalámbrica",
      desc: "Ingresa a Opciones de Desarrollador, busca el interruptor de 'Depuración Inalámbrica' y actívalo. Asegúrate de estar conectado a la misma red Wi-Fi.",
      tip: "En marcas como Xiaomi/Poco, debes activar además 'Depuración USB (Ajustes de seguridad)' para poder simular pulsaciones físicas.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "3. Obtener Código de Vinculación",
      desc: "Presiona sobre el texto 'Depuración Inalámbrica' para entrar al panel detallado y selecciona 'Vincular dispositivo con código de vinculación'.",
      tip: "Verás una ventana flotante con una IP, un Puerto (para vincular) y un código de 6 dígitos que usaremos a continuación.",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "4. Vincular e Iniciar Shizuku",
      desc: "Introduce esos datos en nuestro Simulador de Terminal ADB o en la app de Shizuku/LADB para enviar los paquetes de autorización inalámbricos.",
      tip: "¡Listo! Una vez iniciada Shizuku, las apps de mapeo pueden simular toques en pantalla sin necesidad de una computadora.",
      color: "from-pink-500 to-emerald-500"
    }
  ];

  const runAdbSimulator = () => {
    if (!ipAddress || !pairPort || !connectPort || !pairingCode) {
      setSimStatus("error");
      setSimulationLogs(["❌ Error: Debes rellenar todos los campos para simular la conexión."]);
      return;
    }

    setSimStatus("pairing");
    setSimulationLogs(["$ adb pair " + ipAddress + ":" + pairPort + " " + pairingCode]);

    // Step 1: Pairing handshake (simulated delays)
    setTimeout(() => {
      setSimulationLogs(prev => [
        ...prev,
        "Connecting to " + ipAddress + ":" + pairPort + "...",
        "🔑 Enviando protocolo de empatía criptográfica...",
        "🔒 Intercambiando certificados TLS con clave RSA-2048 de Android..."
      ]);
    }, 800);

    // Step 2: Successfully paired
    setTimeout(() => {
      setSimStatus("paired");
      setSimulationLogs(prev => [
        ...prev,
        "✅ Successfully paired to " + ipAddress + ":" + pairPort + " [guid=adb-key-android-13-mapper-m8]",
        "\n$ adb connect " + ipAddress + ":" + connectPort
      ]);
    }, 2000);

    // Step 3: Connecting via standard ADB port
    setTimeout(() => {
      setSimStatus("connecting");
      setSimulationLogs(prev => [
        ...prev,
        "Connecting to wireless service at " + ipAddress + ":" + connectPort + "..."
      ]);
    }, 2800);

    // Step 4: Fully connected and Shizuku start
    setTimeout(() => {
      setSimStatus("connected");
      setSimulationLogs(prev => [
        ...prev,
        "⚡ Connected to " + ipAddress + ":" + connectPort,
        "\n$ sh /sdcard/Android/data/moe.shizuku.privileged.api/files/start.sh",
        "Starting Shizuku server service...",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "🟢 Shizuku Server v13.5.4 - STARTED SUCCESSFULLY",
        "👑 Permisos ADB Touch-Injection: OTORGADOS",
        "⚙️ UID del proceso: 2000 (shell)",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "🎉 ¡Dispositivo listo para mapeadores sin retraso!"
      ]);
    }, 4200);
  };

  const resetSimulator = () => {
    setSimStatus("idle");
    setSimulationLogs([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Guía interactiva Paso a Paso */}
      <div className="lg:col-span-12 xl:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Tutorial de Depuración Inalámbrica</h3>
            <p className="text-[10px] text-slate-400 font-mono">Paso a paso sin PC para Android 11, 12, 13, 14, 15+</p>
          </div>
        </div>

        {/* Steps Navigator */}
        <div className="flex justify-between items-center bg-slate-950 p-1.5 border border-slate-800/80 rounded-xl mb-6">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`flex-1 py-2 px-1 text-center rounded-lg transition-all duration-150 cursor-pointer text-[11px] font-semibold ${
                activeStep === idx
                  ? "bg-gradient-to-r from-slate-800 to-slate-900 text-indigo-400 shadow border border-slate-700/60"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Paso {idx + 1}
            </button>
          ))}
        </div>

        {/* Active Step Graphic Info */}
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 relative overflow-hidden min-h-[220px] flex flex-col justify-between">
          <div>
            <span className="inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold mb-3.5">
              Guía Visual
            </span>
            <h4 className="text-xs font-bold text-slate-100 mb-2">{steps[activeStep].title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{steps[activeStep].desc}</p>
          </div>

          <div className="mt-4 flex items-start gap-2.5 bg-indigo-950/10 border border-indigo-900/30 p-3 rounded-xl">
            <Lightbulb className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-indigo-400 block uppercase tracking-wide">Consejo Pro:</span>
              <p className="text-[10px] text-slate-400 leading-normal">{steps[activeStep].tip}</p>
            </div>
          </div>

          {/* Abstract visual graphic effect based on step */}
          <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full filter blur-[60px] opacity-20 bg-gradient-to-tr ${steps[activeStep].color}`} />
        </div>

        {/* Shizuku vs Root Section */}
        <div className="mt-6 p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl">
          <div className="flex items-center gap-2.5 mb-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <h4 className="text-[11px] font-bold text-slate-100 uppercase tracking-wide">¿Por qué es necesario Shizuku?</h4>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Android prohíbe por seguridad que una aplicación regular simule toques o clicks sobre otras pantallas. 
            Sin embargo, los comandos ADB (Android Debug Bridge) sí tienen ese permiso. <strong>Shizuku</strong> sirve como un 
            proveedor de seguridad que otorga estos permisos a los mapeadores (como Mantis o Panda) directamente desde el móvil, 
            simulando que hay una PC conectada de forma constante y sin delay.
          </p>
        </div>
      </div>

      {/* Terminal de Simulación ADB */}
      <div className="lg:col-span-12 xl:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Consola ADB Inalámbrica</h3>
              <p className="text-[10px] text-slate-400 font-mono">Entrena y prueba el comando de emparejamiento</p>
            </div>
          </div>

          {/* Form setup */}
          <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide mb-1 flex items-center justify-between">
                <span>Dirección IP del móvil</span>
                <span className="flex items-center gap-1 font-sans text-[9px] text-indigo-400"><Wifi className="h-3 w-3" /> Misma Wi-Fi</span>
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                placeholder="Ej. 192.168.1.45"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide mb-1">
                Puerto Vinculación
              </label>
              <input
                type="text"
                value={pairPort}
                onChange={(e) => setPairPort(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                placeholder="Ej. 37495"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide mb-1">
                Puerto Conexión
              </label>
              <input
                type="text"
                value={connectPort}
                onChange={(e) => setConnectPort(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                placeholder="Ej. 41235"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide mb-1">
                Código de Vinculación (6 dígitos)
              </label>
              <input
                type="text"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 text-center tracking-widest font-bold text-emerald-400"
                placeholder="6 digitos"
                maxLength={6}
              />
            </div>
          </div>
        </div>

        {/* Simulated terminal logs */}
        <div className="flex-1 min-h-[160px] bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[10px] text-slate-300 overflow-y-auto max-h-[220px] mb-4 space-y-1">
          {simulationLogs.length === 0 ? (
            <div className="text-slate-500 flex flex-col items-center justify-center h-full gap-2">
              <Terminal className="h-6 w-6 opacity-40 text-slate-400" />
              <span>Esperando que presiones "Vincular"</span>
            </div>
          ) : (
            simulationLogs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap">{log}</div>
            ))
          )}
        </div>

        {/* Buttons to trigger connection */}
        <div className="flex gap-2">
          {simStatus === "idle" || simStatus === "error" ? (
            <button
              onClick={runAdbSimulator}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 transition-all active:scale-95"
            >
              <Play className="h-4 w-4" />
              Vincular Dispositivo (ADB Pair)
            </button>
          ) : (
            <button
              onClick={resetSimulator}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <RefreshCw className="h-4 w-4 animate-spin" />
              Reiniciar Servidor ADB
            </button>
          )}
        </div>

        {/* Simulated ADB Alert warning */}
        {simStatus === "connected" && (
          <div className="mt-4 flex items-center gap-2 bg-emerald-900/10 border border-emerald-500/20 p-2.5 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-[10px] text-emerald-300">
              ¡Emparejado éxitosamente! El mapeador Mantis/Panda ahora puede simular clicks.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
