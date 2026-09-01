import type { Sketch } from "../state/types";

const cache = new Map<string, SVGSVGElement>();

export function loadSketchSvg(sketch: Sketch): SVGSVGElement {
  const cached = cache.get(sketch.id);
  if (cached) return cached;
  const doc = new DOMParser().parseFromString(sketch.svg, "image/svg+xml");
  const root = doc.documentElement;
  if (!(root instanceof SVGSVGElement)) throw new Error(`sketch ${sketch.id}: not an svg document`);
  cache.set(sketch.id, root);
  return root;
}

export function cloneSketchSvg(sketch: Sketch): SVGSVGElement {
  const clone = document.importNode(loadSketchSvg(sketch), true);
  return clone as SVGSVGElement;
}
