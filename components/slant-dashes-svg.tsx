import React from "react";

export const DiagonalPattern = ({
  width = "100%",
  height = 34,
  color = "#A7C6ED",
  strokeWidth = 2,
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
  const lineCount =
    Math.ceil(numericWidth / spacing) + Math.ceil(height / spacing);

  // Generate diagonal lines
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

  return (
    <div className="relative border-[1px] border-[#A7C6ED] rounded-none shadow-sm">
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

      <svg
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
