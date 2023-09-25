'use client';
import React, { Dispatch, Fragment, SetStateAction } from 'react';
import { Modal, ModalProps } from 'react-bootstrap';

interface IMainModal extends Omit<ModalProps, 'children'> {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  body: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
}

const MainModal = ({ show, setShow, onClose, body, title, footer, ...props }: IMainModal) => {
  const ModalBody = () => (React.isValidElement(body) ? body : <Fragment>{body}</Fragment>);
  const ModalFooter = () =>
    footer ? React.isValidElement(footer) ? footer : <Fragment>{footer}</Fragment> : null;

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  return (
    <Modal show={show} onHide={handleClose} {...props}>
      <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
        {title ?? 'Notice !'}
      </Modal.Header>
      <Modal.Body>
        <ModalBody />
      </Modal.Body>
      <Modal.Footer>
        <ModalFooter />
      </Modal.Footer>
    </Modal>
  );
};

export default MainModal;
