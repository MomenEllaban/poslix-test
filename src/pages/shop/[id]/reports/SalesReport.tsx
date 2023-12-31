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
import { findAllData } from 'src/services/crud.api';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import Pagination from '@mui/material/Pagination';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

const pageSizeOptions = [10, 20, 50, 100];

function SalesReport() {
  const router = useRouter();
  const shopId = router.query.id ?? '';

  const componentRef = useRef(null);
  const NUMBER_PAGE_DEFAULT = 1;

  const { t } = useTranslation();

  const { locationSettings, setLocationSettings, invoicDetails } = useUser();

  const [sales, setSales] = useState<any>([]);
  const [filteredSales, setFilteredSales] = useState<any>([]);
  const [customersOptions, setCustomersOptions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({});
  const [lines, setLines] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  // const [handleSearchTxt, setHandleSearchTxt] = useState('');
  const [details, setDetails] = useState({ subTotal: 1, tax: 0, total: 0 });
  const [selectedRange, setSelectedRange] = useState(null);
  const [strSelectedDate, setStrSelectedDate] = useState([]);
  // const [selectedDateVlaue, setSelectedDateValue] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [paginationTotal, setPaginationTotal] = useState(NUMBER_PAGE_DEFAULT);

  const pageNumRef = useRef(NUMBER_PAGE_DEFAULT) as React.MutableRefObject<number>;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', maxWidth: 72 },
    {
      field: 'date',
      headerName: t('g.Date'),
      width: 180,
      renderCell: ({ row }) => new Date(row.date).toLocaleDateString(),
    },
    {
      field: 'user_name',
      headerName: t('g.SoldBy'),
      flex: 1,
      valueGetter: ({ row }) => {
        let name = '';

        if (row?.user_first_name) {
          name = row?.user_first_name + ' ' + (row?.user_last_name ?? '');
        } else {
          name = row?.user_name;
        }

        return name;
      },
    },
    {
      field: 'contact_name',
      headerName: t('g.SoldTo'),
      flex: 1,
      // renderCell: ({ row }) => row?.contact_name?.trim() ?? (`${row?.contact_first_name} ${row?.contact_last_name}` || 'walk-in-customer'),
      valueGetter: ({ row }) => {
        let name = '';

        if (row?.contact_first_name) {
          name = row?.contact_first_name + ' ' + row?.contact_last_name;
        } else {
          name = row?.contact_name?.trim();
        }

        return name || 'walk-in-customer';
      },
    },
    {
      field: 'tax',
      headerName: t('g.Tax'),
      flex: 1,
      disableColumnMenu: true,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        (+(row.tax ?? 0))?.toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'total_price',
      headerName: t('g.Total'),
      maxWidth: 72,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        `${(+row.sub_total + +row.tax).toFixed(
          locationSettings?.location_decimal_places
        )} ${locationSettings?.currency_code}`,
    },
    { field: 'notes', headerName: t('g.Note'), flex: 1, disableColumnMenu: true },
  ];

  const handelFilterEndPoint = (): string => {
    let endPoint = '';
    if (strSelectedDate.length > 0) {
      endPoint = endPoint + `&start_date=${strSelectedDate[0]}&end_date=${strSelectedDate[1]}`;
    }
    if (selectedRange) {
      endPoint = endPoint + `&dateRange=${selectedRange}`;
    }
    if (selectedCustomer) {
      endPoint = endPoint + `&contact_first_name=${selectedCustomer}`;
    }
    return endPoint;
  };

  async function initDataPage(numPage = NUMBER_PAGE_DEFAULT) {
    setIsLoading(true);
    const endPoint = handelFilterEndPoint();
    pageNumRef.current = numPage;
    api
      .get(`reports/sales/${shopId}?page=${numPage}${endPoint}`)
      .then(({ data }) => {
        setSales(data.result?.pagination?.data);
        setFilteredSales(data.result?.pagination?.data);
        setPaginationTotal(data.result?.pagination?.last_page);
        setDetails({
          subTotal: data.result.sub_total,
          total: data.result.total,
          tax: data.result.tax,
        });
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const getSelectedData = async () => {
    const customerRes = await findAllData(`customers/${shopId}`);
    setCustomersOptions(customerRes.data.result);
  };

  useEffect(() => {
    if (!shopId) return;

    initDataPage(NUMBER_PAGE_DEFAULT);
  }, [shopId, strSelectedDate, selectedRange, selectedCustomer]);

  useEffect(() => {
    if (!shopId) return;
    getSelectedData();
    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);
  }, [shopId]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  //   let localFilteredSales = [];
  //   if (strSelectedDate.length === 2) {
  //     const filteredList = filteredSales.filter((sale: ISalesReport) => {
  //       const dateCreated = sale.date.split(' ')[0];
  //       return (
  //         new Date(dateCreated).getDate() >= new Date(strSelectedDate[0]).getDate() &&
  //         new Date(dateCreated).getMonth() >= new Date(strSelectedDate[0]).getMonth() &&
  //         new Date(dateCreated).getFullYear() >= new Date(strSelectedDate[0]).getFullYear() &&
  //         new Date(dateCreated).getDate() <= new Date(strSelectedDate[1]).getDate() &&
  //         new Date(dateCreated).getMonth() <= new Date(strSelectedDate[1]).getMonth() &&
  //         new Date(dateCreated).getFullYear() <= new Date(strSelectedDate[1]).getFullYear()
  //       );
  //     });

  //     setSelectedDateValue(`${strSelectedDate[0]} - ${strSelectedDate[1]}`);
  //     localFilteredSales = filteredList;
  //   } else if (strSelectedDate.length === 1) {
  //     const filteredList = sales.filter((sale: ISalesReport) => {
  //       const dateCreated = sale.date.split(' ')[0];
  //       return (
  //         new Date(dateCreated).getDate() === new Date(strSelectedDate[0]).getDate() &&
  //         new Date(dateCreated).getMonth() === new Date(strSelectedDate[0]).getMonth() &&
  //         new Date(dateCreated).getFullYear() === new Date(strSelectedDate[0]).getFullYear()
  //       );
  //     });
  //     setSelectedDateValue(strSelectedDate[0]);
  //     localFilteredSales = filteredList;
  //   } else {
  //     localFilteredSales = sales;
  //   }

  //   //Eslam 19
  //   let totalPrice = 0;
  //   let taxAmount = 0;
  //   localFilteredSales.forEach((obj: ISalesReport) => {
  //     const price = +obj.sub_total;
  //     const tax = parseFloat(obj.tax);
  //     totalPrice += price;
  //     taxAmount += tax;
  //   });
  //   const totalPriceAndTax = totalPrice + taxAmount;
  //   setDetails({ subTotal: totalPrice, tax: taxAmount, total: totalPriceAndTax });

  //   if (selectedCustomer?.length > 0)
  //     localFilteredSales = localFilteredSales.filter((el) =>
  //       el.contact_name.includes(selectedCustomer)
  //     );

  //   setFilteredSales(localFilteredSales);
  // }, [strSelectedDate, selectedCustomer]);

  const handleChangeCustomer = (event: SelectChangeEvent<string>) => {
    setSelectedCustomer(event.target.value);
  };

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
  // const handlePrevPageButtonClick = () => setPage((prevPage) => prevPage - 1);
  // const handleNextPageButtonClick = () => setPage((prevPage) => prevPage + 1);

  function CustomPagination(): React.JSX.Element {
    return (
      <Pagination
        color="primary"
        variant="outlined"
        shape="rounded"
        page={pageNumRef.current}
        count={paginationTotal}
        onChange={(event, value) => initDataPage(value)}
      />
    );
  }

  return (
    <AdminLayout shopId={shopId}>
      <div className="flex" style={{ alignItems: 'center' }}>
        <DatePicker
          setStrSelectedDate={setStrSelectedDate}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
          valueTextRange
        />
        <FormControl sx={{ m: 1, width: 220 }}>
          <InputLabel id="customer-select-label">{t('g.Customer')}</InputLabel>
          <Select
            labelId="customer-select-label"
            id="customer-select"
            value={selectedCustomer}
            label={t('g.Customer')}
            onChange={handleChangeCustomer}>
            {customersOptions.map((customer) => (
              <MenuItem key={customer.id} value={customer.first_name}>
                {customer?.first_name} {customer?.last_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button onClick={resetFilters} style={{ height: '56px', marginLeft: 'auto' }}>
          {t('g.CLEAR')}
        </Button>
      </div>
      <AlertDialog
        alertShow={show}
        alertFun={(e: boolean) => setShow(e)}
        id={selectId}
        type={t('g.deleteSale')}
        products={filteredSales}>
        {t('g.Are_you_Sure_You_Want_Delete_This_Item')}
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
        <h5> {t('g.ReportSales')}</h5>
        <div className="deatils_box">
          <div>
            <span>{t('g.SubTotal')}: </span>
            {details.subTotal.toFixed(locationSettings?.location_decimal_places)}{' '}
            {locationSettings?.currency_code}
          </div>
          <div>
            <span>{t('g.Tax')}: </span>
            {details.tax.toFixed(locationSettings?.location_decimal_places)}{' '}
            {locationSettings?.currency_code}
          </div>
          <div>
            <span>{t('g.Total')}: </span>
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
            Pagination: CustomPagination,
            // Footer: () => {
            //   const startingPage = page * pageSize + 1;
            //   const endPage =
            //     page * pageSize + pageSize > filteredSales.length
            //       ? filteredSales.length
            //       : page * pageSize + pageSize;
            //   let total = 0;
            //   filteredSales
            //     .slice(startingPage - 1, endPage)
            //     .forEach((filteredSale) => (total += Number(filteredSale.total_price)));
            //   return (
            //     <div
            //       style={{
            //         display: 'flex',
            //         alignItems: 'center',
            //         justifyContent: 'space-between',
            //       }}>
            //       {/* <p style={{ margin: 0 }}>
            //         <span style={{ fontWeight: 'bold' }}>Page Total: </span>
            //         {total.toFixed(3)} {locationSettings?.currency_code}
            //       </p> */}
            //       <div
            //         style={{
            //           display: 'flex',
            //           alignItems: 'center',
            //         }}>
            //         <div
            //           style={{
            //             display: 'flex',
            //             alignItems: 'center',
            //             justifyContent: 'flex-end',
            //             marginRight: '16px',
            //           }}>
            //           <span style={{ marginRight: '16px' }}>Rows per page:</span>
            //           <Select value={pageSize} onChange={handlePageSizeChange}>
            //             {pageSizeOptions.map((option) => (
            //               <MenuItem key={option} value={option}>
            //                 {option}
            //               </MenuItem>
            //             ))}
            //           </Select>
            //         </div>
            //         <div
            //           style={{
            //             display: 'flex',
            //             alignItems: 'center',
            //             justifyContent: 'flex-end',
            //             marginRight: '16px',
            //           }}>
            //           <IconButton disabled={page === 0} onClick={handlePrevPageButtonClick}>
            //             <KeyboardArrowLeft />
            //           </IconButton>
            //           <div style={{ marginLeft: '16px', marginRight: '16px' }}>
            //             {startingPage} - {endPage} of {filteredSales.length}
            //           </div>
            //           <IconButton
            //             disabled={page >= Math.ceil(filteredSales.length / pageSize) - 1}
            //             onClick={handleNextPageButtonClick}>
            //             <KeyboardArrowRight />
            //           </IconButton>
            //         </div>
            //       </div>
            //     </div>
            //   );
            // },
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
                    <p>{t('g.InvoiceNo')} :</p>
                    <p>{selectRow.id}</p>
                  </div>
                  <div className="top-detials-item">
                    <p>{t('g.InvoiceDate')} :</p>
                    <p>{selectRow.sale_date}</p>
                  </div>
                  <div className="top-detials-item">
                    <p>{t('g.AddedBy')} :</p>
                    <p>{selectRow.added_by}</p>
                  </div>
                </div>
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>{t('g.FinalTotal')} :</p>
                    <p>{selectRow.total_price}</p>
                  </div>
                  <div className="top-detials-item">
                    <p>{t('g.CustomerName')} :</p>
                    <p>{selectRow.customer_name}</p>
                  </div>
                  <div className="top-detials-item" style={{ fontSize: '13px' }}>
                    <p>{t('g.OrderNote')}</p>
                    <p>{selectRow.notes}</p>
                  </div>
                </div>
              </div>
              <div>
                <Button
                  onClick={() => {
                    handlePrint();
                  }}>
                  {t('g.PrintRecipt')}
                </Button>{' '}
                <Button>{t('g.PrintInvoice')}</Button>
              </div>
            </div>
            {lines && !isLoading ? (
              <div className="row">
                <div className="invoice-items-container">
                  <div className="header-titles">
                    <div>{t('g.name')}</div>
                    <div>{t('g.Qty')}</div>
                    <div>{t('g.Amount')}</div>
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
                    <div>{t('g.Total')}</div>
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
            {t('g.Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default SalesReport;

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}
