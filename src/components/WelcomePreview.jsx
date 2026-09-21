import { Chessboard } from "react-chessboard";
import { useBoardTheme } from "../context/ThemeContext";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

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
export default function WelcomePreview({ onSelectMode }) {
  const { theme } = useBoardTheme();

  const handleSelect = (id) => {
    onSelectMode?.(id);
  };

  return (
    <div className="w-full h-full">
      {/* ============================================
          HERO BANNER
      ============================================ */}
      <div className="relative bg-gradient-to-br from-primary-fixed/60 via-primary-fixed/30 to-surface-container-low rounded-2xl p-6 sm:p-8 shadow-sm mb-6 overflow-hidden">
        {/* Decorative chess piece */}
        <div className="absolute -right-4 -bottom-6 text-[180px] leading-none text-primary/10 select-none pointer-events-none">
          ♞
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/60 backdrop-blur-sm mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Welcome back
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-on-surface mb-2 leading-tight">
              Ready to play?
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant max-w-md leading-relaxed">
              Sharpen your skills with engine analysis, tactical puzzles, or a
              friendly match. Choose a mode from the sidebar to begin.
            </p>

            <div className="flex items-center gap-2 mt-5 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest/60 backdrop-blur-sm">
                <Icon
                  name="military_tech"
                  className="text-base text-tertiary"
                  filled
                />
                <span className="text-xs font-bold text-on-surface">
                  Rating 1200
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest/60 backdrop-blur-sm">
                <Icon name="history" className="text-base text-primary" />
                <span className="text-xs font-bold text-on-surface">
                  1,240 games
                </span>
              </div>
            </div>
          </div>

          {/* Decorative board mini */}
          <div className="hidden sm:block shrink-0">
            <div className="w-40 h-40 rounded-2xl bg-surface-container-lowest shadow-md p-2 rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="w-full h-full rounded-xl overflow-hidden grid grid-cols-8 grid-rows-8">
                {[...Array(64)].map((_, i) => {
                  const row = Math.floor(i / 8);
                  const col = i % 8;
                  const isLight = (row + col) % 2 === 0;
                  return (
                    <div
                      key={i}
                      style={{
                        background: isLight ? theme.light : theme.dark,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          QUICK ACTION CARDS
      ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <QuickCard
          icon="memory"
          title="Play vs Engine"
          description="Challenge Stockfish"
          onClick={() => handleSelect("stockfish")}
        />
        <QuickCard
          icon="insights"
          title="Analysis"
          description="Learn with hints"
          onClick={() => handleSelect("analysis")}
        />
        <QuickCard
          icon="group"
          title="2 Player"
          description="Play with a friend"
          onClick={() => handleSelect("local")}
        />
        <QuickCard
          icon="extension"
          title="Puzzle"
          description="Tactical practice"
          badge="7"
          onClick={() => handleSelect("puzzle")}
        />
      </div>

      {/* ============================================
          MAIN CONTENT GRID
      ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ---------- LEFT: Board Preview ---------- */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container-low rounded-xl p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon
                  name="grid_view"
                  className="text-lg text-primary"
                  filled
                />
                <h2 className="text-base font-bold text-on-surface">
                  Board Preview
                </h2>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant">
                Starting Position
              </span>
            </div>

            {/* Player bar top */}
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <span className="text-xl font-bold leading-none text-[#f5f0e8]">
                    ♟
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-on-surface">
                      Opponent
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-surface-container-highest text-secondary">
                      BLACK
                    </span>
                  </div>
                  <div className="text-[11px] text-secondary">
                    Rating 1200 · 🇮🇩
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface">
                <Icon name="schedule" className="text-sm" />
                <span className="font-mono text-sm font-bold tabular-nums">
                  10:00
                </span>
              </div>
            </div>

            {/* Board */}
            <div className="w-full flex justify-center py-1">
              <div className="relative w-full max-w-[520px] aspect-square rounded-2xl p-3 bg-surface-container-highest shadow-md">
                <div className="w-full h-full rounded-xl overflow-hidden shadow-inner">
                  <Chessboard
                    options={{
                      position: START_FEN,
                      allowDragging: false,
                      showNotation: true,
                      boardStyle: {
                        width: "100%",
                        height: "100%",
                        borderRadius: "0.75rem",
                        overflow: "hidden",
                      },
                      lightSquareStyle: { backgroundColor: theme.light },
                      darkSquareStyle: { backgroundColor: theme.dark },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Player bar bottom */}
            <div className="flex items-center justify-between px-2 py-1 mt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm">
                  <Icon name="person" className="text-lg" filled />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-on-surface">
                      You
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-primary-fixed text-on-primary-fixed-variant">
                      WHITE
                    </span>
                  </div>
                  <div className="text-[11px] text-secondary">
                    Rating 1200 · 🇮🇩
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary shadow-sm">
                <Icon name="hourglass_bottom" className="text-sm" />
                <span className="font-mono text-sm font-bold tabular-nums">
                  10:00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT: Info Cards ---------- */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Getting Started */}
          <div className="bg-surface-container-low rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="lightbulb" className="text-lg text-primary" filled />
              <h2 className="text-base font-bold text-on-surface">
                Getting Started
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              <TipRow
                icon="insights"
                title="Analyze your games"
                description="Play freely and see engine suggestions"
                onClick={() => handleSelect("analysis")}
              />
              <TipRow
                icon="extension"
                title="Solve daily puzzles"
                description="Train tactics and improve pattern recognition"
                onClick={() => handleSelect("puzzle")}
              />
              <TipRow
                icon="memory"
                title="Challenge the engine"
                description="Play against Stockfish at your level"
                onClick={() => handleSelect("stockfish")}
              />
              <TipRow
                icon="group"
                title="Local match"
                description="Play with a friend on the same device"
                onClick={() => handleSelect("local")}
                last
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-surface-container-low rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="bar_chart" className="text-lg text-primary" filled />
              <h2 className="text-base font-bold text-on-surface">
                Your Stats
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon="sports_esports"
                value="1,240"
                label="Games played"
                accent="text-primary"
              />
              <StatCard
                icon="emoji_events"
                value="320"
                label="Puzzles solved"
                accent="text-tertiary"
              />
              <StatCard
                icon="trending_up"
                value="+48"
                label="This week"
                accent="text-blue-500"
              />
              <StatCard
                icon="local_fire_department"
                value="7"
                label="Day streak"
                accent="text-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          FOOTER
      ============================================ */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-secondary pt-6 mt-6 border-t border-outline-variant/30">
        <Icon name="auto_awesome" className="text-[14px] text-primary" filled />
        <span className="font-medium">
          Powered by Stockfish 18 · Made with React
        </span>
      </div>
    </div>
  );
}

/* ============================================
   QUICK CARD — clickable
============================================ */
function QuickCard({ icon, title, description, badge, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative bg-surface-container-low rounded-xl p-4 shadow-sm border border-transparent hover:border-primary/20 hover:bg-surface-container hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-left w-full"
    >
      <div className="relative">
        {/* Icon — subtle surface + primary icon */}
        <div className="w-11 h-11 rounded-xl bg-surface-container border border-outline-variant/30 text-primary flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
          <Icon name={icon} className="text-xl" filled />
        </div>

        <div className="flex items-center justify-between gap-1.5 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-sm font-bold text-on-surface truncate">
              {title}
            </h3>
            {badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container shrink-0">
                {badge}
              </span>
            )}
          </div>
          <Icon
            name="arrow_forward"
            className="text-base text-secondary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all shrink-0"
          />
        </div>
        <p className="text-[11px] text-secondary leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}

/* ============================================
   TIP ROW — clickable
============================================ */
function TipRow({ icon, title, description, onClick, last }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-start gap-3 w-full text-left cursor-pointer transition-all ${
        !last ? "pb-3 border-b border-outline-variant/20" : ""
      } hover:opacity-90`}
    >
      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
        <Icon name={icon} className="text-base text-primary" filled />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">
            {title}
          </span>
          <Icon
            name="chevron_right"
            className="text-sm text-secondary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all"
          />
        </div>
        <div className="text-[11px] text-secondary mt-0.5 leading-relaxed">
          {description}
        </div>
      </div>
    </button>
  );
}

/* ============================================
   STAT CARD
============================================ */
function StatCard({ icon, value, label, accent }) {
  return (
    <div className="bg-surface-container rounded-lg p-3 flex flex-col">
      <Icon name={icon} className={`text-lg ${accent} mb-1.5`} filled />
      <span className="text-lg font-bold text-on-surface tabular-nums leading-tight">
        {value}
      </span>
      <span className="text-[10px] text-secondary mt-0.5">{label}</span>
    </div>
  );
}
