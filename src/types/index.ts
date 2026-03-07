export interface ProjectWithCounts {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  aspectRatio: string;
  style: string;
  thumbnail: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    scenes: number;
  };
  totalShots?: number;
}

export interface ShotFormData {
  title?: string;
  shotType: string;
  actionDescription?: string;
  cameraDirection?: string;
  dialogueDirection?: string;
  vfxNotes?: string;
  audioNotes?: string;
  continuityNotes?: string;
  emotionalTone?: string;
  compositionNotes?: string;
  shotDuration?: string;
  environmentId?: string;
  characterIds?: string[];
}

export type ShotStatus = "draft" | "generated" | "approved";

export const SHOT_TYPES = [
  "close-up",
  "medium",
  "wide",
  "over-the-shoulder",
  "insert",
  "tracking",
  "pov",
  "extreme-close-up",
  "full",
  "establishing",
] as const;

export const ASPECT_RATIOS = [
  "16:9",
  "4:3",
  "1:1",
  "9:16",
  "2.39:1",
] as const;

export const STYLES = [
  "cinematic",
  "anime",
  "comic",
  "black-and-white",
  "concept-art",
  "watercolor",
  "sketch",
] as const;
