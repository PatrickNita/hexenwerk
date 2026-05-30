"use client";

import { useStatementArtboardRuntime } from "@/components/statement-artboard-runtime";
import { useCallback, useEffect, useRef } from "react";

export default function StatementFireCanvas() {
  const { registerFireCanvas } = useStatementArtboardRuntime();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const syncCanvasRef = useCallback(() => {
    registerFireCanvas(canvasRef.current, containerRef.current);
  }, [registerFireCanvas]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) {
      return;
    }

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      syncCanvasRef();
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [syncCanvasRef]);

  return (
    <div ref={containerRef} className="statement-fire-canvas-wrap">
      <canvas
        ref={(el) => {
          canvasRef.current = el;
          syncCanvasRef();
        }}
        className="statement-fire-canvas"
        aria-hidden
      />
    </div>
  );
}
