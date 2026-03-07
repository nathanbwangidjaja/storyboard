"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Shot {
  id: string;
  shotNumber: number;
  title: string | null;
  shotType: string;
  actionDescription: string | null;
  cameraDirection: string | null;
  dialogueDirection: string | null;
  audioNotes: string | null;
  generatedImages: string;
  selectedVersion: number;
  status: string;
  scene: {
    id: string;
    sceneNumber: number;
    title: string;
  };
}

export default function TimelinePage() {
  const params = useParams();
  const projectId = params.id as string;
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "strip">("grid");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/projects/${projectId}/shots`);
      if (res.ok) setShots(await res.json());
      setLoading(false);
    })();
  }, [projectId]);

  const toggleCompare = (shotId: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(shotId) ? prev.filter((id) => id !== shotId) : [...prev, shotId]
    );
  };

  // Group shots by scene
  const sceneGroups = shots.reduce<Record<string, { scene: Shot["scene"]; shots: Shot[] }>>((acc, shot) => {
    const sid = shot.scene.id;
    if (!acc[sid]) acc[sid] = { scene: shot.scene, shots: [] };
    acc[sid].shots.push(shot);
    return acc;
  }, {});

  const compareShots = selectedForCompare.map((id) => shots.find((s) => s.id === id)!).filter(Boolean);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/project/${projectId}/workspace`} className="text-surface-500 hover:text-surface-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold text-surface-900">Storyboard Timeline</h1>
          <span className="text-xs text-surface-400">{shots.length} shots</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === "grid" ? "bg-white text-surface-900 shadow-sm" : "text-surface-500"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("strip")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === "strip" ? "bg-white text-surface-900 shadow-sm" : "text-surface-500"}`}
            >
              Strip
            </button>
          </div>
          <Button
            variant={compareMode ? "primary" : "secondary"}
            size="sm"
            onClick={() => { setCompareMode(!compareMode); setSelectedForCompare([]); }}
          >
            {compareMode ? "Exit Compare" : "Compare"}
          </Button>
          <Link href={`/project/${projectId}/export`}>
            <Button variant="secondary" size="sm">Export</Button>
          </Link>
        </div>
      </header>

      {/* Compare panel */}
      {compareMode && selectedForCompare.length > 0 && (
        <div className="bg-surface-900 p-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-white text-sm mb-3">Comparing {selectedForCompare.length} shots</p>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {compareShots.map((shot) => {
                const images = JSON.parse(shot.generatedImages || "[]");
                const img = images[shot.selectedVersion] || images[images.length - 1];
                return (
                  <div key={shot.id} className="shrink-0">
                    <div className="w-64 h-36 bg-surface-800 rounded-lg overflow-hidden">
                      {img ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-surface-500 text-sm">No image</div>
                      )}
                    </div>
                    <p className="text-white text-xs mt-1">
                      S{shot.scene.sceneNumber} / Shot {shot.shotNumber}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {shots.length === 0 ? (
          <div className="text-center py-20 text-surface-400">
            <p className="text-lg font-medium">No shots yet</p>
            <p className="text-sm mt-1 mb-4">Create shots in the workspace to see them here</p>
            <Link href={`/project/${projectId}/workspace`}>
              <Button>Go to Workspace</Button>
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          Object.values(sceneGroups).map(({ scene, shots: sceneShots }) => (
            <div key={scene.id} className="mb-8">
              <h2 className="text-lg font-semibold text-surface-800 mb-3">
                Scene {scene.sceneNumber}: {scene.title}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {sceneShots.map((shot) => {
                  const images = JSON.parse(shot.generatedImages || "[]");
                  const img = images[shot.selectedVersion] || images[images.length - 1];
                  const isSelected = selectedForCompare.includes(shot.id);

                  return (
                    <div
                      key={shot.id}
                      className={`bg-white rounded-lg border overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                        isSelected ? "border-brand-500 ring-2 ring-brand-200" : "border-surface-200"
                      }`}
                      onClick={() => {
                        if (compareMode) toggleCompare(shot.id);
                      }}
                    >
                      <div className="aspect-video bg-surface-100 relative">
                        {img ? (
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-surface-300">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          {shot.shotNumber}
                        </div>
                        {shot.status === "approved" && (
                          <div className="absolute top-1 right-1 bg-brand-500 text-white p-0.5 rounded-full">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium text-surface-800 truncate">
                          {shot.title || `Shot ${shot.shotNumber}`}
                        </p>
                        <p className="text-xs text-surface-400 truncate mt-0.5">
                          {shot.shotType} {shot.cameraDirection ? `\u00b7 ${shot.cameraDirection}` : ""}
                        </p>
                        {shot.actionDescription && (
                          <p className="text-xs text-surface-500 mt-1 line-clamp-2">{shot.actionDescription}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          /* Strip View */
          <div className="space-y-6">
            {Object.values(sceneGroups).map(({ scene, shots: sceneShots }) => (
              <div key={scene.id}>
                <h2 className="text-lg font-semibold text-surface-800 mb-3">
                  Scene {scene.sceneNumber}: {scene.title}
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-4">
                  {sceneShots.map((shot) => {
                    const images = JSON.parse(shot.generatedImages || "[]");
                    const img = images[shot.selectedVersion] || images[images.length - 1];
                    const isSelected = selectedForCompare.includes(shot.id);

                    return (
                      <div
                        key={shot.id}
                        className={`shrink-0 w-60 bg-white rounded-lg border overflow-hidden cursor-pointer hover:shadow-md transition-all ${
                          isSelected ? "border-brand-500 ring-2 ring-brand-200" : "border-surface-200"
                        }`}
                        onClick={() => {
                          if (compareMode) toggleCompare(shot.id);
                        }}
                      >
                        <div className="aspect-video bg-surface-100 relative">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-surface-300 text-sm">
                              No frame
                            </div>
                          )}
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                            {shot.shotNumber}
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="text-sm font-medium text-surface-800 truncate">{shot.title || `Shot ${shot.shotNumber}`}</p>
                          <p className="text-xs text-surface-400">{shot.shotType}</p>
                          {shot.dialogueDirection && (
                            <p className="text-xs text-surface-500 mt-1 italic truncate">{shot.dialogueDirection}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
