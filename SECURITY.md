# Security Policy

## Supported Versions

Security updates are provided for the latest minor version on the `main` branch.

## Reporting a Vulnerability

Please report vulnerabilities privately via your security contact channel. Include:
- affected version and commit hash
- reproduction steps
- impact assessment
- proposed mitigation (if known)

Do not open public issues for undisclosed vulnerabilities.

## Secure Development Notes

- Never commit secrets, private keys, or wallet seed data.
- Keep dependencies up to date and review transitive changes.
- Treat all external RPC responses as untrusted input.
