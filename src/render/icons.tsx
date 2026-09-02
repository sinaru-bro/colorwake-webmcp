import type { ReactNode, SVGProps } from "react";
import type { ToolId } from "../state/types";

const PATHS = {
  undo: (
    <>
      <path d="M11 8l-5 5 5 5" />
      <path d="M6 13h12a7 7 0 0 1 0 14h-5" />
    </>
  ),
  zoomIn: (
    <>
      <circle cx="14" cy="14" r="8" />
      <path d="M20 20l6 6M14 10.5v7M10.5 14h7" />
    </>
  ),
  zoomOut: (
    <>
      <circle cx="14" cy="14" r="8" />
      <path d="M20 20l6 6M10.5 14h7" />
    </>
  ),
  check: <path d="M7 17l6 6 12-14" strokeWidth={4} />,
  chevronLeft: <path d="M19 8l-8 8 8 8" strokeWidth={3.2} />,
  chevronRight: <path d="M13 8l8 8-8 8" strokeWidth={3.2} />,
  panelHide: (
    <>
      <rect x="4.5" y="7" width="23" height="18" rx="4" />
      <path d="M20 7v18" />
      <path d="M10.5 12.5l3.5 3.5-3.5 3.5" />
    </>
  ),
  panelShow: (
    <>
      <rect x="4.5" y="7" width="23" height="18" rx="4" />
      <path d="M20 7v18" />
      <path d="M14.5 12.5L11 16l3.5 3.5" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

/* Tool illustrations: light bodies with grey shading and a thin ink outline, tips pointing down. */
const INK = "#4a443d";
const BODY = "#f3efe8";
const SHADE = "#d2cabe";
const DARK = "#736a5f";
const TIP = "#3b3733";
const outline = { stroke: INK, strokeWidth: 1.3, strokeLinejoin: "round", strokeLinecap: "round" } as const;

const TOOL_ART: Record<ToolId, ReactNode> = {
  brush: (
    <>
      <rect x="13" y="2.5" width="6" height="14.5" rx="2.6" fill={BODY} {...outline} />
      <rect x="14.4" y="4" width="1.4" height="10.5" rx="0.7" fill="#fff" />
      <path d="M17.4 3.6v12.6h1.6V5.2a1.6 1.6 0 0 0-1.6-1.6z" fill={SHADE} opacity=".7" />
      <path d="M12.4 16.8h7.2v4.2h-7.2z" fill={SHADE} {...outline} />
      <path d="M13.6 18.9h4.8" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".7" />
      <path d="M12.3 21h7.4c.5 3.8-1.3 6.9-3.7 8.9-2.4-2-4.2-5.1-3.7-8.9Z" fill={DARK} {...outline} />
      <path d="M16 21.8v6" stroke={TIP} strokeWidth="1" strokeLinecap="round" opacity=".5" />
    </>
  ),
  pencil: (
    <>
      <path d="M12 6.5h8v14.5h-8z" fill={BODY} {...outline} />
      <path d="M14.7 6.5h2.6v14.5h-2.6z" fill="#fff" opacity=".8" />
      <path d="M17.3 6.5h2.7v14.5h-2.7z" fill={SHADE} opacity=".6" />
      <path d="M12 2.8h8v3.7h-8z" fill={SHADE} {...outline} />
      <path d="M12 21h8l-4 7.5z" fill="#e6dccb" {...outline} />
      <path d="M14.7 25.4h2.6L16 28.5z" fill={TIP} />
    </>
  ),
  pen: (
    <>
      <rect x="11.5" y="2.8" width="9" height="15.2" rx="1.6" fill={BODY} {...outline} />
      <path d="M11.5 8.2h9" {...outline} />
      <rect x="13.2" y="9.6" width="1.4" height="6.8" rx="0.7" fill="#fff" />
      <path d="M18.4 8.2v9.8h2.1V8.2z" fill={SHADE} opacity=".6" />
      <path d="M12.6 18h6.8l-1.3 4.4h-4.2z" fill={SHADE} {...outline} />
      <path d="M13.9 22.4h4.2l-.8 6.1h-2.6z" fill={DARK} {...outline} />
    </>
  ),
  fill: (
    <>
      <g transform="rotate(18 15 18)">
        <path
          d="M8.4 12.5h13.2l-1.4 11.6a2.2 2.2 0 0 1-2.2 1.9h-6a2.2 2.2 0 0 1-2.2-1.9z"
          fill={BODY}
          {...outline}
        />
        <path d="M10.2 17.6h9.6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".8" />
        <path d="M18.6 13.4l2.4-.4-1.3 11a2.2 2.2 0 0 1-1.9 1.9z" fill={SHADE} opacity=".6" />
        <ellipse cx="15" cy="12.5" rx="6.6" ry="2.3" fill={SHADE} {...outline} />
        <ellipse cx="15" cy="12.5" rx="4.4" ry="1.3" fill={DARK} />
        <path d="M10.4 11.6a4.7 4.7 0 0 1 9.2 0" fill="none" {...outline} />
      </g>
      <path
        d="M25.6 16.8c0 2.4-2.4 4.2-2.4 6.6a2.4 2.4 0 0 0 4.8 0c0-2.4-2.4-4.2-2.4-6.6z"
        fill={DARK}
        {...outline}
      />
    </>
  ),
};

interface ToolIconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: ToolId;
  size?: number;
}

export function ToolIcon({ name, size = 24, ...rest }: ToolIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" {...rest}>
      {TOOL_ART[name]}
    </svg>
  );
}
