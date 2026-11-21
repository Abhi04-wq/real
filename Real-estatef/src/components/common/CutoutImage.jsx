import React, { useState, useEffect, useRef } from "react";

/**
 * CutoutImage automatically removes white or near-white background from an image
 * using flood-fill and edge feathering on HTML5 Canvas, yielding a true transparent PNG
 * with no white box or fringing.
 */
export function CutoutImage({
  src,
  alt,
  className = "",
  threshold = 220, // Brightness threshold (0-255)
  feather = 20,    // Soft edge transition range
  ...props
}) {
  const [dataUrl, setDataUrl] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (!src) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      if (!isMounted.current) return;

      try {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // BFS Flood-fill from outer edges to only clear the outer white background.
        // This preserves any light/white elements inside the subject (e.g. windows, document paper).
        const totalPixels = w * h;
        const visited = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels * 2);
        let qHead = 0;
        let qTail = 0;

        // Initialize queue with all 4 outer border pixels
        for (let x = 0; x < w; x++) {
          // Top row
          const topIdx = x;
          visited[topIdx] = 1;
          queue[qTail++] = x;
          queue[qTail++] = 0;

          // Bottom row
          const botIdx = (h - 1) * w + x;
          visited[botIdx] = 1;
          queue[qTail++] = x;
          queue[qTail++] = h - 1;
        }

        for (let y = 1; y < h - 1; y++) {
          // Left col
          const leftIdx = y * w;
          visited[leftIdx] = 1;
          queue[qTail++] = 0;
          queue[qTail++] = y;

          // Right col
          const rightIdx = y * w + (w - 1);
          visited[rightIdx] = 1;
          queue[qTail++] = w - 1;
          queue[qTail++] = y;
        }

        while (qHead < qTail) {
          const x = queue[qHead++];
          const y = queue[qHead++];
          const idx = y * w + x;
          const pIdx = idx * 4;

          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];

          // Check if this pixel is white/off-white background
          const minC = Math.min(r, g, b);
          const isWhiteish =
            minC >= threshold &&
            Math.abs(r - g) <= 30 &&
            Math.abs(g - b) <= 30 &&
            Math.abs(r - b) <= 30;

          if (isWhiteish) {
            // Calculate feathered alpha transparency
            const diff = minC - threshold;
            if (diff >= feather) {
              data[pIdx + 3] = 0; // Pure transparent
            } else {
              const alphaFactor = 1 - diff / feather;
              data[pIdx + 3] = Math.round(255 * alphaFactor);
            }

            // Expand to 4 neighboring pixels
            if (x > 0) {
              const nIdx = idx - 1;
              if (!visited[nIdx]) {
                visited[nIdx] = 1;
                queue[qTail++] = x - 1;
                queue[qTail++] = y;
              }
            }
            if (x < w - 1) {
              const nIdx = idx + 1;
              if (!visited[nIdx]) {
                visited[nIdx] = 1;
                queue[qTail++] = x + 1;
                queue[qTail++] = y;
              }
            }
            if (y > 0) {
              const nIdx = idx - w;
              if (!visited[nIdx]) {
                visited[nIdx] = 1;
                queue[qTail++] = x;
                queue[qTail++] = y - 1;
              }
            }
            if (y < h - 1) {
              const nIdx = idx + w;
              if (!visited[nIdx]) {
                visited[nIdx] = 1;
                queue[qTail++] = x;
                queue[qTail++] = y + 1;
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const url = canvas.toDataURL("image/png");
        if (isMounted.current) {
          setDataUrl(url);
          setLoaded(true);
        }
      } catch (err) {
        console.warn("CutoutImage error:", err);
        if (isMounted.current) {
          setDataUrl(src);
          setLoaded(true);
        }
      }
    };

    img.onerror = () => {
      if (isMounted.current) {
        setDataUrl(src);
        setLoaded(true);
      }
    };

    return () => {
      isMounted.current = false;
    };
  }, [src, threshold, feather]);

  return (
    <img
      src={dataUrl || src}
      alt={alt}
      className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
      {...props}
    />
  );
}

export default CutoutImage;
