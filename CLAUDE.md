# Offroad Tire & Gear Ratio Engineering Tool

- Static React 18 + Vite 5 SPA (plain JS/JSX, ESM) that compares tire sizes for 4x4/overland builds (speedometer error, RPM, gearing, clearance, regear advice). Live at overlandn.com/tires and realsystem.github.io/tires.

## Commands
- Install: `npm ci` (unverified here: no network). Dev server: `npm run dev` (port 3000, unverified).
- Test (what CI runs): `npm test` = `node --test tests/*.test.js tests/unit/*.test.js` (197 pass; ~1s; needs no `node_modules`).
- Single file: `node --test tests/tireParser.test.js`. Single test: `node --test --test-name-pattern="<name>" tests/unit/speedometer-error.test.js`.
- Validation suite (not in CI): `npm run test:validation` (currently 15 of 28 fail, see Gotchas).
- Build: `npm run build` = `seo:generate` + `authority:generate` + `vite build` (unverified; the two generators alone run fine: `node scripts/generate-seo-pages.js`, `node scripts/generate-authority-pages.cjs`). App only: `npm run build:app`.
- Docker: `make quick-prod` (port 8080) / `make quick-dev` (port 3000), or `./start.sh`. All unverified; need Docker.
- Lint / typecheck: none exist. Do not claim they passed.

## Architecture
- `src/engine/`: all calculation logic, pure JS, no React. `tireParser.js` (size strings -> dimensions) -> `tireCalculator.js` (main `calculateTireComparison`, calls `rotationalPhysics`, `regearingGuidance`, `clearanceProbability`) ; `regearEngine.js`, `advisoryEngine.js`, `upgradePath.js`, `overlandLoad.js` build on its output. `drivetrainStress.js` is the superseded stress-score system.
- `src/App.jsx`: parses form input, calls the engine, holds results state. `src/components/CalculatorForm.jsx` (input, ~1000 lines) -> `ResultsDisplay.jsx` + `components/results/*` (one component per result section).
- `src/data/`: `gearRatioRecommendations.csv` and `vehicle-configurations.csv` (loaded by the engine via Vite `?raw`), `tire-database.json`.
- `scripts/`: build-time generators for SEO landing pages and "authority" pages (`seo-data.json`, `content-templates.js`; inputs in `data/*.json`). They import the engine, so engine output changes alter generated pages.
- `public/`: static pages (`methodology/`, `research/`, `reports/`, `badges/`, `contribute/`, `embed.html`) and templates; `CNAME` = overlandn.com.
- Flow: form -> `parseTireSize` -> `calculateTireComparison` (+ regear/advisory engines) -> `results` object -> `ResultsDisplay`. Exports/imports of results: `src/utils/exportImport.js`, `forumExport.js`.

## Conventions
- `package.json` is `"type": "module"`: use `import`/`export` in `src/` and `scripts/*.js`; the one `.cjs` script uses `require`.
- Engine functions stay pure and DOM-free so `node --test` can import them. Browser-only code (e.g. `?raw` imports) must sit behind `typeof window !== 'undefined'`, as `vehicleConfigData.js` does.
- Tests use `node:test` + `node:assert`, in `tests/` (functional), `tests/unit/` (math verification), `tests/validation/` (community data). Add new unit tests to `tests/unit/` so `npm test` picks them up.
- Regear guidance is deliberately forum-based ("X% of owners regear"), not an engineering score. Don't reintroduce the stress score in the UI.
- Work on a branch and open a PR to `main`; `main` auto-deploys to GitHub Pages. This repo has no commit-message rule.

## Gotchas
- `SUPPORT_URL` (optional build-time env; GitHub secret or variable, or Docker build arg) sets the footer Support button link. Unset = disabled "Coming soon" button. Never commit the URL. See docs/DEPLOYMENT.md.
- Generated and gitignored: `public/comparisons/`, `public/sitemap.xml`, `dist/`. Don't edit by hand. The authority pages under `public/methodology|research|reports/` are tracked outputs of `generate-authority-pages.cjs`; check `git status` after running it.
- In plain Node the CSV-backed data is empty (the `?raw` imports are skipped), so tests do not cover `gearRatioRecommendations.csv` or `vehicle-configurations.csv`. Check CSV edits in the browser.
- The vehicle dropdown list is hardcoded in `CalculatorForm.jsx`. `src/data/vehicle-database.csv` and `vehicle-ratios-update.js` are NOT used by the app, even though their comments say to edit the CSV. Edit `CalculatorForm.jsx`.
- `vite.config.js` sets `base: '/tires/'` in production. `nginx.conf` has no `/tires` handling, so the Docker build at :8080 may not load its assets (unverified).
- `npm run test:validation` fails 15 of 28: some tests still assert the removed DrivetrainStress score, others use reference values that look wrong (e.g. crawl speed 0.195 mph at 800 RPM). Don't "fix" engine math to satisfy them without checking the reference data first. `tests/README.md` counts (58 tests, 51 pass) are stale.
- `npm run test:all` uses an unquoted `**` glob, so the shell treats it as `*` and it skips `tests/*.test.js`.
- The CI "Lint Check" job is a no-op: `node --check` can't parse JSX and ends in `|| true`.
- `.deployment-info` and the root `test-regearing-guidance.js`, `manual-validation.js`, `vehicle-ratios-update.js` are scratch/legacy files, not part of the build or CI.
- Node 18 (Docker, CI matrix) and 20 (CI, Pages deploy) must both work.

## Definition of done
- `npm test` passes (197+ tests, CI also runs it on Node 18 and 20).
- `npm run build` succeeds (if you could not run it, say so).
- Engine or data changes: add/adjust a test in `tests/unit/`, and check the UI in `npm run dev` for CSV or UI changes.
- New env var, deploy or Docker change: update docs/DEPLOYMENT.md.
