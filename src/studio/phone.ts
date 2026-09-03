import { useEffect, useState } from "react";

const PHONE = "(max-aspect-ratio: 1/1) and (max-width: 600px)";
const LANDSCAPE = "(orientation: landscape) and (max-height: 600px)";

function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

/** True on a portrait phone-sized screen, live with rotation. */
export function usePhone(): boolean {
  return useMedia(PHONE);
}

/** True on a landscape phone-sized screen, live with rotation. */
export function useLandscape(): boolean {
  return useMedia(LANDSCAPE);
}
