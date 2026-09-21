import { Construction, ArrowLeft } from "lucide-react";

export default function ComingSoon({ icon: Icon, title, description, onBack }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
      {/* Icon besar */}
      <div
        className="relative w-24 h-24 rounded-3xl
          bg-gradient-to-br from-primary/20 to-primary-dark/10
          border border-primary/30 flex items-center justify-center mb-6
          shadow-[0_0_60px_rgba(131,201,85,0.15)]"
      >
        {Icon && (
          <Icon className="w-12 h-12 text-primary-light" strokeWidth={1.8} />
        )}
        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-primary text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
          Soon
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-2 text-fg">{title}</h1>

      {/* Description */}
      <p className="text-fg-dim text-sm max-w-[420px] leading-relaxed mb-8">
        {description}
      </p>

      {/* Feature list */}
      <div className="flex flex-col gap-2 mb-8 w-full max-w-[360px]">
        <FeatureItem label="Mode permainan lengkap" />
        <FeatureItem label="Statistik & riwayat partai" />
        <FeatureItem label="Level kesulitan engine" />
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-icon-bg border border-border text-fg-muted text-xs uppercase tracking-wider font-semibold mb-6">
        <Construction className="w-3.5 h-3.5" strokeWidth={2.2} />
        Sedang dikembangkan
      </div>

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
            bg-transparent border border-border text-fg-muted
            text-sm font-medium cursor-pointer transition-all
            hover:bg-icon-bg hover:text-fg hover:border-swatch-border"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.2} />
          Kembali ke Home
        </button>
      )}
    </div>
  );
}

function FeatureItem({ label }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-icon-bg border border-border">
      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      <span className="text-[13px] text-fg-muted">{label}</span>
    </div>
  );
}
