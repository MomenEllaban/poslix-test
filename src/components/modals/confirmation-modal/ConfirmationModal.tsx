import React, { useState } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { usePosContext } from 'src/modules/pos/_context/PosContext';

interface ConfirmationModalProps {
  show: boolean;
  message: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  message,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const { lang: _lang } = usePosContext();
  const lang = _lang?.pos;

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{lang.confirmationModal.confirmation}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button active={!loading} variant="secondary" onClick={onClose}>
          {lang.confirmationModal.cancel}
        </Button>
        <Button active={!loading} variant="danger" onClick={onConfirm}>
          {loading && <Spinner size="sm" className="me-2" />}
          {lang.confirmationModal.confirm}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
