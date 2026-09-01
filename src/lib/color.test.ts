import { describe, expect, it } from "vitest";
import { resolveColor } from "./color";

describe("resolveColor", () => {
  it("accepts palette ids as-is", () => {
    expect(resolveColor("sky")).toEqual({ id: "sky", mapped: null });
  });
  it("maps english aliases", () => {
    expect(resolveColor("light blue")?.id).toBe("sky");
    expect(resolveColor("skin")?.id).toBe("peach");
  });
  it("maps css hex and names to the nearest palette color", () => {
    expect(resolveColor("#87ceeb")?.id).toBe("sky");
    expect(resolveColor("grey")?.mapped).not.toBeNull();
  });
  it("rejects nonsense", () => {
    expect(resolveColor("")).toBeNull();
    expect(resolveColor("not-a-color")).toBeNull();
  });
});
