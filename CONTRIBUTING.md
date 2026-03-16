# Contributing to Authsec Community Docs

Thank you for contributing! If you're making a code change, please update the relevant docs in the same PR.

## Running locally

```bash
npm install
npm run start   # dev server at localhost:3000
npm run build   # production build
```

## Doc structure

```
docs/
├── getting-started/       # Onboarding
├── administration/        # Users, RBAC, OAuth clients
├── autonomous-agents/     # M2M auth, SPIFFE/SPIRE, workload identity
├── sdk/                   # SDK reference
├── ciba/                  # Voice & Headless Agents
└── status/                # System status
```

## Guidelines

- Place new pages in the most relevant existing section.
- Update `sidebars.js` if you add a new page that should appear in the nav.
- Use clear, concise language. Screenshots are welcome in `static/screenshots/`.
- Run `npm run build` before submitting to catch any broken links.

## Submitting a PR

1. Fork the repo and create a branch: `git checkout -b docs/my-change`
2. Make your changes and verify locally with `npm run start`
3. Open a PR against `main` with a short description of what changed and why
