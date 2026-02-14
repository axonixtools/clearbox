# ClearBox

ClearBox is an open-source Next.js app for high-volume inbox cleanup.  
It scans unread Gmail metadata, groups messages into actionable categories, adds finance insights, and provides AI-assisted actions (roast, reply drafting, and cleanup workflows).

## Why ClearBox

- Fast triage for large unread inboxes
- Batch actions instead of one-by-one cleanup
- Privacy-first session workflow
- Finance-focused grouping by provider (ABL, UBL, NayaPay, etc.)
- Built-in dark mode and responsive UI

## Core Features

- Google OAuth sign-in with Gmail access
- Unread scan and category grouping
- Category management:
  - Search within category
  - Select/unselect visible emails
  - Mark read, archive, remove as spam
  - AI reply draft generation
- Roast generator (Claude or local Ollama)
- Finance center:
  - Separate finance page
  - Currency and provider filters
  - Provider tabs and combined view
  - Group-level remove action
  - Daily movement chart and transaction list
- Celebration/share flow after inbox cleanup

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4 + CSS modules
- Auth.js / NextAuth v5
- Gmail API (`googleapis`)
- Anthropic SDK (optional) or Ollama (local)

## Getting Started

### 1. Clone

```bash
git clone https://github.com/axonixtools/clearbox.git
cd clearbox
```

### 2. Install

```bash
npm install
```

### 3. Configure env

```bash
cp .env.example .env.local
```

Set these values in `.env.local`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Auth.js
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI provider option A: Anthropic
ANTHROPIC_API_KEY=
USE_OLLAMA=false

# AI provider option B: Ollama
USE_OLLAMA=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Google OAuth and Gmail Setup

1. Create/select a Google Cloud project.
2. Enable Gmail API.
3. Create OAuth Client ID (Web Application).
4. Add redirect URI:
   - `http://localhost:3000/api/auth/callback/google`
5. Add production redirect URI after deployment.
6. Put client ID/secret in `.env.local`.

## Ollama Setup (Optional)

```bash
ollama pull llama3.2
ollama serve
```

Then set `USE_OLLAMA=true`.

## Project Structure

```text
app/
  api/
  dashboard/
components/
  dashboard/
  landing/
lib/
types/
```

## Privacy Notes

- The app reads email metadata required for categorization and actions.
- Access is scoped through OAuth.
- Session-scoped behavior is used throughout the dashboard flow.

## Contributing

Contributions are welcome.

1. Fork the repo
2. Create a feature branch
3. Make changes with tests/lint passing
4. Open a PR with clear scope and screenshots for UI updates

## License

MIT

## Contact

- Maintainer email: `axonixtools@gmail.com`
