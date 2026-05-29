import React, { useState, useEffect, useRef } from "react";
import { Gamepad as GamepadIcon, HelpCircle, Save, Monitor, Share2, AlertCircle, Plus, Trash2, Crosshair, Sparkles } from "lucide-react";
import { ButtonMapping, GamePreset } from "../types";

interface BluetoothMapperProps {
  mappings: ButtonMapping[];
  setMappings: React.Dispatch<React.SetStateAction<ButtonMapping[]>>;
  activePreset: string;
  setActivePreset: (preset: string) => void;
}

export default function BluetoothMapper({ mappings, setMappings, activePreset, setActivePreset }: BluetoothMapperProps) {
  const [connectedGamepad, setConnectedGamepad] = useState<Gamepad | null>(null);
  const [gamepadState, setGamepadState] = useState<{ buttons: boolean[]; axes: number[] }>({
    buttons: Array(17).fill(false),
    axes: Array(4).fill(0),
  });
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null);
  const [draggedBtnId, setDraggedBtnId] = useState<string | null>(null);

  const phoneScreenRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Default game presets
  const gamePresets: Record<string, GamePreset> = {
    "Genshin Impact": {
      name: "Genshin Impact",
      genre: "RPG de Acción",
      bgUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop",
      mappings: [
        { id: "btn_joyLeft", label: "Joy Izq", targetX: 20, targetY: 70, gamepadAxisIndex: 0 },
        { id: "btn_a", label: "A (Ataque)", targetX: 78, targetY: 72, gamepadButtonIndex: 0 },
        { id: "btn_y", label: "Y (Habilidad E)", targetX: 74, targetY: 53, gamepadButtonIndex: 3 },
        { id: "btn_x", label: "X (Habilidad Q)", targetX: 87, targetY: 42, gamepadButtonIndex: 2 },
        { id: "btn_b", label: "B (Saltar)", targetX: 91, targetY: 68, gamepadButtonIndex: 1 },
        { id: "btn_r1", label: "R1 (Esquivar)", targetX: 88, targetY: 86, gamepadButtonIndex: 5 },
      ]
    },
    "Call of Duty Mobile": {
      name: "Call of Duty Mobile",
      genre: "Shooter / Battle Royale",
      bgUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
      mappings: [
        { id: "btn_joyLeft", label: "Joy Izq (Mov)", targetX: 18, targetY: 72, gamepadAxisIndex: 0 },
        { id: "btn_joyRight", label: "Joy Der (Cámara)", targetX: 72, targetY: 72, gamepadAxisIndex: 2 },
        { id: "btn_r2", label: "R2 (Disparar)", targetX: 86, targetY: 60, gamepadButtonIndex: 7 },
        { id: "btn_l2", label: "L2 (Apuntar)", targetX: 82, targetY: 40, gamepadButtonIndex: 6 },
        { id: "btn_a", label: "A (Agacharse)", targetX: 92, targetY: 82, gamepadButtonIndex: 0 },
        { id: "btn_b", label: "B (Saltar)", targetX: 94, targetY: 58, gamepadButtonIndex: 1 },
        { id: "btn_y", label: "Y (Recargar)", targetX: 70, targetY: 88, gamepadButtonIndex: 3 },
      ]
    },
    "Brawl Stars": {
      name: "Brawl Stars",
      genre: "Brawler / Arcade",
      bgUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
      mappings: [
        { id: "btn_joyLeft", label: "Joy Izq (Mov)", targetX: 20, targetY: 70, gamepadAxisIndex: 0 },
        { id: "btn_r1", label: "R1 (Ataque Normal)", targetX: 82, targetY: 70, gamepadButtonIndex: 5 },
        { id: "btn_r2", label: "R2 (Súper)", targetX: 72, targetY: 85, gamepadButtonIndex: 7 },
        { id: "btn_l1", label: "L1 (Gadget)", targetX: 88, targetY: 45, gamepadButtonIndex: 4 },
      ]
    }
  };

  // Switch presets
  const handleSelectPreset = (presetName: string) => {
    setActivePreset(presetName);
    if (gamePresets[presetName]) {
      setMappings(gamePresets[presetName].mappings);
    }
  };

  // Poll gamepad state
  const pollGamepad = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let primaryGamepad: Gamepad | null = null;
    
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        primaryGamepad = gamepads[i];
        break;
      }
    }

    if (primaryGamepad) {
      setConnectedGamepad(primaryGamepad);
      setGamepadState({
        buttons: primaryGamepad.buttons.map((b) => b.pressed),
        axes: primaryGamepad.axes ? [...primaryGamepad.axes] : [],
      });
    } else {
      setConnectedGamepad(null);
    }

    animationFrameId.current = requestAnimationFrame(pollGamepad);
  };

  useEffect(() => {
    // Initial preset loader
    if (mappings.length === 0) {
      setMappings(gamePresets["Genshin Impact"].mappings);
    }

    // Set up Gamepad API listeners
    const handleConnect = (e: GamepadEvent) => {
      console.log("Gamepad connected:", e.gamepad.id);
      setConnectedGamepad(e.gamepad);
    };

    const handleDisconnect = (e: GamepadEvent) => {
      console.log("Gamepad disconnected:", e.gamepad.id);
      setConnectedGamepad(null);
    };

    window.addEventListener("gamepadconnected", handleConnect);
    window.addEventListener("gamepaddisconnected", handleDisconnect);

    // Start request animation frame polling (more responsive than setInterval)
    animationFrameId.current = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener("gamepadconnected", handleConnect);
      window.removeEventListener("gamepaddisconnected", handleDisconnect);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Standard action names mapping to human-readable names
  const buttonLabels = [
    "A / Cruz ✕",
    "B / Círculo ◯",
    "X / Cuadrado ❑",
    "Y / Triángulo △",
    "L1 / LB",
    "R1 / RB",
    "L2 / LT",
    "R2 / RT",
    "Select",
    "Start",
    "L3 (Pulsar Joy Izq)",
    "R3 (Pulsar Joy Der)",
    "D-Pad Arriba 🡱",
    "D-Pad Abajo 🡳",
    "D-Pad Izquierda 🡰",
    "D-Pad Derecha 🡲",
    "Botón Home / Guía"
  ];

  // Drag and Drop Mapping on Phone screen
  const handleTouchScreenPointerDown = (btnId: string) => {
    setSelectedMappingId(btnId);
    setDraggedBtnId(btnId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggedBtnId || !phoneScreenRef.current) return;

    const rect = phoneScreenRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    // Boundary constraints
    x = Math.max(2, Math.min(98, x));
    y = Math.max(2, Math.min(98, y));

    setMappings((prev) =>
      prev.map((m) => (m.id === draggedBtnId ? { ...m, targetX: Math.round(x), targetY: Math.round(y) } : m))
    );
  };

  const handlePointerUp = () => {
    setDraggedBtnId(null);
  };

  const addNewMapping = () => {
    const id = "custom_" + Math.random().toString(36).substr(2, 5);
    const newMap: ButtonMapping = {
      id: id,
      label: "Nuevo Toque",
      targetX: 50,
      targetY: 50,
      gamepadButtonIndex: 0,
    };
    setMappings((prev) => [...prev, newMap]);
    setSelectedMappingId(id);
  };

  const deleteMapping = (id: string) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
    if (selectedMappingId === id) setSelectedMappingId(null);
  };

  const updateSelectedMapping = (fields: Partial<ButtonMapping>) => {
    if (!selectedMappingId) return;
    setMappings((prev) =>
      prev.map((m) => (m.id === selectedMappingId ? { ...m, ...fields } : m))
    );
  };

  const exportConfigJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mappings, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mapeo_${activePreset.replace(/\s+/g, "_").toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Col 1: Mobile Phone Simulator (Map Layer Designer) */}
      <div className="xl:col-span-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Crosshair className="text-emerald-400 h-4 w-4" />
              Mapeador de Coordenadas de Pantalla
            </h3>
            <p className="text-[10px] text-slate-400">Arrastra los botones a la posición de juego móvil para establecer los toques de control</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={addNewMapping}
              className="px-2.5 py-1 text-[10px] bg-indigo-900/40 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/20 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="h-3 w-3" /> Añadir Toque
            </button>
            <button
              onClick={exportConfigJson}
              className="px-2.5 py-1 text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Share2 className="h-3 w-3" /> Exportar JSON
            </button>
          </div>
        </div>

        {/* Outer Phone shell */}
        <div 
          className="relative w-full max-w-[640px] aspect-[16/9] rounded-[32px] bg-slate-950 p-[12px] border-[5px] border-slate-800 shadow-2xl overflow-hidden shadow-emerald-500/5 select-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Internal Screen Area */}
          <div 
            ref={phoneScreenRef}
            className="w-full h-full rounded-[20px] bg-slate-900 border border-slate-800/80 relative overflow-hidden flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.95)), url(${gamePresets[activePreset]?.bgUrl || "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop"})` }}
          >
            {/* Front facing speaker / camera bar notched bezel inside screen or on frame */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-slate-950/70 z-30 rounded-r-md flex items-center justify-center" />

            {/* Mapped buttons overlays */}
            {mappings.map((btn) => (
              <div
                key={btn.id}
                onPointerDown={() => handleTouchScreenPointerDown(btn.id)}
                style={{ left: `${btn.targetX}%`, top: `${btn.targetY}%` }}
                className={`absolute -translate-x-1/2 -track-y-1/2 cursor-grab active:cursor-grabbing w-10 h-10 rounded-full flex flex-col items-center justify-center text-[10px] font-bold border transition-transform ${
                  selectedMappingId === btn.id
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-110 shadow-lg shadow-emerald-500/20 z-20"
                    : "bg-slate-900/80 border-indigo-500/60 text-indigo-300 hover:border-slate-300 hover:text-slate-100 z-10"
                }`}
              >
                <div className="text-[10px] leading-none mb-0.5">{btn.label}</div>
                <div className="text-[7px] font-mono text-slate-400 leading-none">
                  {btn.targetX}%,{btn.targetY}%
                </div>
                {/* Simulated tap ripple if the mapped button is currently pressed on a real controller */}
                {connectedGamepad && (
                  (btn.gamepadButtonIndex !== undefined && gamepadState.buttons[btn.gamepadButtonIndex]) || 
                  (btn.gamepadAxisIndex !== undefined && Math.abs(gamepadState.axes[btn.gamepadAxisIndex]) > 0.4)
                ) && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
                )}
              </div>
            ))}

            {/* UI overlay guidelines */}
            <div className="absolute inset-4 border border-slate-500/5 rounded-lg pointer-events-none flex items-center justify-center">
              <span className="text-[10px] font-mono text-slate-600">Simulación HUD Móvil</span>
            </div>
          </div>
        </div>

        {/* Bottom selector menu for Game Presets */}
        <div className="w-full mt-4 bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Configuraciones de fábrica:</span>
          {Object.keys(gamePresets).map((presetKey) => (
            <button
              key={presetKey}
              onClick={() => handleSelectPreset(presetKey)}
              className={`text-[10px] px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
                activePreset === presetKey
                  ? "bg-indigo-600 text-slate-150 shadow shadow-indigo-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              🎮 {presetKey}
            </button>
          ))}
        </div>
      </div>

      {/* Col 2: Connected Gamepads details & editing parameters */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        {/* Gamepad connection status */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border uppercase font-mono text-[9px] font-black ${
              connectedGamepad ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
            }`}>
              <GamepadIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">Mando Bluetooth Detectado</h3>
              <p className="text-[10px] text-slate-400">Estado de emparejamiento con el navegador</p>
            </div>
          </div>

          {connectedGamepad ? (
            <div className="space-y-3 bg-slate-950 p-4 border border-slate-800 rounded-xl">
              <div className="text-[11px] font-semibold text-slate-200 font-mono truncate">{connectedGamepad.id}</div>
              
              {/* Joy axis logs */}
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-900">
                <div>
                  <span className="text-slate-500 font-mono">Analog Izq (X, Y):</span>
                  <div className="font-mono text-[10px] text-emerald-400 mt-1">
                    [{gamepadState.axes[0]?.toFixed(2) || "0.00"}, {gamepadState.axes[1]?.toFixed(2) || "0.00"}]
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-mono">Analog Der (X, Y):</span>
                  <div className="font-mono text-[10px] text-emerald-400 mt-1">
                    [{gamepadState.axes[2]?.toFixed(2) || "0.00"}, {gamepadState.axes[3]?.toFixed(2) || "0.00"}]
                  </div>
                </div>
              </div>

              {/* General action button checker */}
              <div className="pt-2 border-t border-slate-900">
                <span className="text-slate-500 font-mono text-[10px] block mb-2">Botones Activos:</span>
                <div className="flex flex-wrap gap-1">
                  {gamepadState.buttons.map((pressed, index) => {
                    if (!pressed) return null;
                    return (
                      <span key={index} className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {buttonLabels[index]?.split(" / ")[0] || `B${index}`}
                      </span>
                    );
                  })}
                  {!gamepadState.buttons.some(b => b) && (
                    <span className="text-[10px] text-xs text-slate-500">Presiona un botón en tu mando para probarlo...</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-xs font-semibold text-yellow-500 block">Mando no conectado</span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Sincroniza un mando Xbox, DualShock/DualSense o genérico por Bluetooth en la configuración de este equipo. 
                  <span className="mt-1 block text-indigo-400 font-medium">¡Aun así puedes seguir mapeando toques manualmente arrastrándolos!</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Selected Button Attributes Configurator */}
        {selectedMappingId ? (
          (() => {
            const currentSelected = mappings.find((m) => m.id === selectedMappingId);
            if (!currentSelected) return null;
            return (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center justify-between mb-4">
                    <span>Ajustar Toque Seleccionado</span>
                    <button
                      onClick={() => deleteMapping(selectedMappingId)}
                      className="p-1 px-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-slate-100 border border-red-900/30 font-medium text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3 w-3" /> Eliminar
                    </button>
                  </h4>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide mb-1">Nombre / Acción en Pantalla</label>
                      <input
                        type="text"
                        value={currentSelected.label}
                        onChange={(e) => updateSelectedMapping({ label: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        placeholder="Ej. Saltar, Atacar"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide mb-1">Coordenada X (%)</label>
                        <input
                          type="number"
                          value={currentSelected.targetX}
                          onChange={(e) => updateSelectedMapping({ targetX: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide mb-1">Coordenada Y (%)</label>
                        <input
                          type="number"
                          value={currentSelected.targetY}
                          onChange={(e) => updateSelectedMapping({ targetY: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 text-center font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide mb-1">Asignar Botón del Mando</label>
                      <select
                        value={currentSelected.gamepadButtonIndex !== undefined ? currentSelected.gamepadButtonIndex : -1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          updateSelectedMapping({ 
                            gamepadButtonIndex: val !== -1 ? val : undefined,
                            gamepadAxisIndex: val === -1 ? 0 : undefined 
                          });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value={-1}>Ninguno / Usar Analog Sticks</option>
                        {buttonLabels.map((lbl, idx) => (
                          <option key={idx} value={idx}>{lbl}</option>
                        ))}
                      </select>
                    </div>

                    {currentSelected.gamepadButtonIndex === undefined && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide mb-1">Eje del Stick Analógico</label>
                        <select
                          value={currentSelected.gamepadAxisIndex !== undefined ? currentSelected.gamepadAxisIndex : 0}
                          onChange={(e) => updateSelectedMapping({ gamepadAxisIndex: parseInt(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value={0}>Stick Izquierdo - Eje Horizontal (X)</option>
                          <option value={1}>Stick Izquierdo - Eje Vertical (Y)</option>
                          <option value={2}>Stick Derecho - Eje Horizontal (X)</option>
                          <option value={3}>Stick Derecho - Eje Vertical (Y)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-[9px] text-slate-500 leading-normal mt-4 bg-slate-950 p-2.5-rounded-xl border border-slate-950 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-indigo-400 shrink-0" /> Configuración salvada en tiempo real.
                </p>
              </div>
            );
          })()
        ) : (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <HelpCircle className="h-8 w-8 opacity-45 mb-2.5 text-slate-400" />
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Ningún elemento seleccionado</h4>
            <p className="text-[10px] text-slate-400 max-w-[180px] leading-relaxed">Arrastra un botón en el móvil o haz un click sobre él para editar su asignación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
