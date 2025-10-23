import React from "react";

interface BgGrainProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  opacity?: number;
  fillOpacity?: number;
}

const BgGrain: React.FC<BgGrainProps> = ({
  width = "100%",
  height = "100%",
  opacity = 0.82,
  fillOpacity = 0.12,
  className,
  style,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: "none",
        opacity,
        ...style,
      }}
      preserveAspectRatio="xMidYMid slice"
      {...props}
    >
      <defs>
        <filter id="grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.4"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0 0 1 1 1 1 1 1 1" />
          </feComponentTransfer>
          <feBlend mode="overlay" in2="SourceGraphic" />
        </filter>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="transparent"
        filter="url(#grain-filter)"
        opacity={fillOpacity}
      />
    </svg>
  );
};

export default BgGrain;
