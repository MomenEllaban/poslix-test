import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { useTranslation } from 'next-i18next';




const OrdersModal = (props: any) => {
  const { t } = useTranslation();
  const { openDialog, statusDialog, category, showType, shopId,selectId,extrasList } = props;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //submit logic
  const onSubmit = async (data: any) => {
    setIsLoading(true);
  };

  const handleSubmit = () => {};

  const onError = (errors: any, e: any) => console.log(errors, e);

  const handleClose = () => {
    setOpen(false);
    openDialog(false);
  };


  

  useEffect(() => {
    if (!statusDialog) return;
    setOpen(statusDialog);

  }, [statusDialog]);


      useEffect(() => {
    if (!statusDialog) return;
    setOpen(statusDialog);  
  }, [statusDialog]);
  
  
  

  if (isLoading)
    return (
      <Modal show={open} onHide={handleClose}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          Orders List
          
        </Modal.Header>
        <Modal.Body>
          <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
            <CircularProgress />
          </Box>
        </Modal.Body>
      </Modal>
    );
  return (
    <Modal show={open} onHide={handleClose} size="lg">
      <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
        Orders List
      </Modal.Header>
      <Modal.Body style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }} >
        
          </Modal.Body>
          <Modal.Footer>
            {showType != 'show' && (
              <Button type="submit" className="text-capitalize" onClick={() => {handleClose()}}>
                Done
              </Button>
            )}
          </Modal.Footer>
    </Modal>
  );
};

export default OrdersModal;
