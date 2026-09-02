import { describe, expect, it } from "vitest";
import { colorHex, isCustomColor, isLightColor, resolveColor } from "./color";

describe("resolveColor", () => {
  it("accepts palette ids as-is", () => {
    expect(resolveColor("sky")).toEqual({ color: "sky", mapped: null });
  });
  it("maps english aliases", () => {
    expect(resolveColor("light blue")?.color).toBe("sky");
    expect(resolveColor("skin")?.color).toBe("peach");
  });
  it("keeps a hex as a custom color, normalized", () => {
    expect(resolveColor("#87CEEB")).toEqual({ color: "#87ceeb", mapped: null });
    expect(resolveColor("abc")?.color).toBe("#aabbcc");
  });
  it("folds a hex that equals a palette color into its id", () => {
    expect(resolveColor("#e5484d")).toEqual({ color: "red", mapped: { from: "#e5484d", to: "red" } });
  });
  it("turns css names into custom colors", () => {
    expect(resolveColor("grey")).toEqual({ color: "#808080", mapped: { from: "grey", to: "#808080" } });
    expect(resolveColor("pink")?.color).toBe("#ffc0cb");
  });
  it("rejects nonsense", () => {
    expect(resolveColor("")).toBeNull();
    expect(resolveColor("not-a-color")).toBeNull();
  });
});

describe("color helpers", () => {
  it("tells custom colors from palette ids", () => {
    expect(isCustomColor("#808080")).toBe(true);
    expect(isCustomColor("red")).toBe(false);
  });
  it("resolves hex for both kinds", () => {
    expect(colorHex("red")).toBe("#E5484D");
    expect(colorHex("#808080")).toBe("#808080");
    expect(colorHex("nope")).toBeUndefined();
  });
  it("picks dark ink for light colors", () => {
    expect(isLightColor("#FFD60A")).toBe(true);
    expect(isLightColor("#1F1F1F")).toBe(false);
  });
});
