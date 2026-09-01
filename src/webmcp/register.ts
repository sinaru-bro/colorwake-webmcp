import { ui, type AgentSupport } from "../state/ui";
import { toInputSchema } from "./schemas";
import { TOOLS, type ToolDef } from "./tools";

export type { AgentSupport };

export function detectAgentSupport(): AgentSupport {
  return typeof document !== "undefined" && typeof document.modelContext?.registerTool === "function"
    ? "native"
    : "none";
}

export function toModelContextTool(tool: ToolDef): WebMCP.ModelContextTool {
  return {
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: toInputSchema(tool.schema),
    ...(tool.readOnly ? { annotations: { readOnlyHint: true } } : {}),
    execute: (input) => tool.execute(input),
  };
}

export async function registerAll(
  signal: AbortSignal,
): Promise<{ support: AgentSupport; registered: number }> {
  const support = detectAgentSupport();
  ui.setAgent(support);
  if (support === "none") return { support, registered: 0 };
  const context = document.modelContext!;
  let registered = 0;
  for (const tool of TOOLS) {
    try {
      await context.registerTool(toModelContextTool(tool), { signal });
      registered += 1;
    } catch {
      // A failed registration must never break the app; the badge reports the count.
    }
  }
  return { support, registered };
}
