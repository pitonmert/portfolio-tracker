# Security Policy

PortfolioTracker is a personal and educational self-hosted portfolio tracking
application. It is not designed as a multi-user SaaS product, and it does not
ship with built-in authentication or authorization.

## Supported Versions

Only the latest `main` branch and the latest published release are considered
supported for security updates.

## Reporting a Vulnerability

Please report suspected security vulnerabilities through GitHub security
advisories when available. If a private advisory is not available, open a GitHub
issue with a minimal, non-sensitive summary and avoid posting secrets, personal
data, database dumps, access tokens, or exploit details publicly.

Include:

- the affected area or endpoint
- the expected behavior
- the observed behavior
- the minimum safe reproduction details

## Deployment Security

The API should not be exposed directly to the public internet. If remote access
is needed, place the application behind your own protection layer, such as:

- Cloudflare Access
- a VPN
- a private network
- reverse proxy authentication
- another trusted access control gateway

## Secrets and Sensitive Data

Keep the following out of git:

- `.env` files
- .NET user secrets
- PostgreSQL credentials
- database dumps and backup files
- `Admin:ReadModelRebuildToken`
- any other local provider or infrastructure credentials

Rotate any credential immediately if it is committed, shared, logged, or exposed
by mistake.

## Authentication and Access Control

PortfolioTracker intentionally does not include built-in authentication or
authorization. This keeps the project focused on personal/local self-hosted use.

If you deploy it anywhere other than a trusted local environment, add access
control outside the application before exposing the frontend or API.

## Database and Backups

Portfolio data can contain sensitive financial information. Treat the database,
database backups, exported files, and logs as private data.

Store backups outside the repository, restrict filesystem access, and avoid
uploading backups to public or shared locations without encryption.

## Market Data Providers

Market data is fetched through external providers. Review and follow the terms
of use for any provider you configure or depend on. Do not assume that provider
data may be redistributed publicly or used commercially.

## Out of Scope

This project does not provide:

- financial advice
- trading automation
- order execution
- multi-user account isolation
- hosted production security guarantees
