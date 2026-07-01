import { useMemo } from "react";
import type { PortfolioPosition } from "@/types/portfolio";
import type { FilterType, SortType } from "@/pages/portfolio/portfolioControls";
import { normalizeSearch } from "@/pages/portfolio/utils/helpers";

function compareSymbol(a: PortfolioPosition, b: PortfolioPosition): number {
  return a.symbol.localeCompare(b.symbol, "tr-TR", { sensitivity: "base" });
}

function compareNumber(
  a: PortfolioPosition,
  b: PortfolioPosition,
  getValue: (position: PortfolioPosition) => number,
  direction: "asc" | "desc",
): number {
  const difference =
    direction === "asc" ? getValue(a) - getValue(b) : getValue(b) - getValue(a);

  return difference || compareSymbol(a, b);
}

function compareClosedState(
  a: PortfolioPosition,
  b: PortfolioPosition,
  closedFirst: boolean,
): number {
  const aClosed = a.isClosed;
  const bClosed = b.isClosed;

  if (aClosed !== bClosed) {
    return aClosed === closedFirst ? -1 : 1;
  }

  return compareSymbol(a, b);
}

function sortPositions(
  positions: PortfolioPosition[],
  sort: SortType,
): PortfolioPosition[] {
  return [...positions].sort((a, b) => {
    switch (sort) {
      case "symbol_desc":
        return compareSymbol(b, a);
      case "invested_desc":
        return compareNumber(
          a,
          b,
          (position) => position.activePositionCost,
          "desc",
        );
      case "invested_asc":
        return compareNumber(
          a,
          b,
          (position) => position.activePositionCost,
          "asc",
        );
      case "pnl_desc":
        return compareNumber(a, b, (position) => position.totalPnL, "desc");
      case "pnl_asc":
        return compareNumber(a, b, (position) => position.totalPnL, "asc");
      case "quantity_desc":
        return compareNumber(a, b, (position) => position.netQuantity, "desc");
      case "quantity_asc":
        return compareNumber(a, b, (position) => position.netQuantity, "asc");
      case "open_first":
        return compareClosedState(a, b, false);
      case "closed_first":
        return compareClosedState(a, b, true);
      case "symbol_asc":
      default:
        return compareSymbol(a, b);
    }
  });
}

export function useFilteredPositions(
  positions: PortfolioPosition[] | null | undefined,
  filter: FilterType,
  search: string,
  sort: SortType,
) {
  return useMemo(() => {
    const rows = positions ?? [];
    const normalizedSearch = normalizeSearch(search);

    const searchedRows = rows.filter((position) => {
      if (
        normalizedSearch &&
        !normalizeSearch(position.symbol).includes(normalizedSearch)
      ) {
        return false;
      }

      return true;
    });
    const filterCounts = searchedRows.reduce(
      (counts, position) => {
        if (position.isClosed) {
          counts.closed += 1;
        } else {
          counts.open += 1;
        }

        counts.all += 1;
        return counts;
      },
      { all: 0, open: 0, closed: 0 },
    );

    const filteredRows = searchedRows.filter((position) => {
      const closed = position.isClosed;

      if (filter === "open" && closed) {
        return false;
      }

      if (filter === "closed" && !closed) {
        return false;
      }

      return true;
    });
    const sortedRows = sortPositions(filteredRows, sort);

    return {
      rows,
      filteredRows: sortedRows,
      filterCounts,
      hasRows: rows.length > 0,
      hasVisibleRows: sortedRows.length > 0,
      count: sortedRows.length,
    };
  }, [positions, filter, search, sort]);
}
