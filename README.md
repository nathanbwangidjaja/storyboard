# Storyboard

A web app for creating storyboard sequences with AI-generated frames. You define scenes and shots, add characters and environments, describe each shot (camera, action, dialogue, etc.), and the app uses Google Gemini to produce illustrated frames. It tries to keep characters and settings consistent across shots by feeding the previous frame back as a reference.

## What it does

- **Projects** — Create projects with a style (cinematic, etc.) and aspect ratio. Each project has its own scenes, characters, and environments.
- **Characters** — Add characters with descriptions, reference images, and costume notes so the AI has something to anchor on.
- **Environments** — Define locations (desert, office, car interior) with reference images and lighting notes.
- **Scenes & shots** — Break a project into scenes, then shots within each scene. Each shot has action description, camera direction, dialogue, VFX, audio notes, and continuity notes.
- **Workspace** — Pick a shot, optionally sketch or upload references, fill in the form, then hit Generate. The app sends everything to Gemini and saves the resulting image.
- **Continuity** — When generating shot N, the previous shot’s image is sent as a reference so the model can match style and characters.
- **Pose references** — You can upload a pose image per character so the AI copies that body position.
- **Export** — Export a project as PDF, a ZIP of images, or JSON.

## Stack

- Next.js 16 (App Router)
- React 19
- Prisma + SQLite
- NextAuth (credentials, email/password)
- Tailwind CSS
- Google Gemini API for image generation

## Prerequisites

- Node 18+
- A [Google AI Studio](https://aistudio.google.com) API key (free tier works)

## Setup

Clone, install, and set up env:

```bash
npm install
cp .env.example .env
```

Edit `.env`. You need:

- `DATABASE_URL` — SQLite path, e.g. `file:./dev.db`
- `NEXTAUTH_SECRET` — Any long random string. Generate one: `openssl rand -base64 32`
- `NEXTAUTH_URL` — For local dev: `http://localhost:3000`
- `GEMINI_API_KEY` — From [Google AI Studio](https://aistudio.google.com/apikey)
- `GEMINI_MODEL` — e.g. `gemini-2.5-flash-image`

Prisma reads `.env` (not `.env.local`). Next.js loads both. If you use `.env.local`, copy it to `.env` as well so Prisma works, or symlink. Both files are gitignored.

Init the DB and run:

```bash
npm run db:push
npm run dev
```

Open http://localhost:3000. Sign up, create a project, add a scene and shot, fill in the form, and generate.

## Project layout

```
src/
  app/
    api/           # API routes: auth, projects, scenes, shots, characters, environments, upload, generate
    auth/          # Login, signup
    dashboard/     # Project list
    project/[id]/  # Workspace, characters, environments, timeline, export
  components/      # Button, Modal, DrawingCanvas, ShotForm, SceneSidebar, GeneratedPreview
  lib/             # auth.ts, db.ts, gemini.ts
prisma/
  schema.prisma    # User, Project, Scene, Shot, Character, Environment, etc.
```

## How generation works

1. You click Generate on a shot.
2. The API loads the shot, its characters, environment, and (if it exists) the previous shot in the same scene.
3. It builds a prompt from action, camera, characters, environment, VFX, etc.
4. If there’s a previous shot image, that image is sent first with instructions to match its style and set.
5. Any per-character pose references are added with “replicate this pose for [character]”.
6. Character reference images and shot-level refs are appended.
7. Gemini returns an image; it’s saved under `public/uploads/generated/` and linked to the shot.

## Quirks and tips

- **Content filters** — Gemini blocks violence, weapons, etc. If generation fails, soften the language (e.g. “tense discussion” instead of “arguing”).
- **Consistency** — The model tries to match the previous frame, but it’s not perfect. Adding character reference images in the Characters tab helps.
- **Prisma** — The project uses `db push`, not migrations. If you change the schema, run `npm run db:push` again.

## Scripts

| Script        | Description                          |
|---------------|--------------------------------------|
| `npm run dev` | Start dev server on port 3000        |
| `npm run build` | Prisma generate + Next.js build   |
| `npm run start` | Start production server            |
| `npm run db:push` | Sync Prisma schema to SQLite    |
| `npm run db:studio` | Open Prisma Studio GUI         |

## Security

`.gitignore` is set up so `.env`, `.env.local`, `*.db`, `*.key`, `*.pem`, and `public/uploads/` are not committed. Double-check with `git status` before pushing.
