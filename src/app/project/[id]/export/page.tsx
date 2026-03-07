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
  vfxNotes: string | null;
  audioNotes: string | null;
  generatedImages: string;
  selectedVersion: number;
  scene: {
    sceneNumber: number;
    title: string;
  };
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  style: string;
  aspectRatio: string;
}

export default function ExportPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "images" | "json">("pdf");

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${projectId}`).then((r) => r.json()),
      fetch(`/api/projects/${projectId}/shots`).then((r) => r.json()),
    ]).then(([proj, shotList]) => {
      setProject(proj);
      setShots(shotList);
      setLoading(false);
    });
  }, [projectId]);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Title page
      doc.setFontSize(32);
      doc.text(project?.title || "Storyboard", pageWidth / 2, 50, { align: "center" });
      doc.setFontSize(14);
      doc.setTextColor(100);
      if (project?.description) {
        doc.text(project.description, pageWidth / 2, 65, { align: "center", maxWidth: 200 });
      }
      doc.setFontSize(10);
      doc.text(`Style: ${project?.style} | Aspect Ratio: ${project?.aspectRatio}`, pageWidth / 2, 80, { align: "center" });
      doc.text(`${shots.length} shots | Exported ${new Date().toLocaleDateString()}`, pageWidth / 2, 88, { align: "center" });

      // Shot pages
      for (const shot of shots) {
        doc.addPage();
        doc.setTextColor(0);

        const images = JSON.parse(shot.generatedImages || "[]");
        const img = images[shot.selectedVersion] || images[images.length - 1];

        // Header
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Scene ${shot.scene.sceneNumber}: ${shot.scene.title}`, 10, 12);
        doc.setFont("helvetica", "normal");
        doc.text(`Shot ${shot.shotNumber}: ${shot.title || "Untitled"} (${shot.shotType})`, 10, 19);

        // Image
        if (img) {
          try {
            const response = await fetch(img);
            const blob = await response.blob();
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });

            const imgWidth = 160;
            const imgHeight = 90;
            doc.addImage(dataUrl, "PNG", 10, 24, imgWidth, imgHeight);
          } catch {
            doc.setFontSize(10);
            doc.text("[Image could not be loaded]", 10, 60);
          }
        }

        // Details
        const detailsStartY = 120;
        let y = detailsStartY;
        doc.setFontSize(9);

        const addDetail = (label: string, value: string | null) => {
          if (!value) return;
          doc.setFont("helvetica", "bold");
          doc.text(`${label}:`, 10, y);
          doc.setFont("helvetica", "normal");
          const lines = doc.splitTextToSize(value, 270);
          doc.text(lines, 50, y);
          y += lines.length * 4 + 2;
        };

        addDetail("Action", shot.actionDescription);
        addDetail("Camera", shot.cameraDirection);
        addDetail("Dialogue", shot.dialogueDirection);
        addDetail("VFX", shot.vfxNotes);
        addDetail("Audio", shot.audioNotes);
      }

      doc.save(`${project?.title || "storyboard"}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const exportImages = async () => {
    setExporting(true);
    try {
      const imageUrls: string[] = [];
      for (const shot of shots) {
        const images = JSON.parse(shot.generatedImages || "[]");
        const img = images[shot.selectedVersion] || images[images.length - 1];
        if (img) imageUrls.push(img);
      }

      for (let i = 0; i < imageUrls.length; i++) {
        const res = await fetch(imageUrls[i]);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `shot_${i + 1}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  };

  const exportJSON = () => {
    const data = {
      project: {
        title: project?.title,
        description: project?.description,
        style: project?.style,
        aspectRatio: project?.aspectRatio,
      },
      shots: shots.map((s) => ({
        sceneNumber: s.scene.sceneNumber,
        sceneTitle: s.scene.title,
        shotNumber: s.shotNumber,
        title: s.title,
        shotType: s.shotType,
        actionDescription: s.actionDescription,
        cameraDirection: s.cameraDirection,
        dialogueDirection: s.dialogueDirection,
        vfxNotes: s.vfxNotes,
        audioNotes: s.audioNotes,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.title || "storyboard"}_shots.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (exportFormat === "pdf") exportPDF();
    else if (exportFormat === "images") exportImages();
    else exportJSON();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  const generatedCount = shots.filter((s) => JSON.parse(s.generatedImages || "[]").length > 0).length;

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href={`/project/${projectId}/workspace`} className="text-surface-500 hover:text-surface-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold text-surface-900">Export Storyboard</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <h2 className="text-xl font-semibold text-surface-900 mb-1">{project?.title}</h2>
          <p className="text-sm text-surface-500 mb-6">
            {shots.length} shots &middot; {generatedCount} frames generated
          </p>

          {generatedCount < shots.length && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-700">
                {shots.length - generatedCount} shots have no generated frames yet. They will appear as placeholders in the export.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "pdf" as const, label: "PDF", desc: "Full storyboard with details" },
                  { value: "images" as const, label: "Images", desc: "Download all frames" },
                  { value: "json" as const, label: "Shot Data", desc: "JSON metadata export" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setExportFormat(opt.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      exportFormat === opt.value
                        ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200"
                        : "border-surface-200 hover:border-surface-300"
                    }`}
                  >
                    <p className="font-medium text-sm text-surface-900">{opt.label}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleExport}
              loading={exporting}
              className="w-full"
              size="lg"
              disabled={shots.length === 0}
            >
              {exporting ? "Exporting..." : `Export as ${exportFormat.toUpperCase()}`}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-surface-700 mb-3">Export Preview</h3>
          <div className="grid grid-cols-4 gap-2">
            {shots.slice(0, 8).map((shot) => {
              const images = JSON.parse(shot.generatedImages || "[]");
              const img = images[shot.selectedVersion] || images[images.length - 1];
              return (
                <div key={shot.id} className="aspect-video bg-surface-100 rounded border border-surface-200 overflow-hidden">
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-300 text-xs">
                      {shot.shotNumber}
                    </div>
                  )}
                </div>
              );
            })}
            {shots.length > 8 && (
              <div className="aspect-video bg-surface-100 rounded border border-surface-200 flex items-center justify-center text-surface-400 text-sm">
                +{shots.length - 8} more
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
