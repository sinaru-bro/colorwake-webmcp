import { rigById } from "../content/rigs";
import type { Sketch } from "../state/types";

export function validateSketch(svg: SVGSVGElement, sketch: Sketch): string[] {
  const issues: string[] = [];
  const rig = rigById(sketch.rig);
  if (!rig) return [`unknown rig ${sketch.rig}`];
  const parts = new Set(
    [...svg.querySelectorAll<SVGGElement>("g[data-part]")].map((g) => g.dataset.part ?? ""),
  );
  for (const part of rig.parts)
    if (part.required && !parts.has(part.id)) issues.push(`missing part ${part.id}`);
  for (const g of svg.querySelectorAll<SVGGElement>("g[data-part]")) {
    const pivot = g.dataset.pivot ?? "";
    if (!/^\d+(\.\d+)?\s+\d+(\.\d+)?$/.test(pivot)) issues.push(`part ${g.dataset.part}: bad data-pivot`);
  }
  const regions = [...svg.querySelectorAll<SVGPathElement>("path[data-region]")];
  const ids = regions.map((p) => p.dataset.region ?? "");
  if (new Set(ids).size !== ids.length) issues.push("duplicate data-region");
  for (const p of regions) {
    if (!p.closest("g[data-part]")) issues.push(`region ${p.dataset.region} is outside any part`);
    if (p.hasAttribute("fill")) issues.push(`region ${p.dataset.region} sets fill`);
  }
  const expected = new Set(sketch.regions.map((r) => r.id));
  for (const id of ids) if (!expected.has(id)) issues.push(`region ${id} not in catalog`);
  for (const id of expected) if (!ids.includes(id)) issues.push(`catalog region ${id} missing in svg`);
  return issues;
}
