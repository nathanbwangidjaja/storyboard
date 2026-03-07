"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  initialImage?: string;
}

export function DrawingCanvas({ onSave, initialImage }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [brushSize, setBrushSize] = useState(3);
  const [color, setColor] = useState("#000000");
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyIndexRef.current++;
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current);
    historyRef.current.push(state);

    // Keep history manageable
    if (historyRef.current.length > 50) {
      historyRef.current = historyRef.current.slice(-50);
      historyIndexRef.current = historyRef.current.length - 1;
    }
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (initialImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        saveState();
      };
      img.src = initialImage;
    } else {
      saveState();
    }
  }, [initialImage, saveState]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initCanvas]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";

    if (tool === "eraser") {
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.globalCompositeOperation = "destination-out";
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";
    saveState();

    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  const undo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    onSave(canvas.toDataURL("image/png"));
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    onSave(canvas.toDataURL("image/png"));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
    onSave(canvas.toDataURL("image/png"));
  };

  const colors = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-white rounded-t-lg border-b border-surface-200">
        <button
          onClick={() => setTool("pen")}
          className={`p-1.5 rounded transition-colors ${tool === "pen" ? "bg-brand-100 text-brand-700" : "text-surface-500 hover:bg-surface-100"}`}
          title="Pen"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`p-1.5 rounded transition-colors ${tool === "eraser" ? "bg-brand-100 text-brand-700" : "text-surface-500 hover:bg-surface-100"}`}
          title="Eraser"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.5 3.5a.5.5 0 00-.854-.354l-6 6a.5.5 0 000 .708l4 4a.5.5 0 00.708 0L8.5 11.707V3.5z" />
            <path d="M10.5 3.5a.5.5 0 01.854-.354l6 6a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0L8.5 15.707V3.5h2z" />
          </svg>
        </button>
        <div className="w-px h-5 bg-surface-200" />
        <div className="flex items-center gap-1">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("pen"); }}
              className={`w-5 h-5 rounded-full border-2 transition-all ${color === c && tool === "pen" ? "border-surface-800 scale-110" : "border-surface-200"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="w-px h-5 bg-surface-200" />
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-20 h-1 accent-brand-600"
          title={`Brush size: ${brushSize}`}
        />
        <span className="text-xs text-surface-400 w-4">{brushSize}</span>
        <div className="flex-1" />
        <button onClick={undo} className="p-1.5 text-surface-500 hover:bg-surface-100 rounded" title="Undo">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button onClick={redo} className="p-1.5 text-surface-500 hover:bg-surface-100 rounded" title="Redo">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>
        <button onClick={clearCanvas} className="p-1.5 text-red-400 hover:bg-red-50 rounded" title="Clear">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 bg-white rounded-b-lg overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          className="block w-full h-full"
        />
      </div>
    </div>
  );
}
