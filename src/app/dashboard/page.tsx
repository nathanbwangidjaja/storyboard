"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { ASPECT_RATIOS, STYLES } from "@/types";
import type { ProjectWithCounts } from "@/types";

// ---------------------------------------------------------------------------
// New Project Modal
// ---------------------------------------------------------------------------

function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [style, setStyle] = useState<string>("cinematic");
  const [genre, setGenre] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          aspectRatio,
          style,
          genre: genre.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to create project");
      }

      const project = await res.json();
      onCreated(project.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-xl bg-surface-0 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-surface-900">New Project</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 hover:text-surface-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="np-title" className="mb-1.5 block text-sm font-medium text-surface-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="np-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Storyboard Project"
              className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="np-desc" className="mb-1.5 block text-sm font-medium text-surface-700">
              Description
            </label>
            <textarea
              id="np-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your project..."
              className="w-full resize-none rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Aspect Ratio & Style */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="np-ar" className="mb-1.5 block text-sm font-medium text-surface-700">
                Aspect Ratio
              </label>
              <select
                id="np-ar"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {ASPECT_RATIOS.map((ar) => (
                  <option key={ar} value={ar}>
                    {ar}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="np-style" className="mb-1.5 block text-sm font-medium text-surface-700">
                Style
              </label>
              <select
                id="np-style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Genre */}
          <div>
            <label htmlFor="np-genre" className="mb-1.5 block text-sm font-medium text-surface-700">
              Genre
            </label>
            <input
              id="np-genre"
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Sci-fi, Drama, Action..."
              className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Project Card Menu
// ---------------------------------------------------------------------------

function CardMenu({
  project,
  onRename,
  onDuplicate,
  onDelete,
}: {
  project: ProjectWithCounts;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600"
        aria-label={`Menu for ${project.title}`}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-40 rounded-lg border border-surface-200 bg-surface-0 py-1 shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onRename();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-surface-700 hover:bg-surface-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Rename
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDuplicate();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-surface-700 hover:bg-surface-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplicate
          </button>
          <hr className="my-1 border-surface-200" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Project Card
// ---------------------------------------------------------------------------

const STYLE_COLORS: Record<string, string> = {
  cinematic: "bg-amber-100 text-amber-800",
  anime: "bg-pink-100 text-pink-800",
  comic: "bg-blue-100 text-blue-800",
  "black-and-white": "bg-surface-200 text-surface-700",
  "concept-art": "bg-purple-100 text-purple-800",
  watercolor: "bg-teal-100 text-teal-800",
  sketch: "bg-surface-100 text-surface-600",
};

const THUMBNAIL_GRADIENTS = [
  "from-brand-400 to-brand-600",
  "from-purple-400 to-pink-500",
  "from-teal-400 to-cyan-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-emerald-400 to-green-600",
];

function gradientForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return THUMBNAIL_GRADIENTS[Math.abs(hash) % THUMBNAIL_GRADIENTS.length];
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ProjectCard({
  project,
  onClick,
  onRename,
  onDuplicate,
  onDelete,
}: {
  project: ProjectWithCounts;
  onClick: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const styleLabel = project.style.charAt(0).toUpperCase() + project.style.slice(1).replace(/-/g, " ");
  const sceneCount = project._count.scenes;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-sm transition-all hover:shadow-md hover:border-surface-300"
    >
      {/* Thumbnail */}
      <div className={`relative h-40 bg-gradient-to-br ${gradientForId(project.id)}`}>
        {project.thumbnail ? (
          <img src={project.thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-12 w-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 3.75c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125" />
            </svg>
          </div>
        )}
        {/* Style Badge */}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLE_COLORS[project.style] || "bg-surface-100 text-surface-700"}`}
        >
          {styleLabel}
        </span>
        {/* Card Menu */}
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <CardMenu project={project} onRename={onRename} onDuplicate={onDuplicate} onDelete={onDelete} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="truncate text-sm font-semibold text-surface-900">{project.title}</h3>
        {project.description && (
          <p className="mt-1 line-clamp-2 text-xs text-surface-500">{project.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-surface-400">
          <span>{sceneCount} {sceneCount === 1 ? "scene" : "scenes"}</span>
          <span>{formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rename Dialog
// ---------------------------------------------------------------------------

function RenameDialog({
  project,
  onClose,
  onRenamed,
}: {
  project: ProjectWithCounts;
  onClose: () => void;
  onRenamed: (id: string, newTitle: string) => void;
}) {
  const [title, setTitle] = useState(project.title);
  const [submitting, setSubmitting] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) throw new Error("Failed to rename");
      onRenamed(project.id, title.trim());
      onClose();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-surface-0 p-6 shadow-2xl">
        <h2 className="mb-4 text-lg font-semibold text-surface-900">Rename Project</h2>
        <input
          autoFocus
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation Dialog
// ---------------------------------------------------------------------------

function DeleteDialog({
  project,
  onClose,
  onDeleted,
}: {
  project: ProjectWithCounts;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  async function handleDelete() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      onDeleted(project.id);
      onClose();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-xl bg-surface-0 p-6 shadow-2xl">
        <h2 className="mb-2 text-lg font-semibold text-surface-900">Delete Project</h2>
        <p className="mb-5 text-sm text-surface-600">
          Are you sure you want to delete <strong>{project.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={submitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ onNewProject }: { onNewProject: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Illustration */}
      <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-brand-50">
        <svg className="h-16 w-16 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 3.75c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-surface-800">No projects yet</h3>
      <p className="mb-6 max-w-sm text-sm text-surface-500">
        Create your first storyboard project to start sketching scenes and generating AI-powered frames.
      </p>
      <button
        onClick={onNewProject}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Create Your First Project
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [renamingProject, setRenamingProject] = useState<ProjectWithCounts | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithCounts | null>(null);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProjects(data);
    } catch {
      // Silently fail; user sees empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handlers
  function handleProjectCreated(id: string) {
    router.push(`/project/${id}/workspace`);
  }

  function handleRenamed(id: string, newTitle: string) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p))
    );
  }

  async function handleDuplicate(project: ProjectWithCounts) {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${project.title} (Copy)`,
          description: project.description || undefined,
          aspectRatio: project.aspectRatio,
          style: project.style,
          genre: project.genre || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      await fetchProjects();
    } catch {
      // Silently fail
    }
  }

  function handleDeleted(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  // Filter projects
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-surface-200 bg-surface-0/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125M3.375 19.5c-.621 0-1.125-.504-1.125-1.125M2.25 18.375V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 0h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125" />
              </svg>
            </div>
            <span className="text-lg font-bold text-surface-900">Storyboard AI</span>
          </div>

          {/* User info & sign out */}
          <div className="flex items-center gap-4">
            {session?.user && (
              <span className="hidden text-sm text-surface-600 sm:inline">
                {session.user.name || session.user.email}
              </span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="rounded-lg border border-surface-300 px-3 py-1.5 text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-surface-900">Your Projects</h1>
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Project
          </button>
        </div>

        {/* Search */}
        {projects.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-sm">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-surface-300 bg-surface-0 py-2 pl-10 pr-3 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-300 border-t-brand-600" />
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <EmptyState onNewProject={() => setShowNewModal(true)} />
        )}

        {/* No search results */}
        {!loading && projects.length > 0 && filteredProjects.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-surface-500">
              No projects match &ldquo;{search}&rdquo;
            </p>
          </div>
        )}

        {/* Project Grid */}
        {!loading && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => router.push(`/project/${project.id}/workspace`)}
                onRename={() => setRenamingProject(project)}
                onDuplicate={() => handleDuplicate(project)}
                onDelete={() => setDeletingProject(project)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showNewModal && (
        <NewProjectModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleProjectCreated}
        />
      )}

      {renamingProject && (
        <RenameDialog
          project={renamingProject}
          onClose={() => setRenamingProject(null)}
          onRenamed={handleRenamed}
        />
      )}

      {deletingProject && (
        <DeleteDialog
          project={deletingProject}
          onClose={() => setDeletingProject(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
