import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { deleteDataWithLocID } from 'src/services/crud.api';
import { useTranslation } from 'next-i18next';

export default function AlertDialog(props: any) {
  const { url, id, shopId, type, subType, section, locatiooID } = props;
  const { t } = useTranslation();
  const handleClose = () => props.alertFun(false, '');
  async function deletePrint() {
    const res = await deleteDataWithLocID(url, id, shopId);
    if (res.data.status) {
      props.alertFun(true, 'Item successfully Deleted!!', id);
    } else props.alertFun(false, 'Please try again!');
  }
  const actionHandle = () => {
    deletePrint();
  };
  return (
    <>
      <Modal
        show={props.alertShow}
        onHide={() => props.alertFun(false, '')}
        backdrop="static"
        keyboard={false}
        centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">POSLIX SYSTEM </Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.children}</Modal.Body>
        <Modal.Footer className="d-flex ">
          <Button
            className="p-2"
            style={{ background: '#ffffff', color: '#000', border: 'none' }}
            onClick={handleClose}>
            {' '}
            {t('alert_dialog.dismiss')}{' '}
          </Button>
          <Button
            className="p-2"
            style={{ background: '#e75050', color: '#ffffff' }}
            onClick={actionHandle}>
            {' '}
            {url === 'transfer'
              ? t('alert_dialog.cancel_transefer')
              : t('alert_dialog.delete')}{' '}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
