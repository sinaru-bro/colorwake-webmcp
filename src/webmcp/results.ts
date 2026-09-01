export interface ToolError {
  ok: false;
  code: string;
  error: string;
  hint?: string;
  options?: unknown[];
}

export type ToolResult<T extends object = Record<string, unknown>> = ({ ok: true } & T) | ToolError;

export function ok<T extends object>(data: T): { ok: true } & T {
  return { ok: true, ...data };
}

export function fail(
  code: string,
  error: string,
  extra: Partial<Pick<ToolError, "hint" | "options">> = {},
): ToolError {
  return { ok: false, code, error, ...extra };
}
