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
import { createNewData, findAllData, updateData } from 'src/services/crud.api';
import { useRouter } from 'next/router';

const Customermodal = (props: any) => {
  const { openDialog, statusDialog, userdata, showType, shopId } = props;
  const customerTemplate = {
    id: 0,
    first_name: '',
    last_name: '',
    mobile: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    shipping_address: '',
  };
  const [moreInfo, setMoreInfo] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(customerTemplate);
  const { customers, setCustomers } = useContext(ProductContext);
  const [open, setOpen] = useState(false);
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const [openSnakeBar, setOpenSnakeBar] = useState(false);
  const handleClose = () => {
    setOpen(false);
    openDialog(false);
  };
  useEffect(() => {
    if (!statusDialog) return;
    setCustomerInfo(customerTemplate);
    setOpen(statusDialog);
    if (userdata !== undefined && showType != 'add' && statusDialog)
      getCustomerInfo(userdata.value);
  }, [statusDialog]);

  async function insertCustomerInfo() {
    const res = await createNewData(`customers/${router.query.id}`, customerInfo)
    if (res.data.success) {
      setCustomers([...customers, res.data.result.profile]);
      handleClose();
      Toastify('success', 'Successfully Created');
    }
    else Toastify('error', 'Has Error, Try Again...');
  }
  async function getCustomerInfo(theId: any) {
    setIsLoading(true);
    setCustomerInfo(customerTemplate);
    const res = await findAllData(`customers/${theId}/show`)
    console.log(res);
    
    if (res.data.success) {
      const selCustomer = res.data.result.profile;
      setCustomerInfo({
        ...customerInfo,
        id: theId,
        mobile: selCustomer.mobile,
        first_name: selCustomer.first_name,
        last_name: selCustomer.last_name,
        city: selCustomer.city,
        state: selCustomer.state,
        address_line_1: selCustomer.address_line_1,
        address_line_2: selCustomer.address_line_2,
        zip_code: selCustomer.zip_code,
        country: selCustomer.country,
        shipping_address: selCustomer.shipping_address,
      });
      setIsLoading(false);
    } else {
      Toastify('error', 'has error, Try Again...');
    }
  }
  async function editCustomerInfo() {
    const res = await updateData('customers', customerInfo.id, customerInfo)
    if (res.data.success) {
      const cinx = customers.findIndex((customer) => customer.value === customerInfo.id);
      if (cinx > -1) {
        const upCustomer = [...customers];
        upCustomer[cinx] = {
          ...upCustomer[cinx],
          value: customerInfo.id,
          label: customerInfo.first_name + ' ' + customerInfo.last_name + ' | ' + customerInfo.mobile,
          mobile: res.data.result.profile.mobile,
        };
        setCustomers(upCustomer);
      }
      handleClose();
      Toastify('success', 'Successfully Edited');
    } else Toastify('error', 'has error, Try Again...');
  }
  const makeShowSnake = (val: any) => {
    setOpenSnakeBar(val);
  };

  return (
    <>
      <Dialog open={open} className="poslix-modal" onClose={handleClose} maxWidth={'xl'}>
        <DialogTitle className="poslix-modal-title text-primary">
          {showType + ' customer'}
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
                    <div className="row">
                      <div className="col-lg-4 mb-3">
                        <label>First Name :</label>
                        <input
                          type="text"
                          name="cname"
                          className="form-control"
                          placeholder="First Name"
                          value={customerInfo.first_name}
                          onChange={(e) =>
                            setCustomerInfo({ ...customerInfo, first_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-lg-4 mb-3">
                        <label>Last Name :</label>
                        <input
                          type="text"
                          name="cemail"
                          className="form-control"
                          placeholder="Last Name"
                          value={customerInfo.last_name}
                          onChange={(e) =>
                            setCustomerInfo({ ...customerInfo, last_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-lg-4 mb-3">
                        <label>Mobile</label>
                        <input
                          type=""
                          name=""
                          className="form-control"
                          placeholder="Mobile"
                          value={customerInfo.mobile}
                          onChange={(e) =>
                            setCustomerInfo({ ...customerInfo, mobile: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </fieldset>
                  <div className="col-lg-4 mb-3 mt-lg-4 mt-0">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setMoreInfo(!moreInfo);
                      }}>
                      {moreInfo ? 'Less ' : 'More '} Information{' '}
                      <i className={`ri-arrow-${moreInfo ? 'up' : 'down'}-s-line ps-1`} />
                    </button>
                  </div>
                  {moreInfo ? (
                    <>
                      <div className="row">
                        <div className="col-lg-6 mb-3">
                          <label>Address line 1</label>
                          <input
                            type=""
                            name=""
                            className="form-control"
                            placeholder="Address line 1"
                            value={customerInfo.address_line_1}
                            onChange={(e) =>
                              setCustomerInfo({ ...customerInfo, address_line_1: e.target.value })
                            }
                          />
                        </div>
                        <div className="col-lg-6 mb-3">
                          <label>Address line 2</label>
                          <input
                            type=""
                            name=""
                            className="form-control"
                            placeholder="Address line 2"
                            value={customerInfo.address_line_2}
                            onChange={(e) =>
                              setCustomerInfo({ ...customerInfo, address_line_2: e.target.value })
                            }
                          />
                        </div>
                        <div className="col-lg-3 mb-3">
                          <label>City</label>
                          <input
                            type=""
                            name=""
                            className="form-control"
                            placeholder="City"
                            value={customerInfo.city}
                            onChange={(e) =>
                              setCustomerInfo({ ...customerInfo, city: e.target.value })
                            }
                          />
                        </div>
                        <div className="col-lg-3 mb-3">
                          <label>State</label>
                          <input
                            type=""
                            name=""
                            className="form-control"
                            placeholder="State"
                            value={customerInfo.state}
                            onChange={(e) =>
                              setCustomerInfo({ ...customerInfo, state: e.target.value })
                            }
                          />
                        </div>
                        <div className="col-lg-3 mb-3">
                          <label>Country</label>
                          <input
                            type=""
                            name=""
                            className="form-control"
                            placeholder="Country"
                            value={customerInfo.country}
                            onChange={(e) =>
                              setCustomerInfo({ ...customerInfo, country: e.target.value })
                            }
                          />
                        </div>
                        <div className="col-lg-3 mb-3">
                          <label>Zip code</label>
                          <input
                            type=""
                            name=""
                            className="form-control"
                            placeholder="Zip code"
                            value={customerInfo.zip_code}
                            onChange={(e) =>
                              setCustomerInfo({ ...customerInfo, zip_code: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <hr />
                      <label>Shipping address</label>
                      <input
                        type=""
                        name=""
                        className="form-control"
                        placeholder="Shipping address"
                        value={customerInfo.shipping_address}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, shipping_address: e.target.value })
                        }
                      />
                    </>
                  ) : null}
                </div>
                <div className="modal-footer">
                  <a className="btn btn-link link-success fw-medium" onClick={() => handleClose()}>
                    <i className="ri-close-line me-1 align-middle" /> Close
                  </a>
                  {showType != 'show' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (showType == 'edit') editCustomerInfo();
                        else insertCustomerInfo();
                      }}>
                      {showType} Customer
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

export default Customermodal;
