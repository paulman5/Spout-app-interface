import React from 'react';

const DiagonalPattern = ({ 
  width = '100%', 
  height = 34, 
  color = '#A7C6ED',
  strokeWidth = 2,
  spacing = 14 
}) => {
  // Convert width to number if it's a string with px
  const getNumericWidth = (w: any) => {
    if (typeof w === 'string' && w.endsWith('px')) {
      return parseInt(w);
    }
    return typeof w === 'number' ? w : 1406; // fallback to original width
  };

  const numericWidth = getNumericWidth(width);
  
  // Calculate number of lines needed based on width and spacing
  const lineCount = Math.ceil(numericWidth / spacing) + Math.ceil(height / spacing);
  
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
      />
    );
  }

  return (
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
  );
};