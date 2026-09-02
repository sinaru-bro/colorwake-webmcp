import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { STROKE_PRESETS } from "../content/strokes";
import { colorHex } from "../lib/color";
import { pathFromPoints, simplify, toViewBoxPoint } from "../lib/geometry";
import { newId } from "../lib/ids";
import type { Paint, Sketch, Stroke, ToolState } from "../state/types";
import { cloneSketchSvg } from "./loader";

const UNPAINTED = "#FFFFFF";
const SIMPLIFY_TOLERANCE = 1;
const SOFT_MARGIN = 3;
const NS = "http://www.w3.org/2000/svg";

interface RegionRefs {
  path: SVGPathElement;
  strokes: SVGGElement;
}

interface StrokeNode {
  node: SVGElement;
  update(points: number[]): void;
}

interface Props {
  sketch: Sketch;
  paint: Paint;
  interactive?: boolean;
  tool?: ToolState;
  onFill?: (regionId: string) => void;
  onStroke?: (stroke: Omit<Stroke, "id">) => void;
  className?: string;
}

function hexOf(color: string): string {
  return colorHex(color) ?? UNPAINTED;
}

function rewriteIds(svg: SVGSVGElement, prefix: string): void {
  for (const el of svg.querySelectorAll("[id]")) el.id = `${prefix}-${el.id}`;
  const attrs = ["fill", "stroke", "filter", "clip-path", "mask", "href"];
  for (const el of svg.querySelectorAll("*")) {
    for (const attr of attrs) {
      const v = el.getAttribute(attr);
      if (!v) continue;
      if (v.startsWith("url(#")) el.setAttribute(attr, `url(#${prefix}-${v.slice(5)}`);
      else if (attr === "href" && v.startsWith("#")) el.setAttribute(attr, `#${prefix}-${v.slice(1)}`);
    }
  }
}

/**
 * A soft stroke blurs through its own filter whose region follows the stroke in user space;
 * the default bounding-box region collapses on straight or single-point strokes.
 */
function strokeNode(stroke: Omit<Stroke, "id">, key: string): StrokeNode {
  const preset = STROKE_PRESETS[stroke.tool][stroke.size];
  const path = document.createElementNS(NS, "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", hexOf(stroke.color));
  path.setAttribute("stroke-width", String(preset.width));
  path.setAttribute("stroke-opacity", String(preset.opacity));
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  if (preset.dash) path.setAttribute("stroke-dasharray", preset.dash);
  if (!preset.blur) {
    path.setAttribute("d", pathFromPoints(stroke.points));
    return { node: path, update: (points) => path.setAttribute("d", pathFromPoints(points)) };
  }
  const group = document.createElementNS(NS, "g");
  const filter = document.createElementNS(NS, "filter");
  filter.id = key;
  filter.setAttribute("filterUnits", "userSpaceOnUse");
  const blur = document.createElementNS(NS, "feGaussianBlur");
  blur.setAttribute("stdDeviation", String(preset.blur));
  filter.append(blur);
  path.setAttribute("filter", `url(#${key})`);
  group.append(filter, path);
  const pad = preset.width / 2 + preset.blur * 3 + SOFT_MARGIN;
  const update = (points: number[]) => {
    path.setAttribute("d", pathFromPoints(points));
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i + 1 < points.length; i += 2) {
      minX = Math.min(minX, points[i]);
      maxX = Math.max(maxX, points[i]);
      minY = Math.min(minY, points[i + 1]);
      maxY = Math.max(maxY, points[i + 1]);
    }
    if (minX === Infinity) return;
    filter.setAttribute("x", (minX - pad).toFixed(1));
    filter.setAttribute("y", (minY - pad).toFixed(1));
    filter.setAttribute("width", (maxX - minX + pad * 2).toFixed(1));
    filter.setAttribute("height", (maxY - minY + pad * 2).toFixed(1));
  };
  update(stroke.points);
  return { node: group, update };
}

