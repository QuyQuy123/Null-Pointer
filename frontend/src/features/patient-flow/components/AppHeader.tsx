import { ArrowLeft, ArrowRight } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onForward?: () => void;
  forwardLabel?: string;
  progress?: { current: number; total: number };
  variant?: "primary" | "white";
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  onForward,
  forwardLabel = "Tiếp tục",
  progress,
  variant = "primary",
}: AppHeaderProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={`sticky top-0 z-40 ${isPrimary ? "bg-primary text-primary-foreground" : "bg-card text-foreground border-b border-border"}`}
    >
      {/* Nav row */}
      <div className="flex items-center gap-2 px-2 pt-10 pb-2">
        {/* Back button */}
        <button
          onClick={onBack}
          disabled={!onBack}
          aria-label="Quay lại"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all min-w-[48px] min-h-[48px] ${
            onBack
              ? isPrimary
                ? "bg-white/15 hover:bg-white/25 active:scale-95 text-white"
                : "bg-muted hover:bg-muted/70 active:scale-95 text-foreground"
              : "opacity-0 pointer-events-none"
          }`}
          style={{ fontSize: 15 }}
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
          <span className="hidden sm:inline">Quay lại</span>
        </button>

        {/* Title */}
        <div className="flex-1 text-center">
          <p
            className={`truncate ${isPrimary ? "text-white" : "text-foreground"}`}
            style={{ fontSize: 16 }}
          >
            {title}
          </p>
          {subtitle && (
            <p
              className={`truncate ${isPrimary ? "text-white/70" : "text-muted-foreground"}`}
              style={{ fontSize: 12 }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Forward button */}
        <button
          onClick={onForward}
          disabled={!onForward}
          aria-label={forwardLabel}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all min-w-[48px] min-h-[48px] justify-end ${
            onForward
              ? isPrimary
                ? "bg-white/15 hover:bg-white/25 active:scale-95 text-white"
                : "bg-muted hover:bg-muted/70 active:scale-95 text-foreground"
              : "opacity-0 pointer-events-none"
          }`}
          style={{ fontSize: 15 }}
        >
          <span className="hidden sm:inline">{forwardLabel}</span>
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className={`flex-1 rounded-full h-1.5 ${isPrimary ? "bg-white/25" : "bg-muted"}`}>
              <div
                className={`rounded-full h-1.5 transition-all duration-500 ${isPrimary ? "bg-white" : "bg-primary"}`}
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <span
              className={isPrimary ? "text-white/70" : "text-muted-foreground"}
              style={{ fontSize: 12 }}
            >
              {progress.current}/{progress.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
