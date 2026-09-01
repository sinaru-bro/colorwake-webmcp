import type { Rig } from "../state/types";

export const RIGS: Rig[] = [
  {
    id: "quadruped",
    label: "Four-legged",
    parts: [
      { id: "body", label: "body", required: true },
      { id: "head", label: "head", required: true },
      { id: "leg-fl", label: "front left leg", required: true },
      { id: "leg-fr", label: "front right leg", required: true },
      { id: "leg-bl", label: "back left leg", required: true },
      { id: "leg-br", label: "back right leg", required: true },
      { id: "tail", label: "tail", required: true },
      { id: "ear-l", label: "left ear", required: false },
      { id: "ear-r", label: "right ear", required: false },
    ],
  },
  {
    id: "swimmer",
    label: "Swimmer",
    parts: [
      { id: "body", label: "body", required: true },
      { id: "tail-fin", label: "tail fin", required: true },
      { id: "head", label: "head", required: false },
      { id: "fin-l", label: "near fin", required: false },
      { id: "fin-r", label: "far fin", required: false },
      { id: "fin-top", label: "top fin", required: false },
    ],
  },
  {
    id: "winged",
    label: "Winged",
    parts: [
      { id: "body", label: "body", required: true },
      { id: "wing-l", label: "near wing", required: true },
      { id: "wing-r", label: "far wing", required: true },
      { id: "head", label: "head", required: false },
      { id: "tail", label: "tail", required: false },
    ],
  },
  {
    id: "biped",
    label: "Two-legged",
    parts: [
      { id: "body", label: "body", required: true },
      { id: "head", label: "head", required: true },
      { id: "arm-l", label: "left arm", required: true },
      { id: "arm-r", label: "right arm", required: true },
      { id: "leg-l", label: "left leg", required: false },
      { id: "leg-r", label: "right leg", required: false },
      { id: "hand-l", label: "left hand", required: false },
      { id: "hand-r", label: "right hand", required: false },
    ],
  },
  {
    id: "object",
    label: "Thing",
    parts: [
      { id: "body", label: "body", required: true },
      { id: "accent-1", label: "accent 1", required: false },
      { id: "accent-2", label: "accent 2", required: false },
    ],
  },
];

export function rigById(id: string): Rig | undefined {
  return RIGS.find((r) => r.id === id);
}
