import { AdminLayout } from '@layout';
import { IItemSalesReport } from '@models/reports.types';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import {
  DataGrid,
  GridColDef,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import withAuth from 'src/HOCs/withAuth';
import DatePicker from 'src/components/filters/Date';
import AlertDialog from 'src/components/utils/AlertDialog';
import { useUser } from 'src/context/UserContext';
import { apiFetch, apiFetchCtr } from 'src/libs/dbUtils';
import api from 'src/utils/app-api';

function ItemsReport() {
  const router = useRouter();
  const shopId = router.query.id;

  const { locationSettings, invoicDetails } = useUser();

  const [sales, setSales] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({});
  const [lines, setLines] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [isLoadItems, setIsLoadItems] = useState(false);
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  const [handleSearchTxt, setHandleSearchTxt] = useState('');
  const [details, setDetails] = useState({ subTotal: 1, tax: 0, cost: 0 });
  const [filteredSales, setFilteredSales] = useState<any>([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [strSelectedDate, setStrSelectedDate] = useState([]);
  const [selectedDateVlaue, setSelectedDateValue] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customersOptions, setCustomersOptions] = useState([]);

  useEffect(() => {
    let localFilteredSales = [];
    if (strSelectedDate.length === 2) {
      const filteredList = sales.filter((sale) => {
        const dateCreated = sale.created_at.split(' ')[0];
        return (
          new Date(dateCreated).getDate() >= new Date(strSelectedDate[0]).getDate() &&
          new Date(dateCreated).getMonth() >= new Date(strSelectedDate[0]).getMonth() &&
          new Date(dateCreated).getFullYear() >= new Date(strSelectedDate[0]).getFullYear() &&
          new Date(dateCreated).getDate() <= new Date(strSelectedDate[1]).getDate() &&
          new Date(dateCreated).getMonth() <= new Date(strSelectedDate[1]).getMonth() &&
          new Date(dateCreated).getFullYear() <= new Date(strSelectedDate[1]).getFullYear()
        );
      });
      setSelectedDateValue(`${strSelectedDate[0]} - ${strSelectedDate[1]}`);
      localFilteredSales = filteredList;
    } else if (strSelectedDate.length === 1) {
      const filteredList = sales.filter((sale) => {
        const dateCreated = sale.created_at.split(' ')[0];
        return (
          new Date(dateCreated).getDate() === new Date(strSelectedDate[0]).getDate() &&
          new Date(dateCreated).getMonth() === new Date(strSelectedDate[0]).getMonth() &&
          new Date(dateCreated).getFullYear() === new Date(strSelectedDate[0]).getFullYear()
        );
      });
      setSelectedDateValue(strSelectedDate[0]);
      localFilteredSales = filteredList;
    } else {
      localFilteredSales = sales;
    }
    if (selectedCustomer) {
      localFilteredSales = localFilteredSales.filter(
        (sale) => sale.customer_name === selectedCustomer
      );
    }
    //Eslam 19
    let totalPrice = 0;
    let taxAmount = 0;
    localFilteredSales.forEach((obj) => {
      const price = parseFloat(obj.total_price);
      const tax = parseFloat(obj.tax_amount);
      totalPrice += price;
      taxAmount += tax;
    });
    const totalPriceAndTax = totalPrice + taxAmount;
    setDetails({
      subTotal: totalPrice,
      tax: taxAmount,
      cost: totalPriceAndTax,
    });
    setFilteredSales(localFilteredSales);
  }, [strSelectedDate, selectedCustomer]);

  const handleChangeCustomer = (event: SelectChangeEvent<string>) => {
    setSelectedCustomer(event.target.value);
  };
  const handleClose = () => setAnchorEl(null);

  const resetFilters = () => {
    // setFilteredSales(sales);
    setSelectedCustomer('');
    setSelectedRange(null);
    setStrSelectedDate([]);
  };

  //table columns
  const columns: GridColDef<IItemSalesReport>[] = [
    {
      field: 'order_id',
      headerName: '#',
      maxWidth: 72,
      renderCell: ({ row }) => row.order_id,
    },
    {
      field: 'user_name',
      headerName: 'User',
      renderCell: ({ row }) => `${row.user_first_name} ${row.user_last_name ?? ''}`,
    },
    {
      field: ' contact_name',
      headerName: 'Contact',
      flex: 1,
      renderCell: ({ row }) => `${row.contact_first_name} ${row.contact_last_name}`,
    },
    {
      field: 'price',
      headerName: 'Price',
      renderCell: ({ row }) =>
        (+row.price).toFixed(locationSettings?.location_decimal_places) +
        ' ' +
        locationSettings?.currency_name,
    },
    // { field: 'Product', headerName: 'Product', flex: 1 },
    // { field: 'SKU', headerName: 'SKU', flex: 1 },
    // { field: 'Category', headerName: 'Category', flex: 1 },
    // { field: 'Brand', headerName: 'Brand', flex: 1 },
    // { field: 'Description', headerName: 'Description', flex: 1 },
    {
      field: 'Purchase Date',
      headerName: 'Purchase Date',
      width: 180,
      renderCell: ({ row }) =>
        `${new Date(row.date).toLocaleDateString()} ${new Date(row.date).toLocaleTimeString()}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <span className="text-black border px-3 rounded rounded-3">{row.status}</span>
      ),
    },

    {
      field: 'Quantity',
      headerName: 'Quantity',

      renderCell: ({ row }) => +(row.qty ?? 0),
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
    setIsLoadItems(true);
    api
      .get(`reports/item-sales/${shopId}`, { params: { all_data: 1 } })
      .then(({ data }) => {
        console.log(data.result);
        setSales(data.result.data);
      })
      .finally(() => {
        setIsLoadItems(false);
      });
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

  useEffect(() => {
    if (!shopId) return;

    initDataPage();
  }, [shopId]);

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
    <AdminLayout shopId={shopId}>
      <div className="flex" style={{ alignItems: 'center' }}>
        <FormControl sx={{ m: 1, width: 220 }}>
          <InputLabel id="customer-select-label">Supplier</InputLabel>
          <Select
            labelId="Supplier-select-label"
            id="Supplier-select"
            value={selectedCustomer}
            label="Supplier"
            onChange={handleChangeCustomer}>
            {/* {customersOptions.map((customer) => (
              <MenuItem key={customer} value={customer}>
                {customer}
              </MenuItem>
            ))} */}
          </Select>
        </FormControl>
        <DatePicker
          {...{
            strSelectedDate,
            setStrSelectedDate,
            selectedRange,
            setSelectedRange,
            hiden: true,
            placeHolder: 'Purchase Date',
          }}
        />
        <FormControl sx={{ m: 1, width: 220 }}>
          <InputLabel id="customer-select-label">Customer</InputLabel>
          <Select
            labelId="customer-select-label"
            id="customer-select"
            value={selectedCustomer}
            label="Customer"
            onChange={handleChangeCustomer}>
            {/* {customersOptions.map((customer) => (
              <MenuItem key={customer} value={customer}>
                {customer}
              </MenuItem>
            ))} */}
          </Select>
        </FormControl>
        <DatePicker
          {...{
            strSelectedDate,
            setStrSelectedDate,
            selectedRange,
            setSelectedRange,
            hiden: true,
            placeHolder: 'Sale Date',
          }}
        />
        <FormControl sx={{ m: 1, width: 220 }}>
          <InputLabel id="BusinessLocation-select-label">Business Location</InputLabel>
          <Select
            labelId="BusinessLocation-select-label"
            id="BusinessLocation-select"
            value={selectedCustomer}
            label="Business Location"
            onChange={handleChangeCustomer}>
            {/* {customersOptions.map((customer) => (
              <MenuItem key={customer} value={customer}>
                {customer}
              </MenuItem>
            ))} */}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, width: 220 }}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={selectedCustomer}
            label="Category"
            onChange={handleChangeCustomer}>
            {/* {customersOptions.map((category) => (
              <MenuItem key={customer} value={customer}>
                {customer}
              </MenuItem>
            ))} */}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, width: 220 }}>
          <InputLabel id="Brand-select-label">Brand</InputLabel>
          <Select
            labelId="Brand-select-label"
            id="Brand-select"
            value={selectedCustomer}
            label="Brand"
            onChange={handleChangeCustomer}>
            {/* {customersOptions.map((customer) => (
              <MenuItem key={customer} value={customer}>
                {customer}
              </MenuItem>
            ))} */}
          </Select>
        </FormControl>
        <Button onClick={resetFilters} style={{ height: '56px', marginLeft: 'auto' }}>
          CLEAR
        </Button>
      </div>
      <AlertDialog
        alertShow={show}
        alertFun={(e: boolean) => setShow(e)}
        id={selectId}
        type="deleteSale"
        products={sales}>
        Are you Sure You Want Delete This Item ?
      </AlertDialog>
      {
        <div style={{ display: 'none' }}>
          <ComponentToPrint ref={componentRef} />
        </div>
      }
      <div className="page-content-style card">
        <h5> Items Report</h5>
        {/* <div className="deatils_box">
          <div>
            <span>SubTotal: </span>
            {Number(details.subTotal).toFixed(3)}{" "}
            {locationSettings?.currency_code}
          </div>
          <div>
            <span>Tax: </span>
            {Number(details.tax).toFixed(3)} {locationSettings?.currency_code}
          </div>
          <div>
            <span>Total: </span>
            {Number(Number(details.subTotal) + Number(details.tax)).toFixed(
              3
            )}{" "}
            {locationSettings?.currency_code}
          </div>
          <div>
            <span>Cost: </span>
            {Number(details.cost).toFixed(3)} {locationSettings?.currency_code}
          </div>
        </div> */}
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
          pageSize={30}
          rowsPerPageOptions={[10]}
          getRowId={(row) => row.order_id}
          components={{ Toolbar: CustomToolbar }}
        />
      </div>
      {/* FOR VIEW ELEMENT */}
      <Dialog open={showViewPopUp} fullWidth={true} className="poslix-modal" onClose={handleClose}>
        <DialogTitle className="poslix-modal text-primary">Sale Details</DialogTitle>
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
                  <div className="top-detials-item">
                    <p>Invoice Date :</p>
                    <p>{selectRow.sale_date}</p>
                  </div>
                  <div className="top-detials-item">
                    <p>Added By :</p>
                    <p>{selectRow.added_by}</p>
                  </div>
                </div>
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>Final Total :</p>
                    <p>{selectRow.total_price}</p>
                  </div>
                  <div className="top-detials-item">
                    <p>Customer Name :</p>
                    <p>{selectRow.customer_name}</p>
                  </div>
                  <div className="top-detials-item" style={{ fontSize: '13px' }}>
                    <p>Order Note</p>
                    <p>{selectRow.notes}</p>
                  </div>
                </div>
              </div>
              <div>
                <Button
                  onClick={() => {
                    handlePrint();
                  }}>
                  Print Recipt
                </Button>{' '}
                <Button>Print Invoice</Button>
              </div>
            </div>
            {lines && !isLoadItems ? (
              <div className="row">
                <div className="invoice-items-container">
                  <div className="header-titles">
                    <div>Name</div>
                    <div>Qty</div>
                    <div>Amount</div>
                  </div>
                  {lines.map((line: any, index: number) => {
                    return (
                      <div className="header-items under_items" key={index}>
                        <div>{line.name}</div>
                        <div>{Number(line.qty)}</div>
                        <div>{line.price}</div>
                      </div>
                    );
                  })}
                  <div className="header-titles under_items" style={{ marginTop: '20px' }}>
                    <div></div>
                    <div>Total</div>
                    <div>{selectRow.total_price}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>laoding...</div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowViewPopUp(false);
            }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default withAuth(ItemsReport);
