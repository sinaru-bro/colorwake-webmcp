import { useEffect, useState } from "react";

const PHONE = "(max-aspect-ratio: 1/1) and (max-width: 600px)";

/** True on a portrait phone-sized screen, live with rotation. */
export function usePhone(): boolean {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const update = () => setPhone(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return phone;
}
