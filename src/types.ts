export interface ButtonMapping {
  id: string; // unique id (e.g., "btn_a", "btn_b")
  label: string; // (e.g., "A", "B", "X", "Y", "L1", "R1", "L2", "R2")
  targetX: number; // percentage coordinate on virtual mobile screen (0 to 100)
  targetY: number; // percentage coordinate on virtual mobile screen (0 to 100)
  gamepadButtonIndex?: number; // index in Gamepad.buttons array
  gamepadAxisIndex?: number; // if mapped to an axis
  axisDirection?: 1 | -1; // positive or negative direction for axis
  assignedKey?: string; // fallback physical keyboard key (e.g. "Space", "Shift")
}

export interface GamePreset {
  name: string;
  genre: string;
  bgUrl: string;
  mappings: ButtonMapping[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export interface PairingState {
  ipAddress: string;
  port: string;
  pairingCode: string;
  status: "disconnected" | "pairing" | "paired" | "connecting" | "connected" | "error";
  logs: string[];
}
