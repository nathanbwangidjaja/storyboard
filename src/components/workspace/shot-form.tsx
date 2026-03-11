"use client";

import { useState, useEffect, useCallback } from "react";
import { SHOT_TYPES } from "@/types";

interface Character {
  id: string;
  name: string;
  description: string | null;
}

interface Environment {
  id: string;
  name: string;
  description: string | null;
}

interface ShotCharacter {
  characterId: string;
  poseNotes?: string | null;
  actionNotes?: string | null;
  poseReferenceImage?: string | null;
  character?: { id: string; name: string };
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
  emotionalTone: string | null;
  compositionNotes: string | null;
  shotDuration: string | null;
  environmentId: string | null;
  characters: Array<ShotCharacter & { characterId: string }>;
}

interface ShotFormProps {
  shot: Shot;
  characters: Character[];
  environments: Environment[];
  onUpdate: (data: Record<string, unknown>) => void;
  onUploadPoseRef?: (characterId: string, file: File) => Promise<void>;
  uploadingPoseFor?: string | null;
  poseUploadSuccess?: string | null;
}

export function ShotForm({ shot, characters, environments, onUpdate, onUploadPoseRef, uploadingPoseFor, poseUploadSuccess }: ShotFormProps) {
  const [form, setForm] = useState({
    title: shot.title || "",
    shotType: shot.shotType || "medium",
    actionDescription: shot.actionDescription || "",
    cameraDirection: shot.cameraDirection || "",
    dialogueDirection: shot.dialogueDirection || "",
    vfxNotes: shot.vfxNotes || "",
    audioNotes: shot.audioNotes || "",
    continuityNotes: shot.continuityNotes || "",
    emotionalTone: shot.emotionalTone || "",
    compositionNotes: shot.compositionNotes || "",
    shotDuration: shot.shotDuration || "",
    environmentId: shot.environmentId || "",
  });

  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(
    shot.characters?.map((c) => c.characterId) || []
  );
  const [characterPoses, setCharacterPoses] = useState<Record<string, { poseNotes: string; actionNotes: string }>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    setForm({
      title: shot.title || "",
      shotType: shot.shotType || "medium",
      actionDescription: shot.actionDescription || "",
      cameraDirection: shot.cameraDirection || "",
      dialogueDirection: shot.dialogueDirection || "",
      vfxNotes: shot.vfxNotes || "",
      audioNotes: shot.audioNotes || "",
      continuityNotes: shot.continuityNotes || "",
      emotionalTone: shot.emotionalTone || "",
      compositionNotes: shot.compositionNotes || "",
      shotDuration: shot.shotDuration || "",
      environmentId: shot.environmentId || "",
    });
    setSelectedCharacterIds(shot.characters?.map((c) => c.characterId) || []);
    setCharacterPoses((p) => {
      const next = { ...p };
      (shot.characters || []).forEach((sc) => {
        next[sc.characterId] = { poseNotes: sc.poseNotes || "", actionNotes: sc.actionNotes || "" };
      });
      return next;
    });
  }, [shot]);

  const debounceRef = useCallback(
    (() => {
      let timer: NodeJS.Timeout;
      return (data: Record<string, unknown>) => {
        clearTimeout(timer);
        timer = setTimeout(() => onUpdate(data), 800);
      };
    })(),
    [onUpdate]
  );

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    debounceRef({ [field]: value });
  };

  const toggleCharacter = (charId: string) => {
    const next = selectedCharacterIds.includes(charId)
      ? selectedCharacterIds.filter((id) => id !== charId)
      : [...selectedCharacterIds, charId];
    setSelectedCharacterIds(next);
    emitCharacters(next, characterPoses, undefined);
  };

  const getPoseRefForCharacter = (cid: string) =>
    shot.characters?.find((sc) => sc.characterId === cid)?.poseReferenceImage;

  const emitCharacters = (ids: string[], poses: Record<string, { poseNotes: string; actionNotes: string }>, poseRefs?: Record<string, string | null>) => {
    onUpdate({
      characters: ids.map((cid) => ({
        characterId: cid,
        poseNotes: poses[cid]?.poseNotes || null,
        actionNotes: poses[cid]?.actionNotes || null,
        poseReferenceImage: poseRefs?.[cid] ?? getPoseRefForCharacter(cid),
      })),
    });
  };

  const updateCharacterPose = (charId: string, field: "poseNotes" | "actionNotes", value: string) => {
    const next = { ...characterPoses, [charId]: { ...(characterPoses[charId] || { poseNotes: "", actionNotes: "" }), [field]: value } };
    setCharacterPoses(next);
    debounceRef({
      characters: selectedCharacterIds.map((cid) => ({
        characterId: cid,
        poseNotes: next[cid]?.poseNotes || null,
        actionNotes: next[cid]?.actionNotes || null,
        poseReferenceImage: getPoseRefForCharacter(cid),
      })),
    });
  };

  const clearPoseRef = (cid: string) => {
    if (!onUploadPoseRef) return;
    onUpdate({
      characters: selectedCharacterIds.map((scid) => ({
        characterId: scid,
        poseNotes: characterPoses[scid]?.poseNotes || null,
        actionNotes: characterPoses[scid]?.actionNotes || null,
        poseReferenceImage: scid === cid ? null : getPoseRefForCharacter(scid),
      })),
    });
  };

  return (
    <div className="divide-y divide-surface-100">
      {/* Shot Info */}
      <div className="p-3 space-y-3">
        <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Shot Info</h3>
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            placeholder="Shot title..."
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">Shot Type</label>
            <select
              value={form.shotType}
              onChange={(e) => handleChange("shotType", e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500"
            >
              {SHOT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/-/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">Duration</label>
            <input
              type="text"
              value={form.shotDuration}
              onChange={(e) => handleChange("shotDuration", e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500"
              placeholder="e.g., 3s"
            />
          </div>
        </div>
      </div>

      {/* Action Description */}
      <div className="p-3 space-y-3">
        <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Action</h3>
        <textarea
          value={form.actionDescription}
          onChange={(e) => handleChange("actionDescription", e.target.value)}
          rows={3}
          className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500 resize-none"
          placeholder="Describe what happens in this shot..."
        />
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Emotional Tone</label>
          <input
            type="text"
            value={form.emotionalTone}
            onChange={(e) => handleChange("emotionalTone", e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500"
            placeholder="e.g., tense, joyful, melancholic"
          />
        </div>
      </div>

      {/* Characters */}
      <div className="p-3 space-y-3">
        <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Characters</h3>
        {characters.length === 0 ? (
          <p className="text-xs text-surface-400">No characters defined yet</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => toggleCharacter(char.id)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    selectedCharacterIds.includes(char.id)
                      ? "bg-brand-100 border-brand-300 text-brand-700"
                      : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                  }`}
                >
                  {char.name}
                </button>
              ))}
            </div>
            {selectedCharacterIds.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-surface-100">
                <p className="text-xs font-medium text-surface-600">Pose & Action (per character)</p>
                {selectedCharacterIds.map((cid) => {
                  const char = characters.find((c) => c.id === cid);
                  const pose = characterPoses[cid] || { poseNotes: "", actionNotes: "" };
                  const poseRefUrl = getPoseRefForCharacter(cid);
                  const isUploading = uploadingPoseFor === cid;
                  const justUploaded = poseUploadSuccess === cid;
                  return (
                    <div key={cid} className="p-2 rounded-lg bg-surface-50 border border-surface-100 space-y-2">
                      <span className="text-xs font-medium text-surface-700 block">{char?.name || cid}</span>
                      <div>
                        <label className="text-[10px] text-surface-500 uppercase block mb-1">Pose reference</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {poseRefUrl ? (
                            <div className="relative group">
                              <img
                                src={poseRefUrl}
                                alt={`Pose for ${char?.name}`}
                                className="w-14 h-14 object-cover rounded border-2 border-brand-400"
                              />
                              <span className="absolute bottom-0 left-0 right-0 bg-brand-600/90 text-white text-[9px] text-center py-0.5">
                                {char?.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => clearPoseRef(cid)}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove pose"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <label
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors ${
                                isUploading
                                  ? "bg-brand-50 border-brand-200 text-brand-600"
                                  : "bg-white border-surface-200 text-surface-600 hover:bg-surface-50"
                              }`}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f && onUploadPoseRef) onUploadPoseRef(cid, f);
                                  e.target.value = "";
                                }}
                              />
                              {isUploading ? (
                                <>
                                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  Uploading…
                                </>
                              ) : justUploaded ? (
                                <>
                                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Uploaded!
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                                  </svg>
                                  Upload pose
                                </>
                              )}
                            </label>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={pose.poseNotes}
                        onChange={(e) => updateCharacterPose(cid, "poseNotes", e.target.value)}
                        placeholder="Pose (e.g., jumping out, mid-leap)"
                        className="w-full px-2 py-1 text-xs border border-surface-200 rounded focus:ring-1 focus:ring-brand-500"
                      />
                      <input
                        type="text"
                        value={pose.actionNotes}
                        onChange={(e) => updateCharacterPose(cid, "actionNotes", e.target.value)}
                        placeholder="Action (e.g., arms extended, legs bent)"
                        className="w-full px-2 py-1 text-xs border border-surface-200 rounded focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Environment */}
      <div className="p-3 space-y-2">
        <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Environment</h3>
        <select
          value={form.environmentId}
          onChange={(e) => handleChange("environmentId", e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500"
        >
          <option value="">None selected</option>
          {environments.map((env) => (
            <option key={env.id} value={env.id}>{env.name}</option>
          ))}
        </select>
      </div>

      {/* Camera Direction */}
      <div className="p-3 space-y-3">
        <button onClick={() => toggleSection("camera")} className="flex items-center justify-between w-full">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Camera</h3>
          <svg className={`w-3.5 h-3.5 text-surface-400 transition-transform ${expandedSections.camera ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {(expandedSections.camera || form.cameraDirection || form.compositionNotes) && (
          <div className="space-y-3">
            <textarea
              value={form.cameraDirection}
              onChange={(e) => handleChange("cameraDirection", e.target.value)}
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500 resize-none"
              placeholder="Camera angle, framing, movement..."
            />
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">Composition</label>
              <input
                type="text"
                value={form.compositionNotes}
                onChange={(e) => handleChange("compositionNotes", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500"
                placeholder="Rule of thirds, leading lines..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Dialogue */}
      <div className="p-3 space-y-3">
        <button onClick={() => toggleSection("dialogue")} className="flex items-center justify-between w-full">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Dialogue</h3>
          <svg className={`w-3.5 h-3.5 text-surface-400 transition-transform ${expandedSections.dialogue ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {(expandedSections.dialogue || form.dialogueDirection) && (
          <textarea
            value={form.dialogueDirection}
            onChange={(e) => handleChange("dialogueDirection", e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500 resize-none"
            placeholder="Who speaks, line summary, emotion..."
          />
        )}
      </div>

      {/* VFX */}
      <div className="p-3 space-y-3">
        <button onClick={() => toggleSection("vfx")} className="flex items-center justify-between w-full">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">VFX</h3>
          <svg className={`w-3.5 h-3.5 text-surface-400 transition-transform ${expandedSections.vfx ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {(expandedSections.vfx || form.vfxNotes) && (
          <textarea
            value={form.vfxNotes}
            onChange={(e) => handleChange("vfxNotes", e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500 resize-none"
            placeholder="Smoke, sparks, magic effects..."
          />
        )}
      </div>

      {/* Audio */}
      <div className="p-3 space-y-3">
        <button onClick={() => toggleSection("audio")} className="flex items-center justify-between w-full">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Audio</h3>
          <svg className={`w-3.5 h-3.5 text-surface-400 transition-transform ${expandedSections.audio ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {(expandedSections.audio || form.audioNotes) && (
          <textarea
            value={form.audioNotes}
            onChange={(e) => handleChange("audioNotes", e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500 resize-none"
            placeholder="Ambient sound, music cue, SFX..."
          />
        )}
      </div>

      {/* Continuity */}
      <div className="p-3 space-y-3">
        <button onClick={() => toggleSection("continuity")} className="flex items-center justify-between w-full">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Continuity</h3>
          <svg className={`w-3.5 h-3.5 text-surface-400 transition-transform ${expandedSections.continuity ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {(expandedSections.continuity || form.continuityNotes) && (
          <textarea
            value={form.continuityNotes}
            onChange={(e) => handleChange("continuityNotes", e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-md focus:ring-1 focus:ring-brand-500 resize-none"
            placeholder="Match previous shot, preserve wardrobe..."
          />
        )}
      </div>
    </div>
  );
}
