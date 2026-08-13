import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

export function ConfirmationModal({
  open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Confirm',
  confirmVariant = 'danger', loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>
    }>
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
