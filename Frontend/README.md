# Smart College Hub

A cleaned and improved JavaScript React/TanStack Start frontend for a college coding platform.

## What changed

- Converted source files from TypeScript/TSX to JavaScript/JSX.
- Removed generator-specific files, package dependency, config comments and external error reporting.
- Rebuilt the landing page with a more polished student-focused layout.
- Improved the app shell with a cleaner brand mark, responsive navigation and better footer.
- Refined login, signup and dashboard copy/design for a more professional college platform feel.
- Kept the original API integration style and route structure so the existing backend endpoints can continue to be used.

## Run locally

```bash
npm install
npm run dev
```

Set your backend URL in `.env` when needed:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Build

```bash
npm run build
npm run preview
```

## Project structure

```text
src/components      Shared layout and UI components
src/lib             API, auth and utility helpers
src/routes          TanStack Start file-based routes
src/styles.css      Tailwind CSS theme and utilities
```
