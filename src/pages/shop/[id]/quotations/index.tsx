import React, { useState, useEffect } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faEye, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { ILocationSettings } from '@models/common-model';
import { useReactToPrint } from 'react-to-print';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import { findAllData, updateData } from 'src/services/crud.api';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NextPage } from 'next';
import withAuth from 'src/HOCs/withAuth';

const SalesList: NextPage = (props: any) => {
  const { id } = props;
  const { t } = useTranslation();
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    // @ts-ignore
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });
  const [sales, setsales] = useState<any>([]);
  const [customersNames, setCustomersNames] = useState<any>([]);
  const router = useRouter();
  const shopId = router.query.id;
  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({ payment: [] });
  const [lines, setLines] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);
  const [isLoadItems, setIsLoadItems] = useState(false);
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  const [handleSearchTxt, setHandleSearchTxt] = useState('');
  const [isloading, setIsloading] = useState<any>(false);
  const [invoiceDetails, setInvoiceDetails] = useState<any>();
  const [selectedQuotationProducts, setSelectedQuotationProducts] = useState([]);
  // const { setInvoiceDetails, invoiceDetails } = useContext(UserContext);
  const [tax, setTax] = useState(0);
  const [showingQuotation, setShowQuotation] = useState<{
    transferID: number | null;
    from: string;
    status: string;
    total: number;
    products: { name: string; qty: number }[];
    createdBy: string;
    ceartedAt: string;
  }>({
    transferID: null,
    from: '',
    status: '',
    total: 0,
    products: [],
    createdBy: '',
    ceartedAt: '',
  });

  const updateStatus = async (id: number, status: string) => {
    const res = await updateData('quotations-list', id, { status });
    if (res.data.success) Toastify('success', 'Quotation Successfuly Updated..');
    else Toastify('error', 'Error');
    initDataPage();
  };
  const checkPrintType = async () => {
    const res = await findAllData(`appearance/${router.query.id}`);
    setInvoiceDetails({
      ...res.data.result,
      en: { ...res.data.result.en, is_multi_language: !!res.data.result.en.is_multi_language },
    });
  };
  const getItems = async (id: number) => {
    setIsLoadItems(true);
    try {
      const res = await findAllData(`quotations-list/${id}`);

      setLines(res.data.result.quotationsList?.products);
    } catch (e) {
      Toastify('error', 'Something went wrong');
    }
    // if (res.data.success) {
    //   setSalesRep(res.data.result);
    setIsLoadItems(false);
    // }
  };
  const formatQuotation = (quotation: any) => {
    setTax(quotation.tax_amount);
    const total = quotation.total_price;
    const products: { name: string; qty: number }[] = [];
    const status = quotation.status;
    const transferID = quotation.id;
    const _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    const from = _locs.find((el) => el.location_id == quotation.location_id).location_name;
    const ceartedAt = quotation.created_at;
    const qotProducts = quotation.products;

    setSelectedQuotationProducts(qotProducts);

    quotation?.quotation_list_lines?.forEach((el) => {
      products.push({
        name: qotProducts.filter((ele) => ele.id == el.product_id)[0]?.name,
        qty: el.qty,
      });
    });

    setShowQuotation({
      total,
      from,
      transferID,
      products,
      status,
      ceartedAt,
      createdBy: from,
    });
    getItems(transferID);
    setSelectRow({ ...quotation });
  };
  // ------------------------------------------------------------------------------------------------
  useEffect(() => {
    checkPrintType();
  }, []);

  // ------------------------------------------------------------------------------------------------
  //table columns
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    {
      field: 'customer_id',
      headerName: t('quotation.customer_name'),
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (row.customer_id) {
          let first_name = customersNames
            .filter(function (customer) {
              return customer.id === row.customer_id;
            })
            .map(function (customer) {
              return customer.first_name + customer.last_name;
            });

          return first_name;
        }
      },
    },
    { field: 'created_at', headerName: t('quotation.quotaion_date'), flex: 1 },
    {
      flex: 1,
      field: 'status',
      headerName: t('quotation.status'),
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (row.status === 'accepted') {
          return (
            <>
              <div className="sty_Accepted">Accepted</div>
            </>
          );
        } else if (row.status === 'canceled') {
          return (
            <>
              <div className="sty_Cancled">Cancelled</div>
            </>
          );
        } else {
          return (
            <>
              <div className="sty_Waiting">Waiting</div>
            </>
          );
        }
      },
    },
    {
      flex: 1,
      field: 'action',
      headerName: t('quotation.action'),
      filterable: false,
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            {/* <Button
              onClick={() => {
                localStorage.setItem('currentQuotation', JSON.stringify(row));
                router.push('/shop/' + shopId + '/quotations/edit');
              }}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button> */}
            <Button
              onClick={() => {
                setSelectId(row.id);
                setShow(true);
              }}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
            <Button
              onClick={() => {
                formatQuotation(row);
                setShowViewPopUp(true);
              }}>
              <FontAwesomeIcon icon={faEye} />
            </Button>
            <Button
              disabled={!(row.status === 'waiting')}
              onClick={() => updateStatus(row.id, 'accepted')}>
              <FontAwesomeIcon icon={faCheck} />
            </Button>
            <Button
              disabled={!(row.status === 'waiting')}
              onClick={() => updateStatus(row.id, 'canceled')}>
              <FontAwesomeIcon icon={faXmark} />
            </Button>
          </ButtonGroup>
        </>
      ),
    },
  ];

  const componentRef = React.useRef(null);
  class ComponentToPrint extends React.PureComponent {
    render() {
      if (!selectRow) return;
      return (
        <div className="bill">
          <div className="brand-logo">
            <img src={invoiceDetails?.en?.logo} />
          </div>
          <br />
          <div className="brand-name">{invoiceDetails?.en?.name}</div>
          <div className="shop-details">{invoiceDetails?.en?.tell}</div>
          <br />
          <div className="bill-details">
            <div className="flex justify-between">
              <div>
                {invoiceDetails?.en?.txtCustomer}{' '}
                {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtCustomer}
              </div>
              <div>
                {selectRow?.customer?.first_name} {selectRow?.customer?.last_name}
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoiceDetails?.en?.orderNo}{' '}
                {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.orderNo}
              </div>
              <div>{selectRow.id}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoiceDetails?.en?.txtDate}{' '}
                {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtDate}
              </div>
              <div>
                {selectRow?.created_at
                  ? new Date(selectRow?.created_at).toISOString().slice(0, 10)
                  : ''}
              </div>
            </div>
          </div>
          {/*  */}
          <table className="table">
            <thead>
              <tr className="header">
                <th>
                  {invoiceDetails?.en?.txtQty}
                  <br />
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtQty}
                </th>
                <th>
                  {invoiceDetails?.en?.txtItem}
                  <br />
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtItem}
                </th>
                <th></th>
                <th>
                  {invoiceDetails?.en?.txtAmount}
                  <br />
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtAmount}
                </th>
              </tr>
              {lines?.length > 0 &&
                lines?.map((line: any, index: number) => {
                  return (
                    <tr key={index}>
                      <td>{Number(line?.product_qty).toFixed(0)}</td>
                      <td>
                        {
                          selectedQuotationProducts.filter((ele) => {
                            if (ele.variant_id) {
                              return ele.variant_id == line?.variant_id;
                            }
                            return ele.product_id == line?.product_id;
                          })[0]?.product_name
                        }
                      </td>
                      <td></td>
                      <td>
                        {Number(
                          +selectedQuotationProducts.filter((ele) => {
                            if (ele.variant_id) {
                              return ele.variant_id == line?.variant_id;
                            }
                            return ele.product_id == line?.product_id;
                          })[0]?.product_price
                        ).toFixed(locationSettings?.location_decimal_places)}
                      </td>
                    </tr>
                  );
                })}
              <tr style={{ borderTop: '2px', height: '2px' }}></tr>
              <tr className="net-amount">
                <td></td>
                <td>
                  {invoiceDetails?.en?.txtTax}{' '}
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtTax}
                </td>
                <td></td>
                <td>
                  {(((+selectRow?.total_price / (1 + tax / 100)) * tax) / 100).toFixed(
                    locationSettings?.location_decimal_places
                  )}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td>
                  {invoiceDetails?.en?.txtDiscount}
                  {'Discount'} {invoiceDetails?.en?.is_multi_language && 'التخفيضات'}
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtDiscount}
                </td>
                <td></td>
                <td>
                  {(+selectRow?.discount_amount).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {invoiceDetails?.en?.txtTotal}{' '}
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtTotal}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(selectRow?.total_price).toFixed(
                    locationSettings?.location_decimal_places || 4
                  )}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  Total Paid {invoiceDetails?.en?.is_multi_language && 'إجمالى المدفوعات'}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(selectRow?.payment[0]?.amount).toFixed(
                    locationSettings?.location_decimal_places
                  )}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  Total Due {invoiceDetails?.en?.is_multi_language && 'المتبقى'}
                </td>
                <td></td>
                <td className="txt-bold">
                  {selectRow?.total_price - +selectRow?.payment[0]?.amount > 0
                    ? Number(selectRow?.total_price - +selectRow?.payment[0]?.amount).toFixed(
                        locationSettings?.location_decimal_places || 4
                      )
                    : 0}
                </td>
              </tr>
            </thead>
          </table>
          {/*  */}
          <p className="recipt-footer">
            {invoiceDetails?.en?.footer}
            <br />
            {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.footer}
          </p>
          <p className="recipt-footer">{selectRow.notes}</p>
          <br />
        </div>
      );
    }
  }

  const componentRef2 = React.useRef(null);
  class ComponentToPrint2 extends React.PureComponent {
    render() {
      if (!selectRow) return;
      return (
        <div className="bill2">
          <div className="brand-logo">
            <img src={invoiceDetails?.en?.logo} />
            <div className="invoice-print">
              INVOICE
              <div>
                <table className="GeneratedTable">
                  <tbody>
                    <tr>
                      <td className="td_bg">
                        {invoiceDetails?.en?.orderNo}
                        <br />
                        {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.orderNo}
                      </td>
                      <td>{selectRow?.id}</td>
                    </tr>
                    <tr>
                      <td className="td_bg">
                        {invoiceDetails?.en?.txtDate}
                        <br />
                        {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtDate}
                      </td>
                      <td>
                        {selectRow?.created_at
                          ? new Date(selectRow?.created_at).toISOString().slice(0, 10)
                          : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <br />

          <div className="up_of_table flex justify-between">
            <div className="left_up_of_table">
              <div>Billed From</div>
              <div>{invoiceDetails?.en?.name}</div>
              <div>{invoiceDetails?.en?.email}</div>
              <div>{invoiceDetails?.en?.tell}</div>
              <div>{invoiceDetails?.en?.address}</div>
              <div>VAT Number: {invoiceDetails?.en?.vatNumber}</div>
            </div>
            <div className="right_up_of_table">
              <div>Billed To</div>
              <div>
                {invoiceDetails?.en?.txtCustomer}{' '}
                {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtCustomer}
              </div>
              <div>
                {selectRow?.customer?.first_name} {selectRow?.customer?.last_name}
              </div>
            </div>
          </div>
          <br />

          <table className="GeneratedTable2">
            <thead>
              <tr>
                <th>
                  {invoiceDetails?.en?.txtItem} <br />
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtItem}
                </th>
                <th>
                  {' '}
                  {invoiceDetails?.en?.txtQty}
                  <br />
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtQty}
                </th>
                <th>Unit Price</th>
                <th>
                  {invoiceDetails?.en?.txtTax}
                  <br />
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtTax}
                </th>
                <th>
                  {' '}
                  {invoiceDetails?.en?.txtAmount}
                  <br />
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtAmount}
                </th>
              </tr>
            </thead>
            {lines?.length > 0 &&
              lines?.map((line: any, index: number) => {
                return (
                  <tr key={index}>
                    <td>
                      {
                        selectedQuotationProducts.filter((ele) => {
                          if (ele.variant_id) {
                            return ele.variant_id == line?.variant_id;
                          }
                          return ele.product_id == line?.product_id;
                        })[0]?.product_name
                      }
                    </td>
                    <td>{Number(line?.product_qty).toFixed(0)}</td>
                    <td>
                      {Number(
                        selectedQuotationProducts.filter((ele) => {
                          if (ele.variant_id) {
                            return ele.variant_id == line?.variant_id;
                          }
                          return ele.product_id == line?.product_id;
                        })[0]?.product_price
                      ).toFixed(locationSettings?.location_decimal_places || 4)}
                    </td>
                    <td>
                      {Number(
                        (tax / 100) *
                          +selectedQuotationProducts.filter((ele) => {
                            if (ele.variant_id) {
                              return ele.variant_id == line?.variant_id;
                            }
                            return ele.product_id == line?.product_id;
                          })[0]?.product_price
                      ).toFixed(locationSettings?.location_decimal_places)}
                    </td>

                    <td>
                      {Number(
                        +selectedQuotationProducts.filter((ele) => {
                          if (ele.variant_id) {
                            return ele.variant_id == line?.variant_id;
                          }
                          return ele.product_id == line?.product_id;
                        })[0]?.product_price
                      ).toFixed(locationSettings?.location_decimal_places)}
                    </td>
                  </tr>
                );
              })}

            <tbody>
              <tr>
                <td colSpan={4} className="txt_bold_invoice">
                  {invoiceDetails?.en?.txtTotal}{' '}
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtTotal}
                </td>
                <td className="txt_bold_invoice">
                  {Number(selectRow.total_price).toFixed(
                    locationSettings?.location_decimal_places || 4
                  )}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="txt_bold_invoice">
                  Total Paid
                </td>
                <td className="txt_bold_invoice">
                  {Number(selectRow?.payment[0]?.amount).toFixed(
                    locationSettings?.location_decimal_places || 4
                  )}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="txt_bold_invoice">
                  Total Due
                </td>
                <td className="txt_bold_invoice">
                  {selectRow?.total_price - +selectRow?.payment[0]?.amount > 0
                    ? Number(selectRow?.total_price - +selectRow?.payment[0]?.amount).toFixed(
                        locationSettings?.location_decimal_places || 4
                      )
                    : 0}
                </td>
              </tr>
            </tbody>
          </table>

          <p className="recipt-footer">
            {invoiceDetails?.en?.footer}
            <br />
            {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.footer}
          </p>
          {/* <p className="recipt-footer">{selectRow.notes}</p> */}
          <br />
        </div>
      );
    }
  }

  // init sales data
  async function initDataPage() {
    setIsloading(true);
    try {
      const res = await findAllData(`quotations-list?location_id=${shopId}`);
      const customers_names = await findAllData(`customers/${shopId}`);
      setCustomersNames(customers_names.data.result);
      setsales(res.data.result.quotationsList.reverse());
      //       if (res.data.result.invoiceDetails != null && res.data.result.invoiceDetails.length > 10){
      //         setInvoiceDetails(JSON.parse(res.data.result.invoiceDetails));
      // }
    } catch (e) {
      Toastify('error', 'Something went wrong');
    }
    setIsloading(false);
  }

  const [permissions, setPermissions] = useState<any>();

  useEffect(() => {
    localStorage.getItem('currentQuotation') ? localStorage.removeItem('currentQuotation') : null;

    const perms = JSON.parse(localStorage.getItem('permissions')).filter(
      (loc) => loc.id == router.query.id
    );
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms[0]?.permissions?.map((perm) =>
      perm.name.includes('quotations-list/show')
        ? (getPermissions.hasView = true)
        : perm.name.includes('quotations-list/add')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('quotations-list/update')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('quotations-list/delete')
        ? (getPermissions.hasDelete = true)
        : null
    );

    setPermissions(getPermissions);

    var _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.location_id == shopId;
          })
        ]
      );

    initDataPage();
  }, [router.asPath]);

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (result) {
      const _data = [...sales];
      const idx = _data.findIndex((itm: any) => itm.id == selectId);

      if (idx != -1) {
        _data.splice(idx, 1);
        setsales(_data);
      }
    }
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
        <GridToolbarColumnsButton placeholder="grid" />
        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  }
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const handlePrint2 = useReactToPrint({
    content: () => componentRef2.current,
  });
  const handleClose = () => {
    setShowViewPopUp(false);
    setShowQuotation({
      transferID: null,
      from: '',
      status: '',
      total: 0,
      products: [],
      createdBy: '',
      ceartedAt: '',
    });
    setLines([]);
  };
  return (
    <AdminLayout shopId={id}>
      <ToastContainer />
      <AlertDialog
        alertShow={show}
        alertFun={handleDeleteFuc}
        shopId={id}
        id={selectId}
        url="quotations-list">
        {t('alert_dialog.delete_msg')}
      </AlertDialog>
      {
        <div style={{ display: 'none' }}>
          <ComponentToPrint ref={componentRef} />
        </div>
      }
      {
        <div style={{ display: 'none' }}>
          <ComponentToPrint2 ref={componentRef2} />
        </div>
      }
      <div className="page-content-style card">
        <div className="mb-4">
          <button
            className="btn m-btn btn-primary p-3"
            onClick={() => {
              router.push('/shop/' + shopId + '/quotations/add');
            }}>
            <FontAwesomeIcon icon={faPlus} /> {t('quotation.add_quotation')}
          </button>
        </div>

        <h5>{t('quotation.quotation_list')}</h5>
        <DataGrid
          loading={isloading}
          className="datagrid-style"
          sx={{
            '.MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '&.MuiDataGrid-root': {
              border: 'none',
            },
          }}
          rows={sales}
          columns={columns}
          initialState={{
            columns: { columnVisibilityModel: { mobile: false } },
          }}
          pageSize={10}
          rowsPerPageOptions={[10]}
          components={{ Toolbar: CustomToolbar }}
        />
      </div>
      {/*  */}

      <Dialog open={showViewPopUp} fullWidth={true} className="poslix-modal" onClose={handleClose}>
        <DialogTitle className="poslix-modal text-primary">
          {t('quotation_sale_model.quotaion_details')}
        </DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="poslix-modal">
            <div className="top-section-details">
              <img src={invoiceDetails?.en?.logo} style={{ width: '80px', marginBottom: '10px' }} />
              <div className="item-sections">
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>{t('quotation_sale_model.quotaion-no')} :</p>
                    <p>{selectRow.id}</p>
                  </div>
                  <div className="top-detials-item pe-2">
                    <p>{t('quotation_sale_model.quotaion_date')} :</p>
                    {edit ? (
                      <input
                        type="text"
                        className="form-control"
                        value={
                          selectRow?.created_at && new Date(selectRow?.created_at).toLocaleString()
                        }
                      />
                    ) : (
                      <p>
                        {selectRow?.created_at && new Date(selectRow?.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="top-detials-item pe-2">
                    <p>{t('quotation_sale_model.added_by')} :</p>

                    <p>{selectRow?.employee?.first_name}</p>
                  </div>
                </div>
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>{t('quotation_sale_model.final_total')} :</p>
                    <p>
                      {Number(selectRow.total_price).toFixed(
                        locationSettings?.location_decimal_places
                      )}
                    </p>
                  </div>
                  <div className="top-detials-item">
                    <p>{t('quotation_sale_model.customer_name')} :</p>
                    <p>
                      {selectRow?.customer?.first_name} {selectRow?.customer?.last_name}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Button
                  className="mr-right"
                  onClick={() => {
                    handlePrint();
                  }}>
                  {t('quotation_sale_model.print_recipt')}
                </Button>
                <Button
                  onClick={() => {
                    handlePrint2();
                  }}>
                  {t('quotation_sale_model.print_invoice')}
                </Button>
              </div>
            </div>
            {lines?.products?.length > 0 || true ? (
              <div className="row">
                <div className="invoice-items-container">
                  <div className="header-titles">
                    <div>{t('quotation_sale_model.name')}</div>
                    <div>{t('quotation_sale_model.qty')}</div>
                    <div>{t('quotation_sale_model.amount')}</div>
                    {edit && <div></div>}
                  </div>
                  {lines?.map((line: any, index: number) => {
                    return (
                      <div className="header-items under_items" key={index}>
                        <div>
                          {
                            selectedQuotationProducts.filter((ele) => {
                              if (ele.variant_id) {
                                return ele.variant_id == line?.variant_id;
                              }
                              return ele.product_id == line?.product_id;
                            })[0]?.product_name
                          }
                        </div>
                        <div>{Number(+line?.product_qty).toFixed(0)}</div>
                        <div>
                          {Number(
                            +selectedQuotationProducts.filter((ele) => {
                              if (ele.variant_id) {
                                return ele.variant_id == line?.variant_id;
                              }
                              return ele.product_id == line?.product_id;
                            })[0]?.product_price
                          ).toFixed(locationSettings?.location_decimal_places)}
                        </div>
                      </div>
                    );
                  })}
                  <div className="header-titles under_items" style={{ marginTop: '20px' }}>
                    <div>{t('quotation_sale_model.total')}</div>
                    <div>
                      {(+selectRow.total_price).toFixed(locationSettings?.location_decimal_places)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>loading...</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
export default withAuth(SalesList);

export async function getServerSideProps({ params, locale }) {
  const { id } = params;
  return {
    props: { id, ...(await serverSideTranslations(locale)) },
  };
}
