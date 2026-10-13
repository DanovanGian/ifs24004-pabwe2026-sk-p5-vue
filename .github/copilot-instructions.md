<!-- Copilot / AI agent instructions for this repository -->
# Copilot instructions

Purpose
- Help contributors and AI agents quickly understand and modify this small Vite + Vue 3 project.

Big picture
- This is a single-page Vite + Vue 3 application. Entry: `src/main.js` mounts `App.vue` into `#app` (see [index.html](index.html)).
- Primary UI is implemented with Vue Single-File Components (SFCs) using the `<script setup>` syntax (example: [src/components/HelloWorld.vue](src/components/HelloWorld.vue)).
- Static assets live under `src/assets` and are imported into components (e.g. `import heroImg from '../assets/hero.png'`).
- Styling is provided by `src/style.css` (CSS variables and component-scoped selectors). Tailwind packages are installed and the Vite Tailwind plugin is enabled in [vite.config.js](vite.config.js), but most components currently use the existing plain CSS.

How to run (discovered from `package.json`)
- Install dependencies: use your preferred package manager (e.g. `npm install`, `bun install`, or `pnpm install`).
- Dev server (HMR): `npm run dev` — editing `src/App.vue` or any SFC triggers HMR.
- Build for production: `npm run build`.
- Preview production build: `npm run preview`.

Project-specific conventions & patterns
- SFC pattern: components follow `src/components/*.vue` and use `<script setup>` with composition API imports such as `ref`.
- Asset imports: prefer ES module imports from `src/assets` and bind with `:src` on `<img>` (see [src/components/HelloWorld.vue](src/components/HelloWorld.vue)).
- Global CSS: `src/style.css` contains the base layout and CSS variables; modify it for site-wide styles rather than adding global styles in components.
- No tests or test runner detected. Changes should be validated by running the dev server.

Integration points & external dependencies
- Vite dev server and build pipeline (see `vite` dependency and scripts in `package.json`).
- Vue 3 used as the framework (`vue` dependency). Components use modern composition API features.
- Tailwind plugin: `@tailwindcss/vite` and `tailwindcss` are present and registered in [vite.config.js](vite.config.js). There is no `tailwind.config.js` in the repo root at time of capture — if you add Tailwind utility classes, create a `tailwind.config.js` and include Tailwind directives in `src/style.css`.

Quick examples (do these exact, concrete edits)
- To add an importable image to a component:

```vue
<script setup>
import logo from '../assets/my-logo.png'
</script>
<template>
  <img :src="logo" alt="logo" />
</template>
```

- To confirm HMR: change the template text in [src/App.vue](src/App.vue) and save; the dev server should update the browser without full reload.

What to avoid / notes for AI
- Do not assume existence of config files that are not present (no test config, no tailwind.config.js currently).
- Prefer minimal, targeted edits: the project is small and designed to run with the provided `dev` script.
- When adding Tailwind utilities, also add a `tailwind.config.js` and include the Tailwind directives into `src/style.css` to keep the build consistent.

Files to inspect first
- [index.html](index.html)
- [src/main.js](src/main.js)
- [src/App.vue](src/App.vue)
- [src/components/HelloWorld.vue](src/components/HelloWorld.vue)
- [src/style.css](src/style.css)
- [vite.config.js](vite.config.js)
- [package.json](package.json)

If anything here is unclear or you'd like more detail (tests, CI, or Tailwind setup), tell me which area to expand and I'll update this file.
