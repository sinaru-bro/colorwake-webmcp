import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { paletteColor } from "../content/palette";
import { STROKE_PRESETS } from "../content/strokes";
import { pathFromPoints, simplify, toViewBoxPoint } from "../lib/geometry";
import { newId } from "../lib/ids";
import type { Paint, Sketch, Stroke, ToolState } from "../state/types";
import { cloneSketchSvg } from "./loader";

const UNPAINTED = "#FFFFFF";
const SIMPLIFY_TOLERANCE = 1;

interface RegionRefs {
  path: SVGPathElement;
  strokes: SVGGElement;
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

function hexOf(colorId: string): string {
  return paletteColor(colorId)?.hex ?? UNPAINTED;
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

function strokeElement(stroke: Omit<Stroke, "id">, filterId: string): SVGPathElement {
  const preset = STROKE_PRESETS[stroke.tool][stroke.size];
  const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
  el.setAttribute("d", pathFromPoints(stroke.points));
  el.setAttribute("fill", "none");
  el.setAttribute("stroke", hexOf(stroke.color));
  el.setAttribute("stroke-width", String(preset.width));
  el.setAttribute("stroke-opacity", String(preset.opacity));
  el.setAttribute("stroke-linecap", "round");
  el.setAttribute("stroke-linejoin", "round");
  if (preset.dash) el.setAttribute("stroke-dasharray", preset.dash);
  if (preset.blur) el.setAttribute("filter", `url(#${filterId})`);
  return el;
}

function mountInstance(
  sketch: Sketch,
  prefix: string,
): { svg: SVGSVGElement; regions: Map<string, RegionRefs>; filterId: string } {
  const svg = cloneSketchSvg(sketch);
  rewriteIds(svg, prefix);
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.display = "block";
  const ns = "http://www.w3.org/2000/svg";
  const defs = document.createElementNS(ns, "defs");
  svg.prepend(defs);
  const filterId = `${prefix}-soft`;
  const filter = document.createElementNS(ns, "filter");
  filter.id = filterId;
  const blur = document.createElementNS(ns, "feGaussianBlur");
  blur.setAttribute("stdDeviation", "0.8");
  filter.append(blur);
  defs.append(filter);
  const regions = new Map<string, RegionRefs>();
  for (const path of svg.querySelectorAll<SVGPathElement>("path[data-region]")) {
    const id = path.dataset.region ?? "";
    const clip = document.createElementNS(ns, "clipPath");
    clip.id = `${prefix}-clip-${id}`;
    const clipShape = document.createElementNS(ns, "path");
    clipShape.setAttribute("d", path.getAttribute("d") ?? "");
    clip.append(clipShape);
    defs.append(clip);
    const strokes = document.createElementNS(ns, "g");
    strokes.dataset.strokes = id;
    strokes.setAttribute("clip-path", `url(#${clip.id})`);
    strokes.style.pointerEvents = "none";
    path.after(strokes);
    path.setAttribute("fill", UNPAINTED);
    regions.set(id, { path, strokes });
  }
  return { svg, regions, filterId };
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
      if (refs) refs.strokes.append(strokeElement(stroke, inst.filterId));
    }
  }, [paint, sketch]);

  useEffect(() => {
    const el = host.current;
    if (!el || !interactive) return;
    let drawing: {
      region: string;
      points: number[];
      preview: SVGPathElement;
      tool: Exclude<ToolState["tool"], "fill">;
    } | null = null;
    let frame = 0;

    const flush = () => {
      frame = 0;
      if (drawing) drawing.preview.setAttribute("d", pathFromPoints(drawing.points));
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
      const preview = strokeElement(stroke, inst.filterId);
      refs.strokes.append(preview);
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
      preview.remove();
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
  }, [interactive]);

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
