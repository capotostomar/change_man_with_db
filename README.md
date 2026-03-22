# Change Management Tool

A web application for managing IT changes, approvals, CAB board, CMDB, pipelines, and incidents.

## Tech Stack

- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

Make sure you have [Node.js](https://nodejs.org/) installed (v18+).

```sh
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── components/       # Shared UI components
│   └── ui/           # shadcn/ui primitives
├── data/             # Mock/static data
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── pages/            # Page-level components
└── test/             # Test setup and examples
```

## Deployment

Build the project with `npm run build` — the output will be in the `dist/` folder and can be served by any static hosting provider (Netlify, Vercel, Nginx, etc.).
