# Storyboard

A storyboard generation app that uses AI (Gemini) to create illustrated frames from shot descriptions, with support for character poses, references, and continuity across shots.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy the example env file and add your credentials:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   - `NEXTAUTH_SECRET` — A long random string (e.g. `openssl rand -base64 32`)
   - `GEMINI_API_KEY` — Your [Google AI Studio API key](https://aistudio.google.com/apikey)
   - `GEMINI_MODEL` — e.g. `gemini-2.5-flash-image`

   > **Note:** You can use `.env` or `.env.local` — both work. Never commit either file; they are listed in `.gitignore`.

3. **Initialize the database**

   ```bash
   npm run db:push
   ```

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run db:push` — Sync Prisma schema to database
- `npm run db:studio` — Open Prisma Studio

## Tech stack

- Next.js 16, React 19
- Prisma + SQLite
- NextAuth.js
- Tailwind CSS
- Google Gemini (image generation)
