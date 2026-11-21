import React from "react";

export default function LuxurySparkline({
  data = [24, 28, 26, 32, 38, 35, 42],
  color = "#86A9D8", // Steel Blue
  height = 32,
  className = "",
}) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 4;
  const h = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = height - paddingY - ((val - min) / range) * h;
    return [x, y];
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  const areaPath = `${linePath} L 100 ${height} L 0 ${height} Z`;
  const gradId = `spark-grad-${Math.random().toString(36).substring(2, 9)}`;

  const lastPoint = points[points.length - 1];

  return (
    <div className={`w-full overflow-visible ${className}`} style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {lastPoint && (
          <circle
            cx={lastPoint[0]}
            cy={lastPoint[1]}
            r="2.5"
            fill={color}
            stroke="#0B0F17"
            strokeWidth="1.5"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
}
