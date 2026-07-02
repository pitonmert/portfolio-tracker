import { cx } from "@/utils/cx";
import { formatCurrency, getPnlClassHeader } from "@/utils/formatters";
import { ChevronsUpDownIcon } from "@/components/ui/icons";
import type { PositionDisplayMetric } from "./PositionCard";

const metricOptions: Array<{
  value: PositionDisplayMetric;
  label: string;
}> = [
  { value: "totalPnL", label: "Toplam K/Z" },
  { value: "unrealizedPnL", label: "Açık K/Z" },
  { value: "realizedPnL", label: "Gerçekleşmiş K/Z" },
];

export interface PositionGroupHeaderProps {
  title: string;
  updatedTime: string | null;
  displayMetric: PositionDisplayMetric;
  metricValue: number;
  marketValue: number;
  dropdownOpen: boolean;
  onDropdownToggle: () => void;
  onMetricChange: (value: PositionDisplayMetric) => void;
}

export function PositionGroupHeader({
  title,
  updatedTime,
  displayMetric,
  metricValue,
  marketValue,
  dropdownOpen,
  onDropdownToggle,
  onMetricChange,
}: PositionGroupHeaderProps) {
  const selectedInitial =
    metricOptions
      .find((option) => option.value === displayMetric)
      ?.label.at(0) ?? "";

  return (
    <div className="flex items-center justify-between border-b pb-1 font-semibold tabular-nums select-none">
      <h3 className="flex items-center gap-2">
        {title}
        <span className="text-xs text-[var(--ink-3)]">
          {updatedTime ?? "-"}
        </span>
      </h3>

      <div className="relative flex flex-col items-end">
        <span>{formatCurrency(marketValue)}</span>

        <button
          className="flex items-center gap-1 hover:opacity-75"
          type="button"
          onClick={onDropdownToggle}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          <span className={getPnlClassHeader(metricValue)}>
            {formatCurrency(metricValue)}
          </span>
          <span className="text-xs">{selectedInitial}</span>
          <ChevronsUpDownIcon
            className="h-3.5 w-3.5 -mr-1 -ml-1"
            aria-hidden="true"
          />
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-1.5 z-30 w-max min-w-[140px] rounded-xl border border-[color:var(--line-soft)] bg-[var(--bg)] p-1.5 shadow-[var(--paper-shadow)]"
            style={{ animation: "slide-up 0.15s ease-out" }}
            role="listbox"
            aria-label="K/Z metriği"
          >
            {metricOptions.map((option) => {
              const active = option.value === displayMetric;

              return (
                <button
                  key={option.value}
                  className={cx(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                    active
                      ? "bg-[var(--bg-2)] text-[var(--accent)] gap-2"
                      : "text-[var(--ink-2)] hover:bg-[var(--bg-2)] hover:text-[var(--ink)]",
                  )}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onMetricChange(option.value)}
                >
                  <span>{option.label}</span>
                  {active && (
                    <span className="" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
