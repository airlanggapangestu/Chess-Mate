export default function ModeCard({
  icon,
  title,
  description,
  onClick,
  disabled,
}) {
  return (
    <button
      className={`mode-card ${disabled ? "mode-card-disabled" : ""}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className="mode-card-icon">{icon}</div>
      <div className="mode-card-body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {disabled && <span className="mode-card-badge">Segera</span>}
    </button>
  );
}
