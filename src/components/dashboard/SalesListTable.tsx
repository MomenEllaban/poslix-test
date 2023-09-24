import React, { useContext, useState, useEffect } from 'react';
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
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faEye,
  faDollarSign,
} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
import { apiFetch, apiFetchCtr } from 'src/libs/dbUtils';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { ILocationSettings, IpaymentRow } from '@models/common-model';
import { UserContext, useUser } from 'src/context/UserContext';
import { useReactToPrint } from 'react-to-print';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import { convertDateStringToDateAndTime } from '../../models/data';
import SalesPaymentModal from '../pos/modals/SalesPaymentModal';
import { cartJobType } from 'src/recoil/atoms';
import { useRecoilState } from 'recoil';
import { findAllData } from 'src/services/crud.api';
import { useAppDispatch } from 'src/hooks';
import { addMultipleToCart, addToCart } from 'src/redux/slices/cart.slice';

export default function SalesListTable(props: any) {
  const { shopId, rules, salesList } = props;
  const dispatch = useAppDispatch();
  const {locationSettings,setLocationSettings }=useUser()

 
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
  
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);
  const [isLoadItems, setIsLoadItems] = useState(false);
  
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  const [handleSearchTxt, setHandleSearchTxt] = useState('');
  const [invoiceDetails, setInvoiceDetails] = useState<any>({});
  const [paymentModalShow, setPaymentModalShow] = useState<boolean>(false);
  const [paymentModalData, setPaymentModalData] = useState({});

  const checkPrintType = async () => {
    const res = await findAllData(`appearance/${router.query.id}`)
    setInvoiceDetails(res.data.result)
  }

  useEffect(() => {
   checkPrintType()
  }, []);
  //table columns
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'contact_name', headerName: 'Customer Name', flex: 1 },
    { field: 'mobile', headerName: 'Mobile', flex: 1, disableColumnMenu: true },
    { field: 'date', headerName: 'Sale Date', flex: 1 },
    // { field: "total_price", headerName: "Final Total ", flex: 1 },
    {
      field: 'sub_total',
      headerName: 'Final Total ',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>{Number(+row.sub_total).toFixed(locationSettings?.location_decimal_places)}</>
      ),
    },
    { field: 'payed', headerName: 'Amount paid', flex: 1 },
    {
      flex: 1,
      field: 'TotalDue',
      headerName: 'Total Due ',
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          {Number(+row.sub_total - +row.payed) > 0
            ? Number(+row.sub_total - +row.payed).toFixed(locationSettings?.location_decimal_places)
            : 0}
        </>
      ),
    },
    {
      flex: 1,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (row.due === 0) {
          return (
            <>
              <div className="sty_Paid">Paid</div>
            </>
          );
        } else if (row.due === row.sub_total) {
          return (
            <>
              <div className="sty_n_Paid">Not Paid</div>
            </>
          );
        } else {
          return (
            <>
              <div className="sty_p_Paid">Partially Paid</div>
            </>
          );
        }
      },
    },
    {
      flex: 1,
      field: 'action',
      headerName: 'Action ',
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
                const res = await findAllData(`sales/${row.id}`)
                dispatch(addMultipleToCart({ location_id: router.query.id, products: res.data.result.products }));
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
              className={`${
                Number(+row.due) > 0
                  ? 'opacity-100 pe-auto'
                  : 'opacity-50 pe-none'
              }`}
              onClick={() => {
                if (Number(+row.due) > 0) {
                  setPaymentModalShow(true);
                  setPaymentModalData({
                    ...row,
                    totalDue:
                      Number(+row.due) > 0
                        ? Number(+row.due).toFixed(
                            locationSettings?.location_decimal_places
                          )
                        : 0,
                  });
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

  const componentRef = React.useRef(null);
  class ComponentToPrint extends React.PureComponent {
    render() {
      if (!selectRow) return;
      return (
        <div className="bill" style={{ width: '100%' }}>
          <div className="brand-logo">
            <img src={invoiceDetails.logo} />
          </div>
          <br />
          <div className="brand-name">{invoiceDetails.name}</div>
          <div className="shop-details">{invoiceDetails.tell}</div>
          <br />
          <div className="bill-details">
            <div className="flex justify-between">
              <div>
                {invoiceDetails.txtCustomer}{' '}
                {invoiceDetails.isMultiLang && invoiceDetails.txtCustomer2}
              </div>
              <div>{selectRow.contact_name}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoiceDetails.orderNo} {invoiceDetails.isMultiLang && invoiceDetails.orderNo2}
              </div>
              <div>{selectRow.id}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoiceDetails.txtDate} {invoiceDetails.isMultiLang && invoiceDetails.txtDate2}
              </div>
              <div>{new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr className="header">
                <th>
                  {invoiceDetails.txtQty}
                  <br />
                  {invoiceDetails.isMultiLang && invoiceDetails.txtQty2}
                </th>
                <th>
                  {invoiceDetails.txtItem}
                  <br />
                  {invoiceDetails.isMultiLang && invoiceDetails.txtItem2}
                </th>
                <th></th>
                <th>
                  {invoiceDetails.txtAmount}
                  <br />
                  {invoiceDetails.isMultiLang && invoiceDetails.txtAmount2}
                </th>
              </tr>
              {lines.length > 0 &&
                lines.map((line: any, index: number) => {
                  return (
                    <tr key={index}>
                      <td>{Number(line.pivot.qty).toFixed(0)}</td>
                      <td>{line.name}</td>
                      <td></td>
                      <td>{+line.pivot.qty * +line.pivot.price}</td>
                    </tr>
                  );
                })}
              <tr className="net-amount">
                <td></td>
                <td>
                  {invoiceDetails.txtTax} {invoiceDetails.isMultiLang && invoiceDetails.txtTax2}
                </td>
                <td></td>
                <td>{(+selectRow.sub_total * +lines[0]?.pivot.tax_amount / 100).toFixed(locationSettings?.location_decimal_places)}</td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td>
                  {invoiceDetails.txtDiscount}{'Discount'}
                  {invoiceDetails.isMultiLang && invoiceDetails.txtDiscount2}
                </td>
                <td></td>
                <td>{(+selectRow?.discount).toFixed(locationSettings?.location_decimal_places)}</td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {invoiceDetails.txtTotal} {invoiceDetails.isMultiLang && invoiceDetails.txtTotal2}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(selectRow.sub_total - +selectRow?.discount).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
            </thead>
          </table>
          <p className="recipt-footer">
            {invoiceDetails.footer}
            {invoiceDetails.isMultiLang && invoiceDetails.footer2}
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
            <img src={invoiceDetails.logo} />
            <div className="invoice-print">
              INVOICE
              <div>
                <table className="GeneratedTable">
                  <tbody>
                    <tr>
                      <td className="td_bg">INVOICE NUMBER </td>
                      <td>{selectRow.id}</td>
                    </tr>
                    <tr>
                      <td className="td_bg">INVOICE DATE </td>
                      <td>{new Date().toISOString().slice(0, 10)}</td>
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
              <div>Global Tech Projects</div>
              <div>info@poslix.com</div>
              <div>+986 2428 8077</div>
              <div>Office 21-22, Building 532, Mazoon St. Muscat, Oman</div>
              <div>VAT Number: OM1100270001</div>
            </div>
            <div className="right_up_of_table">
              <div>Billed To</div>
              <div>{selectRow.contact_name}</div>
              {/* <span>Billed To</span> */}
            </div>
          </div>
          <br />
          {/* <div className="bill-details">
                        <div className="flex justify-between">
                            <div>{invoiceDetails.txtCustomer} {invoiceDetails.isMultiLang && invoiceDetails.txtCustomer2}</div>
                            <div>{selectRow.customer_name}</div>
                        </div>
                        <div className="flex justify-between">
                            <div>{invoiceDetails.orderNo} {invoiceDetails.isMultiLang && invoiceDetails.orderNo2}</div>
                            <div>{selectRow.id}</div>
                        </div>
                        <div className="flex justify-between">
                            <div>{invoiceDetails.txtDate} {invoiceDetails.isMultiLang && invoiceDetails.txtDate2}</div>
                            <div>{new Date().toISOString().slice(0, 10)}</div>
                        </div>
                    </div> */}

          <table className="GeneratedTable2">
            <thead>
              <tr>
                <th>Description</th>
                <th>
                  {' '}
                  {invoiceDetails.txtQty}
                  <br />
                  {invoiceDetails.isMultiLang && invoiceDetails.txtQty2}
                </th>
                <th>Unit Price</th>
                {/* <th> {invoiceDetails.txtItem}<br />{invoiceDetails.isMultiLang && invoiceDetails.txtItem2}</th> */}
                <th>Tax</th>
                <th>
                  {' '}
                  {invoiceDetails.txtAmount}
                  <br />
                  {invoiceDetails.isMultiLang && invoiceDetails.txtAmount2}
                </th>
              </tr>
            </thead>
            {lines.length > 0 &&
              lines.map((line: any, index: number) => {
                return (
                  <tr key={index}>
                    <td>{line.name}</td>
                    <td>{Number(line.qty).toFixed(0)}</td>
                    <td>{line.price}</td>
                    <td></td>
                    <td>{line.price * Number(line.qty)}</td>
                  </tr>
                );
              })}

            <tbody>
              <tr>
                {/* <td>{invoiceDetails.txtTax} {invoiceDetails.isMultiLang && invoiceDetails.txtTax2}</td> */}
                <td colSpan={4} className="txt_bold_invoice">
                  Sub Total
                </td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={4} className="txt_bold_invoice">
                  {invoiceDetails.txtTotal} {invoiceDetails.isMultiLang && invoiceDetails.txtTotal2}
                </td>
                <td className="txt_bold_invoice">
                  {Number(selectRow.total_price).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* <table className="table">
            <thead>
              <tr className="header">
                <th>
                  {invoiceDetails.txtQty}<br />{invoiceDetails.isMultiLang && invoiceDetails.txtQty2}
                </th>
                <th>
                  {invoiceDetails.txtItem}<br />{invoiceDetails.isMultiLang && invoiceDetails.txtItem2}
                </th>
                <th>
                </th>
                <th>
                  {invoiceDetails.txtAmount}<br />{invoiceDetails.isMultiLang && invoiceDetails.txtAmount2}
                </th>
              </tr>
              {lines.length > 0 && lines.map((line: any, index: number) => {
                return (
                  <tr key={index}>
                    <td>{Number(line.qty)}</td>
                    <td>{line.name}</td>
                    <td></td>
                    <td>{line.price}</td>
                  </tr>
                );
              })}
              <tr className="net-amount">
                <td></td>
                <td>{invoiceDetails.txtTax} {invoiceDetails.isMultiLang && invoiceDetails.txtTax2}</td>
                <td></td>
                <td>{(selectRow.total_price).toFixed(locationSettings?.location_decimal_places)}</td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className='txt-bold'>{invoiceDetails.txtTotal} {invoiceDetails.isMultiLang && invoiceDetails.txtTotal2}</td>
                <td></td>
                <td className='txt-bold'>{Number(selectRow.total_price).toFixed(locationSettings?.location_decimal_places)}</td>
              </tr>
            </thead>
          </table> */}
          <p className="recipt-footer">
            {invoiceDetails.footer}
            <br />
            {invoiceDetails.footersecond}
            {invoiceDetails.isMultiLang && invoiceDetails.footer2}
          </p>
          <p className="recipt-footer">{selectRow.notes}</p>
          <br />
        </div>
      );
    }
  }
  
  // init sales data
  async function initDataPage() {
    // const { success, newdata } = await apiFetchCtr({
    //   fetch: 'transactions',
    //   subType: 'getSales',
    //   shopId,
    // });
    // if (success) {
    //   setSales(newdata.data);
    //   if (newdata.invoiceDetails != null && newdata.invoiceDetails.length > 10)
    //     setinvoiceDetails(JSON.parse(newdata.invoiceDetails));
    // }
  }

  const getItems = async (id: number) => {
    setIsLoadItems(true);
    const res = await findAllData(`sales/${id}`)
    if (res.data.success) {
      setLines(res.data.result.products);
      setIsLoadItems(false);
    }
  }

  useEffect(() => {
    var _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );
    else alert('errorr location settings');

    initDataPage();
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
  return (
    <>
      <ToastContainer />
      <AlertDialog
        alertShow={show}
        alertFun={handleDeleteFuc}
        shopId={shopId}
        id={selectId}
        url={'sales'}>
        Are you Sure You Want Delete This Item ?
      </AlertDialog>
      <div style={{ display: 'none' }}>
        <ComponentToPrint ref={componentRef} />
      </div>
      <div style={{ display: 'none' }}>
        <ComponentToPrint2 ref={componentRef2} />
      </div>
      <div className="page-content-style card">
        <h5>Salse List</h5>
        {salesList.data && <DataGrid
          className="datagrid-style"
          sx={{
            '.MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '&.MuiDataGrid-root': {
              border: 'none',
            },
          }}
          rows={salesList.data}
          columns={columns}
          initialState={{
            columns: { columnVisibilityModel: { mobile: false } },
          }}
          pageSize={10}
          rowsPerPageOptions={[10]}
          components={{ Toolbar: CustomToolbar }}
        />}
      </div>
      {/* FOR VIEW ELEMENT */}
      <Dialog open={showViewPopUp} fullWidth={true} className="poslix-modal" onClose={handleClose}>
        <DialogTitle className="poslix-modal text-primary">
          {edit ? 'Edit Sale' : 'Sale Details'}
        </DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="poslix-modal">
            <div className="top-section-details">
              <img src={invoiceDetails.logo} style={{ width: '80px', marginBottom: '10px' }} />
              <div className="item-sections">
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>Invoice No :</p>
                    <p>{selectRow.id}</p>
                  </div>
                  <div className="top-detials-item pe-2">
                    <p>Invoice Date :</p>
                    {edit ? (
                      <input
                        type="text"
                        className="form-control"
                        value={convertDateStringToDateAndTime(selectRow.date)}
                      />
                    ) : (
                      <p>{convertDateStringToDateAndTime(selectRow.date)}</p>
                    )}
                  </div>
                  <div className="top-detials-item pe-2">
                    <p>Added By :</p>
                    {edit ? (
                      <input type="text" className="form-control" value={selectRow.user_name} />
                    ) : (
                      <p>{selectRow.user_name}</p>
                    )}
                  </div>
                </div>
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>Final Total :</p>
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
                    <p>Customer Name :</p>
                    {edit ? (
                      <input type="text" className="form-control" value={selectRow.customer_name} />
                    ) : (
                      <p>{selectRow.contact_name}</p>
                    )}
                  </div>
                  <div className="top-detials-item" style={{ fontSize: '13px' }}>
                    <p>Order Note</p>
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
                    Print Recipt
                  </Button>
                  <Button
                    onClick={() => {
                      handlePrint2();
                    }}>
                    Print Invoice
                  </Button>
                </div>
              )}
            </div>
            {lines.length > 0 && !isLoadItems ? (
              <div className="row">
                <div className="invoice-items-container">
                  <div className="header-titles">
                    <div>Name</div>
                    <div>Qty</div>
                    <div>Amount</div>
                    {edit && <div></div>}
                  </div>
                  {lines.length > 0 && lines?.map((line: any, index: number) => {
                    return (
                      <div className="header-items under_items" key={index}>
                        <div>{line.name}</div>
                        <div>
                          {edit ? (
                            <input
                              type="text"
                              className="form-control"
                              value={Number(+line.pivot.qty).toFixed(0)}
                            />
                          ) : (
                            Number(+line.pivot.qty).toFixed(0)
                          )}
                        </div>
                        <div>
                          {Number(+line.pivot.qty * +line.pivot.price).toFixed(locationSettings?.location_decimal_places)}
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
                    <div>Total</div>
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
              <div>loading...</div>
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
              Save
            </Button>
          )}
          <Button
            onClick={() => {
              setEdit(false);
              setShowViewPopUp(false);
            }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <SalesPaymentModal
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
