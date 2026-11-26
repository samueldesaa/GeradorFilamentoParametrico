# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## App and design direction

This is Forma Studio, a Portuguese-language parametric spiral generator for 3D printing. It uses Vite, vanilla JavaScript, CSS, and Three.js. Preserve this stack unless the user explicitly requests otherwise.

The user likes green but rejects generic AI aesthetics and overdesign. Do not invent a product name, brand, promotional labels, dramatic headline, or unnecessary copy. Use “Gerador paramétrico para impressão 3D” as the functional page title. Keep text large and high-contrast, content compact, and units consistent (requested meters remain meters). Show filament diameter with the related inputs; remove unnecessary metrics such as path point counts and redundant warnings. The primary action is “Pré-visualizar” (explicitly previews 3D, not export), then becomes “Exportar STL”. The 3D preview replaces the 2D view in the same space; provide a clear way back to parameters and 2D. Add visible light/dark or contrast controls and font-size increase/decrease. No vague decorative grid/background. Apply the full checklist in Obsidian `Skills/frontend/minhas-preferencias.md` and `ClaudeBrain/Memoria/preferencias-design-anti-ai-slop.md` before UI edits; validate each requirement after.

The product is a Portuguese-language parametric filament generator using Vite, vanilla JavaScript, CSS, and Three.js. Preserve this stack unless asked otherwise.

## Validation

Use `npm test` and `npm run build`. Check at 320, 768, and 1440 px, keyboard/focus, contrast, and horizontal overflow.

## Validation

Use `npm test` and `npm run build` for verification. Check responsive layouts at 320, 768, and 1440 px; test keyboard/focus and avoid horizontal scrolling.
