import React, { useContext, useState, useEffect } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbar,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faEye,
  faCheck,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
import { apiFetch, apiFetchCtr } from 'src/libs/dbUtils';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { ILocationSettings, ITokenVerfy } from '@models/common-model';
import * as cookie from 'cookie';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { UserContext } from 'src/context/UserContext';
import { useReactToPrint } from 'react-to-print';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import { findAllData } from 'src/services/crud.api';

export default function SalesList(props: any) {
  const { id } = props;
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [sales, setsales] = useState<any>([]);
  const router = useRouter();
  const shopId = router.query.id
  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({});
  const [lines, setLines] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);
  const [isLoadItems, setIsLoadItems] = useState(false);
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  const [handleSearchTxt, setHandleSearchTxt] = useState('');
  const { setInvoicDetails, invoicDetails } = useContext(UserContext);
  const [accept, setAccept] = useState(false);

  //table columns
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    {
      field: 'customer_name', headerName: 'Customer Name', flex: 1, renderCell: ({ row }: Partial<GridRowParams>) => {
        return row.first_name + ' ' + row.last_name
      }
    },
    { field: 'sale_date', headerName: 'Quotation Date', flex: 1 },
    {
      flex: 1,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (Number(+row.total_price - +row.amount) === 0) {
          return (
            <>
              <div className="sty_Accepted">Accepted</div>
            </>
          );
        } else if (Number(+row.total_price - +row.amount) === Number(row.total_price)) {
          return (
            <>
              <div className="sty_Cancled">Cancled</div>
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
      headerName: 'Action ',
      filterable: false,
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            <Button onClick={() => {
              localStorage.setItem('currentQuotation', JSON.stringify(row))
              router.push('/shop/' + shopId + '/quotations/edit');
            }}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
            <Button onClick={() => {
              setSelectId(row.id);
              setShow(true);
            }}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
            <Button onClick={() => { }}>
              <FontAwesomeIcon icon={faEye} />
            </Button>
            {/* <Button onClick={() => {}}>
              <FontAwesomeIcon icon={faCheck} />
            </Button>
            <Button onClick={() => {}}>
              <FontAwesomeIcon icon={faXmark} />
            </Button> */}
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
            <img src={invoicDetails.logo} />
          </div>
          <br />
          <div className="brand-name">{invoicDetails.name}</div>
          <div className="shop-details">{invoicDetails.tell}</div>
          <br />
          <div className="bill-details">
            <div className="flex justify-between">
              <div>
                {invoicDetails.txtCustomer}{' '}
                {invoicDetails.isMultiLang && invoicDetails.txtCustomer2}
              </div>
              <div>{selectRow.customer_name}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoicDetails.orderNo} {invoicDetails.isMultiLang && invoicDetails.orderNo2}
              </div>
              <div>{selectRow.id}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoicDetails.txtDate} {invoicDetails.isMultiLang && invoicDetails.txtDate2}
              </div>
              <div>{new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr className="header">
                <th>
                  {invoicDetails.txtQty}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtQty2}
                </th>
                <th>
                  {invoicDetails.txtItem}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtItem2}
                </th>
                <th></th>
                <th>
                  {invoicDetails.txtAmount}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtAmount2}
                </th>
              </tr>
              {lines &&
                lines.map((line: any, index: number) => {
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
                <td>
                  {invoicDetails.txtTax} {invoicDetails.isMultiLang && invoicDetails.txtTax2}
                </td>
                <td></td>
                {/* <td>{(selectRow.total_price).toFixed(locationSettings?.location_decimal_places)}</td> */}
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {invoicDetails.txtTotal} {invoicDetails.isMultiLang && invoicDetails.txtTotal2}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(selectRow.total_price).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
            </thead>
          </table>
          <p className="recipt-footer">
            {invoicDetails.footer}
            {invoicDetails.isMultiLang && invoicDetails.footer2}
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
            <img src={invoicDetails.logo} />
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
                        {invoicDetails.name}
                    </div> */}
          {/* <div className="shop-details">
                        {invoicDetails.tell}
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
              <div>{selectRow.customer_name}</div>
              {/* <span>Billed To</span> */}
            </div>
          </div>
          <br />
          {/* <div className="bill-details">
                        <div className="flex justify-between">
                            <div>{invoicDetails.txtCustomer} {invoicDetails.isMultiLang && invoicDetails.txtCustomer2}</div>
                            <div>{selectRow.customer_name}</div>
                        </div>
                        <div className="flex justify-between">
                            <div>{invoicDetails.orderNo} {invoicDetails.isMultiLang && invoicDetails.orderNo2}</div>
                            <div>{selectRow.id}</div>
                        </div>
                        <div className="flex justify-between">
                            <div>{invoicDetails.txtDate} {invoicDetails.isMultiLang && invoicDetails.txtDate2}</div>
                            <div>{new Date().toISOString().slice(0, 10)}</div>
                        </div>
                    </div> */}

          <table className="GeneratedTable2">
            <thead>
              <tr>
                <th>Description</th>
                <th>
                  {' '}
                  {invoicDetails.txtQty}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtQty2}
                </th>
                <th>Unit Price</th>
                {/* <th> {invoicDetails.txtItem}<br />{invoicDetails.isMultiLang && invoicDetails.txtItem2}</th> */}
                <th>Tax</th>
                <th>
                  {' '}
                  {invoicDetails.txtAmount}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtAmount2}
                </th>
              </tr>
            </thead>
            {lines &&
              lines.map((line: any, index: number) => {
                return (
                  <tr key={index}>
                    <td>{line.name}</td>
                    <td>{Number(line.qty)}</td>
                    <td>{line.price}</td>
                    <td></td>
                    <td>{line.price * Number(line.qty)}</td>
                  </tr>
                );
              })}

            <tbody>
              <tr>
                {/* <td>{invoicDetails.txtTax} {invoicDetails.isMultiLang && invoicDetails.txtTax2}</td> */}
                <td colSpan={4} className="txt_bold_invoice">
                  Sub Total
                </td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={4} className="txt_bold_invoice">
                  {invoicDetails.txtTotal} {invoicDetails.isMultiLang && invoicDetails.txtTotal2}
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
                  {invoicDetails.txtQty}<br />{invoicDetails.isMultiLang && invoicDetails.txtQty2}
                </th>
                <th>
                  {invoicDetails.txtItem}<br />{invoicDetails.isMultiLang && invoicDetails.txtItem2}
                </th>
                <th>
                </th>
                <th>
                  {invoicDetails.txtAmount}<br />{invoicDetails.isMultiLang && invoicDetails.txtAmount2}
                </th>
              </tr>
              {lines && lines.map((line: any, index: number) => {
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
                <td>{invoicDetails.txtTax} {invoicDetails.isMultiLang && invoicDetails.txtTax2}</td>
                <td></td>
                <td>{(selectRow.total_price).toFixed(locationSettings?.location_decimal_places)}</td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className='txt-bold'>{invoicDetails.txtTotal} {invoicDetails.isMultiLang && invoicDetails.txtTotal2}</td>
                <td></td>
                <td className='txt-bold'>{Number(selectRow.total_price).toFixed(locationSettings?.location_decimal_places)}</td>
              </tr>
            </thead>
          </table> */}
          <p className="recipt-footer">
            {invoicDetails.footer}
            <br />
            {invoicDetails.footersecond}
            {invoicDetails.isMultiLang && invoicDetails.footer2}
          </p>
          <p className="recipt-footer">{selectRow.notes}</p>
          <br />
        </div>
      );
    }
  }

  async function viewTransaction() {
    setShowViewPopUp(true);
    var result = await apiFetch({
      fetch: 'getSellLinesByTransactionId',
      data: { id: selectId },
    });
    const { success, newdata } = result;
    if (success) {
      setLines(newdata.sellLines);
    }
  }
  // init sales data
  async function initDataPage() {
    const res = await findAllData('quotations-list')
    if (res.data.success) {
      setsales(res.data.result.quotationsList);
      // if (res.data.result.invoiceDetails != null && res.data.result.invoiceDetails.length > 10)
      //   setInvoicDetails(JSON.parse(res.data.result.invoiceDetails));
    }
  }

  async function getItems(id: number) {
    setIsLoadItems(true);
    const { success, newdata } = await apiFetchCtr({
      fetch: 'transactions',
      subType: 'getSaleItems',
      shopId,
      id,
    });
    if (success) {
      setLines(newdata);
      setIsLoadItems(false);
    }
  }

  const [permissions, setPermissions] = useState<any>();

  useEffect(() => {
    localStorage.getItem('currentQuotation') ? localStorage.removeItem('currentQuotation') : null

    const perms = JSON.parse(localStorage.getItem('permissions')).filter(loc => loc.id == router.query.id)
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
          return loc.value == shopId;
        })
        ]
      );

    initDataPage();
  }, [router.asPath]);

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (result) {
      const _data = [...sales];
      console.log(selectId);
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
    <AdminLayout shopId={id}>
      <ToastContainer />
      <AlertDialog
        alertShow={show}
        alertFun={handleDeleteFuc}
        shopId={id}
        id={selectId}
        url="quotations-list">
        Are you Sure You Want Delete This Item ?
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
            <FontAwesomeIcon icon={faPlus} /> Add Quotation{' '}
          </button>
        </div>
        <h5>Quotations List</h5>
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
      {/* FOR VIEW ELEMENT */}
      <Dialog open={showViewPopUp} fullWidth={true} className="poslix-modal" onClose={handleClose}>
        <DialogTitle className="poslix-modal text-primary">
          {edit ? 'Edit Sale' : 'Sale Details'}
        </DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="poslix-modal">
            <div className="top-section-details">
              <img src={invoicDetails.logo} style={{ width: '80px', marginBottom: '10px' }} />
              <div className="item-sections">
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>Invoice No :</p>
                    <p>{selectRow.id}</p>
                  </div>
                  <div className="top-detials-item pe-2">
                    <p>Invoice Date :</p>
                    {edit ? (
                      <input type="text" className="form-control" value={selectRow.sale_date} />
                    ) : (
                      <p>{selectRow.sale_date}</p>
                    )}
                  </div>
                  <div className="top-detials-item pe-2">
                    <p>Added By :</p>
                    {edit ? (
                      <input type="text" className="form-control" value={selectRow.added_by} />
                    ) : (
                      <p>{selectRow.added_by}</p>
                    )}
                  </div>
                </div>
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>Final Total :</p>
                    {edit ? (
                      <input type="text" className="form-control" value={selectRow.total_price} />
                    ) : (
                      <p>{selectRow.total_price}</p>
                    )}
                  </div>
                  <div className="top-detials-item">
                    <p>Customer Name :</p>
                    {edit ? (
                      <input type="text" className="form-control" value={selectRow.customer_name} />
                    ) : (
                      <p>{selectRow.customer_name}</p>
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
                  <div className="top-detials-item" style={{ fontSize: '13px' }}>
                    <p>Status</p>
                    {edit ? (
                      <input type="text" className="form-control" value={selectRow.status} />
                    ) : (
                      <p>{selectRow.status}</p>
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
            {lines && !isLoadItems ? (
              <div className="row">
                <div className="invoice-items-container">
                  <div className="header-titles">
                    <div>Name</div>
                    <div>Qty</div>
                    <div>Amount</div>
                    {edit && <div></div>}
                  </div>
                  {lines.map((line: any, index: number) => {
                    return (
                      <div className="header-items under_items" key={index}>
                        <div>{line.name}</div>
                        <div>
                          {edit ? (
                            <input type="text" className="form-control" value={Number(line.qty)} />
                          ) : (
                            Number(line.qty)
                          )}
                        </div>
                        <div>{line.price}</div>
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
                        <input type="text" className="form-control" value={selectRow.total_price} />
                      ) : (
                        selectRow.total_price
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>laoding...</div>
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
    </AdminLayout>
  );
}
export async function getServerSideProps({ params }) {
  const { id } = params
  return {
    props: { id },
  }
}