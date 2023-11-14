import { faDollarSign, faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IpaymentRow } from '@models/common-model';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState, isValidElement } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import { ToastContainer } from 'react-toastify';
import { useRecoilState } from 'recoil';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Toastify } from 'src/libs/allToasts';
import { cartJobType } from 'src/recoil/atoms';
import { addMultipleToCart, selectCartByLocation } from 'src/redux/slices/cart.slice';
import { findAllData } from 'src/services/crud.api';
import SalesPaymentModal from '../pos/modals/SalesPaymentModal';
import { useAppDispatch, useAppSelector } from 'src/hooks';

export default function SalesListTable({
  id,
  shopId,
  t,
  rules,
  salesList,
  loading,
  CustomPagination,
}: any) {
  const dispatch = useAppDispatch();
  const componentRef = useRef(null);
  const [locationSettings, setLocationSettings] = useState<any>();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [sales, setSales] = useState<any>([]);
  const router = useRouter();
  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({});
  const [, setJobType] = useRecoilState(cartJobType);
  const [lines, setLines] = useState<any>([]);
  const [tax, setTax] = useState<any>();
  const [salesRep, setSalesRep] = useState<any>({});

  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);
  const [isLoadItems, setIsLoadItems] = useState(false);

  const [showViewPopUp, setShowViewPopUp] = useState(false);
  const [handleSearchTxt, setHandleSearchTxt] = useState('');
  const [invoiceDetails, setInvoiceDetails] = useState<any>({});
  const [paymentModalShow, setPaymentModalShow] = useState<boolean>(false);
  const [paymentModalData, setPaymentModalData] = useState({});
  const selectCartForLocation = selectCartByLocation(shopId);
  const cart = useAppSelector(selectCartForLocation);

  const checkPrintType = async () => {
    const res = await findAllData(`appearance/${router.query.id}`);
    setInvoiceDetails({
      ...res.data.result,
      en: { ...res.data.result.en, is_multi_language: !!res.data.result.en.is_multi_language },
    });
  };

  useEffect(() => {
    checkPrintType();
  }, []);
  //table columns
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    {
      field: 'contact_name',
      headerName: t('invoices.customer_name'),
      flex: 1,
      renderCell({ row }) {
        return row.contact_name !== ' ' ? row.contact_name : 'walk-in customer';
      },
    },
    { field: 'mobile', headerName: 'Mobile', flex: 1, disableColumnMenu: true },
    { field: 'date', headerName: t('invoices.sale_date'), flex: 1 },
    {
      field: 'total',
      headerName: t('invoices.final_total'),
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        Number(+row.total).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'payed',
      headerName: t('invoices.amount_paid'),
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        Number(+row.payed).toFixed(locationSettings?.location_decimal_places),
    },
    {
      flex: 1,
      field: 'due',
      headerName: t('invoices.total_due'),
      renderCell: ({ row }: Partial<GridRowParams>) => {
        let renderdDue = Number(+row.due);
        if (renderdDue < 0) {
          renderdDue = 0;
        }
        return <>{renderdDue.toFixed(locationSettings?.location_decimal_places)}</>;
      },
    },
    {
      flex: 1,
      field: 'status',
      headerName: t('invoices.status'),
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (row.due === 0 || row.due < 0) {
          return <div className="sty_Paid">Paid</div>;
        }
        if (row.due === row.sub_total) {
          return <div className="sty_n_Paid">Not Paid</div>;
        }
        return <div className="sty_p_Paid">Partially Paid</div>;
      },
    },
    {
      flex: 1,
      field: 'action',
      headerName: t('invoices.action'),
      filterable: false,
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            <Button
              onClick={async () => {
                // setEdit(true);
                // onRowsSelectionHandler(row);
                setJobType({
                  req: 3,
                  val: row.id,
                });
                const res = await findAllData(`sales/${row.id}`);
                dispatch(
                  addMultipleToCart({
                    location_id: router.query.id,
                    products: res.data.result.products,
                    orderId: row.id,
                    customerId: row.contact_id,
                    lastTotal: row.sub_total,
                    lastDue: +row.due,
                  })
                );
                router.push('/pos/' + router.query.id);
              }}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
            {rules.hasDelete && (
              <Button
                onClick={() => {
                  setSelectId(row.id);
                  setShow(true);
                }}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
            <Button
              onClick={() => {
                onRowsSelectionHandler(row);
              }}>
              <FontAwesomeIcon icon={faEye} />
            </Button>
            <Button
              className={`${Number(+row.due) > 0 ? 'opacity-100 pe-auto' : 'opacity-50 pe-none'}`}
              onClick={() => {
                if (Number(+row.due) > 0) {
                  getItems(row.id);
                  setSelectRow(row);
                  setPaymentModalData({
                    ...row,
                    totalDue:
                      Number(+row.due) > 0
                        ? Number(+row.due).toFixed(locationSettings?.location_decimal_places)
                        : 0,
                  });
                  setPaymentModalShow(true);
                }
              }}>
              <FontAwesomeIcon icon={faDollarSign} />
            </Button>
          </ButtonGroup>
          {/*edited*/}
          {/* <TestModal statusDialog={paymentModalShow} open={setPaymentModalShow}></TestModal> */}
        </>
      ),
    },
  ];

  class ComponentToPrint extends React.PureComponent {
    render() {
      const { tax } = this.props;

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
              <div>{selectRow.contact_name}</div>
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
                {salesRep?.created_at
                  ? new Date(salesRep?.created_at).toISOString().slice(0, 10)
                  : new Date().toISOString().slice(0, 10)}
              </div>
            </div>
          </div>
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
              {lines.length > 0 &&
                lines.map((line: any, index: number) => {
                  return (
                    <tr key={index}>
                      <td>{Number(line.product_qty).toFixed(0)}</td>
                      <td>{line.product_name}</td>
                      <td></td>
                      <td>
                        {Number(+line.product_price).toFixed(
                          locationSettings?.location_decimal_places
                        )}
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
                   {(+selectRow?.tax ||(+tax/100*+selectRow.sub_total)
                  ).toFixed(locationSettings?.location_decimal_places)}
                               {/* {(
                    ((+selectRow.sub_total / (1 + +selectRow?.tax / 100)) * +selectRow?.tax) /
                    100
                  ).toFixed(locationSettings?.location_decimal_places)} */}
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
                <td>{(+selectRow?.discount).toFixed(locationSettings?.location_decimal_places)}</td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {invoiceDetails?.en?.txtTotal}{' '}
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtTotal}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(selectRow.sub_total - +selectRow?.discount).toFixed(
                    locationSettings?.location_decimal_places
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
                  {Number(selectRow.payed).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  Total Due {invoiceDetails?.en?.is_multi_language && 'المتبقى'}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(selectRow.discount).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
            </thead>
          </table>
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
                        {salesRep?.created_at
                          ? new Date(salesRep?.created_at).toISOString().slice(0, 10)
                          : new Date().toISOString().slice(0, 10)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <br />
          {/* <div className="brand-name">
                        {invoiceDetails.name}
                    </div> */}
          {/* <div className="shop-details">
                        {invoiceDetails.tell}
                    </div> */}
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
              <div>{selectRow.contact_name}</div>
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
            {lines.length > 0 &&
              lines.map((line: any, index: number) => {
                return (
                  <tr key={index}>
                    <td>{line.product_name}</td>
                    <td>{Number(line.product_qty).toFixed(0)}</td>
                    <td>
                      {Number(line.product_price).toFixed(locationSettings?.location_decimal_places)}
                    </td>
                    <td>
                      {Number((+tax / 100) * +line.product_price).toFixed(
                        locationSettings?.location_decimal_places
                      )}
                    </td>
                    <td>
                      {Number(+line.product_qty * +line.product_price).toFixed(
                        locationSettings?.location_decimal_places
                      )}
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
                  {Number(selectRow.sub_total).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="txt_bold_invoice">
                  Total Paid {invoiceDetails?.en?.is_multi_language && 'إجمالى المدفوعات'}
                </td>
                <td className="txt_bold_invoice">
                  {Number(selectRow.payed).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="txt_bold_invoice">
                  Total Due {invoiceDetails?.en?.is_multi_language && 'المتبقى'}
                </td>
                <td className="txt_bold_invoice">
                  {Number(selectRow.due).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
            </tbody>
          </table>
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
  const getItems = async (id: number) => {
    setIsLoadItems(true);
    const res = await findAllData(`sales/${id}`);
    if (res.data.success) {
      setSalesRep(res.data.result);
      setLines(res.data.result.products);
      setTax(res.data.result.tax_amount)
      setIsLoadItems(false);
    }
  };

  useEffect(() => {
    let _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
        _locs.findIndex((loc: any) => {
          return loc.value == id;
        })
        ]
      );

    // initDataPage();
  }, [router.asPath]);

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (result) {
      const _data = [...sales];
      const idx = _data.findIndex((itm: any) => itm.id == selectId);
      if (idx != -1) {
        _data.splice(idx, 1);
        setSales(_data);
      }
    }
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
  };

  // function to edite payment
  const handelPaymentFun = (_row: IpaymentRow, userData: any) => {
    const _data = [...sales];
    const idx = _data.findIndex((itm: any) => itm.id == userData.id);
    if (idx != -1) {
      if (_row.amount.toString() !== 'NaN') {
        _data[idx].amount =
          _data[idx].amount === null
            ? `${_row.amount}.000`
            : `${+_row.amount + parseFloat(_data[idx].amount)}.000`;
      } else {
        _data[idx].amount =
          _data[idx].amount === null
            ? userData.totalDue
            : `${parseFloat(_data[idx].amount) + parseFloat(userData.totalDue)}.000`;
      }
      setSales(_data);
      setSelectRow(_data[idx]);
      setSelectId(_data[idx].id);
      getItems(_data[idx].id);
      // setSelectRow(_data[idx]);
    }
    setTimeout(() => {
      handlePrint();
    }, 3000);
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
        <GridToolbarColumnsButton />
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
  const onRowsSelectionHandler = (selectedRowsData: any) => {
    setSelectRow(selectedRowsData);
    setSelectId(selectedRowsData.id);
    getItems(selectedRowsData.id);
    setShowViewPopUp(true);
  };
  const handleSearch = (e: any) => {
    setHandleSearchTxt(e.target.value);
  };

  type _C = {
    Toolbar: () => React.JSX.Element;
    Pagination?: () => React.JSX.Element;
  };

  const handleComponentsDataGrid = () => {
    let components: _C = {
      Toolbar: CustomToolbar,
    };

    if (isValidElement(<CustomPagination />)) {
      components.Pagination = CustomPagination;
    }

    return components;
  };

  return (
    <>
      <ToastContainer />
      <AlertDialog
        alertShow={show}
        alertFun={handleDeleteFuc}
        shopId={shopId}
        id={selectId}
        url={'sales'}>
        {t('alert_dialog.delete_msg')}
      </AlertDialog>
      <div style={{ display: 'none' }}>
        <ComponentToPrint tax={cart?.cartTax} ref={componentRef} />
      </div>
      <div style={{ display: 'none' }}>
        <ComponentToPrint2 ref={componentRef2} />
      </div>
      <div className="page-content-style card">
        <h5>{t('invoices.invoices_list')}</h5>
        {/* {salesList.data && ( */}
        <DataGrid
          className="datagrid-style"
          sx={{
            '.MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '&.MuiDataGrid-root': {
              border: 'none',
            },
          }}
          loading={loading}
          rows={salesList.data || []}
          columns={columns}
          initialState={{
            columns: { columnVisibilityModel: { mobile: false } },
          }}
          // pageSize={10}
          // rowsPerPageOptions={[0]}
          components={handleComponentsDataGrid()}
        />
        {/* )} */}
      </div>
      {/* FOR VIEW ELEMENT */}
      <Dialog open={showViewPopUp} fullWidth={true} className="poslix-modal" onClose={handleClose}>
        <DialogTitle className="poslix-modal text-primary">
          {edit ? 'Edit Sale' : t('quotation_sale_model.sale_details')}
        </DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="poslix-modal">
            <div className="top-section-details">
              <img src={invoiceDetails?.en?.logo} style={{ width: '80px', marginBottom: '10px' }} />
              <div className="item-sections">
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>{t('quotation_sale_model.invoice_no')} :</p>
                    <p>{selectRow.id}</p>
                  </div>
                  <div className="top-detials-item pe-2">
                    <p>{t('quotation_sale_model.invoice_date')} :</p>
                    {edit ? (
                      <input
                        type="text"
                        className="form-control"
                        value={new Date(salesRep?.created_at).toLocaleString()}
                      />
                    ) : (
                      <p>{new Date(salesRep?.created_at).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="top-detials-item pe-2">
                    <p>{t('quotation_sale_model.added_by')} :</p>
                    {edit ? (
                      <input type="text" className="form-control" value={selectRow.user_name} />
                    ) : (
                      <p>{selectRow.user_name}</p>
                    )}
                  </div>
                </div>
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>{t('quotation_sale_model.final_total')} :</p>
                    {edit ? (
                      <input
                        type="text"
                        className="form-control"
                        value={Number(selectRow.sub_total).toFixed(
                          locationSettings?.location_decimal_places
                        )}
                      />
                    ) : (
                      <p>
                        {Number(selectRow.sub_total).toFixed(
                          locationSettings?.location_decimal_places
                        )}
                      </p>
                    )}
                  </div>
                  <div className="top-detials-item">
                    <p>{t('quotation_sale_model.customer_name')} :</p>
                    {edit ? (
                      <input type="text" className="form-control" value={selectRow.customer_name} />
                    ) : (
                      <p>{selectRow.contact_name}</p>
                    )}
                  </div>
                  <div className="top-detials-item" style={{ fontSize: '13px' }}>
                    <p>{t('quotation_sale_model.order_note')}</p>
                    {edit ? (
                      <input type="text" className="form-control" value={selectRow.notes} />
                    ) : (
                      <p>{selectRow.notes}</p>
                    )}
                  </div>
                </div>
              </div>
              {!edit && (
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
              )}
            </div>
            {lines.length > 0 && !isLoadItems ? (
              <div className="row">
                <div className="invoice-items-container">
                  <div className="header-titles">
                    <div>{t('quotation_sale_model.name')}</div>
                    <div>{t('quotation_sale_model.qty')}</div>
                    <div>{t('quotation_sale_model.amount')}</div>
                    {edit && <div></div>}
                  </div>
                  {lines.length > 0 &&
                    lines?.map((line: any, index: number) => {
                      return (
                        <div className="header-items under_items" key={index}>
                          <div>{line.product_name}</div>
                          <div>
                            {edit ? (
                              <input
                                type="text"
                                className="form-control"
                                value={Number(+line.product_qty).toFixed(0)}
                              />
                            ) : (
                              Number(+line.product_qty).toFixed(0)
                            )}
                          </div>
                          <div>
                            {Number(+line.product_price).toFixed(
                              locationSettings?.location_decimal_places
                            )}
                          </div>
                          {edit && (
                            <div>
                              <b>x</b>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  <div className="header-titles under_items" style={{ marginTop: '20px' }}>
                    <div></div>
                    <div>{t('quotation_sale_model.total')}</div>
                    <div>
                      {edit ? (
                        <input
                          type="text"
                          className="form-control"
                          value={(+selectRow.sub_total - +selectRow?.discount).toFixed(
                            locationSettings?.location_decimal_places
                          )}
                        />
                      ) : (
                        (+selectRow.sub_total - +selectRow?.discount).toFixed(
                          locationSettings?.location_decimal_places
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>{t('quotation_sale_model.loading')}</div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          {edit && (
            <Button
              onClick={() => {
                setShowViewPopUp(false);
                setEdit(false);
              }}>
              {t('quotation_sale_model.save')}
            </Button>
          )}
          <Button
            onClick={() => {
              setEdit(false);
              setShowViewPopUp(false);
            }}>
            {t('quotation_sale_model.cancel')}
          </Button>
        </DialogActions>
      </Dialog>

      <SalesPaymentModal
        t={t}
        userData={paymentModalData}
        statusDialog={paymentModalShow}
        setPaymentModalShow={setPaymentModalShow}
        setPaymentModalData={setPaymentModalData}
        location={locationSettings?.location_name}
        shopId={shopId}
        completeHandele={handelPaymentFun}
        handlePrint={handlePrint}
      />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;
  return {
    props: { id },
  };
}
