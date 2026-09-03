# colorwake

Color a picture, then say what it should do.

colorwake is a coloring studio for parents and kids to create together. Color a sketch with a finger, mouse or stylus; finish it and the same canvas becomes a stage where the characters come alive. An AI agent (via the ChatGPT desktop app's in-app browser, or any WebMCP-capable browser) joins through [WebMCP](https://github.com/webmachinelearning/webmcp) — tell it the story and it casts the characters, sets the place, time and weather, and composes their motions. No artwork is generated for the child: the child makes the art, and the agent plays inside it.

Built for the WebMCP Challenge.

## Design notes

- **`get_guide` — an in-page playbook.** A read-only tool can carry guidance, not just app state: how the studio works, what the child can do next, and the house rules. An agent that reads it starts with a clear role — offer choices, never take over the story.
- **A loop built around the protocol.** On-screen taps aren't announced to the agent; successful write-tool results return fresh, action-relevant context, and `get_studio_state` resyncs the rest.
- **Parity, with one boundary.** UI-equivalent tools call the same actions as the on-screen controls, and there is deliberately no painting tool — coloring belongs to the child. The 20-picture and 8-step caps return actionable errors; the three-spot stage swaps out the friend that has been there longest.
- **Local-first.** No app backend or accounts. Raw artwork stays in localStorage; the agent receives only a compact state summary.
- **Co-play by design.** ChatGPT is for users 13 and older, so a parent operates the agent and relays the child's ideas while the child stays in charge of the art.

## Run

```
npm install
npm run dev
```

Open the local URL in the ChatGPT desktop app's in-app browser, or in any browser with WebMCP support.

## Deploy

```
npm run deploy
```

Deploys the static build to Cloudflare Workers Static Assets.

## WebMCP tools

| Tool               | Kind  | What it does                                                                |
| ------------------ | ----- | --------------------------------------------------------------------------- |
| `get_guide`        | read  | How the studio works and how to guide the player — read first               |
| `get_studio_state` | read  | Mode, colored characters (regions, colors, progress, position), tool, scene |
| `list_sketches`    | read  | Sketch catalog with difficulty                                              |
| `list_motions`     | read  | Motion presets, primitives, body parts, scene options                       |
| `set_mode`         | write | Switch between coloring and playing — same as the two on-screen buttons     |
| `pick_sketch`      | write | Put a sketch on the canvas                                                  |
| `set_tool`         | write | Change brush and color (never paints)                                       |
| `apply_motion`     | write | Animate a character with a preset or composed steps                         |
| `apply_motions`    | write | Animate up to three characters in one call                                  |
| `arrange_scene`    | write | Place, time, weather and character positions                                |

## License

AGPL-3.0-only — Copyright (c) 2026 sinaru-bro. See [LICENSE](LICENSE). The colorwake name and logo are not licensed for derived products.
