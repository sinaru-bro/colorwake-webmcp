import type { PlaceArt } from "./types";

export const blank: PlaceArt = {
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#F1E7D2" />
      <path d="M0 0 H1600 V26 Q800 44 0 26 Z" fill="#F7EFDF" />
      <path d="M0 264 V190 Q800 160 1600 190 V264 Z" fill="#E8DCC2" />
    </>
  ),
};
