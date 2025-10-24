import React from "react";

export const DiagonalPattern = ({
  width = "100%",
  height = 34,
  color = "#A7C6ED",
  strokeWidth = 1.5,
  spacing = 14,
}) => {
  // Convert width to number if it's a string with px
  const getNumericWidth = (w: any) => {
    if (typeof w === "string" && w.endsWith("px")) {
      return parseInt(w);
    }
    return typeof w === "number" ? w : 1406; // fallback to original width
  };

  const numericWidth = getNumericWidth(width);

  // Calculate number of lines needed based on width and spacing
  // Use larger spacing on mobile for fewer lines
  const mobileSpacing = spacing * 1.5; // Reduced spacing for better mobile coverage
  const lineCount =
    Math.ceil(numericWidth / spacing) + Math.ceil(height / spacing);
  const mobileLineCount =
    Math.ceil(numericWidth / mobileSpacing) + Math.ceil(height / mobileSpacing);

  // Generate diagonal lines for desktop
  const lines = [];
  for (let i = 0; i < lineCount; i++) {
    const startX = i * spacing;
    lines.push(
      <path
        key={i}
        d={`M${startX} ${height}L${startX + height} 0`}
        stroke={color}
        strokeWidth={strokeWidth}
      />,
    );
  }

  // Generate diagonal lines for mobile (better coverage and more slanted)
  const mobileLines = [];
  // Add extra lines to ensure full screen coverage
  const extraLines = 3;
  for (let i = -extraLines; i < mobileLineCount + extraLines; i++) {
    const startX = i * mobileSpacing;
    // Make lines more slanted and extend beyond screen edges for mobile
    const extendedHeight = height * 1.5; // Make lines taller for better slant
    const startY = height;
    const endX = startX + extendedHeight;
    const endY = 0;

    mobileLines.push(
      <path
        key={i}
        d={`M${startX} ${startY}L${endX} ${endY}`}
        stroke={color}
        strokeWidth={strokeWidth * 1.2} // Slightly thicker for mobile
      />,
    );
  }

  return (
    <div className="relative md:border-[1px] md:border-[#A7C6ED] md:rounded-none md:shadow-sm">
      {/* Horizontal border extensions to connect with vertical page lines - hidden on mobile */}
      {/* Top border extension - left side */}
      <div className="hidden md:block absolute -left-16 top-0 w-16 h-[1.5px] bg-[#A7C6ED]"></div>
      {/* Top border extension - right side */}
      <div className="hidden md:block absolute -right-16 top-0 w-16 h-[1.5px] bg-[#A7C6ED]"></div>
      {/* Bottom border extension - left side */}
      <div className="hidden md:block absolute -left-16 bottom-0 w-16 h-[1.5px] bg-[#A7C6ED]"></div>
      {/* Bottom border extension - right side */}
      <div className="hidden md:block absolute -right-16 bottom-0 w-16 h-[1.5px] bg-[#A7C6ED]"></div>
      {/* Top-left diamond */}
      <div className="hidden lg:block absolute -left-2 -top-2 z-20">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-blue-300"
        >
          <path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            stroke="currentColor"
            strokeWidth="3"
            fill="white"
          />
        </svg>
      </div>

      {/* Top-right diamond */}
      <div className="hidden lg:block absolute -right-2 -top-2 z-20">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-blue-300"
        >
          <path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            stroke="currentColor"
            strokeWidth="3"
            fill="white"
          />
        </svg>
      </div>

      {/* Bottom-left diamond */}
      <div className="hidden lg:block absolute -left-2 -bottom-2 z-20">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-blue-300"
        >
          <path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            stroke="currentColor"
            strokeWidth="3"
            fill="white"
          />
        </svg>
      </div>

      {/* Bottom-right diamond */}
      <div className="hidden lg:block absolute -right-2 -bottom-2 z-20">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-blue-300"
        >
          <path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            stroke="currentColor"
            strokeWidth="3"
            fill="white"
          />
        </svg>
      </div>

      {/* Intersection diamonds where extended borders meet vertical page lines */}
      {/* Top-left intersection diamond */}
      <div className="hidden lg:block absolute -left-16 -top-2 z-20">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-blue-300"
        >
          <path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            stroke="currentColor"
            strokeWidth="3"
            fill="white"
          />
        </svg>
      </div>

      {/* Top-right intersection diamond */}
      <div className="hidden lg:block absolute -right-16 -top-2 z-20">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-blue-300"
        >
          <path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            stroke="currentColor"
            strokeWidth="3"
            fill="white"
          />
        </svg>
      </div>

      {/* Bottom-left intersection diamond */}
      <div className="hidden lg:block absolute -left-16 -bottom-2 z-20">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-blue-300"
        >
          <path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            stroke="currentColor"
            strokeWidth="3"
            fill="white"
          />
        </svg>
      </div>

      {/* Bottom-right intersection diamond */}
      <div className="hidden lg:block absolute -right-16 -bottom-2 z-20">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-blue-300"
        >
          <path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            stroke="currentColor"
            strokeWidth="3"
            fill="white"
          />
        </svg>
      </div>

      {/* Mobile SVG - fewer lines, no borders, extended viewBox for better coverage */}
      <svg
        className="block md:hidden"
        width="100%"
        height={height}
        viewBox={`-100 0 ${numericWidth + 200} ${height * 1.5}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{
          overflow: "visible",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
        }}
      >
        {mobileLines}
      </svg>

      {/* Desktop SVG - full pattern with borders */}
      <svg
        className="hidden md:block"
        width={width}
        height={height}
        viewBox={`0 0 ${numericWidth} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {lines}
      </svg>
    </div>
  );
};
