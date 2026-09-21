/* ============================================
   ICON
============================================ */
function Icon({ name, className = "", filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "filled" : ""} ${className}`}
    >
      {name}
    </span>
  );
}

/* ============================================
   TOP BAR
============================================ */
export default function TopBar({ engineReady = true, onMenuClick }) {
  return (
    <header
      className="fixed top-0 left-72 right-0 h-16 z-30
        bg-surface/85 backdrop-blur-xl
        shadow-[0_1px_8px_rgba(46,50,48,0.04)]
        flex items-center justify-between px-8
        max-[900px]:left-0 max-[700px]:px-4"
    >
      {/* Left: menu button (mobile) + engine status */}
      <div className="flex items-center gap-3">
        {/* Hamburger — only mobile */}
        <button
          onClick={onMenuClick}
          className="min-[901px]:hidden w-10 h-10 rounded-lg flex items-center justify-center
            bg-surface-container hover:bg-surface-container-high
            text-on-surface-variant hover:text-on-surface
            transition-colors cursor-pointer shrink-0"
          title="Open menu"
        >
          <Icon name="menu" className="text-xl" />
        </button>

        <div className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              engineReady ? "bg-primary" : "bg-tertiary"
            }`}
          />
          <span className="max-[500px]:hidden">
            {engineReady ? "Stockfish 18 Ready" : "Loading engine..."}
          </span>
          <span className="min-[501px]:hidden">Engine</span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-4 max-[700px]:gap-2">
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            text-sm text-on-surface-variant
            hover:bg-surface-container-high hover:text-on-surface
            transition-all cursor-pointer max-[700px]:hidden"
        >
          <Icon name="tune" className="text-base" />
          Engine Options
        </button>

        <div className="w-px h-6 bg-surface-variant max-[700px]:hidden" />

        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Icon name="person" className="text-on-primary text-[18px]" filled />
        </div>
      </div>
    </header>
  );
}
