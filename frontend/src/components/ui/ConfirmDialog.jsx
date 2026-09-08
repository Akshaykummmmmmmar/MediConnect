import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import './confirmDialog.css';

const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  confirmText = 'Yes, Continue',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  onConfirm,
  onCancel,
  busy = false,
}) => {
  if (!open) return null;

  const Icon = icon || (variant === 'danger' ? AlertTriangle : CheckCircle2);

  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={onCancel}>
      <div className="confirm-card" onClick={e => e.stopPropagation()}>
        <div className={`confirm-icon ${variant}`}>
          <Icon size={30} />
        </div>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        <div className="confirm-actions">
          <button className="confirm-btn cancel" onClick={onCancel} disabled={busy}>
            {cancelText}
          </button>
          <button className={`confirm-btn ${variant}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
