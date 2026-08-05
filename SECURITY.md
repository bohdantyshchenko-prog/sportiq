# Security Policy

## Supported version

NOVIQ 6 offline production is the supported browser release.

## Reporting

Do not publish sensitive findings in a public issue. Provide the affected file, reproduction steps, impact and suggested remediation to the repository owner through a private GitHub security advisory.

## Security boundaries

- The active browser runtime has no production npm dependency.
- User progress remains in local storage unless the user explicitly exports a backup.
- Local telemetry is bounded, redacted and never transmitted.
- Backup imports are validated before state replacement.
- Native `alert`, `confirm`, dynamic code execution and external analytics are prohibited.

## Dependency policy

Test dependencies are exactly pinned. Pull requests fail when `npm audit --audit-level=high` reports a high or critical vulnerability.
