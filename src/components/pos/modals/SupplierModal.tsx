import { joiResolver } from '@hookform/resolvers/joi';
import { Box, CircularProgress } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup, Form, Modal, Tab, Tabs } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import { Toastify } from 'src/libs/allToasts';
import { addSuplierSchema } from 'src/modules/suppliers/_schema/add-supplier-schema';
import api from 'src/utils/app-api';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { findAllData } from 'src/services/crud.api';
import { useUser } from 'src/context/UserContext';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const supplierFields = (t, showType, errors, register) => { 
  const supplierFields = [
    {
      name: 'name',
      label: t('supplier.name'),
      placeholder: t('supplier.enter_supplier_name'),
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: t('supplier.email'),
      placeholder: t('supplier.enter_supplier_email'),
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      label: t('supplier.phone'),
      placeholder: t('supplier.enter_supplier_phone'),
      type: 'text',
      required: true,
    },
    {
      name: 'facility_name',
      label: t('supplier.facility_name'),
      placeholder: t('supplier.enter_facility_name'),
      type: 'text',
      required: true,
    },
    {
      name: 'tax_number',
      label: t('supplier.tax_number'),
      placeholder: t('supplier.enter_tax_number'),
      type: 'text',
      required: true,
    },
    {
      name: 'invoice_address',
      label: t('supplier.invoice_address'),
      placeholder: t('supplier.enter_address'),
      type: 'text',
      required: false,
    },
    {
      name: 'invoice_City',
      label: t('supplier.invoice_city'),
      placeholder: t('supplier.enter_invoice_city'),
      type: 'text',
      required: false,
    },
    {
      name: 'invoice_Country',
      label: t('supplier.invoice_country'),
      placeholder: t('supplier.enter_invoice_country'),
      type: 'text',
      required: false,
    },
    {
      name: 'postal_code',
      label: t('supplier.postal_code'),
      placeholder: t('supplier.enter_postal_code'),
      type: 'text',
      required: false,
    },
  ];
  return supplierFields.map((field) => {
    return (
      <div style={{ width: '49%' }}>
        <FormField
          key={`supplier-form-${field.name}`}
          {...field}
          disabled={showType === 'show'}
          errors={errors}
          required={showType === 'show' ? false : field.required}
          register={register}
        />
      </div>
    );
  });
};

const SupplierModal = ({ openDialog, statusDialog, supplierId, showType, shopId }: any) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [key, setKey] = useState('profile');
  const [purchases, setPurchases] = useState<any>([]);
  const { locationSettings, setLocationSettings } = useUser();
  const router = useRouter();

  function getStatusStyle(status: string) {
    switch (status) {
      case 'paid':
      case 'received':
        return <span className="purchase-satus-style">{status}</span>;

      default:
        return (
          <span className="purchase-satus-style paid-other">{status.split('_').join(' ')}</span>
        );
    }
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    {
      field: 'status',
      headerName: t('supplier.stock_status'),
      flex: 0.5,
      renderCell: ({ row }: Partial<GridRowParams>) => getStatusStyle(row.status),
    },
    {
      field: 'payment_status',
      headerName: t('supplier.payment_status'),
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => getStatusStyle(row.payment_status),
    },
    {
      field: 'payment',
      headerName: t('supplier.method'),
      flex: 0.5,
      renderCell: ({ row }: Partial<GridRowParams>) => row.payment[0]?.payment_type || '-',
    },
    {
      field: 'total_price',
      headerName: t('supplier.total_price'),
      flex: 1,
      renderCell: (params) =>
        Number(params.value).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'products',
      headerName: t('supplier.products'),
      flex: 1,
      renderCell: ({ row }) => (
        <span title={row.products.map((prod) => prod.name).join(', ')}>
          {row.products.map((prod) => prod.name).join(', ')}
        </span>
      ),
    },
  ];
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

    if (showType === 'add') {
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
          const currentPath = router.pathname;

          if (!currentPath.includes('suppliers')) {
            router.push(`/shop/${shopId}/suppliers`);
          }
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
      return;
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

  const initData = async () => {
    const res = await findAllData(`purchase/${shopId}`);
    if (res.data.success)
      setPurchases(res.data.result?.filter((pu) => pu.supplier_id === supplierId));
  };

  useEffect(() => {
    if (!statusDialog) return;

    setOpen(statusDialog);
    if (supplierId !== undefined && (showType === 'edit' || showType === 'show') && statusDialog)
      getCustomerInfo(supplierId);
    initData();
  }, [statusDialog]);

  if (isLoading)
    return (
      <Modal show={open} onHide={handleClose}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          {showType !== 'show'
            ? showType === 'add'
              ? t('supplier.add_supplier')
              : t('supplier.edit_supplier')
            : t('supplier.supplier')}
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
      <Modal.Body>
        <Tabs
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3">
          <Tab eventKey="profile" title={t('supplier.profile')}>
            <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
              <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
                {showType !== 'show'
                  ? showType === 'add'
                    ? t('supplier.add_supplier')
                    : t('supplier.edit_supplier')
                  : t('supplier.supplier')}
              </Modal.Header>
              <Modal.Body>
                <div className="d-flex flex-row flex-wrap justify-content-between">
                  {supplierFields(t, showType, errors, register)}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <a className="btn btn-link link-success fw-medium" onClick={handleClose}>
                {t('supplier.close')} <i className="ri-close-line me-1 align-middle" />
                </a>
                {showType !== 'show' ? (
                  <Button type="submit" variant="primary" className="p-2">
                    {t('supplier.save')}
                  </Button>
                ) : null}
              </Modal.Footer>
            </Form>
          </Tab>
          {showType === 'show' && (
            <Tab
              eventKey="orders"
              title={t('supplier.orders')}
              style={{
                minHeight: '600px',
              }}>
              <div className="page-content-style card" style={{ minHeight: '600px' }}>
                <DataGrid
                  className="datagrid-style"
                  sx={{
                    '.MuiDataGrid-columnSeparator': {
                      display: 'none',
                    },
                    '&.MuiDataGrid-root': {
                      border: 'none',
                    },
                    ' .MuiDataGrid-virtualScroller': {
                      minHeight: '600px',
                    },
                  }}
                  rows={purchases}
                  columns={columns}
                  initialState={{
                    columns: { columnVisibilityModel: { mobile: false } },
                  }}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                />
              </div>
            </Tab>
          )}
        </Tabs>
      </Modal.Body>
      {/* <Modal.Footer>
        <a className="btn btn-link link-success fw-medium" onClick={handleClose}>
          <i className="ri-close-line me-1 align-middle" /> Close
        </a>
      </Modal.Footer> */}
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
