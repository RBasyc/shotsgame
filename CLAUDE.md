# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript + Vite web application. The project uses Vue 3 Single File Components (SFCs) with the `<script setup>` composition API syntax.

## Development Commands

- `npm run dev` - Start the Vite development server with hot module replacement (HMR)
- `npm run build` - Build for production (runs TypeScript compiler via vue-tsc, then Vite build)
- `npm run preview` - Preview the production build locally

## TypeScript Configuration

The project uses strict TypeScript configuration with additional linting rules:
- `strict: true` - All strict type-checking options enabled
- `noUnusedLocals` and `noUnusedParameters` - Detects unused code
- `noFallthroughCasesInSwitch` - Prevents switch statement fallthrough
- `noUncheckedSideEffectImports` - Validates side-effect imports

Build info is cached in `node_modules/.tmp/` to speed up subsequent builds.

## Project Structure

- `src/main.ts` - Application entry point, mounts Vue app to `#app`
- `src/App.vue` - Root component
- `src/components/` - Vue SFC components
- `src/assets/` - Static assets (images, etc.)
- `public/` - Static files served directly from root (e.g., `public/icons.svg`)
- `index.html` - HTML entry point
- `vite.config.ts` - Vite bundler configuration

## Vue SFC Pattern

Components use `<script setup lang="ts">` syntax. When creating new components:
- Import Vue composables (like `ref`, `computed`) from `vue`
- Use `.vue` file extension
- Assets imported in JavaScript are processed by Vite and return URLs

## Self-Improvement

This project uses the self-improvement skill for continuous learning. Log to `.learnings/` when:
- Commands or operations fail unexpectedly
- You correct yourself or discover better approaches
- User requests capabilities that don't exist
- You learn project-specific conventions

Files in `.learnings/`:
- `LEARNINGS.md` - Corrections, insights, knowledge gaps, best practices
- `ERRORS.md` - Command failures and integration errors
- `FEATURE_REQUESTS.md` - Capabilities requested by the user

When a learning is broadly applicable, promote it to this `CLAUDE.md` file.

## Three.js Integration

This project uses Three.js (v0.183+) for 3D graphics. TypeScript types are provided by `@types/three`.

### Usage Pattern

When creating Three.js components in Vue:
1. Use template refs to get container DOM element
2. Initialize Three.js in `onMounted()` hook
3. Clean up in `onUnmounted()` - dispose renderer, cancel animation frames
4. Handle window resize events to update camera aspect ratio and renderer size
5. Import from `three` package: `import * as THREE from 'three'`

Example component: `src/components/ThreeScene.vue`

### Key Practices
- Always dispose renderer and geometries/materials to prevent memory leaks
- Use `requestAnimationFrame` for smooth animations
- Set up resize handlers for responsive canvases
- Use `MeshStandardMaterial` for lighting effects, `MeshBasicMaterial` for unlit
