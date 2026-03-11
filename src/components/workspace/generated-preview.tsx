"use client";

import { useState, useEffect } from "react";

interface GeneratedPreviewProps {
  images: string[];
  selectedVersion: number;
  onSelectVersion: (v: number) => void;
  generating?: boolean;
}

export function GeneratedPreview({ images, selectedVersion, onSelectVersion, generating }: GeneratedPreviewProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!generating) {
      setElapsed(0);
      return;
    }
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [generating]);

  if (generating) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-surface-200" />
            <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-surface-700">Generating frame...</p>
          <p className="text-xs text-surface-400 mt-1">{elapsed}s elapsed</p>
          <div className="mt-3 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-surface-400">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No generated frames yet</p>
          <p className="text-xs mt-1">Fill in shot details and click Generate</p>
        </div>
      </div>
    );
  }

  const currentImage = images[selectedVersion] || images[images.length - 1];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-surface-900 rounded-lg overflow-hidden">
        <img
          src={currentImage}
          alt="Generated storyboard frame"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-surface-500">Versions:</span>
          <div className="flex gap-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onSelectVersion(i)}
                className={`w-12 h-8 rounded border-2 overflow-hidden transition-all ${
                  i === selectedVersion
                    ? "border-brand-500 ring-1 ring-brand-300"
                    : "border-surface-200 hover:border-surface-400"
                }`}
              >
                <img src={img} alt={`Version ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
