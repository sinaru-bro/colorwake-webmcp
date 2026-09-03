import { useEffect, useState } from "react";

const PHONE = "(max-aspect-ratio: 1/1) and (max-width: 600px)";
const PAD = "(max-aspect-ratio: 1/1) and (min-width: 601px) and (max-width: 1024px)";
const LANDSCAPE = "(orientation: landscape) and (max-height: 600px)";
const PAD_LANDSCAPE = "(orientation: landscape) and (min-height: 601px) and (pointer: coarse)";

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

/** True on a portrait tablet-sized screen, live with rotation. */
export function usePad(): boolean {
  return useMedia(PAD);
}

/** True on a landscape phone-sized screen, live with rotation. */
export function useLandscape(): boolean {
  return useMedia(LANDSCAPE);
}

/** True on a landscape touch screen taller than a phone, live with rotation. */
export function usePadLandscape(): boolean {
  return useMedia(PAD_LANDSCAPE);
}

/** True on any compact layout — portrait phone or pad, or landscape — live with rotation. */
export function useCompact(): boolean {
  const phone = usePhone();
  const pad = usePad();
  const landscape = useLandscape();
  const padLandscape = usePadLandscape();
  return phone || pad || landscape || padLandscape;
}
