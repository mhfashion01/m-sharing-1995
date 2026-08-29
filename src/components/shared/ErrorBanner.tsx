import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  variant?: 'error' | 'warning';
}

export function ErrorBanner({ message, onDismiss, onRetry, variant = 'error' }: ErrorBannerProps) {
  const styles = variant === 'error'
    ? 'bg-red-500/10 border-red-500/30 text-red-300'
    : 'bg-amber-500/10 border-amber-500/30 text-amber-300';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${styles} text-sm`}>
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <p className="flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 px-3 py-1 text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          Retry
        </button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 p-0.5 hover:opacity-70 transition-opacity">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
