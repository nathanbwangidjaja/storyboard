"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";

interface Character {
  id: string;
  name: string;
  description: string | null;
  referenceImages: string;
  styleNotes: string | null;
  costumeNotes: string | null;
  ageGender: string | null;
  personalityNotes: string | null;
}

export default function CharactersPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Character | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    styleNotes: "",
    costumeNotes: "",
    ageGender: "",
    personalityNotes: "",
  });

  const fetchCharacters = async () => {
    const res = await fetch(`/api/projects/${projectId}/characters`);
    if (res.ok) setCharacters(await res.json());
  };

  useEffect(() => { fetchCharacters(); }, [projectId]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", styleNotes: "", costumeNotes: "", ageGender: "", personalityNotes: "" });
    setShowModal(true);
  };

  const openEdit = (char: Character) => {
    setEditing(char);
    setForm({
      name: char.name,
      description: char.description || "",
      styleNotes: char.styleNotes || "",
      costumeNotes: char.costumeNotes || "",
      ageGender: char.ageGender || "",
      personalityNotes: char.personalityNotes || "",
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const url = editing
      ? `/api/projects/${projectId}/characters/${editing.id}`
      : `/api/projects/${projectId}/characters`;
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      fetchCharacters();
    }
  };

  const deleteChar = async (id: string) => {
    if (!confirm("Delete this character?")) return;
    await fetch(`/api/projects/${projectId}/characters/${id}`, { method: "DELETE" });
    fetchCharacters();
  };

  const uploadRef = async (charId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "character");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { path } = await res.json();
      const char = characters.find((c) => c.id === charId);
      if (!char) return;
      const refs = JSON.parse(char.referenceImages || "[]");
      refs.push(path);
      await fetch(`/api/projects/${projectId}/characters/${charId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceImages: JSON.stringify(refs) }),
      });
      fetchCharacters();
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
          <h1 className="font-semibold text-surface-900">Character Library</h1>
        </div>
        <Button onClick={openNew}>Add Character</Button>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {characters.length === 0 ? (
          <div className="text-center py-20 text-surface-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-lg font-medium mb-1">No characters yet</p>
            <p className="text-sm mb-4">Define your characters to maintain consistency across shots</p>
            <Button onClick={openNew}>Add First Character</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char) => {
              const refs = JSON.parse(char.referenceImages || "[]") as string[];
              return (
                <div key={char.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-surface-100 flex items-center justify-center overflow-hidden">
                    {refs.length > 0 ? (
                      <img src={refs[0]} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-16 h-16 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-surface-900">{char.name}</h3>
                    {char.description && <p className="text-sm text-surface-500 mt-1 line-clamp-2">{char.description}</p>}
                    {char.ageGender && <p className="text-xs text-surface-400 mt-1">{char.ageGender}</p>}
                    {refs.length > 1 && (
                      <div className="flex gap-1 mt-2">
                        {refs.slice(1, 4).map((r, i) => (
                          <img key={i} src={r} alt="" className="w-10 h-10 rounded object-cover border border-surface-200" />
                        ))}
                        {refs.length > 4 && (
                          <div className="w-10 h-10 rounded bg-surface-100 flex items-center justify-center text-xs text-surface-400">
                            +{refs.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(char)}>Edit</Button>
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadRef(char.id, f);
                        }} />
                        <span className="inline-flex items-center px-3 py-1.5 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors">
                          Upload Ref
                        </span>
                      </label>
                      <button onClick={() => deleteChar(char.id)} className="ml-auto text-red-400 hover:text-red-600 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Character" : "Add Character"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Character name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Visual Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="Physical appearance, distinguishing features..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Age / Gender</label>
              <input type="text" value={form.ageGender} onChange={(e) => setForm({ ...form, ageGender: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="e.g., 30s female" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Personality</label>
              <input type="text" value={form.personalityNotes} onChange={(e) => setForm({ ...form, personalityNotes: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="e.g., brave, quiet" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Style Notes</label>
            <input type="text" value={form.styleNotes} onChange={(e) => setForm({ ...form, styleNotes: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="Art style notes for this character" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Costume Notes</label>
            <input type="text" value={form.costumeNotes} onChange={(e) => setForm({ ...form, costumeNotes: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="Clothing, accessories, armor..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Add Character"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
