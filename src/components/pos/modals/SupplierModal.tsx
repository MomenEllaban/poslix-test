import { joiResolver } from '@hookform/resolvers/joi';
import { useContext, useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import { Toastify } from 'src/libs/allToasts';
import { addSuplierSchema } from 'src/modules/suppliers/_schema/add-supplier-schema';
import { ProductContext } from '../../../context/ProductContext';
import { apiFetchCtr, apiInsertCtr, apiUpdateCtr } from '../../../libs/dbUtils';
import { initalSupplierCustomerTemplate } from './_data/customer';
import api from 'src/utils/app-api';
import { Box, CircularProgress } from '@mui/material';

const supplierFields = [
  { name: 'name', label: 'Name', placeholder: 'Enter supplier name', type: 'text', required: true },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'Enter supplier email',
    type: 'email',
    required: true,
  },
  {
    name: 'phone',
    label: 'Phone',
    placeholder: 'Enter supplier phone number',
    type: 'text',
    required: true,
  },
  {
    name: 'facility_name',
    label: 'Facility Name',
    placeholder: 'Enter facility name',
    type: 'text',
    required: true,
  },
  {
    name: 'tax_number',
    label: 'Tax Number',
    placeholder: 'Enter supplier name',
    type: 'text',
    required: true,
  },
  {
    name: 'invoice_address',
    label: 'Invoice Address',
    placeholder: 'Enter supplier name',
    type: 'text',
    required: false,
  },
  {
    name: 'invoice_City',
    label: 'Ivoice City',
    placeholder: 'Enter supplier name',
    type: 'text',
    required: false,
  },
  {
    name: 'invoice_Country',
    label: 'Ivoice Country',
    placeholder: 'Enter supplier name',
    type: 'text',
    required: false,
  },
  {
    name: 'postal_code',
    label: 'Postal Code',
    placeholder: 'Enter supplier name',
    type: 'text',
    required: false,
  },
];

