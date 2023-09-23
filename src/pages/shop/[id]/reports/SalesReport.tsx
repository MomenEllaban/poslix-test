import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { ISalesReport } from '@models/reports.types';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import withAuth from 'src/HOCs/withAuth';
import DatePicker from 'src/components/filters/Date';
import AlertDialog from 'src/components/utils/AlertDialog';
import { useUser } from 'src/context/UserContext';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import SalesReportToPrint from 'src/modules/reports/_components/SalesReportToPrint';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

const pageSizeOptions = [10, 20, 50, 100];

function SalesReport() {
  const router = useRouter();
  const shopId = router.query.id ?? '';

  const componentRef = useRef(null);

  const { locationSettings, setLocationSettings, invoicDetails } = useUser();

  const [sales, setSales] = useState<any>([]);
  const [filteredSales, setFilteredSales] = useState<any>([]);
  const [customersOptions, setCustomersOptions] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({});
  const [lines, setLines] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  const [handleSearchTxt, setHandleSearchTxt] = useState('');
  const [details, setDetails] = useState({ subTotal: 1, tax: 0, total: 0 });
  const [selectedRange, setSelectedRange] = useState(null);
  const [strSelectedDate, setStrSelectedDate] = useState([]);
  const [selectedDateVlaue, setSelectedDateValue] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'id', headerName: '#', maxWidth: 72 },
      {
        field: 'date',
        headerName: 'Date',
        width: 180,
        renderCell: ({ row }) => new Date(row.date).toLocaleDateString(),
      },
      { field: 'user_name', headerName: 'Sold By', flex: 1 },
      {
        field: 'contact_name',
        headerName: 'Sold To',
        flex: 1,

        renderCell: ({ row }) => row.contact_name.trim() || 'walk-in-customer',
      },
      {
        field: 'tax',
        headerName: 'Tax',
        flex: 1,
        disableColumnMenu: true,
        renderCell: ({ row }: Partial<GridRowParams>) =>
          (+(row.tax ?? 0))?.toFixed(locationSettings?.location_decimal_places),
      },
      {
        field: 'total_price',
        headerName: 'Total',
        maxWidth: 72,
        renderCell: ({ row }: Partial<GridRowParams>) =>
          `${(+row.sub_total + +row.tax).toFixed(
            locationSettings?.location_decimal_places
          )} ${locationSettings?.currency_code}`,
      },
      { field: 'notes', headerName: 'Note', flex: 1, disableColumnMenu: true },
    ],
    [locationSettings]
  );

  useEffect(() => {
    const customers = [];
    sales.forEach((sale: any) => {
      if (!customers.includes(sale.customer_name)) customers.push(sale.customer_name);
    });
    setCustomersOptions(customers);
  }, [sales]);

  async function initDataPage() {
    setIsLoading(true);
    api
      .get(`reports/sales/${shopId}`, { params: { all_data: 1 } })
      .then(({ data }) => {
        setSales(data.result.data);
        setFilteredSales(data.result.data);
        setDetails({
          subTotal: data.result.sub_total,
          total: data.result.total,
          tax: data.result.tax,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    if (!shopId) return;

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);

    initDataPage();
  }, [shopId]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  // const onRowsSelectionHandler = (selectedRowsData: any) => {
  //   setSelectRow(selectedRowsData);
  //   setSelectId(selectedRowsData.id);
  //   getItems(selectedRowsData.id);
  //   setShowViewPopUp(true);
  // };
  const handleSearch = (e: any) => {
    setHandleSearchTxt(e.target.value);
  };

  useEffect(() => {
    let localFilteredSales = [];
    if (strSelectedDate.length === 2) {
      const filteredList = sales.filter((sale: ISalesReport) => {
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
      const filteredList = sales.filter((sale: ISalesReport) => {
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

    if (selectedCustomer) {
      localFilteredSales = localFilteredSales.filter((sale) =>
        selectedCustomer.trim().localeCompare(sale.customer_name?.trim())
      );
    }
    //Eslam 19
    let totalPrice = 0;
    let taxAmount = 0;
    localFilteredSales.forEach((obj: ISalesReport) => {
      const price = +obj.sub_total;
      const tax = parseFloat(obj.tax);
      totalPrice += price;
      taxAmount += tax;
    });
    const totalPriceAndTax = totalPrice + taxAmount;
    setDetails({ subTotal: totalPrice, tax: taxAmount, total: totalPriceAndTax });
    setFilteredSales(localFilteredSales);
  }, [strSelectedDate, selectedCustomer]);

  const handleChangeCustomer = (event: SelectChangeEvent<string>) =>
    setSelectedCustomer(event.target.value);

  const resetFilters = () => {
    setFilteredSales(sales);
    setSelectedCustomer(null);
    setSelectedRange(null);
    setStrSelectedDate([]);
    setPage(0);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(+event.target.value);
    setPage(0);
  };

  const handlePageChange = (params) => setPage(params.page);
  const handlePrevPageButtonClick = () => setPage((prevPage) => prevPage - 1);
  const handleNextPageButtonClick = () => setPage((prevPage) => prevPage + 1);

  return (
    <AdminLayout shopId={shopId}>
      <div className="flex" style={{ alignItems: 'center' }}>
        <DatePicker
          setStrSelectedDate={setStrSelectedDate}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
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
              <MenuItem
                key={customer?.trim() || 'walk-in-customer'}
                value={customer?.trim() || 'walk-in-customer'}>
                {customer?.trim() || 'walk-in-customer'}
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
        products={filteredSales}>
        Are you Sure You Want Delete This Item ?
      </AlertDialog>
      {
        <div style={{ display: 'none' }}>
          <SalesReportToPrint
            lines={lines}
            ref={componentRef}
            selectRow={selectRow}
            invoicDetails={invoicDetails}
            locationSettings={locationSettings}
          />
        </div>
      }
      <div className="page-content-style card">
        <h5> Report Sales</h5>
        <div className="deatils_box">
          <div>
            <span>SubTotal: </span>
            {details.subTotal.toFixed(locationSettings?.location_decimal_places)}{' '}
            {locationSettings?.currency_code}
          </div>
          <div>
            <span>Tax: </span>
            {details.tax.toFixed(locationSettings?.location_decimal_places)}{' '}
            {locationSettings?.currency_code}
          </div>
          <div>
            <span>Total: </span>
            {details.total.toFixed(locationSettings?.location_decimal_places)}{' '}
            {locationSettings?.currency_code}
          </div>
        </div>

        <DataGrid
          loading={isLoading}
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
          components={{
            Toolbar: CustomToolbar,
            Footer: () => {
              const startingPage = page * pageSize + 1;
              const endPage =
                page * pageSize + pageSize > filteredSales.length
                  ? filteredSales.length
                  : page * pageSize + pageSize;
              let total = 0;
              filteredSales
                .slice(startingPage - 1, endPage)
                .forEach((filteredSale) => (total += Number(filteredSale.total_price)));
              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <p style={{ margin: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>Page Total: </span>
                    {total.toFixed(3)} {locationSettings?.currency_code}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        marginRight: '16px',
                      }}>
                      <span style={{ marginRight: '16px' }}>Rows per page:</span>
                      <Select value={pageSize} onChange={handlePageSizeChange}>
                        {pageSizeOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        marginRight: '16px',
                      }}>
                      <IconButton disabled={page === 0} onClick={handlePrevPageButtonClick}>
                        <KeyboardArrowLeft />
                      </IconButton>
                      <div style={{ marginLeft: '16px', marginRight: '16px' }}>
                        {startingPage} - {endPage} of {filteredSales.length}
                      </div>
                      <IconButton
                        disabled={page >= Math.ceil(filteredSales.length / pageSize) - 1}
                        onClick={handleNextPageButtonClick}>
                        <KeyboardArrowRight />
                      </IconButton>
                    </div>
                  </div>
                </div>
              );
            },
          }}
          pagination
          page={page}
          pageSize={pageSize}
          rowCount={filteredSales.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          // initialState={{
          //   pagination: { pageSize: 5 },
          // }}
          // pageSizeOptions={[5, 10, 25]}
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
            {lines && !isLoading ? (
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

export default withAuth(SalesReport);
