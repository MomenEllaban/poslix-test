import React, { useState, useContext, useEffect } from 'react';
import { apiFetch, apiUpdateCtr, apiInsertCtr, apiFetchCtr } from '../../../libs/dbUtils';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ProductContext } from '../../../context/ProductContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import SnakeAlert from '../utils/SnakeAlert';
import mStyle from '../../../styles/Customermodal.module.css';
import { Toastify } from 'src/libs/allToasts';
import { createNewData, updateData } from 'src/services/crud.api';
import { useRouter } from 'next/router';

const PricingModal = (props: any) => {
  const { openDialog, statusDialog, userdata, showType, shopId, pricingGroups, setPricingGroups, selectGroup } =
    props;
  const pricingTemplate = { id: 0, name: '' };
  const [pricingName, setPricingName] = useState(pricingTemplate);
  const [pricingGroup, setPricingGroup] = useState({ name: '' });
  const { customers, setCustomers } = useContext(ProductContext);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleClose = () => {
    setPricingGroup({ name: '' })
    setOpen(false);
    openDialog(false);
  };
  useEffect(() => {
    if (!statusDialog) return;
    setPricingName(pricingTemplate);
    setOpen(statusDialog);
    if (userdata !== undefined && showType != 'add' && statusDialog)
      // getPricingName(userdata.value);
      setPricingName(userdata);
  }, [statusDialog]);

  useEffect(() => {
    if (showType === 'edit') setPricingGroup({ name: userdata.name })
  }, [userdata])

  const router = useRouter()
  const handleSubmit = async () => {
    if (pricingGroup.name.length === 0) {
      Toastify("error", "Please enter all the fields.");
      return
    }
    let res;
    if (showType === 'edit') {
      const body = {
        "location_id": selectGroup.location_id,
        "business_id": selectGroup.business_id,
        "customers": selectGroup.customers?.map?.(el => el.id),
        "products": selectGroup.products
      }
      try {
        res = await updateData('pricing-group', userdata.id, { ...body, ...pricingGroup })
        Toastify('success', 'Group successfully updated')
        handleClose()
      } catch (e) {
        Toastify('error', 'Somthing wrong!!, try agian')
      }
    }
    else
      try {
        res = await createNewData('pricing-group', { ...pricingGroup, location_id: router.query.id })
        Toastify('success', 'Group successfully added')
        handleClose()
      } catch (e) {
        Toastify('error', 'Somthing wrong!!, try agian')
       
      }


  }
  return (
    <>
      <Dialog open={open} className="poslix-modal" onClose={handleClose} maxWidth={'xl'}>
        <DialogTitle className="poslix-modal-title text-primary">
          {showType + ' Pricing Group'}
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
                        <label>Name:</label>
                        <input
                          type="text"
                          name="cname"
                          className="form-control"
                          placeholder="Enter Name"
                          value={pricingGroup.name}
                          onChange={(e) => setPricingGroup({ ...pricingGroup, name: e.target.value })}
                        />
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div className="modal-footer">
                  <a className="btn btn-link link-success fw-medium" onClick={() => handleClose()}>
                    <i className="ri-close-line me-1 align-middle" /> Close
                  </a>
                  {showType != 'show' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}>
                      {showType} Pricing Group
                    </button>
                  )}
                </div>
              </div>
              {/* /.modal-content */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PricingModal;
