"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";

interface Environment {
  id: string;
  name: string;
  description: string | null;
  referenceImages: string;
  lightingNotes: string | null;
  moodNotes: string | null;
  recurringProps: string | null;
  locationStyle: string | null;
}

export default function EnvironmentsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Environment | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    lightingNotes: "",
    moodNotes: "",
    recurringProps: "",
    locationStyle: "",
  });

  const fetchEnvs = async () => {
    const res = await fetch(`/api/projects/${projectId}/environments`);
    if (res.ok) setEnvironments(await res.json());
  };

  useEffect(() => { fetchEnvs(); }, [projectId]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", lightingNotes: "", moodNotes: "", recurringProps: "", locationStyle: "" });
    setShowModal(true);
  };

  const openEdit = (env: Environment) => {
    setEditing(env);
    setForm({
      name: env.name,
      description: env.description || "",
      lightingNotes: env.lightingNotes || "",
      moodNotes: env.moodNotes || "",
      recurringProps: env.recurringProps || "",
      locationStyle: env.locationStyle || "",
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const url = editing
      ? `/api/projects/${projectId}/environments/${editing.id}`
      : `/api/projects/${projectId}/environments`;
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); fetchEnvs(); }
  };

  const deleteEnv = async (id: string) => {
    if (!confirm("Delete this environment?")) return;
    await fetch(`/api/projects/${projectId}/environments/${id}`, { method: "DELETE" });
    fetchEnvs();
  };

  const uploadRef = async (envId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "environment");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { path } = await res.json();
      const env = environments.find((e) => e.id === envId);
      if (!env) return;
      const refs = JSON.parse(env.referenceImages || "[]");
      refs.push(path);
      await fetch(`/api/projects/${projectId}/environments/${envId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceImages: JSON.stringify(refs) }),
      });
      fetchEnvs();
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href={`/project/${projectId}/workspace`} className="text-surface-500 hover:text-surface-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold text-surface-900">Environment Library</h1>
        </div>
        <Button onClick={openNew}>Add Environment</Button>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {environments.length === 0 ? (
          <div className="text-center py-20 text-surface-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
            </svg>
            <p className="text-lg font-medium mb-1">No environments yet</p>
            <p className="text-sm mb-4">Define locations and settings for your scenes</p>
            <Button onClick={openNew}>Add First Environment</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {environments.map((env) => {
              const refs = JSON.parse(env.referenceImages || "[]") as string[];
              return (
                <div key={env.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-surface-100 flex items-center justify-center overflow-hidden">
                    {refs.length > 0 ? (
                      <img src={refs[0]} alt={env.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-16 h-16 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-surface-900">{env.name}</h3>
                    {env.description && <p className="text-sm text-surface-500 mt-1 line-clamp-2">{env.description}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {env.moodNotes && <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">{env.moodNotes}</span>}
                      {env.lightingNotes && <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full">{env.lightingNotes}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(env)}>Edit</Button>
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadRef(env.id, f);
                        }} />
                        <span className="inline-flex items-center px-3 py-1.5 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors">Upload Ref</span>
                      </label>
                      <button onClick={() => deleteEnv(env.id)} className="ml-auto text-red-400 hover:text-red-600 text-sm">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Environment" : "Add Environment"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Location name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 resize-none" placeholder="Describe the environment..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Lighting</label>
              <input type="text" value={form.lightingNotes} onChange={(e) => setForm({ ...form, lightingNotes: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="e.g., golden hour" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Mood</label>
              <input type="text" value={form.moodNotes} onChange={(e) => setForm({ ...form, moodNotes: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="e.g., eerie, warm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Recurring Props</label>
            <input type="text" value={form.recurringProps} onChange={(e) => setForm({ ...form, recurringProps: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="Key objects always in this location" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Style</label>
            <input type="text" value={form.locationStyle} onChange={(e) => setForm({ ...form, locationStyle: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="e.g., cyberpunk, medieval" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Add Environment"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
