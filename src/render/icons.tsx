import type { SVGProps } from "react";

const PATHS = {
  fill: (
    <>
      <g transform="rotate(22 14 18)">
        <path d="M6.5 12.5h15l-1.7 12.6a2 2 0 0 1-2 1.7H10.2a2 2 0 0 1-2-1.7Z" />
        <path d="M10 12.5a4 4 0 0 1 8 0" />
        <path d="M8.2 18h11.6" strokeOpacity={0.45} />
      </g>
      <path
        d="M26.2 15c0 2.6-2.7 4.5-2.7 7.1a2.7 2.7 0 0 0 5.4 0c0-2.6-2.7-4.5-2.7-7.1Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  pen: (
    <>
      <path d="M10.5 4.5h11v14h-11Z" />
      <path d="M10.5 9.5h11" />
      <path d="M12 18.5h8l-1.6 6.5h-4.8Z" />
      <path d="M14.3 25h3.4l-1 4h-1.4Z" fill="currentColor" stroke="none" />
    </>
  ),
  brush: (
    <>
      <path d="M14 3.5h4v11h-4Z" />
      <path d="M12.5 14.5h7v4h-7Z" />
      <path
        d="M12.5 18.5h7c0 4.2-1.6 7.4-3.5 10c-1.9-2.6-3.5-5.8-3.5-10Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  pencil: (
    <>
      <path d="M12 4.5h8v17l-4 7-4-7Z" />
      <path d="M12 9.5h8" />
      <path d="M12 21.5h8" />
      <path d="M14.6 25.4h2.8l-1.4 3Z" fill="currentColor" stroke="none" />
    </>
  ),
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
  reset: (
    <>
      <path d="M8.5 9.5A10 10 0 1 1 6 16" />
      <path d="M6 6v6h6" />
    </>
  ),
  stop: <rect x="8" y="8" width="16" height="16" rx="3" fill="currentColor" stroke="none" />,
  check: <path d="M7 17l6 6 12-14" strokeWidth={4} />,
  chevronLeft: <path d="M19 8l-8 8 8 8" strokeWidth={3.2} />,
  chevronRight: <path d="M13 8l8 8-8 8" strokeWidth={3.2} />,
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
