type StatusTone = "info" | "success" | "error";

type StatusBannerProps = {
  tone: StatusTone;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
};

export function StatusBanner({
  tone,
  title,
  message,
  actionLabel,
  onAction,
  actionDisabled,
}: StatusBannerProps) {
  return (
    <div className={`status-banner ${tone}`} role={tone === "error" ? "alert" : "status"}>
      <div className="status-copy">
        <p className="status-title">{title}</p>
        <p className="status-message">{message}</p>
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          className="button ghost small"
          onClick={onAction}
          disabled={actionDisabled}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
