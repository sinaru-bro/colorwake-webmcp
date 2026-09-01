import type { Primitive } from "../../state/types";
import { PRIMITIVES, ROTATE_CAPS, type BuildContext, type ParamSpec, type ParamValue } from "./primitives";

function partRange(
  primitive: Primitive,
  key: string,
  spec: ParamSpec,
  ctx: BuildContext,
): [number, number] | null {
  const lo = spec.min;
  const hi = spec.max;
  if (ctx.isPart && ctx.partClass) {
    const caps = ROTATE_CAPS[ctx.partClass];
    if (primitive === "rotate" && (key === "from" || key === "to")) return [-caps.rotate, caps.rotate];
    if (primitive === "wave" && key === "angle") return [0, caps.waveAngle];
    if (primitive === "wave" && key === "offset") return [-caps.waveOffset, caps.waveOffset];
    if (spec.partMin !== undefined && spec.partMax !== undefined) return [spec.partMin, spec.partMax];
  }
  if (lo === undefined || hi === undefined) return null;
  return [lo, hi];
}

export function clampParams(
  primitive: Primitive,
  params: Record<string, unknown> | undefined,
  ctx: BuildContext,
): { params: Record<string, ParamValue>; clamped: Record<string, unknown>; ignored: string[] } {
  const def = PRIMITIVES[primitive];
  const out: Record<string, ParamValue> = {};
  const clamped: Record<string, unknown> = {};
  const ignored: string[] = [];
  for (const [key, spec] of Object.entries(def.params)) out[key] = spec.default;
  for (const [key, raw] of Object.entries(params ?? {})) {
    const spec = def.params[key];
    if (!spec) {
      ignored.push(key);
      continue;
    }
    if (typeof spec.default === "boolean") {
      const v = raw === true || raw === "true" ? true : raw === false || raw === "false" ? false : null;
      if (v === null) clamped[key] = spec.default;
      else out[key] = v;
      continue;
    }
    if (spec.enum) {
      if (typeof raw === "string" && spec.enum.includes(raw)) out[key] = raw;
      else clamped[key] = spec.default;
      continue;
    }
    const n = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(n)) {
      clamped[key] = spec.default;
      continue;
    }
    let v = spec.integer ? Math.round(n) : n;
    const range = partRange(primitive, key, spec, ctx);
    if (range) v = Math.min(range[1], Math.max(range[0], v));
    if (v !== n) clamped[key] = v;
    out[key] = v;
  }
  return { params: out, clamped, ignored };
}

export function describePrimitives(): Array<{ id: string; label: string; params: Record<string, string> }> {
  return Object.values(PRIMITIVES).map((def) => {
    const params: Record<string, string> = {};
    for (const [key, spec] of Object.entries(def.params)) {
      if (spec.enum) params[key] = `${spec.enum.join("|")} (default ${String(spec.default)})`;
      else if (typeof spec.default === "boolean") params[key] = `boolean (default ${String(spec.default)})`;
      else {
        const unit = def.id === "move" || def.id === "bounce" || def.id === "shake" ? " viewBox units" : "";
        const part = spec.partMin !== undefined ? `, part [${spec.partMin},${spec.partMax}]` : "";
        params[key] = `[${spec.min},${spec.max}]${unit}${part} (default ${String(spec.default)})`;
      }
    }
    return { id: def.id, label: def.label, params };
  });
}
