import { useBoardTheme, BOARD_THEMES } from "../context/ThemeContext";

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
export default function SettingsPanel() {
  const { themeKey, setThemeKey } = useBoardTheme();

  return (
    <div className="max-w-3xl mx-auto px-8 py-8 max-[700px]:px-4 max-[700px]:py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm shrink-0">
          <Icon name="settings" className="text-2xl" filled />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
          <p className="text-sm text-secondary mt-0.5">
            Customize your chess experience
          </p>
        </div>
      </div>

      {/* Board Theme */}
      <section className="mb-10">
        <SectionHeader
          icon="palette"
          title="Board Theme"
          description="Choose a color scheme for the chess board"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(BOARD_THEMES).map(([key, theme]) => (
            <ThemeCard
              key={key}
              themeKey={key}
              theme={theme}
              active={themeKey === key}
              onClick={() => setThemeKey(key)}
            />
          ))}
        </div>
      </section>

      {/* About */}
      <section className="mb-8">
        <SectionHeader
          icon="info"
          title="About"
          description="Application information"
        />

        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low overflow-hidden">
          <InfoRow label="Application" value="ChessMate" />
          <InfoRow label="Engine" value="Stockfish 18" />
          <InfoRow label="Tech Stack" value="React + Vite + Tailwind CSS v4" />
          <InfoRow label="Design" value="Material Design 3" last />
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-secondary pt-4 border-t border-outline-variant/30">
        <Icon name="auto_awesome" className="text-[14px] text-primary" filled />
        <span className="font-medium">More settings coming soon</span>
      </div>
    </div>
  );
}

/* ============================================
   SECTION HEADER
============================================ */
function SectionHeader({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center shrink-0">
        <Icon name={icon} className="text-base text-primary" filled />
      </div>
      <div>
        <h2 className="text-base font-bold text-on-surface">{title}</h2>
        <p className="text-xs text-secondary mt-0.5">{description}</p>
      </div>
    </div>
  );
}

/* ============================================
   THEME CARD
============================================ */
function ThemeCard({ theme, active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={theme.name}
      className={`group relative p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
        active
          ? "border-primary bg-primary-fixed/30 shadow-sm"
          : "border-transparent bg-surface-container-low hover:bg-surface-container"
      }`}
    >
      {/* Mini board 4×4 */}
      <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 grid grid-cols-4 grid-rows-4 shadow-inner">
        {[...Array(16)].map((_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const isLight = (row + col) % 2 === 0;
          return (
            <div
              key={i}
              style={{ background: isLight ? theme.light : theme.dark }}
            />
          );
        })}
      </div>

      {/* Name + check */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-sm font-semibold truncate ${
            active ? "text-primary" : "text-on-surface"
          }`}
        >
          {theme.name}
        </span>

        {active ? (
          <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <Icon name="check" className="text-on-primary text-[14px]" />
          </span>
        ) : (
          <span className="w-5 h-5 rounded-full border-2 border-outline-variant/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        )}
      </div>
    </button>
  );
}

/* ============================================
   INFO ROW
============================================ */
function InfoRow({ label, value, last }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 ${
        !last ? "border-b border-outline-variant/20" : ""
      }`}
    >
      <span className="text-[13px] text-secondary">{label}</span>
      <span className="text-[13px] font-semibold text-on-surface text-right">
        {value}
      </span>
    </div>
  );
}
