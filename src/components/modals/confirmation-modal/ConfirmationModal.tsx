import React, { useState } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';

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
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button active={!loading} variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button active={!loading} variant="danger" onClick={onConfirm}>
          {loading && <Spinner size="sm" className="me-2" />}
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