const SupplierModal = ({ openDialog, statusDialog, userdata, showType, shopId }: any) => {
  const [moreInfo, setMoreInfo] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(initalSupplierCustomerTemplate);
  const { customers, setCustomers } = useContext(ProductContext);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openSnakeBar, setOpenSnakeBar] = useState(false);

  // assumption of one order at a time / one cart
  const {
    handleSubmit,
    register,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(addSuplierSchema),
    reValidateMode: 'onBlur',
    mode: 'onTouched',
    criteriaMode: 'all',
  });

  const handleClose = () => {
    setOpen(false);
    openDialog(false);
    reset();
  };

  const onSubmit = (data) => {

    setIsLoading(true);
    api
      .post(
        `suppliers/${shopId}`,
        {},
        {
          params: { ...data },
        }
      )
      .then(() => {
        Toastify('success', 'Successfully Created');
        handleClose();
      })
      .catch(({ response }) => {

        const err = response.data.error;
        Object.keys(err).forEach((errorItem) => {
          setError(errorItem, { message: err[errorItem][0] });
        });
        Toastify('error', 'Has Error, Try Again...');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const onError = (data) => {
    // console.log(data);
  };

  async function insertCustomerInfo() {
    const { success, msg, code, newdata } = await apiInsertCtr({
      type: 'customer',
      subType: 'addCustomer',
      shopId,
      data: customerInfo,
    });
    if (success) {
      setCustomers([...customers, newdata]);
      handleClose();
      Toastify('success', 'Successfully Created');
    } else if (code == 100) Toastify('error', msg);
    else Toastify('error', 'Has Error, Try Again...');
  }
  async function getCustomerInfo(theId: any) {
    setIsLoading(true);
    setCustomerInfo(initalSupplierCustomerTemplate);
    var result = await apiFetchCtr({
      fetch: 'customer',
      subType: 'getCustomerInfo',
      theId,
      shopId,
    });
    if (result.success) {
      const selCustomer = result?.newdata[0];
      setCustomerInfo({
        ...customerInfo,
        id: theId,
        mobile: selCustomer.mobile,
        firstName: selCustomer.first_name,
        lastName: selCustomer.last_name,
        city: selCustomer.city,
        state: selCustomer.state,
        addr1: selCustomer.addr1,
        addr2: selCustomer.addr2,
        zipCode: selCustomer.zip_code,
        country: selCustomer.country,
        shipAddr: selCustomer.shipping_address,
      });
      setIsLoading(false);
    } else {
      Toastify('error', 'has error, Try Again...');
    }
  }
  async function editCustomerInfo() {
    var result = await apiUpdateCtr({
      type: 'customer',
      subType: 'editCustomerInfo',
      shopId,
      data: customerInfo,
    });
    if (result.success) {
      const cinx = customers.findIndex((customer) => customer.value === customerInfo.id);
      if (cinx > -1) {
        const upCustomer = [...customers];
        upCustomer[cinx] = {
          ...upCustomer[cinx],
          value: customerInfo.id,
          label: customerInfo.firstName + ' ' + customerInfo.lastName + ' | ' + customerInfo.mobile,
          mobile: result.newdata.mobile,
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

  useEffect(() => {
    if (!statusDialog) return;
    setCustomerInfo(initalSupplierCustomerTemplate);
    setOpen(statusDialog);
    if (userdata !== undefined && showType != 'add' && statusDialog)
      getCustomerInfo(userdata.value);
  }, [statusDialog]);

  if (isLoading)
    return (
      <Modal show={open} onHide={handleClose}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          {showType + ' Supplier'}
        </Modal.Header>
        <Modal.Body>
          <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
            <CircularProgress />
          </Box>
        </Modal.Body>
      </Modal>
    );
  return (
    <Modal show={open} onHide={handleClose} className="scroll-form">
      <style scoped jsx>{`
        .scroll-form {
          max-height: 70dvh;
          overflow-y: auto;
          padding-inline: 0.5rem;
        }
      `}</style>
      <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          {showType + ' Supplier'}
        </Modal.Header>
        <Modal.Body>
          <div className="scroll-form">
            {supplierFields.map((field) => (
              <FormField
                key={`supplier-form-${field.name}`}
                {...field}
                errors={errors}
                register={register}
              />
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <a className="btn btn-link link-success fw-medium" onClick={handleClose}>
            Close <i className="ri-close-line me-1 align-middle" />
          </a>
          <Button type="submit" variant="primary" className="p-2">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SupplierModal;
/**
 * 
 * 
 *   {/* <Dialog open={open} className="poslix-modal" onClose={handleClose} maxWidth={'xl'}>
        <DialogTitle className="poslix-modal-title text-primary">
          {showType + ' Supplier'}
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                margin: '20px',
              }}>
              <CircularProgress />
            </Box>
          ) : (
            <div className="poslix-modal">
              <div className="modal-content">
                <div className="modal-body">
                  <fieldset disabled={showType == 'show' ? true : false}>
                    <div className="row">
                      <div className="col-lg-6 mb-3">
                        <label>Name :</label>
                        <input
                          type="text"
                          name="cname"
                          className="form-control"
                          placeholder="Name"
                          value={customerInfo.firstName}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label>Transactions :</label>
                        <input
                          type="text"
                          name="cemail"
                          className="form-control"
                          placeholder="Transactions"
                          value={customerInfo.lastName}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label>Paid invoices</label>
                        <input
                          type=""
                          name=""
                          className="form-control"
                          placeholder="Paid invoices"
                          value={customerInfo.mobile}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              mobile: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label>Unpaid invoices</label>
                        <input
                          type=""
                          name=""
                          className="form-control"
                          placeholder="Unpaid invoices"
                          value={customerInfo.mobile}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              mobile: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </fieldset>
                  {/* <div className="col-lg-4 mb-3 mt-lg-4 mt-0">
                                    <button className="btn btn-primary" onClick={() => { setMoreInfo(!moreInfo); }}>
                                        {moreInfo ? "Less " : "More "} Information <i className={`ri-arrow-${moreInfo ? 'up' : 'down'}-s-line ps-1`} />
                                    </button>
                                </div>
                                {
                                    moreInfo ? (
                                        <>
                                            <div className="row">
                                                <div className="col-lg-6 mb-3">
                                                    <label>Address line 1</label>
                                                    <input
                                                        type=""
                                                        name=""
                                                        className="form-control"
                                                        placeholder="Address line 1"
                                                        value={customerInfo.addr1}
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, addr1: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label>Address line 2</label>
                                                    <input
                                                        type=""
                                                        name=""
                                                        className="form-control"
                                                        placeholder="Address line 2"
                                                        value={customerInfo.addr2}
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, addr2: e.target.value })}
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
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
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
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })}
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
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, country: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-lg-3 mb-3">
                                                    <label>Zip code</label>
                                                    <input
                                                        type=""
                                                        name=""
                                                        className="form-control"
                                                        placeholder="Zip code"
                                                        value={customerInfo.zipCode}
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, zipCode: e.target.value })}
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
                                                value={customerInfo.shipAddr}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, shipAddr: e.target.value })}
                                            />
                                        </>
                                    ) : null
                                }
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
                      {showType} Supplier
                    </button>
                  )}
                </div>
              </div>

</div>
          )}
        </DialogContent>
      </Dialog> 
 */
