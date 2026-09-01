import { detectAgentSupport } from "./register";
import { toInputSchema } from "./schemas";
import { TOOLS, toolByName } from "./tools";

export interface RegisteredSummary {
  name: string;
  title: string;
  description: string;
  inputSchema: object | undefined;
  readOnly: boolean;
  source: "native" | "local";
}

export async function listRegistered(): Promise<RegisteredSummary[]> {
  if (detectAgentSupport() === "native" && typeof document.modelContext?.getTools === "function") {
    try {
      const tools = await document.modelContext.getTools();
      return tools.map((t) => ({
        name: t.name,
        title: t.title,
        description: t.description,
        inputSchema: t.inputSchema,
        readOnly: Boolean(t.annotations?.readOnlyHint),
        source: "native",
      }));
    } catch {
      // fall through to the local registry
    }
  }
  return TOOLS.map((t) => ({
    name: t.name,
    title: t.title,
    description: t.description,
    inputSchema: toInputSchema(t.schema),
    readOnly: Boolean(t.readOnly),
    source: "local",
  }));
}

export async function callTool(name: string, input: unknown): Promise<unknown> {
  const tool = toolByName(name);
  if (!tool)
    return {
      ok: false,
      code: "unknown_tool",
      error: `No tool "${name}".`,
      options: TOOLS.map((t) => t.name),
    };
  return tool.execute(input);
}
