import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const errors = [];
const warns = [];
const error = (msg) => errors.push(msg);
const warn = (msg) => warns.push(msg);

const MIN_REGION_SIDE = { easy: 40, normal: 32 };
const REGION_BAND = { easy: [3, 6], normal: [8, 12] };
const RIG_IDS = ["quadruped", "swimmer", "winged", "biped", "object"];

function hasNonAscii(text) {
  for (const ch of text) {
    const c = ch.charCodeAt(0);
    if (c > 126 || (c < 32 && c !== 9 && c !== 10 && c !== 13)) return true;
  }
  return false;
}

function ids(source, re) {
  return [...source.matchAll(re)].map((m) => m[1]);
}

function readRigs() {
  const src = readFileSync(join(root, "src/content/rigs.ts"), "utf8");
  const rigs = new Map();
  const blocks = src.split(/\n\s*\{\s*\n\s*id: "/).slice(1);
  for (const block of blocks) {
    const rigId = block.slice(0, block.indexOf('"'));
    if (!RIG_IDS.includes(rigId)) continue;
    const parts = new Map();
    for (const m of block.matchAll(/\{ id: "([a-z0-9-]+)", label: "[^"]*", required: (true|false) \}/g)) {
      parts.set(m[1], m[2] === "true");
    }
    rigs.set(rigId, parts);
  }
  return rigs;
}

function readCatalog() {
  const src = readFileSync(join(root, "src/content/sketches/catalog.ts"), "utf8");
  if (hasNonAscii(src)) error("catalog.ts: non-ASCII characters in data strings");
  const entries = new Map();
  const body = src.slice(src.indexOf("SKETCHES: SketchMeta[] = ["), src.indexOf("];"));
  const chunks = body.split(/\n  \{\n/).slice(1);
  for (const chunk of chunks) {
    const id = /id: "([a-z0-9-]+)"/.exec(chunk)?.[1];
    const rig = /rig: "([a-z]+)"/.exec(chunk)?.[1];
    const level = /level: "(easy|normal)"/.exec(chunk)?.[1];
    const regionsBlock = chunk.slice(
      chunk.indexOf("regions: ["),
      chunk.indexOf("]", chunk.indexOf("regions: [")),
    );
    const regions = [...regionsBlock.matchAll(/\{ id: "([a-z0-9-]+)", label: "([^"]*)" \}/g)].map((m) => ({
      id: m[1],
      label: m[2],
    }));
    const sayingsBlock = /sayings: \[([^\]]*)\]/.exec(chunk)?.[1] ?? "";
    const sayings = ids(sayingsBlock, /"([^"]*)"/g);
    const accents = /accents: \[/.test(chunk);
    if (id) entries.set(id, { id, rig, level, regions, sayings, accents });
  }
  return entries;
}

// Tag-level pass: tracks <g> nesting so regions can be checked for a data-part ancestor.
function analyzeSvg(src, f, rigParts) {
  const tagRe = /<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g;
  const stack = [];
  const parts = [];
  const regions = [];
  for (const m of src.matchAll(tagRe)) {
    const [, closing, name, attrs, selfClosing] = m;
    if (closing) {
      if (name === "g") stack.pop();
      continue;
    }
    if (name === "g") {
      const part = /data-part="([a-z0-9-]+)"/.exec(attrs)?.[1] ?? null;
      const pivot = /data-pivot="([^"]*)"/.exec(attrs)?.[1] ?? null;
      if (part) parts.push({ id: part, pivot });
      if (!selfClosing) stack.push(part);
      continue;
    }
    const region = /data-region="([a-z0-9-]+)"/.exec(attrs)?.[1];
    if (region) {
      const d = /\sd="([^"]*)"/.exec(attrs)?.[1] ?? "";
      regions.push({
        id: region,
        d,
        hasFill: /\sfill=/.test(attrs),
        insidePart: stack.some((p) => p !== null),
        isPath: name === "path",
      });
    }
  }

  const partIds = parts.map((p) => p.id);
  if (new Set(partIds).size !== partIds.length) error(`${f}: duplicate data-part`);
  for (const p of parts) {
    if (!rigParts.has(p.id)) error(`${f}: unknown part ${p.id} for this rig`);
    const xy = p.pivot?.trim().split(/\s+/).map(Number) ?? [];
    if (xy.length !== 2 || xy.some((v) => !Number.isFinite(v) || v < 0 || v > 512))
      error(`${f}: part ${p.id} needs data-pivot="x y" within 0..512`);
  }
  for (const [id, required] of rigParts) {
    if (required && !partIds.includes(id)) error(`${f}: missing required part ${id}`);
  }
  return regions;
}

