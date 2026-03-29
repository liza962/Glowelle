import { Button, Modal } from "react-bootstrap";

export default function ConfirmModal({
  show,
  onHide,
  title = "Confirm",
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger",
  onConfirm,
}) {
  const handleConfirm = async () => {
    try {
      await Promise.resolve(onConfirm());
    } finally {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" type="button" onClick={onHide}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} type="button" onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
