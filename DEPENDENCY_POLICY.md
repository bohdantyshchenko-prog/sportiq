# Test dependency policy

- The production browser runtime has no npm dependencies.
- End-to-end tooling is pinned to an exact stable Playwright version.
- Pull requests run `npm audit --audit-level=high` before browser installation.
- Screenshot and E2E workflows install dependencies from the repository package manifest; ad hoc package installs are forbidden.
- Dependency-only updates must pass Quality, Screenshot, Chromium, and WebKit workflows.
- Preview, beta, and alpha dependency versions are not allowed on `main`.
