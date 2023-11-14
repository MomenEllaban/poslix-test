import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { IProduct } from '@models/pos.types';
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
// import { apiFetch, apiFetchCtr } from 'src/libs/dbUtils';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import ItemsReportToPrint from 'src/modules/reports/_components/ItemsReportToPrint';
import { findAllData } from 'src/services/crud.api';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import Pagination from '@mui/material/Pagination';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

function ItemsReport() {
  const router = useRouter();
  const shopId = router.query.id ?? '';

  const componentRef = useRef(null);

  const { t } = useTranslation();

  const { locationSettings, setLocationSettings, invoicDetails } = useUser();

  const NUMBER_PAGE_DEFAULT = 1;

  const [sales, setSales] = useState<any>([]);
  const [filteredSales, setFilteredSales] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({});
  const [lines, setLines] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [isLoadItems, setIsLoadItems] = useState(true);
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  // const [handleSearchTxt, setHandleSearchTxt] = useState('');
  const [details, setDetails] = useState({ subTotal: 1, tax: 0, cost: 0 });
  const [selectedRange, setSelectedRange] = useState(null);
  const [strSelectedDate, setStrSelectedDate] = useState([]);
  const [selectedDateVlaue, setSelectedDateValue] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [locations, setLocations] = useState([]);
  const [suppliersOptions, setSuppliersOptions] = useState([]);
  const [customersOptions, setCustomersOptions] = useState([]);
  const [paginationTotal, setPaginationTotal] = useState(NUMBER_PAGE_DEFAULT);

  const pageNumRef = useRef(NUMBER_PAGE_DEFAULT) as React.MutableRefObject<number>;

  const handleChangeSupplier = (event: SelectChangeEvent<string>) => {
    setSelectedSupplier(event.target.value);
  };

  const handleChangeCustomer = (event: SelectChangeEvent<string>) => {
    setSelectedCustomer(event.target.value);
  };

  const handleClose = () => setAnchorEl(null);

  const resetFilters = () => {
    setFilteredSales(() => sales);
    setSelectedCustomer('');
    setSelectedSupplier('');
    setSelectedRange(null);
    setStrSelectedDate([]);
  };

  //table columns
  const columns: GridColDef<IItemSalesReport & { product: IProduct }>[] = useMemo(
    () => [
      {
        field: 'product_name',
        headerName: t('g.Product'),
        renderCell: ({ row }) => row?.product?.name,
      },
      {
        field: 'product_sku',
        headerName: t('g.SKU'),
        renderCell: ({ row }) => row?.product?.sku,
      },
      {
        field: 'product_category',
        headerName: t('g.Category'),
        renderCell: ({ row }) => row?.product?.category?.name,
      },
      {
        field: 'product_brand',
        headerName: t('g.Brand'),
        // @ts-ignore
        renderCell: ({ row }) => row?.product?.brand?.name || '---',
      },
      {
        field: 'Purchase Date',
        headerName: t('g.PurchaseDate'),
        width: 180,
        renderCell: ({ row }) =>
          `${new Date(row.date).toLocaleDateString()} ${new Date(row.date).toLocaleTimeString()}`,
      },
      // {
      //   field: 'purchase_id',
      //   headerName: 'Purchase ID',
      //   // @ts-ignore
      //   renderCell: ({ row }) => row?.product?.supplier?.name || '---',
      // },
      {
        field: 'supplier_name',
        headerName: t('g.Supplier'),
        // @ts-ignore
        renderCell: ({ row }) => row?.supplier_name || 'walk-in supplier',
      },
      {
        field: 'purchase_price',
        headerName: t('g.PurchasePrice'),
        renderCell: ({ row }) =>
          (+row?.product?.cost_price).toFixed(locationSettings?.location_decimal_places) +
          ' ' +
          locationSettings?.currency_name,
      },
      {
        field: 'sale_date',
        headerName: t('g.SaleDate'),
        width: 180,
        renderCell: ({ row }) =>
          `${new Date(row.date).toLocaleDateString()} ${new Date(row.date).toLocaleTimeString()}`,
      },
      {
        field: 'order_id',
        headerName: t('g.Sale'),
        maxWidth: 72,
        renderCell: ({ row }) => row.order_id,
      },
      {
        field: 'contact_name',
        headerName: t('g.Customer'),
        renderCell: ({ row }) => `${row.contact_first_name} ${row.contact_last_name}`,
      },

      {
        field: 'qty',
        headerName: t('g.Qty'),
        renderCell: ({ row }) => (+row.qty).toFixed(0),
      },
      {
        field: 'price',
        headerName: t('g.SellingPrice'),
        renderCell: ({ row }) =>
          (+row.product.sell_price).toFixed(locationSettings?.location_decimal_places) +
          ' ' +
          locationSettings?.currency_name,
      },
    ],
    [locationSettings]
  );

  const handelFilterEndPoint = (): string => {
    let endPoint = '';
    if (strSelectedDate.length > 0) {
      endPoint = endPoint + `&purchase_date=${strSelectedDate[0]}`;
    }
    if (selectedSupplier) {
      endPoint = endPoint + `&supplier_name=${selectedSupplier}`;
    }
    if (selectedCustomer) {
      endPoint = endPoint + `&contact_first_name=${selectedCustomer}`;
    }
    return endPoint;
  };

  // init sales data
  async function initDataPage(numPage = NUMBER_PAGE_DEFAULT) {
    setIsLoadItems(true);
    const endPoint = handelFilterEndPoint();
    api
      .get(`reports/item-sales/${shopId}?page=${numPage}${endPoint}`)
      .then(({ data }) => {
        pageNumRef.current = numPage;
        const _salesList = data.result?.pagination?.data;
        setPaginationTotal(data.result.pagination?.last_page);
        const mappedSalesList = [];
        let index = 0;
        _salesList.forEach((item) => {
          const { products, ...rest } = item;
          products.forEach((product) => {
            mappedSalesList.push({ id: index++, ...rest, product });
          });
        });
        ////
        setSales(mappedSalesList);
        setFilteredSales(mappedSalesList);
      })
      .finally(() => {
        setIsLoadItems(false);
      });
  }

  const handlePrint = useReactToPrint({ content: () => componentRef.current });

  // useEffect(() => {
  //   let localFilteredSales = [];
  //   if (strSelectedDate.length === 2) {
  //     const filteredList = sales.filter((sale) => {
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
  //     const filteredList = sales.filter((sale) => {
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
  //   localFilteredSales.forEach((obj) => {
  //     const price = parseFloat(obj.price);
  //     const tax = parseFloat(obj.tax);
  //     totalPrice += price;
  //     taxAmount += tax;
  //   });
  //   const totalPriceAndTax = totalPrice + taxAmount;
  //   setDetails({
  //     subTotal: totalPrice,
  //     tax: taxAmount,
  //     cost: totalPriceAndTax,
  //   });
  //   if (selectedSupplier?.length > 0) {
  //     // console.log(111111111);
  //     localFilteredSales = localFilteredSales.filter((el) => el.supplier_name === selectedSupplier);
  //   }
  //   if (selectedCustomer?.length > 0) {
  //     // console.log(222222222);
  //     localFilteredSales = localFilteredSales.filter(
  //       (el) => el.contact_first_name === selectedCustomer
  //     );
  //   }
  //   setFilteredSales(() => localFilteredSales);
  // }, [strSelectedDate, selectedSupplier, selectedCustomer]);

  useEffect(() => {
    if (!shopId) return;
    initDataPage(NUMBER_PAGE_DEFAULT);
  }, [strSelectedDate, selectedSupplier, selectedCustomer, shopId]);

  const getSelectedData = async () => {
    const supplierRes = await findAllData(`suppliers/${shopId}`);
    setSuppliersOptions(supplierRes.data.result);
    const customerRes = await findAllData(`customers/${shopId}`);

    setCustomersOptions([
      ...customerRes.data.result,
      { first_name: 'walk-in', last_name: 'customer' },
    ]);
  };

  /*************************************/
  useEffect(() => {
    if (!shopId) return;
    getSelectedData();
    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    setLocations(locations);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);
    // initDataPage();
  }, [shopId]);

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
        <FormControl sx={{ m: 1, width: 220 }}>
          <InputLabel id="customer-select-label">{t('g.Supplier')}</InputLabel>
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
          <InputLabel id="customer-select-label">{t('g.Customer')}</InputLabel>
          <Select
            labelId="customer-select-label"
            id="customer-select"
            value={selectedCustomer}
            label={t('g.Customer')}
            onChange={handleChangeCustomer}>
            {customersOptions.map((customer, index) => (
              <MenuItem key={index} value={customer.first_name}>
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
        type="deleteSale"
        products={sales}>
        {t('g.Are_you_Sure_You_Want_Delete_This_Item')}
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
        {/* {console.log(filteredSales)} */}
        <h5> {t('g.ItemsReport')}</h5>
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
          // pageSize={30}
          // rowsPerPageOptions={[10]}
          // getRowId={(row) => row.order_id}
          components={{ Toolbar: CustomToolbar, Pagination: CustomPagination }}
        />
      </div>
      {/* FOR VIEW ELEMENT */}
      <Dialog open={showViewPopUp} fullWidth={true} className="poslix-modal" onClose={handleClose}>
        <DialogTitle className="poslix-modal text-primary">{t('g.SaleDetails')}</DialogTitle>
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
                    <p>Final Total :</p>
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
            {lines && !isLoadItems ? (
              <div className="row">
                <div className="invoice-items-container">
                  <div className="header-titles">
                    <div>{t('g.Name')}</div>
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

export default ItemsReport;

export async function getServerSideProps({locale}) {
  

  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

