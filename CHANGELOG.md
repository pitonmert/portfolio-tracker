# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.3.0] - 2026-07-01

### Added

- Added public repository documentation, license, and changelog.
- Added direct portfolio calculation edge case tests.

### Changed

- Standardized API formatting and comments.
- Updated planning documents to match the current architecture.
- Pinned market data service dependencies.

### Fixed

- Health checks now validate database connectivity.
- Catalog asset synchronization now deactivates stale non-custom assets.
- Transaction create and update requests can use `assetId` without requiring `symbol`.
- Transaction endpoints and services now propagate cancellation tokens.

### Removed

- Removed the tracked borsapy data probe and copied provider guide.

## [v0.2.0] - 2026-07-01

### Added

- Added catalog-backed asset search and asset relationship model.
- Added market data service integration with live quotes and manual price overrides.
- Added backend dashboard responses and portfolio position read models.
- Added frontend test infrastructure with Vitest and React Testing Library.
- Added backend integration tests for assets, portfolio, market prices, and transactions.

### Changed

- Centralized portfolio calculations in backend dashboard responses and read models.
- Improved transaction forms, portfolio cards, summary panels, and history modals.
- Updated Docker, environment configuration, and project documentation.

## [v0.1.0] - 2026-07-01

### Added

- Initialized the Portfolio Tracker web application.
- Added the initial API, frontend, database, and Docker project structure.
