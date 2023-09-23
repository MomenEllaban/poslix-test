import { joiResolver } from '@hookform/resolvers/joi';
import { Box, CircularProgress } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import { Toastify } from 'src/libs/allToasts';
import { addSuplierSchema } from 'src/modules/suppliers/_schema/add-supplier-schema';
import api from 'src/utils/app-api';
import { ProductContext } from '../../../context/ProductContext';
import { initalSupplierCustomerTemplate } from './_data/customer';

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
    placeholder: 'Enter address',
    type: 'text',
    required: false,
  },
  {
    name: 'invoice_City',
    label: 'Invoice City',
    placeholder: 'Enter invoice city',
    type: 'text',
    required: false,
  },
  {
    name: 'invoice_Country',
    label: 'Invoice Country',
    placeholder: 'Enter invoice country',
    type: 'text',
    required: false,
  },
  {
    name: 'postal_code',
    label: 'Postal Code',
    placeholder: 'Enter postal code',
    type: 'text',
    required: false,
  },
];

const SupplierModal = ({ openDialog, statusDialog, supplierId, showType, shopId }: any) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  // assumption of one order at a time / one cart
  const {
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
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

  const onSubmit = async (data) => {
    setIsLoading(true);

    if (showType === 'add')
      try {
        try {
          await api.post(
            `suppliers/${shopId}`,
            {},
            {
              params: { ...data },
            }
          );
          Toastify('success', 'Successfully Created');
          handleClose();
        } catch ({ response }) {
          const err = response.data.error;
          Object.keys(err).forEach((errorItem) => {
            setError(errorItem, { message: err[errorItem][0] });
          });
          Toastify('error', 'Has Error, Try Again...');
        }
      } finally {
        setIsLoading(false);
      }
    const { id, email: _email, ...rest } = data;
    const _updated = { ...rest };
    if (_email !== email) _updated.email = _email;
    api
      .put(
        `suppliers/${id}`,
        {},
        {
          params: { ..._updated },
        }
      )
      .then(() => {
        Toastify('success', 'Successfully Updated');
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

  async function getCustomerInfo(theId: any) {
    setIsLoading(true);

    api
      .get(`suppliers/${theId}/show`)
      .then(({ data }) => {
        setEmail(data.result.email);
        return data.result;
      })
      .then((result) => {
        Object.keys(result).forEach((item) => {
          setValue(item, result[item]);
        });
      })
      .catch(() => {
        Toastify('error', 'has error, Try Again...');

        handleClose();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    if (!statusDialog) return;

    setOpen(statusDialog);
    if (supplierId !== undefined && (showType === 'edit' || showType === 'show') && statusDialog)
      getCustomerInfo(supplierId);
  }, [statusDialog]);

  if (isLoading)
    return (
      <Modal show={open} onHide={handleClose}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          {showType !== 'show' ? showType + ' Supplier' : 'Supplier'}
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
          {showType === 'show' ? 'Supplier' : showType + ' Supplier'}
        </Modal.Header>
        <Modal.Body>
          <div className="scroll-form">
            {supplierFields.map((field) => {
              return (
                <FormField
                  key={`supplier-form-${field.name}`}
                  {...field}
                  disabled={showType === 'show'}
                  errors={errors}
                  required={showType === 'show' ? false : field.required}
                  register={register}
                />
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <a className="btn btn-link link-success fw-medium" onClick={handleClose}>
            Close <i className="ri-close-line me-1 align-middle" />
          </a>
          {showType !== 'show' ? (
            <Button type="submit" variant="primary" className="p-2">
              Save
            </Button>
          ) : null}
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