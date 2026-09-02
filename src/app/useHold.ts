import { useEffect, useRef, useState } from "react";

/** Press-and-hold gesture: `onComplete` fires after `ms` unless the pointer lifts or leaves first. */
export function useHold(ms: number, onComplete: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);
  const start = () => {
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onComplete();
    }, ms);
  };
  const cancel = () => {
    setHolding(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => cancel, []);
  return { holding, start, cancel };
}
