"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DrawingCanvas } from "@/components/canvas/drawing-canvas";
import { ShotForm } from "@/components/workspace/shot-form";
import { SceneSidebar } from "@/components/workspace/scene-sidebar";
import { GeneratedPreview } from "@/components/workspace/generated-preview";
import Link from "next/link";

interface Character {
  id: string;
  name: string;
  description: string | null;
  referenceImages: string;
}

interface Environment {
  id: string;
  name: string;
  description: string | null;
  referenceImages: string;
}

interface Shot {
  id: string;
  shotNumber: number;
  title: string | null;
  shotType: string;
  actionDescription: string | null;
  cameraDirection: string | null;
  dialogueDirection: string | null;
  vfxNotes: string | null;
  audioNotes: string | null;
  continuityNotes: string | null;
  sketchImage: string | null;
  poseReferenceImage: string | null;
  uploadedReferences: string;
  generatedImages: string;
  selectedVersion: number;
  emotionalTone: string | null;
  compositionNotes: string | null;
  shotDuration: string | null;
  status: string;
  sceneId: string;
  environmentId: string | null;
  characters: Array<{
    id: string;
    characterId: string;
    poseNotes: string | null;
    actionNotes: string | null;
    poseReferenceImage: string | null;
    character: Character;
  }>;
}

interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  summary: string | null;
  emotionalTone: string | null;
  shots: Shot[];
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  style: string;
  aspectRatio: string;
  scenes: Scene[];
  characters: Character[];
  environments: Environment[];
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [activeShotId, setActiveShotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [sketchDataUrl, setSketchDataUrl] = useState<string | null>(null);
  const [showAddScene, setShowAddScene] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState("");
  const [dismissedGuide, setDismissedGuide] = useState(false);

  const activeScene = project?.scenes.find((s) => s.id === activeSceneId);
  const activeShot = activeScene?.shots.find((s) => s.id === activeShotId);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProject(data);

      if (!activeSceneId && data.scenes.length > 0) {
        const qScene = searchParams.get("scene");
        const qShot = searchParams.get("shot");
        if (qScene && qShot && data.scenes.some((s: Scene) => s.id === qScene)) {
          setActiveSceneId(qScene);
          setActiveShotId(qShot);
        } else {
          setActiveSceneId(data.scenes[0].id);
          if (data.scenes[0].shots.length > 0) {
            setActiveShotId(data.scenes[0].shots[0].id);
          }
        }
      }
    } catch {
      console.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId, activeSceneId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const addScene = async () => {
    if (!newSceneTitle.trim()) return;
    const nextNum = (project?.scenes.length || 0) + 1;
    const res = await fetch(`/api/projects/${projectId}/scenes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSceneTitle, sceneNumber: nextNum }),
    });
    if (res.ok) {
      setNewSceneTitle("");
      setShowAddScene(false);
      await fetchProject();
    }
  };

  const addShot = async (sceneId: string) => {
    const scene = project?.scenes.find((s) => s.id === sceneId);
    const nextNum = (scene?.shots.length || 0) + 1;
    const res = await fetch(`/api/projects/${projectId}/shots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sceneId, shotNumber: nextNum, title: `Shot ${nextNum}` }),
    });
    if (res.ok) {
      const shot = await res.json();
      setActiveShotId(shot.id);
      setActiveSceneId(sceneId);
      await fetchProject();
    }
  };

  const deleteShot = async (shotId: string) => {
    const res = await fetch(`/api/projects/${projectId}/shots/${shotId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      if (activeShotId === shotId) setActiveShotId(null);
      await fetchProject();
    }
  };

  const deleteScene = async (sceneId: string) => {
    const res = await fetch(`/api/projects/${projectId}/scenes/${sceneId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      if (activeSceneId === sceneId) {
        setActiveSceneId(null);
        setActiveShotId(null);
      }
      await fetchProject();
    }
  };

  const updateShot = async (shotId: string, data: Partial<Shot>) => {
    await fetch(`/api/projects/${projectId}/shots/${shotId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchProject();
  };

  const saveSketch = async () => {
    if (!sketchDataUrl || !activeShotId) return;

    const blob = await (await fetch(sketchDataUrl)).blob();
    const formData = new FormData();
    formData.append("file", blob, "sketch.png");
    formData.append("type", "sketch");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { path } = await res.json();
      await updateShot(activeShotId, { sketchImage: path } as Partial<Shot>);
    }
  };

  const generateImage = async () => {
    if (!activeShotId || !projectId) return;
    setGenerating(true);
    setGenError(null);

    try {
      if (sketchDataUrl) {
        await saveSketch();
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shotId: activeShotId, projectId }),
      });

      if (!res.ok) {
        const err = await res.json();
        setGenError(err.error || "Generation failed. Try again.");
        return;
      }

      setGenError(null);
      await fetchProject();
    } catch {
      setGenError("Network error. Please check your connection and try again.");
    } finally {
      setGenerating(false);
    }
  };

  const uploadReference = async (file: File) => {
    if (!activeShotId) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "reference");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { path } = await res.json();
      const currentRefs = JSON.parse(activeShot?.uploadedReferences || "[]");
      currentRefs.push(path);
      await updateShot(activeShotId, { uploadedReferences: JSON.stringify(currentRefs) } as Partial<Shot>);
    }
  };

  const [uploadingPoseFor, setUploadingPoseFor] = useState<string | null>(null);
  const [poseUploadSuccess, setPoseUploadSuccess] = useState<string | null>(null);

  const uploadPoseForCharacter = async (characterId: string, file: File) => {
    if (!activeShotId || !activeShot) return;
    setUploadingPoseFor(characterId);
    setPoseUploadSuccess(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "pose");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { path } = await res.json();
      const characters = activeShot.characters.map((sc) => ({
        characterId: sc.characterId,
        poseNotes: sc.poseNotes,
        actionNotes: sc.actionNotes,
        poseReferenceImage: sc.characterId === characterId ? path : sc.poseReferenceImage,
      }));
      await updateShot(activeShotId, { characters } as Partial<Shot>);
      setPoseUploadSuccess(characterId);
      setTimeout(() => setPoseUploadSuccess(null), 2000);
    } finally {
      setUploadingPoseFor(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto mb-4" />
          <p className="text-surface-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-surface-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface-50">
      {/* Top Navbar */}
      <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-surface-500 hover:text-surface-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold text-surface-900">{project.title}</h1>
          <span className="text-xs px-2 py-0.5 bg-surface-100 rounded-full text-surface-500">
            {project.style} &middot; {project.aspectRatio}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/project/${projectId}/characters`}>
            <Button variant="ghost" size="sm">Characters</Button>
          </Link>
          <Link href={`/project/${projectId}/environments`}>
            <Button variant="ghost" size="sm">Environments</Button>
          </Link>
          <Link href={`/project/${projectId}/timeline`}>
            <Button variant="ghost" size="sm">Timeline</Button>
          </Link>
          <Link href={`/project/${projectId}/export`}>
            <Button variant="secondary" size="sm">Export</Button>
          </Link>
        </div>
      </header>

      {/* Getting Started Guide */}
      {!dismissedGuide && project.characters.length === 0 && project.scenes.every(s => s.shots.every(sh => JSON.parse(sh.generatedImages || "[]").length === 0)) && (
        <div className="bg-brand-50 border-b border-brand-200 px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium text-brand-800">Getting started:</span>
            <div className="flex items-center gap-3 text-brand-700">
              <Link href={`/project/${projectId}/characters`} className="flex items-center gap-1 hover:underline">
                <span className="w-5 h-5 rounded-full bg-brand-200 text-brand-700 text-xs font-bold flex items-center justify-center">1</span>
                Add characters
              </Link>
              <span className="text-brand-300">&rarr;</span>
              <Link href={`/project/${projectId}/environments`} className="flex items-center gap-1 hover:underline">
                <span className="w-5 h-5 rounded-full bg-brand-200 text-brand-700 text-xs font-bold flex items-center justify-center">2</span>
                Add environments
              </Link>
              <span className="text-brand-300">&rarr;</span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-brand-200 text-brand-700 text-xs font-bold flex items-center justify-center">3</span>
                Describe shot &amp; generate
              </span>
            </div>
          </div>
          <button onClick={() => setDismissedGuide(true)} className="text-brand-400 hover:text-brand-600 p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Three-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Scenes & Shots */}
        <SceneSidebar
          scenes={project.scenes}
          activeSceneId={activeSceneId}
          activeShotId={activeShotId}
          onSelectScene={setActiveSceneId}
          onSelectShot={(sceneId, shotId) => {
            setActiveSceneId(sceneId);
            setActiveShotId(shotId);
          }}
          onAddScene={() => setShowAddScene(true)}
          onAddShot={addShot}
          onDeleteShot={deleteShot}
          onDeleteScene={deleteScene}
        />

        {/* Center - Canvas & Preview */}
        <div className="flex-1 flex flex-col min-w-0 border-x border-surface-200">
          {activeShot ? (
            <>
              <div className="p-3 border-b border-surface-200 bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm text-surface-900">
                    {activeShot.title || `Shot ${activeShot.shotNumber}`}
                  </h3>
                  <p className="text-xs text-surface-500">
                    Scene {activeScene?.sceneNumber} &middot; Shot {activeShot.shotNumber} &middot;{" "}
                    <span className={`${activeShot.status === "generated" ? "text-green-600" : activeShot.status === "approved" ? "text-brand-600" : "text-surface-400"}`}>
                      {activeShot.status}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadReference(file);
                      }}
                    />
                    <span className="inline-flex items-center px-3 py-1.5 text-sm bg-surface-100 text-surface-700 rounded-lg hover:bg-surface-200 transition-colors">
                      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upload Ref
                    </span>
                  </label>
                  {activeShot.status === "generated" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateShot(activeShotId!, { status: "approved" } as Partial<Shot>)}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </Button>
                  )}
                  {activeShot.status === "approved" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateShot(activeShotId!, { status: "generated" } as Partial<Shot>)}
                      className="text-brand-600 hover:bg-brand-50"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approved
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    loading={generating}
                    onClick={generateImage}
                  >
                    {generating ? "Generating..." : "Generate Frame"}
                  </Button>
                </div>
              </div>

              {genError && (
                <div className="mx-3 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <p>{genError}</p>
                  </div>
                  <button onClick={() => setGenError(null)} className="text-red-400 hover:text-red-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
                  {/* Drawing Canvas */}
                  <div className="border-b lg:border-b-0 lg:border-r border-surface-200 flex flex-col">
                    <div className="p-2 bg-surface-50 border-b border-surface-200 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Sketch / Input
                    </div>
                    <div className="flex-1 p-2 bg-surface-100 min-h-[300px]">
                      <DrawingCanvas
                        onSave={setSketchDataUrl}
                        initialImage={activeShot.sketchImage || undefined}
                        key={activeShotId}
                      />
                    </div>
                    {/* Reference thumbnails */}
                    {JSON.parse(activeShot.uploadedReferences || "[]").length > 0 && (
                      <div className="p-2 border-t border-surface-200 bg-white">
                        <p className="text-xs text-surface-500 mb-1">References:</p>
                        <div className="flex gap-2 overflow-x-auto flex-wrap">
                          {JSON.parse(activeShot.uploadedReferences || "[]").map((ref: string, i: number) => (
                            <img
                              key={i}
                              src={ref}
                              alt={`Reference ${i + 1}`}
                              className="w-16 h-16 object-cover rounded border border-surface-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Generated Preview */}
                  <div className="flex flex-col">
                    <div className="p-2 bg-surface-50 border-b border-surface-200 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Generated Frame
                    </div>
                    <div className="flex-1 p-2 bg-surface-100 min-h-[300px]">
                      <GeneratedPreview
                        images={JSON.parse(activeShot.generatedImages || "[]")}
                        selectedVersion={activeShot.selectedVersion}
                        onSelectVersion={(v) => updateShot(activeShotId!, { selectedVersion: v } as Partial<Shot>)}
                        generating={generating}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-surface-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">Select a shot to begin</p>
                <p className="text-sm mt-1">Choose a shot from the sidebar or create a new one</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Shot Instructions */}
        {activeShot && (
          <div className="w-80 bg-white overflow-y-auto shrink-0">
            <ShotForm
              shot={activeShot}
              characters={project.characters}
              environments={project.environments}
              onUpdate={(data) => updateShot(activeShotId!, data)}
              onUploadPoseRef={uploadPoseForCharacter}
              uploadingPoseFor={uploadingPoseFor}
              poseUploadSuccess={poseUploadSuccess}
            />
          </div>
        )}
      </div>

      {/* Add Scene Modal */}
      <Modal open={showAddScene} onClose={() => setShowAddScene(false)} title="Add Scene">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Scene Title</label>
            <input
              type="text"
              value={newSceneTitle}
              onChange={(e) => setNewSceneTitle(e.target.value)}
              placeholder="e.g., Opening Sequence"
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              onKeyDown={(e) => e.key === "Enter" && addScene()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAddScene(false)}>Cancel</Button>
            <Button variant="primary" onClick={addScene}>Add Scene</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