function mountInstance(
  sketch: Sketch,
  prefix: string,
): { svg: SVGSVGElement; regions: Map<string, RegionRefs> } {
  const svg = cloneSketchSvg(sketch);
  rewriteIds(svg, prefix);
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.display = "block";
  const defs = document.createElementNS(NS, "defs");
  svg.prepend(defs);
  const regions = new Map<string, RegionRefs>();
  for (const path of svg.querySelectorAll<SVGPathElement>("path[data-region]")) {
    const id = path.dataset.region ?? "";
    const clip = document.createElementNS(NS, "clipPath");
    clip.id = `${prefix}-clip-${id}`;
    const clipShape = document.createElementNS(NS, "path");
    clipShape.setAttribute("d", path.getAttribute("d") ?? "");
    clip.append(clipShape);
    defs.append(clip);
    const strokes = document.createElementNS(NS, "g");
    strokes.dataset.strokes = id;
    strokes.setAttribute("clip-path", `url(#${clip.id})`);
    strokes.style.pointerEvents = "none";
    path.after(strokes);
    path.setAttribute("fill", UNPAINTED);
    regions.set(id, { path, strokes });
  }
  return { svg, regions };
}

export function SketchSurface({
  sketch,
  paint,
  interactive = false,
  tool,
  onFill,
  onStroke,
  className,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const instance = useRef<ReturnType<typeof mountInstance> | null>(null);
  const prefix = useMemo(() => newId("sk"), []);
  const live = useRef({ tool, onFill, onStroke });
  useLayoutEffect(() => {
    live.current = { tool, onFill, onStroke };
  });

  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    const inst = mountInstance(sketch, prefix);
    el.replaceChildren(inst.svg);
    instance.current = inst;
    return () => {
      instance.current = null;
      el.replaceChildren();
    };
  }, [sketch, prefix]);

  useLayoutEffect(() => {
    const inst = instance.current;
    if (!inst) return;
    for (const [id, refs] of inst.regions) {
      refs.path.setAttribute("fill", paint.fills[id] ? hexOf(paint.fills[id]) : UNPAINTED);
      refs.strokes.replaceChildren();
    }
    for (const stroke of paint.strokes) {
      const refs = inst.regions.get(stroke.region);
      if (refs) refs.strokes.append(strokeNode(stroke, `${prefix}-${stroke.id}`).node);
    }
  }, [paint, sketch, prefix]);

  useEffect(() => {
    const el = host.current;
    if (!el || !interactive) return;
    let drawing: {
      region: string;
      points: number[];
      preview: StrokeNode;
      tool: Exclude<ToolState["tool"], "fill">;
    } | null = null;
    let frame = 0;

    const flush = () => {
      frame = 0;
      if (drawing) drawing.preview.update(drawing.points);
    };

    const onDown = (e: PointerEvent) => {
      const inst = instance.current;
      const current = live.current;
      if (!inst || !current.tool || e.button !== 0) return;
      const target = (e.target as Element).closest("path[data-region]") as SVGPathElement | null;
      if (!target || !inst.svg.contains(target)) return;
      const region = target.dataset.region ?? "";
      if (current.tool.tool === "fill") {
        current.onFill?.(region);
        return;
      }
      const p = toViewBoxPoint(inst.svg, e.clientX, e.clientY);
      const refs = inst.regions.get(region);
      if (!p || !refs) return;
      const stroke = {
        region,
        tool: current.tool.tool,
        color: current.tool.color,
        size: current.tool.size,
        points: [p.x, p.y],
      };
      const preview = strokeNode(stroke, `${prefix}-draw`);
      refs.strokes.append(preview.node);
      drawing = { region, points: stroke.points, preview, tool: current.tool.tool };
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    };

    const onMove = (e: PointerEvent) => {
      const inst = instance.current;
      if (!drawing || !inst) return;
      const p = toViewBoxPoint(inst.svg, e.clientX, e.clientY);
      if (!p) return;
      drawing.points.push(p.x, p.y);
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const finish = (e: PointerEvent) => {
      if (!drawing) return;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      const { region, tool: strokeTool, preview } = drawing;
      let points = drawing.points;
      if (points.length === 2) points = [points[0], points[1], points[0] + 0.01, points[1] + 0.01];
      points = simplify(points, SIMPLIFY_TOLERANCE);
      preview.node.remove();
      const current = live.current;
      drawing = null;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (current.tool)
        current.onStroke?.({
          region,
          tool: strokeTool,
          color: current.tool.color,
          size: current.tool.size,
          points,
        });
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", finish);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", finish);
      el.removeEventListener("pointercancel", finish);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [interactive, prefix]);

  return (
    <div
      ref={host}
      className={className}
      style={{ width: "100%", height: "100%", touchAction: interactive ? "none" : "auto" }}
      aria-label={sketch.title}
      role={interactive ? "application" : "img"}
    />
  );
}
