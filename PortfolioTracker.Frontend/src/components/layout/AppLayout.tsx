import { Outlet } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";

const iconButtonClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent bg-transparent text-[var(--nav-ink)] transition-colors hover:bg-[var(--nav-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nav-ink)] select-none";
const brandLinkClass =
  "block min-w-max whitespace-nowrap font-[family-name:var(--font-display)] text-lg font-bold leading-snug text-[var(--nav-ink)] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nav-ink)] max-[600px]:text-base max-[360px]:text-sm select-none";

export default function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { activeToast } = useToast();

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--page-bg)] text-[var(--ink)]">
      <header className="z-20 flex min-w-0 shrink-0 items-center justify-between gap-4 border-b border-[color:var(--nav-line)] bg-[var(--nav-bg)] px-4 py-1.5 backdrop-blur-xl transition-colors">
        {/* Left: project name */}
        <div className="flex shrink-0 items-center">
          <a href="/" className={brandLinkClass}>
            PortfolioTracker
          </a>
        </div>

        {/* Orta: Bildirim Pop-up */}
        <div className="flex min-w-0 flex-1 items-center justify-center">
          {activeToast && (
            <div
              key={activeToast.id}
              className={`inline-flex min-w-0 shrink items-center gap-2 rounded-full border px-3 py-1 shadow-sm transition-all select-none ${
                activeToast.type === "error"
                  ? "border-[var(--expense)] bg-[var(--expense)] text-white"
                  : "border-[color:var(--line)] bg-[var(--bg)] text-[var(--ink)]"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                  activeToast.type === "error"
                    ? "bg-white text-[var(--expense)]"
                    : "bg-[var(--accent)] text-[var(--on-accent)]"
                }`}
              >
                {activeToast.type === "error" ? "!" : "✓"}
              </span>
              <span className="mt-[1px] truncate font-[family-name:var(--font-mono)] text-xs font-semibold uppercase">
                {activeToast.message}
              </span>
            </div>
          )}
        </div>

        {/* Right: theme button */}
        <div className="flex shrink-0 items-center">
          <button
            className={iconButtonClass}
            onClick={toggleTheme}
            aria-label="Tema değiştir"
          >
            {theme === "light" ? "☀" : "🌙"}
          </button>
        </div>
      </header>
      <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
