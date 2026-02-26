# AGENTS.md

## Cursor Cloud specific instructions

This is a zero-dependency static portfolio website (HTML + CSS + images). There is no build system, no package manager, no tests, and no linter configured.

### Running the dev server

Serve the site with any static HTTP server from the repository root:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a browser. The entire site is a single `index.html` page with `styles.css` and static image assets.

### Key notes

- No `package.json`, `Makefile`, or build tooling exists. Do not attempt `npm install` or similar.
- External resources (Google Fonts, Microsoft Clarity analytics) load from CDNs; the site renders with fallback fonts if offline.
- The site is deployed to GitHub Pages via the `CNAME` file (`mariankadlec.cz`).
