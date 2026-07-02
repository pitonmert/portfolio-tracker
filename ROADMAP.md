# Roadmap

This roadmap captures candidate product directions for PortfolioTracker. It is
not a delivery promise or release schedule. Bugs, technical debt, and security
concerns are tracked in [GitHub Issues](https://github.com/pitonmert/portfolio-tracker/issues).

## Current Focus

- Keep the self-hosted setup simple and well documented.
- Preserve backend-owned portfolio calculations and read models.
- Improve data consistency around assets, transactions, prices, and snapshots.
- Expand tests around financial edge cases and import/export workflows.

## Planned Ideas

### CSV Import and Export

Export transactions to CSV and support validated CSV import with dry-run checks,
row-level errors, and a review step before saving.

### Historical Performance Charts

Store daily portfolio value snapshots and show portfolio value over ranges such
as 30 days, 6 months, and 1 year.

### Dividend Tracking

Support dividend income as a separate transaction type and include it in realized
portfolio performance without changing the default WAC cost model.

### Portfolio Allocation

Show portfolio weights by asset using backend dashboard values. Positions with
missing prices should be clearly separated from priced positions.

### Fees and Taxes

Add commission and optional expense fields to transactions so cost basis and PnL
can reflect net costs.

### CSV/Statement Parsing

Parse broker exports from CSV or Excel files and let the user review detected
transactions before importing them.

### Multi-Asset Support

Expand asset types beyond the current stock, fund, and custom flows to support
assets such as currency, gold, commodities, and manually tracked instruments.

## Analytics

- Portfolio distribution views.
- Benchmark comparison against selected indexes.
- Goal tracking and progress toward target portfolio values.
- Smart rebalancing suggestions based on target allocation and available cash.
- Optional lot-based analysis alongside the default WAC model.

## Integrations

- Terminal client for quick portfolio summaries.
- Raycast command for macOS quick access.
- macOS menu bar summary app.
- VS Code status bar extension.
- Telegram or Discord notifications for summaries and alerts.
- Small physical displays or smart lighting integrations for passive status.

## Not Planned

- Multi-user SaaS features.
- Trading automation or order execution.
- Financial advice or investment recommendations.
- Replacing provider terms with bundled market data redistribution.
