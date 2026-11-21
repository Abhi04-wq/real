import React, { useEffect, useState } from "react";

export default function AnimatedCounter({ value, duration = 1200, prefix = "", suffix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);

  // Parse numeric target from value (e.g., "₹45,45,000" -> 4545000, 148 -> 148, "94.2%" -> 94.2)
  const isString = typeof value === "string";
  let targetNumber = 0;
  let isCurrency = false;
  let isPercentage = false;

  if (isString) {
    if (value.includes("₹")) isCurrency = true;
    if (value.includes("%")) isPercentage = true;
    const cleaned = value.replace(/[^0-9.]/g, "");
    targetNumber = parseFloat(cleaned) || 0;
  } else {
    targetNumber = Number(value) || 0;
  }

  useEffect(() => {
    let startTime = null;
    let animId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = targetNumber * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [targetNumber, duration]);

  // Format final string
  let formatted = "";
  if (isCurrency) {
    formatted = `₹${Math.round(displayValue).toLocaleString("en-IN")}`;
  } else if (isPercentage) {
    formatted = `${displayValue.toFixed(1)}%`;
  } else if (Number.isInteger(targetNumber)) {
    formatted = Math.round(displayValue).toLocaleString("en-IN");
  } else {
    formatted = displayValue.toFixed(1);
  }

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
