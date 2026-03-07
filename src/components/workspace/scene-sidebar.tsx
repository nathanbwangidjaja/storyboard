"use client";

import { useState } from "react";

interface Shot {
  id: string;
  shotNumber: number;
  title: string | null;
  status: string;
  generatedImages: string;
}

interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  shots: Shot[];
}

interface SceneSidebarProps {
  scenes: Scene[];
  activeSceneId: string | null;
  activeShotId: string | null;
  onSelectScene: (id: string) => void;
  onSelectShot: (sceneId: string, shotId: string) => void;
  onAddScene: () => void;
  onAddShot: (sceneId: string) => void;
  onDeleteShot: (shotId: string) => void;
  onDeleteScene: (sceneId: string) => void;
}

export function SceneSidebar({
  scenes,
  activeSceneId,
  activeShotId,
  onSelectScene,
  onSelectShot,
  onAddScene,
  onAddShot,
  onDeleteShot,
  onDeleteScene,
}: SceneSidebarProps) {
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(
    new Set(scenes.map((s) => s.id))
  );
  const [contextMenu, setContextMenu] = useState<{ type: "scene" | "shot"; id: string; x: number; y: number } | null>(null);

  const toggleScene = (id: string) => {
    setExpandedScenes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="w-64 bg-white overflow-y-auto shrink-0 flex flex-col">
      <div className="p-3 border-b border-surface-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-surface-700 uppercase tracking-wider">Scenes</h2>
        <button
          onClick={onAddScene}
          className="text-brand-600 hover:text-brand-700 transition-colors"
          title="Add Scene"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {scenes.length === 0 ? (
          <div className="p-4 text-center text-surface-400 text-sm">
            <p>No scenes yet</p>
            <button onClick={onAddScene} className="text-brand-600 hover:underline mt-1">
              Add your first scene
            </button>
          </div>
        ) : (
          scenes.map((scene) => (
            <div key={scene.id} className="border-b border-surface-100">
              <div
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-surface-50 transition-colors ${
                  activeSceneId === scene.id ? "bg-brand-50" : ""
                }`}
                onClick={() => {
                  onSelectScene(scene.id);
                  toggleScene(scene.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ type: "scene", id: scene.id, x: e.clientX, y: e.clientY });
                }}
              >
                <svg
                  className={`w-4 h-4 text-surface-400 transition-transform ${
                    expandedScenes.has(scene.id) ? "rotate-90" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 truncate">
                    Scene {scene.sceneNumber}: {scene.title}
                  </p>
                  <p className="text-xs text-surface-400">{scene.shots.length} shots</p>
                </div>
              </div>

              {expandedScenes.has(scene.id) && (
                <div className="pb-1">
                  {scene.shots.map((shot) => {
                    const hasGenerated = JSON.parse(shot.generatedImages || "[]").length > 0;
                    return (
                      <div
                        key={shot.id}
                        className={`flex items-center gap-2 pl-8 pr-3 py-1.5 cursor-pointer hover:bg-surface-50 transition-colors ${
                          activeShotId === shot.id ? "bg-brand-100 border-r-2 border-brand-500" : ""
                        }`}
                        onClick={() => onSelectShot(scene.id, shot.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({ type: "shot", id: shot.id, x: e.clientX, y: e.clientY });
                        }}
                      >
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            shot.status === "approved"
                              ? "bg-brand-500"
                              : hasGenerated
                              ? "bg-green-400"
                              : "bg-surface-300"
                          }`}
                        />
                        <span className="text-sm text-surface-700 truncate flex-1">
                          {shot.title || `Shot ${shot.shotNumber}`}
                        </span>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => onAddShot(scene.id)}
                    className="flex items-center gap-1 pl-8 pr-3 py-1.5 text-xs text-surface-400 hover:text-brand-600 transition-colors w-full"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Shot
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-surface-200 py-1 min-w-[140px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-3 py-1.5 text-sm text-left text-red-600 hover:bg-red-50"
              onClick={() => {
                if (contextMenu.type === "scene") onDeleteScene(contextMenu.id);
                else onDeleteShot(contextMenu.id);
                setContextMenu(null);
              }}
            >
              Delete {contextMenu.type === "scene" ? "Scene" : "Shot"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
