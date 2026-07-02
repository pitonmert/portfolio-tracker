import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { assetService } from "@/services/assetService";
import { queryKeys } from "@/services/queryKeys";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { uiStyles } from "@/components/ui/styles";
import type { AssetSearchResult } from "@/types/asset";

interface TransactionAssetAutocompleteProps {
  value: string;
  error?: string;
  onChange: (value: string, assetId: number | null) => void;
}

function getAssetTypeLabel(asset: AssetSearchResult) {
  if (asset.isCustom || asset.assetType === "custom") return "Özel";
  if (asset.assetType === "fund") return "Fon";
  return "Hisse";
}

function getAssetName(asset: AssetSearchResult) {
  if (asset.isCustom) return "Katalog dışı özel varlık";
  return asset.name ?? asset.market;
}

const styles = {
  field: "flex w-full min-w-0 flex-col",
  fieldErrorHidden: "invisible",
  suggestionsContainer:
    "app-scrollbar absolute left-0 right-0 top-full z-50 mt-1.5 max-h-52 overflow-auto rounded-xl border border-[color:var(--line)] bg-[var(--bg)]/95 py-1.5 shadow-xl shadow-[color:var(--line-soft)] backdrop-blur-xl",
  suggestionButtonBase:
    "w-full min-w-0 px-3.5 py-2.5 text-left transition-colors focus-visible:bg-[var(--bg-2)] focus-visible:outline-none",
  suggestionActive: "bg-[var(--bg-2)] text-[var(--accent)]",
  suggestionInactive: "text-[var(--ink)] hover:bg-[var(--bg-2)]",
  suggestionRow: "flex min-w-0 items-start justify-between gap-3",
  suggestionText: "min-w-0 flex-1",
  suggestionSymbol:
    "block truncate font-mono text-[15px] font-semibold leading-snug",
  suggestionName: "mt-0.5 block truncate text-xs text-[var(--ink-3)]",
  suggestionBadges: "flex shrink-0 flex-wrap justify-end gap-1",
  suggestionBadge:
    "inline-flex items-center rounded-md bg-[var(--bg-2)] px-1.5 py-0.5 text-[11px] font-semibold uppercase text-[var(--ink-2)]",
  suggestionBadgeAccent:
    "inline-flex items-center rounded-md bg-[var(--accent)] px-1.5 py-0.5 text-[11px] font-semibold uppercase text-[var(--on-accent)]",
  suggestionLoading:
    "absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-[color:var(--line)] bg-[var(--bg)]/95 px-3.5 py-2.5 text-sm font-medium text-[var(--ink-3)] shadow-xl shadow-[color:var(--line-soft)] backdrop-blur-xl",
};

export function TransactionAssetAutocomplete({
  value,
  error,
  onChange,
}: TransactionAssetAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const [assetSuggestionsOpen, setAssetSuggestionsOpen] = useState(false);
  const [selectedAssetSuggestionIndex, setSelectedAssetSuggestionIndex] =
    useState(0);
  const debouncedSymbolQuery = useDebouncedValue(value.trim(), 200);
  const { data: assetSuggestions = [], isFetching: assetSuggestionsLoading } =
    useQuery({
      queryKey: queryKeys.assets.search(debouncedSymbolQuery, "auto", 8),
      queryFn: () => assetService.search({ q: debouncedSymbolQuery, limit: 8 }),
      enabled: debouncedSymbolQuery.length > 0,
      staleTime: 60_000,
    });
  const showAssetSuggestions =
    assetSuggestionsOpen && assetSuggestions.length > 0;

  useEffect(() => {
    setSelectedAssetSuggestionIndex(0);
    setAssetSuggestionsOpen(assetSuggestions.length > 0);
  }, [assetSuggestions]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        autocompleteRef.current?.contains(event.target as Node) ||
        document.activeElement !== inputRef.current
      ) {
        return;
      }

      setAssetSuggestionsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const selectAssetSuggestion = (asset: AssetSearchResult) => {
    onChange(asset.symbol, asset.id ?? null);
    setAssetSuggestionsOpen(false);
    setSelectedAssetSuggestionIndex(0);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showAssetSuggestions) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedAssetSuggestionIndex(
        (index) => (index + 1) % assetSuggestions.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedAssetSuggestionIndex(
        (index) =>
          (index - 1 + assetSuggestions.length) % assetSuggestions.length,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      selectAssetSuggestion(assetSuggestions[selectedAssetSuggestionIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setAssetSuggestionsOpen(false);
    }
  };

  const handleSuggestionMouseDown = (
    event: ReactMouseEvent<HTMLButtonElement>,
    asset: AssetSearchResult,
  ) => {
    event.preventDefault();
    selectAssetSuggestion(asset);
  };

  return (
    <div className={`relative ${styles.field}`} ref={autocompleteRef}>
      <label htmlFor="asset-input" className={uiStyles.label}>
        Varlık
      </label>
      <input
        ref={inputRef}
        id="asset-input"
        className={uiStyles.input}
        type="text"
        placeholder="Gümüş"
        value={value}
        onChange={(event) => {
          onChange(event.target.value, null);
          setAssetSuggestionsOpen(true);
        }}
        onFocus={() => setAssetSuggestionsOpen(assetSuggestions.length > 0)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        aria-invalid={error ? "true" : undefined}
      />
      <span
        className={`${uiStyles.fieldError} ${error ? "" : styles.fieldErrorHidden}`}
        aria-live="polite"
      >
        {error ?? "Alan geçerli"}
      </span>
      {showAssetSuggestions && (
        <div className={styles.suggestionsContainer}>
          {assetSuggestions.map((asset, index) => (
            <button
              key={`${asset.assetType}-${asset.market}-${asset.symbol}-${asset.isCustom ? "custom" : "catalog"}`}
              type="button"
              className={`${styles.suggestionButtonBase} ${
                index === selectedAssetSuggestionIndex
                  ? styles.suggestionActive
                  : styles.suggestionInactive
              }`}
              onMouseDown={(event) => handleSuggestionMouseDown(event, asset)}
            >
              <span className={styles.suggestionRow}>
                <span className={styles.suggestionText}>
                  <span className={styles.suggestionSymbol}>
                    {asset.symbol}
                  </span>
                  <span className={styles.suggestionName}>
                    {getAssetName(asset)}
                  </span>
                </span>
                <span className={styles.suggestionBadges}>
                  {asset.isOpenPosition && (
                    <span className={styles.suggestionBadgeAccent}>Açık</span>
                  )}
                  {asset.lastUsedAt && !asset.isOpenPosition && (
                    <span className={styles.suggestionBadge}>Son</span>
                  )}
                  <span className={styles.suggestionBadge}>
                    {getAssetTypeLabel(asset)}
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
      {assetSuggestionsOpen &&
        assetSuggestionsLoading &&
        !showAssetSuggestions && (
          <div className={styles.suggestionLoading}>Aranıyor...</div>
        )}
    </div>
  );
}
