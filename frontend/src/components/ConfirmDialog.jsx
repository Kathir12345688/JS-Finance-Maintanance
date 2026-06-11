export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className="confirm-dialog-backdrop">
      <div className="confirm-dialog card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <p className="card-text text-muted">{message}</p>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              {cancelText}
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? 'Please wait...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