function approxBbox(d) {
  const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  if (!xs.length || !ys.length) return null;
  return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

const palette = readFileSync(join(root, "src/content/palette.ts"), "utf8");
const paletteIds = ids(palette, /\bid: "([a-z-]+)"/g);
if (new Set(paletteIds).size !== paletteIds.length) error("palette: duplicate ids");
if (paletteIds.length !== 12) error(`palette: expected 12 colors, found ${paletteIds.length}`);
for (const hex of ids(palette, /hex: "(#[0-9A-Fa-f]{6})"/g))
  if (!/^#[0-9A-F]{6}$/.test(hex)) warn(`palette: hex not uppercase ${hex}`);
const aliases = ids(palette, /aliases: \[([^\]]*)\]/g).flatMap((a) => ids(a, /"([^"]*)"/g));
if (new Set(aliases).size !== aliases.length) error("palette: duplicate aliases");
if (hasNonAscii(palette)) error("palette.ts: non-ASCII characters");

const rigs = readRigs();
if (rigs.size !== RIG_IDS.length) error(`rigs.ts: expected ${RIG_IDS.length} rigs, parsed ${rigs.size}`);
const catalog = readCatalog();

const svgDir = join(root, "src/content/sketches/svg");
const svgs = readdirSync(svgDir).filter((f) => f.endsWith(".svg"));
const svgIds = new Set(svgs.map((f) => f.replace(/\.svg$/, "")));
for (const id of catalog.keys()) if (!svgIds.has(id)) error(`catalog: ${id} has no svg file`);

for (const f of svgs) {
  const id = f.replace(/\.svg$/, "");
  const src = readFileSync(join(svgDir, f), "utf8");
  for (const tag of src.matchAll(/<[a-zA-Z][^>]*>/g)) {
    const bare = tag[0].replace(/[a-zA-Z:-]+="[^"]*"/g, "");
    if (/\s[a-zA-Z:-]+(?=\s|\/?>)/.test(bare))
      error(`${f}: attribute without a value (XML needs name="value"): ${tag[0].slice(0, 60)}`);
  }
  const meta = catalog.get(id);
  if (!meta) error(`${f}: no catalog entry`);

  if (!/viewBox="0 0 512 512"/.test(src)) error(`${f}: viewBox must be 0 0 512 512`);
  const rig = /data-rig="([a-z]+)"/.exec(src)?.[1];
  if (!rig || !RIG_IDS.includes(rig)) error(`${f}: missing or unknown data-rig`);
  if (meta && rig && meta.rig !== rig) error(`${f}: data-rig ${rig} but catalog says ${meta.rig}`);
  if (/<(script|image|text|foreignObject|style)\b/.test(src)) error(`${f}: forbidden element`);
  if (/href="https?:/.test(src)) error(`${f}: external reference`);
  if (/\swidth=|\sheight=/.test(src.slice(0, src.indexOf(">"))))
    error(`${f}: root must not set width/height`);
  if (hasNonAscii(src)) error(`${f}: non-ASCII characters`);

  const rigParts = rigs.get(rig) ?? new Map();
  const regions = analyzeSvg(src, f, rigParts);
  const regionIds = regions.map((r) => r.id);
  if (new Set(regionIds).size !== regionIds.length) error(`${f}: duplicate data-region`);

  const level = meta?.level ?? "normal";
  const [lo, hi] = REGION_BAND[level];
  if (regions.length < lo || regions.length > hi)
    error(`${f}: ${regions.length} regions, ${level} needs ${lo}..${hi}`);

  for (const r of regions) {
    if (!r.isPath) error(`${f}: region ${r.id} must be a <path>`);
    if (r.hasFill) error(`${f}: region ${r.id} must not set fill`);
    if (!/[zZ]\s*$/.test(r.d)) error(`${f}: region ${r.id} path must close with Z`);
    if (!r.insidePart) error(`${f}: region ${r.id} is not inside a data-part`);
    const box = approxBbox(r.d);
    if (box && Math.min(box.w, box.h) < MIN_REGION_SIDE[level])
      warn(
        `${f}: region ${r.id} short side ~${Math.round(Math.min(box.w, box.h))} < ${MIN_REGION_SIDE[level]}`,
      );
  }

  if (meta) {
    const catalogIds = meta.regions.map((r) => r.id).sort();
    const svgSorted = [...regionIds].sort();
    if (catalogIds.join(",") !== svgSorted.join(","))
      error(`${f}: catalog regions [${catalogIds}] differ from svg [${svgSorted}]`);
    for (const r of meta.regions) if (!r.label.trim()) error(`catalog ${id}: region ${r.id} has empty label`);
    if (meta.sayings.length < 2 || meta.sayings.length > 3) error(`catalog ${id}: sayings must be 2..3`);
    if (meta.rig === "object" && !meta.accents) error(`catalog ${id}: object sketches need accents`);
  }
}

for (const w of warns) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(
  `check:content - ${svgs.length} sketch file(s), ${errors.length} error(s), ${warns.length} warning(s)`,
);
if (errors.length) process.exit(1);
