import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Award, CheckCircle2, AlertTriangle, Zap, Gamepad, Sparkles, HelpCircle, Gamepad2, ArrowUpCircle } from "lucide-react";
import { ButtonMapping } from "../types";

interface GameEmulatorPlaygroundProps {
  mappings: ButtonMapping[];
}

export default function GameEmulatorPlayground({ mappings }: GameEmulatorPlaygroundProps) {
  const [activeGame, setActiveGame] = useState<"platformer" | "racing">("platformer");
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover" | "win">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [turboActive, setTurboActive] = useState(false);
  const [activePresses, setActivePresses] = useState<Record<string, boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state references to bypass closure stale state inside requestAnimationFrame loop
  const pState = useRef({
    x: 100,
    y: 180,
    vx: 0,
    vy: 0,
    isJumping: false,
    bullets: [] as { x: number; y: number; vx: number }[],
    obstacles: [] as { x: number; y: number; width: number; height: number; type: string }[],
    collectables: [] as { x: number; y: number; radius: number; collected: boolean }[],
    bgScroll: 0,
    tick: 0,
    // Racing specific states
    carX: 150,
    carSpeed: 0,
    carMaxSpeed: 6,
    tracks: [] as { x: number; y: number; width: number }[],
    trackOffset: 0,
    rivals: [] as { x: number; y: number; speed: number; lane: number }[]
  });

  // Gamepad Polling state to feed the loop
  const gamepadPollingRef = useRef<{ axes: number[]; buttons: boolean[] }>({
    axes: Array(4).fill(0),
    buttons: Array(17).fill(false)
  });

  // Keep track of mapped buttons to trigger active styles on screen
  useEffect(() => {
    let animId: number;

    const pollInputs = () => {
      const gList = navigator.getGamepads ? navigator.getGamepads() : [];
      let foundGp: Gamepad | null = null;
      for (const gp of gList) {
        if (gp) {
          foundGp = gp;
          break;
        }
      }

      const nextPresses: Record<string, boolean> = {};

      if (foundGp) {
        gamepadPollingRef.current = {
          axes: [...foundGp.axes],
          buttons: foundGp.buttons.map(b => b.pressed)
        };

        // Match mappings to find active presses
        for (const map of mappings) {
          if (map.gamepadButtonIndex !== undefined && foundGp.buttons[map.gamepadButtonIndex]?.pressed) {
            nextPresses[map.id] = true;
          }
          if (map.gamepadAxisIndex !== undefined) {
            const axisVal = foundGp.axes[map.gamepadAxisIndex];
            if (Math.abs(axisVal) > 0.45) {
              nextPresses[map.id] = true;
            }
          }
        }
      } else {
        gamepadPollingRef.current = {
          axes: Array(4).fill(0),
          buttons: Array(17).fill(false)
        };
      }

      setActivePresses(nextPresses);
      animId = requestAnimationFrame(pollInputs);
    };

    animId = requestAnimationFrame(pollInputs);
    return () => cancelAnimationFrame(animId);
  }, [mappings]);

  // Start / Reset game
  const startGame = () => {
    setGameState("playing");
    setScore(0);
    pState.current = {
      x: 80,
      y: 190,
      vx: 0,
      vy: 0,
      isJumping: false,
      bullets: [],
      obstacles: activeGame === "platformer" ? [
        { x: 380, y: 195, width: 20, height: 25, type: "cactus" },
        { x: 600, y: 195, width: 22, height: 25, type: "spikes" },
        { x: 850, y: 160, width: 20, height: 20, type: "ufo" },
        { x: 1100, y: 195, width: 25, height: 25, type: "spikes" },
        { x: 1350, y: 195, width: 22, height: 25, type: "cactus" }
      ] : [],
      collectables: [
        { x: 250, y: 140, radius: 8, collected: false },
        { x: 480, y: 120, radius: 8, collected: false },
        { x: 720, y: 130, radius: 8, collected: false },
        { x: 980, y: 140, radius: 8, collected: false },
        { x: 1250, y: 120, radius: 8, collected: false }
      ],
      bgScroll: 0,
      tick: 0,
      // Racing initial state
      carX: 180,
      carSpeed: 3,
      carMaxSpeed: 6,
      tracks: [],
      trackOffset: 0,
      rivals: [
        { x: 120, y: -100, speed: 2, lane: 0 },
        { x: 220, y: -300, speed: 1.5, lane: 1 },
        { x: 160, y: -500, speed: 2.2, lane: 1 },
        { x: 240, y: -700, speed: 1.8, lane: 2 }
      ]
    };
  };

  // Keyboard fallbacks helper
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      
      const key = e.key.toLowerCase();
      // Emulate mapping checks
      if (key === " " || key === "arrowup" || key === "w") {
        // Find jump/up mapping
        triggerAction("saltar");
      }
      if (key === "f" || key === "enter") {
        triggerAction("atacar");
        triggerAction("disparar");
      }
      if (key === "a" || key === "arrowleft") {
        pState.current.vx = -3.5;
        pState.current.carX = Math.max(100, pState.current.carX - 8);
      }
      if (key === "d" || key === "arrowright") {
        pState.current.vx = 3.5;
        pState.current.carX = Math.min(260, pState.current.carX + 8);
      }
      if (key === "shift") {
        triggerAction("turbo");
        triggerAction("esquivar");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "a" || key === "d" || key === "arrowleft" || key === "arrowright") {
        pState.current.vx = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, activeGame]);

  const triggerAction = (actionKeyword: string) => {
    const act = actionKeyword.toLowerCase();
    
    // Platformer Jump
    if (act.includes("saltar") || act.includes("jump") || act.includes("b (saltar)")) {
      if (!pState.current.isJumping) {
        pState.current.vy = -7.5;
        pState.current.isJumping = true;
      }
    }

    // Shoot
    if (act.includes("atacar") || act.includes("disparar") || act.includes("shoot") || act.includes("ataque")) {
      pState.current.bullets.push({
        x: pState.current.x + 15,
        y: pState.current.y + 10,
        vx: 6
      });
    }

    // Racing Turbo
    if (act.includes("turbo") || act.includes("esquivar") || act.includes("dodge")) {
      setTurboActive(true);
      pState.current.carSpeed = 8.5;
      setTimeout(() => setTurboActive(false), 800);
    }
  };

  // Main Canvas Game loop
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check current Gamepad polling commands to move character
      const gp = gamepadPollingRef.current;
      
      // Joy axes check to move Left / Right
      const axesThreshold = 0.25;
      let leftRightMove = 0;
      
      // Determine if joyLeft is mapped to movement
      const hasJoyLeftMap = mappings.some(m => m.id === "btn_joyLeft");
      if (hasJoyLeftMap) {
        const hAxis = gp.axes[0]; // Left analog X axis
        if (hAxis < -axesThreshold) leftRightMove = -1;
        if (hAxis > axesThreshold) leftRightMove = 1;
      }

      // Read explicit individual mappings to trigger actions
      for (const map of mappings) {
        if (map.gamepadButtonIndex !== undefined && gp.buttons[map.gamepadButtonIndex]) {
          const act = map.label.toLowerCase();
          if (act.includes("saltar") || act.includes("jump") || act.includes("b")) {
            if (!pState.current.isJumping) {
              pState.current.vy = -7.5;
              pState.current.isJumping = true;
            }
          }
          if (act.includes("atacar") || act.includes("disparar") || act.includes("r2") || act.includes("r1")) {
            // Rate-limited shoot checks
            if (pState.current.tick % 15 === 0) {
              pState.current.bullets.push({
                x: pState.current.x + 15,
                y: pState.current.y + 10,
                vx: 5.5
              });
            }
          }
          if (act.includes("turbo") || act.includes("esquivar") || act.includes("esquivar")) {
            setTurboActive(true);
            pState.current.carSpeed = 8.5;
          }
        }
      }

      // Update calculations based on Game selection
      if (activeGame === "platformer") {
        drawPlatformer(ctx, canvas, leftRightMove);
      } else {
        drawRacing(ctx, canvas, leftRightMove);
      }

      pState.current.tick++;
      animId = requestAnimationFrame(gameLoop);
    };

    const drawPlatformer = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, leftRightMove: number) => {
      const state = pState.current;

      // Background drawing (pixel-art tech vibe)
      ctx.fillStyle = "#0c1524";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars in background
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      for (let i = 0; i < 15; i++) {
        const starX = (i * 80 - state.bgScroll * 0.15 + canvas.width) % canvas.width;
        ctx.fillRect(starX, (i * 25) % 120, 2, 2);
      }

      // Floor
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 220, canvas.width, canvas.height - 220);
      ctx.fillStyle = "#10b981";
      ctx.fillRect(0, 220, canvas.width, 4); // lawn line

      if (gameState === "playing") {
        // Move camera background scroll
        state.bgScroll += 1.2;

        // Player physics
        if (leftRightMove !== 0) {
          state.vx = leftRightMove * 2.8;
        }
        state.x += state.vx;
        state.y += state.vy;

        // Friction
        state.vx *= 0.85;

        // Gravity
        state.vy += 0.38;

        // Floor collision
        if (state.y >= 190) {
          state.y = 190;
          state.vy = 0;
          state.isJumping = false;
        }

        // Keep inside bounds
        state.x = Math.max(20, Math.min(canvas.width - 40, state.x));

        // Draw Player (Retro Mech Drone)
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(state.x + 10, state.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        // Eye of Mech
        ctx.fillStyle = "#e11d48";
        ctx.fillRect(state.x + (state.vx >= 0 ? 12 : 4), state.y + 6, 4, 3);
        // Jetpack fire
        if (state.isJumping) {
          ctx.fillStyle = "#f59e0b";
          ctx.fillRect(state.x, state.y + 18, 5, 6);
        }

        // Draw Bullets
        ctx.fillStyle = "#22d3ee";
        state.bullets.forEach((bullet, bIdx) => {
          bullet.x += bullet.vx;
          ctx.fillRect(bullet.x, bullet.y, 6, 3);
          
          // Bullet bounds cleanup
          if (bullet.x > canvas.width) {
            state.bullets.splice(bIdx, 1);
          }
        });

        // Draw and Update Obstacles
        state.obstacles.forEach((obs, oIdx) => {
          obs.x -= 2; // move left
          
          if (obs.type === "cactus") {
            ctx.fillStyle = "#537c3c";
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.fillStyle = "#3b5c29";
            ctx.fillRect(obs.x + 3, obs.y + 4, 6, obs.height - 4);
          } else if (obs.type === "spikes") {
            ctx.fillStyle = "#e2e8f0";
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width / 2, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();
          } else { // UFO alien floating
            ctx.fillStyle = "#cd7bef";
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            // lights
            ctx.fillStyle = "#10b981";
            ctx.fillRect(obs.x + 4, obs.y + 4, 3, 3);
          }

          // Bullet collision with Obstacles (destroys Cactus / UFO)
          state.bullets.forEach((bullet, bIdx) => {
            if (
              bullet.x > obs.x &&
              bullet.x < obs.x + obs.width &&
              bullet.y > obs.y &&
              bullet.y < obs.y + obs.height
            ) {
              setScore(prev => prev + 15);
              state.bullets.splice(bIdx, 1);
              
              // Move obstacle back to recycle
              obs.x = canvas.width + Math.random() * 300 + 100;
            }
          });

          // Player collision with Obstacles
          const px = state.x + 10;
          const py = state.y + 10;
          if (
            px + 6 > obs.x &&
            px - 6 < obs.x + obs.width &&
            py + 6 > obs.y &&
            py - 6 < obs.y + obs.height
          ) {
            // Hit! Gameover
            setGameState("gameover");
            if (score > highScore) setHighScore(score);
          }

          // Recycle obstacles that pass offscreen
          if (obs.x < -40) {
            obs.x = canvas.width + Math.random() * 400 + 400;
            setScore(prev => prev + 10);
          }
        });

        // Collectables (Orb Points)
        state.collectables.forEach((star) => {
          star.x -= 1.8;
          if (!star.collected) {
            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();

            // Collision check
            const dist = Math.hypot(star.x - (state.x + 10), star.y - (state.y + 10));
            if (dist < star.radius + 10) {
              star.collected = true;
              setScore(prev => prev + 25);
            }
          }

          // Recycle
          if (star.x < -20) {
            star.x = canvas.width + Math.random() * 200 + 50;
            star.collected = false;
          }
        });

        // Draw Score UI inside Canvas
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`SCORE: ${score}`, 20, 25);
      } else {
        // Idle screen or gameover
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px system-ui";
        ctx.textAlign = "center";
        
        if (gameState === "gameover") {
          ctx.fillText("🎮 ¡FIN JUEGO! (COLISIÓN)", canvas.width / 2, canvas.height / 2 - 10);
          ctx.fillStyle = "#38bdf8";
          ctx.fillText(`PUNTOS OBTENIDOS: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
        } else {
          ctx.fillText("Simulador de Juegos Mapeados", canvas.width / 2, canvas.height / 2 - 10);
          ctx.fillStyle = "#64748b";
          ctx.font = "10px monospace";
          ctx.fillText("Presiona JUGAR para iniciar aventura", canvas.width / 2, canvas.height / 2 + 15);
        }
        ctx.textAlign = "left"; // restore
      }
    };

    const drawRacing = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, leftRightMove: number) => {
      const state = pState.current;

      // Floor Grass background
      ctx.fillStyle = "#14532d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Track Lane boundaries (Perspective drawing)
      const centerX = canvas.width / 2;
      ctx.fillStyle = "#334155"; // gray road

      ctx.beginPath();
      ctx.moveTo(centerX - 40, 0);
      ctx.lineTo(centerX + 40, 0);
      ctx.lineTo(centerX + 160, canvas.height);
      ctx.lineTo(centerX - 160, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Road side margins stripes (red and white)
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX - 40, 0);
      ctx.lineTo(centerX - 160, canvas.height);
      ctx.moveTo(centerX + 40, 0);
      ctx.lineTo(centerX + 160, canvas.height);
      ctx.stroke();

      if (gameState === "playing") {
        // Increment Score through constant speed
        setScore(prev => prev + 1);

        // Movement calculations
        if (leftRightMove !== 0) {
          state.carX += leftRightMove * 3.5;
        }

        // Limit car within track boundaries on bottom
        state.carX = Math.max(centerX - 110, Math.min(centerX + 90, state.carX));

        // Draw Player Car / Bike
        ctx.fillStyle = turboActive ? "#fb7185" : "#ef4444";
        // main chassis
        ctx.fillRect(state.carX, 175, 20, 32);
        // tires
        ctx.fillStyle = "#000000";
        ctx.fillRect(state.carX - 4, 180, 4, 8);
        ctx.fillRect(state.carX + 20, 180, 4, 8);
        ctx.fillRect(state.carX - 4, 196, 4, 8);
        ctx.fillRect(state.carX + 20, 196, 4, 8);
        
        // spoilers
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(state.carX - 6, 172, 32, 4);

        // Draw Thruster boost flame if turbo active
        if (turboActive) {
          ctx.fillStyle = "#f59e0b";
          ctx.fillRect(state.carX + 6, 207, 8, 12);
        }

        // Control and Draw Rivals
        state.rivals.forEach((riv) => {
          riv.y += (state.carSpeed - riv.speed);
          
          const rx = centerX - 80 + riv.lane * 80;
          ctx.fillStyle = "#e11d48";
          ctx.fillRect(rx, riv.y, 22, 34);
          
          // tires for rival
          ctx.fillStyle = "#111827";
          ctx.fillRect(rx - 3, riv.y + 4, 3, 7);
          ctx.fillRect(rx + 22, riv.y + 4, 3, 7);
          ctx.fillRect(rx - 3, riv.y + 22, 3, 7);
          ctx.fillRect(rx + 22, riv.y + 22, 3, 7);

          // Collision Check with rival
          if (
            state.carX + 18 > rx &&
            state.carX < rx + 22 &&
            175 < riv.y + 34 &&
            207 > riv.y
          ) {
            // Collision!
            setGameState("gameover");
            if (score > highScore) setHighScore(score);
          }

          // Recycle rival when passes bottom
          if (riv.y > canvas.height + 40) {
            riv.y = -200 - Math.random() * 300;
            riv.lane = Math.floor(Math.random() * 3);
            setScore(prev => prev + 50);
          }
        });

      } else {
        // Idle / GameOver details
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px system-ui";
        ctx.textAlign = "center";
        
        if (gameState === "gameover") {
          ctx.fillText("💥 ¡COLISIÓN AUTOMOVILÍSTICA!", canvas.width / 2, canvas.height / 2 - 10);
          ctx.fillStyle = "#f43f5e";
          ctx.fillText(`PUNTAJE FINAL: ${score} METROS`, canvas.width / 2, canvas.height / 2 + 15);
        } else {
          ctx.fillText("Simulador de Moto-Cross / Carreras", canvas.width / 2, canvas.height / 2 - 10);
          ctx.fillStyle = "#94a3b8";
          ctx.font = "10px monospace";
          ctx.fillText("Usa tus sticks o teclas de dirección y TURBO!", canvas.width / 2, canvas.height / 2 + 15);
        }
        ctx.textAlign = "left"; // reset alignment
      }

      // Draw Score HUD inside Canvas
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`DISTANCIA: ${score}m`, 20, 25);
    };

  }, [activeGame, gameState]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Simulation Screen View */}
      <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Gamepad className="text-emerald-400 h-4 w-4" />
              Consola de Prueba de Juego
            </h3>
            <p className="text-[10px] text-slate-400">Prueba cómo responde tu mapeo actual sobre estos comandos de juego interactivos</p>
          </div>

          <div className="flex gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl">
            <button
              onClick={() => {
                setActiveGame("platformer");
                setGameState("idle");
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all ${
                activeGame === "platformer"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              2D Aventura
            </button>
            <button
              onClick={() => {
                setActiveGame("racing");
                setGameState("idle");
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all ${
                activeGame === "racing"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Carreras Retro
            </button>
          </div>
        </div>

        {/* Video Game Canvas Container representing mobile screen */}
        <div className="relative border border-slate-800/80 bg-slate-950 rounded-2xl overflow-hidden shadow-inner max-w-full">
          <canvas
            ref={canvasRef}
            width={430}
            height={240}
            className="w-full h-auto aspect-[16/9] block"
          />

          {/* Touch Coordinate HUD Overlay - visually flashes transparent red touch coordinates when mapping triggers */}
          {gameState === "playing" && mappings.map((map) => {
            const isPressed = activePresses[map.id];
            if (!isPressed) return null;
            return (
              <div
                key={map.id}
                style={{ left: `${map.targetX}%`, top: `${map.targetY}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
              >
                {/* Visual tactile tap pulse circle representing absolute Tap Injection */}
                <div className="w-8 h-8 rounded-full border-2 border-emerald-400 bg-emerald-500/20 animate-ping opacity-80" />
                <div className="w-4 h-4 rounded-full bg-emerald-500/40 border border-emerald-400 flex items-center justify-center text-[7px] font-bold text-slate-100 shadow shadow-emerald-500/50">
                  {map.label.charAt(0)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls & Info bottom block */}
        <div className="w-full mt-4 flex flex-wrap justify-between items-center gap-3 bg-slate-950 p-4 border border-slate-800 rounded-xl">
          <div className="flex gap-2">
            {gameState !== "playing" ? (
              <button
                onClick={startGame}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all hover:scale-103 active:scale-97"
              >
                <Play className="h-4 w-4" /> Jugar Ahora
              </button>
            ) : (
              <button
                onClick={() => setGameState("idle")}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
              >
                <RotateCcw className="h-4 w-4" /> Detener
              </button>
            )}
          </div>

          <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
            <Award className="h-4 w-4 text-amber-500 shrink-0" />
            <span>PUNTAJE MÁXIMO DE SESIÓN: <strong className="text-slate-100 font-bold">{highScore}</strong></span>
          </div>
        </div>
      </div>

      {/* Side HUD layout mapper diagnostics instructions */}
      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <Gamepad2 className="text-indigo-400 h-5 w-5" />
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">Monitoreo de Mapeo Activo</h4>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal mb-4">
            A continuación se detallan los toques que Shizuku o Mantis inyectarán cuando presiones los botones de tu gamepad. 
            ¡Prueba presionarlos ahora mismo!
          </p>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {mappings.map((map) => {
              const isPressed = activePresses[map.id];
              return (
                <div
                  key={map.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isPressed
                      ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-300 scale-102 shadow-md shadow-emerald-500/5"
                      : "bg-slate-950 border-slate-800/60 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${isPressed ? "bg-emerald-400 animate-pulse" : "bg-slate-700"}`} />
                    <span className="text-[11px] font-semibold">{map.label}</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">
                    Sincronizado a X:{map.targetX}% Y:{map.targetY}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic tips warning feedback */}
        <div className="mt-5 p-3.5 bg-indigo-950/20 border border-indigo-900/30 rounded-xl flex items-start gap-2.5">
          <HelpCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-[10px] leading-normal text-slate-400">
            <strong className="text-indigo-300 block mb-0.5">¿No tienes un control conectado?</strong>
            Puedes emular el mapeo usando el teclado: <code className="bg-slate-900 px-1 py-0.5 text-indigo-400 rounded">W</code> para saltar, <code className="bg-slate-900 px-1 py-0.5 text-indigo-400 rounded">Flechas / A D</code> para dirección, y <code className="bg-slate-900 px-1 py-0.5 text-indigo-400 rounded">F / Enter</code> para atacar.
          </div>
        </div>
      </div>
    </div>
  );
}
