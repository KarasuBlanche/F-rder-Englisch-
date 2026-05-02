# What time is it?

A standalone HTML5 classroom app for practising English time phrases with Grade 5 learners.

Includes light/dark mode, dedicated phone and iPad/tablet layouts, animated SVG clocks, touch-friendly tasks, optional audio, scores, hints, and teacher settings.

## Run

Open `index.html` in a browser. It redirects to `förder englisch uhrzeiten.html`, the main app file. No build step, login, backend, database, or internet connection is required.

Optional local test server:

```bash
node dev-server.cjs 8000
```

## Files

- `förder englisch uhrzeiten.html` - main app file
- `index.html` - GitHub Pages redirect to the main app file
- `styles.css` - responsive visual design
- `app.js` - task data, clock component, solo mode, partner mode, settings, scoring, audio
- `dev-server.cjs` - optional local test server

## Teacher Quick Start

1. Choose Solo Mode or Partner Mode.
2. Start with easy levels.
3. Use Partner Mode for speaking practice.
4. Use Final Challenge for checking progress.

## Adapt

Time phrases are generated in `app.js` from one central clock-time structure. To add new partner dialogue cards, edit the `SITUATIONS` array. To change level behaviour, edit the `LEVELS` array and the allowed-minute helpers near the top of `app.js`.
