'use client';
import React, { useState, useContext, useEffect } from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Toastify } from 'src/libs/allToasts';
import { createNewData, updateData } from 'src/services/crud.api';
import { useRouter } from 'next/router';
import { ProductContext } from 'src/context/ProductContext';
import { Dialog } from '@mui/material';

const PaymentModal = (props: any) => {
  const { openDialog, statusDialog, showType, fetchData, t } = props;

  const methodTemplate = { id: 0, name: '' };
  const [methodsName, setMethodName] = useState(methodTemplate);
  const [paymentMethods, setPaymentMethods] = useState({ name: '' });

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setPaymentMethods({ name: '' });
    setOpen(false);
    openDialog(false);
    fetchData();
  };
  useEffect(() => {
    if (!statusDialog) return;
    setMethodName(methodTemplate);
    setOpen(statusDialog);
  }, [statusDialog]);

  const router = useRouter();
  const handleSubmit = async () => {
    if (paymentMethods.name.length === 0) {
      Toastify('error', 'Please enter all the fields.');
      return;
    }
    let res;
    if (showType === 'add') {
      res = await createNewData(`/payments`, { ...paymentMethods, location_id: router.query.id });
      if (res.data.success) {
        handleClose();
      }
    }
  };
  return (
    <>
      <Dialog open={open} className="poslix-modal" onClose={handleClose} maxWidth={'xl'}>
        <DialogTitle className="poslix-modal-title text-primary">
        {t('payment.add_method')}
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <div className="poslix-modal">
              <div className="modal-content">
                <div className="modal-body">
                  <fieldset disabled={showType == 'show' ? true : false}>
                    <div className="">
                      <div className="col-lg-4 mb-3" style={{ minWidth: '400px' }}>
                        <label>{t('payment.name')}:</label>
                        <input
                          type="text"
                          name="cname"
                          className="form-control"
                          placeholder={t('payment.enter_name')}
                          value={paymentMethods.name}
                          onChange={(e) =>
                            setPaymentMethods({ ...paymentMethods, name: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div className="modal-footer">
                  <a className="btn btn-link link-success fw-medium" onClick={() => handleClose()}>
                    <i className="ri-close-line me-1 align-middle" /> {t('payment.close')}
                  </a>
                  {showType != 'show' && (
                    <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                      {t('payment.add_method_group')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentModal;
