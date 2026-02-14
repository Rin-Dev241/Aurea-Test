# Aurea Test

Calm, task-focused web UI wireframe for an assistive dashboard experience.

## What is this

This repository contains a multi-page static prototype with a simple PWA setup and focused screens for reminders, memory, emotions, games, and caregiver alerts.

## Highlights

- Multi-page layout with dedicated screens for core flows
- Lightweight structure: HTML + CSS + vanilla JS
- PWA-ready: `manifest.json` and `sw.js` included
- Shared assets and page-specific styles for quick iteration

## Pages

- Home: `index.html`
- Dashboard: `dashboard.html`
- Reminders: `reminders.html`
- Memory: `memory.html`
- Emotions: `emotion.html`
- Games: `games.html`
- Alerts: `alerts.html`
- Profile: `profile.html`

## Project structure

```
assets/
	css/                Shared + page styles
	icons/              App icons
	js/                 Feature scripts
pages/                Optional duplicated page set
js/                   Shared scripts
*.html                Top-level pages
manifest.json
sw.js
```

## Getting started

1. Open `index.html` in a browser.
2. Navigate using the on-page links or the browser URL bar.

Optional: run a local static server for service worker testing.

## Notes

- This is a wireframe/prototype and may include duplicate files in `pages/`.
- Styles are grouped by feature in `assets/css/`.

## Status

Active prototype.
