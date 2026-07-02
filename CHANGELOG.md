# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1](https://github.com/pitonmert/portfolio-tracker/compare/v0.3.0...v0.3.1) (2026-07-02)


### Bug Fixes

* **docs:** include market data test dependencies ([4f1717e](https://github.com/pitonmert/portfolio-tracker/commit/4f1717edcd99f59bdcfd95d79fd6ce331bea66f6))

## [v0.3.0] - 2026-07-01

### Added

- Added public repository documentation, license, and changelog.
- Expanded portfolio calculation edge case test coverage.

### Changed

- Cleaned market data service artifacts and pinned service dependencies.
- Standardized API formatting and comments.

### Fixed

- Health checks now validate database connectivity.
- Catalog asset synchronization now deactivates stale non-custom assets.
- Transaction create and update requests can use `assetId` without requiring `symbol`.
- Transaction endpoints and services now propagate cancellation tokens.

### Removed

- Removed tracked market data probe artifacts and copied provider guide.

## [v0.2.0] - 2026-07-01

### Added

- Added catalog-backed asset search and asset relationship model.
- Added market data service integration with live quotes and manual price overrides.
- Added backend dashboard responses and portfolio position read models.
- Added portfolio position snapshots for faster dashboard reads.
- Added frontend and backend test coverage.

### Changed

- Centralized portfolio calculations in backend dashboard responses and read models.
- Reorganized API structure around domain entities, infrastructure, and feature modules.
- Improved transaction forms, portfolio cards, summary panels, and history modals.
- Updated Docker, environment configuration, and project documentation.

## [v0.1.0] - 2026-07-01

### Added

- Initialized the Portfolio Tracker web application.
- Added the initial API, frontend, database, Docker, and market data service structure.
- Established the base portfolio tracking workflow.
