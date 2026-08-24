# Route Facile — Car Rental Platform

Monorepo for the Route Facile car rental platform, consolidated from three
previously separate repositories.

- `backend/` — NestJS API (formerly `route-facile-backend`)
- `frontend/` — React customer-facing site (formerly `route-facile-frontend`)
- `cms-admin/` — CoreUI admin panel (formerly `route-facile-cms-admin`)

Each app keeps its own `package.json`, `.gitignore`, and build process — this
is a folder-based monorepo, not a shared build system. See each app's own
README for setup instructions.
