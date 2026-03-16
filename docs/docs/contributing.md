---
sidebar_position: 7
title: Contributing
---

# Contributing

GLHF welcomes contributions from researchers and developers. Whether you're fixing a bug, adding a new integration, or improving documentation, we appreciate your help.

## Local Development Setup

See the [Getting Started](getting-started) guide for setting up your local environment. The key commands:

```bash
# From the repo root — run both backend and frontend
yarn develop

# Or run them separately
yarn develop:backend
yarn develop:frontend
```

## Repository Structure

```
glhf/
  backend/                  # Strapi 4 CMS
    config/
      cron-tasks.js         # Scheduled jobs
      functions/            # Cron job implementations
    src/api/                # Custom APIs
  frontend/                 # Next.js 14
    pages/                  # Routes and API routes
    src/components/         # React components
    src/utils/              # Helpers (API client, auth)
  docs/                     # This documentation (Docusaurus)
```

## How to Add an Integration

GLHF follows a consistent pattern for integrations:

1. **Define environment variables** — Add new vars to `backend/.env.example` (and `frontend/.env.example` if needed)
2. **Create backend logic** — Add functions in `backend/config/functions/` or a new API in `backend/src/api/`
3. **Add a cron job** (if needed) — Register in `backend/config/cron-tasks.js` with an `*_ENABLED` toggle
4. **Connect to the frontend** (if needed) — Add API routes in `frontend/pages/api/` or update existing components

## Areas Welcoming Contributions

- **New game platforms** — Epic Games Store, GOG, PlayStation, Xbox, etc.
- **New survey platforms** — REDCap, LimeSurvey, etc.
- **UI improvements** — Better participant dashboard, progress visualization
- **Documentation** — Tutorials, deployment guides for specific cloud providers
- **Testing** — Unit and integration tests (no test framework is currently configured)
- **Internationalization** — Multi-language support for participant-facing content

## Code Style

The backend does not currently have a linter configured. The frontend uses ESLint and Prettier.

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `yarn lint:fix` in the frontend directory
5. Submit a pull request with a clear description of what and why

## Questions?

Open an issue on [GitHub](https://github.com/glhf-lab/glhf/issues) — we're happy to help.
