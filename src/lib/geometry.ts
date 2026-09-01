import type { Position } from "../state/types";

export function toViewBoxPoint(svg: SVGSVGElement, clientX: number, clientY: number): Position | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

function perpendicularDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Ramer–Douglas–Peucker on a flat [x0, y0, x1, y1, …] array. */
export function simplify(points: number[], tolerance = 1): number[] {
  const n = points.length / 2;
  if (n <= 2) return points.slice();
  const keep = new Uint8Array(n);
  keep[0] = 1;
  keep[n - 1] = 1;
  const stack: [number, number][] = [[0, n - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    let maxD = 0;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = perpendicularDistance(
        points[i * 2],
        points[i * 2 + 1],
        points[a * 2],
        points[a * 2 + 1],
        points[b * 2],
        points[b * 2 + 1],
      );
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > tolerance && idx !== -1) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  const out: number[] = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(points[i * 2], points[i * 2 + 1]);
  return out;
}

export function pathFromPoints(points: number[]): string {
  if (points.length < 2) return "";
  let d = `M${points[0].toFixed(1)} ${points[1].toFixed(1)}`;
  for (let i = 2; i < points.length; i += 2) d += `L${points[i].toFixed(1)} ${points[i + 1].toFixed(1)}`;
  return d;
}
