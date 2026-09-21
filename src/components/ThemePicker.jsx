import { BOARD_THEMES, useBoardTheme } from "../context/ThemeContext";

export default function ThemePicker() {
  const { themeKey, setThemeKey } = useBoardTheme();

  return (
    <div className="theme-picker">
      <h3>Papan Catur</h3>
      <div className="theme-grid">
        {Object.entries(BOARD_THEMES).map(([key, t]) => (
          <button
            key={key}
            className={`theme-swatch ${themeKey === key ? "active" : ""}`}
            onClick={() => setThemeKey(key)}
            title={t.name}
          >
            <div className="theme-preview">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="theme-row">
                  <span
                    style={{ background: i % 2 === 0 ? t.light : t.dark }}
                  />
                  <span
                    style={{ background: i % 2 === 0 ? t.dark : t.light }}
                  />
                </div>
              ))}
            </div>
            <span className="theme-name">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
