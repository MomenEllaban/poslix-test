import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { EStatus, IItemSalesReport } from '@models/reports.types';
import { Dialog, DialogActions, DialogContent, DialogTitle, MenuItem } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import withAuth from 'src/HOCs/withAuth';
import DatePicker from 'src/components/filters/Date';
import AlertDialog from 'src/components/utils/AlertDialog';
import { useUser } from 'src/context/UserContext';
import { apiFetch, apiFetchCtr } from 'src/libs/dbUtils';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import ItemsReportToPrint from 'src/modules/reports/_components/ItemsReportToPrint';
import { findAllData } from 'src/services/crud.api';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

function ItemsReport() {
  const router = useRouter();
  const shopId = router.query.id ?? '';

  const componentRef = useRef(null);

  const { locationSettings, setLocationSettings, invoicDetails } = useUser();

  const [sales, setSales] = useState<any>([]);
  const [filteredSales, setFilteredSales] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({});
  const [lines, setLines] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [isLoadItems, setIsLoadItems] = useState(false);
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  const [handleSearchTxt, setHandleSearchTxt] = useState('');
  const [details, setDetails] = useState({ subTotal: 1, tax: 0, cost: 0 });
  const [selectedRange, setSelectedRange] = useState(null);
  const [strSelectedDate, setStrSelectedDate] = useState([]);
  const [selectedDateVlaue, setSelectedDateValue] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [locations, setLocations] = useState([]);
  const [suppliersOptions, setSuppliersOptions] = useState([]);
  const [customersOptions, setCustomersOptions] = useState([]);

  const handleChangeSupplier = (event: SelectChangeEvent<string>) => {
    setSelectedSupplier(event.target.value);
    setFilteredSales(filteredSales.filter((el) => el.user_name === event.target.value));
  };

  const handleChangeCustomer = (event: SelectChangeEvent<string>) => {
    setSelectedCustomer(event.target.value);
    setFilteredSales(filteredSales.filter((el) => event.target.value === el.contact_first_name));
  };

  const handleClose = () => setAnchorEl(null);

  const resetFilters = () => {
    setFilteredSales(sales);
    setSelectedCustomer('');
    setSelectedSupplier('');
    setSelectedRange(null);
    setStrSelectedDate([]);
  };

  //table columns
  const columns: GridColDef<IItemSalesReport>[] = useMemo(
    () => [
      { field: 'order_id', headerName: '#', maxWidth: 72, renderCell: ({ row }) => row.order_id },
      {
        field: 'user_name',
        headerName: 'Name',
        renderCell: ({ row }) => `${row.user_first_name} ${row.user_last_name ?? ''}`,
      },
      {
        field: 'contact_name',
        headerName: 'Sold To',
        renderCell: ({ row }) => `${row.contact_first_name} ${row.contact_last_name}`,
      },
      {
        field: 'Purchase Date',
        headerName: 'Purchase Date',
        width: 180,
        renderCell: ({ row }) =>
          `${new Date(row.date).toLocaleDateString()} ${new Date(row.date).toLocaleTimeString()}`,
      },
      {
        field: 'qty',
        headerName: 'Qty',
        renderCell: ({ row }) => (+row.qty).toFixed(0),
      },
      {
        field: 'price',
        headerName: 'Total',
        renderCell: ({ row }) =>
          (+row.price).toFixed(locationSettings?.location_decimal_places) +
          ' ' +
          locationSettings?.currency_name,
      },
      {
        field: 'tax',
        headerName: 'Tax',
        renderCell: ({ row }) =>
          (+row.tax).toFixed(locationSettings?.location_decimal_places) +
          ' ' +
          locationSettings?.currency_name,
      },
      {
        field: 'cost',
        headerName: 'Cost',
        renderCell: ({ row }) =>
          (+row.tax).toFixed(locationSettings?.location_decimal_places) +
          ' ' +
          locationSettings?.currency_name,
      },
    ],
    [locationSettings]
  );

  // init sales data
  async function initDataPage() {
    setIsLoadItems(true);
    api
      .get(`reports/item-sales/${shopId}`, { params: { all_data: 1 } })
      .then(({ data }) => {
        setSales(data.result.data);
        setFilteredSales(data.result.data);
      })
      .finally(() => {});

    const supplierRes = await findAllData(`suppliers/${shopId}`);
    setSuppliersOptions(supplierRes.data.result);
    const customerRes = await findAllData(`customers/${shopId}`);
    setCustomersOptions([...customerRes.data.result, {name: "walk-in customer"}]);

    setIsLoadItems(false);
  }

  const handlePrint = useReactToPrint({ content: () => componentRef.current });

  const onRowsSelectionHandler = (selectedRowsData: any) => {
    setSelectRow(selectedRowsData);
    setSelectId(selectedRowsData.id);
    setShowViewPopUp(true);
  };
  const handleSearch = (e: any) => {
    setHandleSearchTxt(e.target.value);
  };

  useEffect(() => {
    let localFilteredSales = [];
    if (strSelectedDate.length === 2) {
      const filteredList = filteredSales.filter((sale) => {
        const dateCreated = sale.date.split(' ')[0];
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
        const dateCreated = sale.date.split(' ')[0];
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
    //Eslam 19
    let totalPrice = 0;
    let taxAmount = 0;
    localFilteredSales.forEach((obj) => {
      const price = parseFloat(obj.price);
      const tax = parseFloat(obj.tax);
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
  }, [strSelectedDate]);

  /*************************************/
  useEffect(() => {
    if (!shopId) return;

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    setLocations(locations);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);

    initDataPage();
  }, [shopId]);

  return (
    <AdminLayout shopId={shopId}>
      <div className="flex" style={{ alignItems: 'center' }}>
        <FormControl sx={{ m: 1, width: 220 }}>
          <InputLabel id="customer-select-label">Supplier</InputLabel>
          <Select
            labelId="Supplier-select-label"
            id="Supplier-select"
            value={selectedSupplier}
            label="Supplier"
            onChange={handleChangeSupplier}>
            {suppliersOptions.map((supplier) => (
              <MenuItem key={supplier.id} value={supplier.name}>
                {supplier.name}
              </MenuItem>
            ))}
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
            {customersOptions.map((customer) => (
              <MenuItem key={customer.id} value={customer.first_name}>
                {customer?.first_name} {customer?.last_name}
              </MenuItem>
            ))}
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
          <ItemsReportToPrint
            lines={lines}
            ref={componentRef}
            selectRow={selectRow}
            invoicDetails={invoicDetails}
            locationSettings={locationSettings}
          />
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
          loading={isLoadItems}
          className="datagrid-style"
          sx={{
            '.MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '&.MuiDataGrid-root': {
              border: 'none',
            },
          }}
          rows={filteredSales}
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
