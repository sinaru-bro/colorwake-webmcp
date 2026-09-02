# colorwake

Color a picture, then say what it should do.

colorwake is a coloring studio for parents and kids to create together. Color a sketch with a finger, mouse or pencil; press ✓ and the same canvas becomes a play screen where the characters come alive. An AI agent (ChatGPT desktop in-app browser or Chrome 149+) joins through [WebMCP](https://github.com/webmachinelearning/webmcp) — it hands out brushes and colors, moves the characters, and sets the place, time and weather. It never paints.

Built for the WebMCP Challenge.

## Run

```
npm install
npm run dev
```

Open the local URL in Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled, or in the ChatGPT desktop app's in-app browser.

## Deploy

```
npm run deploy
```

Deploys the static build to Cloudflare Workers Static Assets.

## WebMCP tools

| Tool               | Kind  | What it does                                                                |
| ------------------ | ----- | --------------------------------------------------------------------------- |
| `get_studio_state` | read  | Mode, colored characters (regions, colors, progress, position), tool, scene |
| `list_sketches`    | read  | Sketch catalog with difficulty                                              |
| `list_motions`     | read  | Motion presets, primitives, body parts, scene options                       |
| `set_mode`         | write | Switch between coloring and playing — same as the two on-screen buttons     |
| `pick_sketch`      | write | Put a sketch on the canvas                                                  |
| `set_tool`         | write | Change brush and color (never paints)                                       |
| `apply_motion`     | write | Animate a character with a preset or composed steps                         |
| `arrange_scene`    | write | Place, time, weather and character positions                                |

## License

AGPL-3.0-only — Copyright (c) 2026 sinaru-bro. See [LICENSE](LICENSE). The colorwake name and logo are not licensed for derived products.
