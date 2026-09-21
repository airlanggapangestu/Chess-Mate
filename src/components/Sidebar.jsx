import logoScreen from "../assets/screen.png";

/* ============================================
   NAV ITEMS
============================================ */
const NAV_ITEMS = [
  {
    id: "stockfish",
    icon: "memory",
    title: "Play vs Engine",
    description: "Competing against the engine",
  },
  {
    id: "analysis",
    icon: "insights",
    title: "Analysis",
    description: "Freely playing with move suggestions",
  },
  {
    id: "local",
    icon: "group",
    title: "2 Player",
    description: "Playing two-player offline",
  },
  {
    id: "puzzle",
    icon: "extension",
    title: "Puzzle",
    description: "Tactical practice",
    badge: "7",
  },
];

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
   MAIN
============================================ */
export default function Sidebar({
  activeMode,
  onSelectMode,
  onLogoClick,
  mobileOpen = false,
  onMobileClose,
}) {
  const handleSelect = (id) => {
    onSelectMode(id);
    onMobileClose?.();
  };

  const handleLogo = () => {
    onLogoClick();
    onMobileClose?.();
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      <div
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-inverse-surface/40 backdrop-blur-sm transition-opacity duration-200 min-[901px]:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      />

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-72 z-50
          bg-surface-container-low
          flex flex-col
          shadow-[0_1px_8px_rgba(46,50,48,0.06)]
          transition-transform duration-300 ease-out
          min-[901px]:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full min-[901px]:translate-x-0"}
        `}
      >
        {/* ============ TOP: LOGO + NAV ============ */}
        <div className="flex flex-col gap-6 py-6 px-4 flex-1 min-h-0">
          {/* Logo + close button */}
          <div className="flex items-center justify-between gap-2 shrink-0">
            <button
              onClick={handleLogo}
              className="flex items-center gap-3 px-3 text-left cursor-pointer
                hover:opacity-90 transition-opacity min-w-0 flex-1"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                <img
                  src={logoScreen}
                  alt="ChessMate"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-lg font-bold text-on-surface leading-tight truncate">
                  ChessMate
                </span>
                <span className="text-[10px] font-semibold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full inline-block mt-0.5 w-fit">
                  1,240 games
                </span>
              </div>
            </button>

            {/* Close button — only mobile */}
            <button
              onClick={onMobileClose}
              className="min-[901px]:hidden w-9 h-9 rounded-lg flex items-center justify-center
                text-secondary hover:bg-surface-container-high hover:text-on-surface
                transition-colors cursor-pointer shrink-0"
              title="Close menu"
            >
              <Icon name="close" className="text-xl" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1.5 shrink-0">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                active={activeMode === item.id}
                onClick={() => handleSelect(item.id)}
              />
            ))}
          </nav>

          {/* Divider */}
          <div className="h-px bg-outline-variant/30 mx-3 shrink-0" />

          {/* Preferences */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-secondary px-3 mb-0.5">
              Preferences
            </div>
            <NavItem
              item={{
                id: "settings",
                icon: "palette",
                title: "Board Theme & Settings",
                description: "Customize your experience",
              }}
              active={activeMode === "settings"}
              onClick={() => handleSelect("settings")}
              compact
            />
          </div>
        </div>

        {/* ============ BOTTOM: PROFILE ============ */}
        <div className="shrink-0 px-4 pb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                  <Icon
                    name="person"
                    className="text-on-primary text-[20px]"
                    filled
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface-container-low" />
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-sm font-bold text-on-surface leading-tight truncate">
                  Guest
                </span>
                <span className="text-[11px] text-secondary font-medium tabular-nums">
                  Rating: 1200
                </span>
              </div>
            </div>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-lg
                hover:bg-surface text-secondary hover:text-on-surface transition-colors
                cursor-pointer shrink-0"
              title="Profile menu"
            >
              <Icon name="more_vert" className="text-lg" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ============================================
   NAV ITEM
============================================ */
function NavItem({ item, active, onClick, compact = false }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-start gap-3 p-3 rounded-xl transition-all text-left w-full cursor-pointer ${
        active
          ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      } ${compact ? "items-center" : ""}`}
    >
      <Icon
        name={item.icon}
        className={`text-xl shrink-0 transition-colors ${
          compact ? "" : "mt-0.5"
        } ${
          active
            ? "text-on-primary-container"
            : "text-on-surface-variant group-hover:text-on-surface"
        }`}
        filled={active}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`text-sm font-semibold leading-tight truncate ${
              compact ? "" : "block"
            }`}
          >
            {item.title}
          </span>
          {item.badge && (
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                active
                  ? "bg-on-primary-container/20 text-on-primary-container"
                  : "bg-tertiary-container text-on-tertiary-container"
              }`}
            >
              {item.badge}
            </span>
          )}
        </div>
        {!compact && item.description && (
          <div
            className={`text-[11px] mt-0.5 truncate ${
              active ? "text-on-primary-container/80" : "text-secondary"
            }`}
          >
            {item.description}
          </div>
        )}
      </div>

      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-primary" />
      )}
    </button>
  );
}
