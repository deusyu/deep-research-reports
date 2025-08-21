# Deep Research Reports

Static HTML reports deployed on Cloudflare Pages, with automatic routing via Pages Functions (`_worker.js`).

## Routing
The worker lets you link **extensionless** URLs:
- `/2025/personal-nas-strategy` → tries `/2025/personal-nas-strategy/`, `/2025/personal-nas-strategy.html`, `/2025/personal-nas-strategy/index.html`.
- `/reports/another-report` → `/reports/another-report.html`.

So you can keep both folder-style and single-file HTML side by side.

## Project layout