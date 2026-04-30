export default function ConfirmDialog({ item, onCancel, onConfirm }) {
  if (!item) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">Delete this record?</h3>
        <p>
          You are about to delete <strong>{item.label}</strong>. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="danger-button" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
