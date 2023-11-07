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
import { apiFetch, apiFetchCtr } from 'src/libs/dbUtils';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import ItemsReportToPrint from 'src/modules/reports/_components/ItemsReportToPrint';
import { findAllData } from 'src/services/crud.api';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

function PurchaseReport() {
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
  const [selectedProduct, setSelectedProducts] = useState('');
  const [locations, setLocations] = useState([]);
  const [suppliersOptions, setSuppliersOptions] = useState([]);
  const [productsOptions, setProductsOptions] = useState([]);

  const handleChangeSupplier = (event: SelectChangeEvent<string>) => {
    setSelectedSupplier(event.target.value);
  };

  const handleChangeProduct = (event: SelectChangeEvent<string>) => {
    setSelectedProducts(event.target.value);
  };

  const handleClose = () => setAnchorEl(null);

  const resetFilters = () => {
    setFilteredSales(() => sales);
    setSelectedProducts('');
    setSelectedSupplier('');
    setSelectedRange(()=>null);
    setStrSelectedDate(()=>[]);
  };
  
  //table columns
  const columns: GridColDef<any>[] = useMemo(
    () => [
      {
        field: 'product_name',
        headerName: 'Product',
        flex: 1,
        renderCell: ({ row }) => row?.product_name,
      },
      {
        field: 'product_sku',
        headerName: 'SKU',
        flex: 1,
        renderCell: ({ row }) => row?.product_sku,
      },
      {
        field: 'supplier_name',
        headerName: 'Supplier',
        flex: 1,
        // @ts-ignore
        renderCell: ({ row }) => row?.supplier_name || 'walk-in supplier',
      },
      {
        field: 'created_at',
        headerName: 'Date',
        flex: 1,
        renderCell: ({ row }) =>
          `${new Date(row?.created_at).toLocaleDateString()} ${new Date(
            row?.created_at
          ).toLocaleTimeString()}`,
      },
      {
        field: 'qty',
        headerName: 'Quantity',
        flex: 1,
        renderCell: ({ row }) => (+row.qty).toFixed(0),
      },
      {
        field: 'cost',
        headerName: 'Unit Purchase Price',
        flex: 1,
        // @ts-ignore
        renderCell: ({ row }) =>
          `${locationSettings.currency_code} ${(+row?.cost).toFixed(
            locationSettings?.location_decimal_places
          )}`,
      },
      {
        field: 'subtotal',
        headerName: 'Subtotal',
        flex: 1,
        // @ts-ignore
        renderCell: ({ row }) =>
          `${locationSettings.currency_code} ${(row?.subtotal)}`,
      },
    ],
    [locationSettings]
  );

  // init sales data
  async function initDataPage() {
    setIsLoadItems(true);
    api
      .get(`reports/purchase/${shopId}`, { params: { all_data: 1 } })
      .then(({ data }) => {
        const _salesList = data.result;
        const mappedSalesList = [];
        //mohamed elsayed
        let index = 0;
        _salesList.forEach((item) => {
          mappedSalesList.push({ id: index++, ...item });
        });
        ////
        setSales(mappedSalesList);
        setFilteredSales(() => mappedSalesList);
      })
      .finally(() => {});

    const supplierRes = await findAllData(`suppliers/${shopId}`);
    setSuppliersOptions(supplierRes.data.result);
    const productsRes = await findAllData(`products/${shopId}`)
    setProductsOptions([...productsRes.data.result.data]);
    setIsLoadItems(false);
  }

  const handlePrint = useReactToPrint({ content: () => componentRef.current });

  const handleSearch = (e: any) => {
    setHandleSearchTxt(e.target.value);
  };

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
    if (selectedSupplier?.length > 0) {
      localFilteredSales = localFilteredSales.filter((el) => el.supplier_name === selectedSupplier);
    }
    
    if (selectedProduct?.length > 0) {
      console.log(selectedProduct);
      console.log(localFilteredSales);
      
      localFilteredSales = localFilteredSales.filter(
        (el) => el.product_name === selectedProduct
      );
    }
    setFilteredSales(() => localFilteredSales);
  }, [strSelectedDate, selectedSupplier, selectedProduct]);
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
          <InputLabel id="customer-select-label">Product</InputLabel>
          <Select
            labelId="customer-select-label"
            id="customer-select"
            value={selectedProduct}
            label="Products"
            onChange={handleChangeProduct}>
            {productsOptions.map((product, index) => (
              <MenuItem key={index} value={product.name}>
                {product?.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
        <Button onClick={resetFilters} style={{ height: '56px', marginLeft: 'auto' }}>
          CLEAR
        </Button>
      </div>
      {/* <AlertDialog
        alertShow={show}
        alertFun={(e: boolean) => setShow(e)}
        id={selectId}
        type="deleteSale"
        products={sales}>
        Are you Sure You Want Delete This Item ?
      </AlertDialog> */}
      {/* {
        <div style={{ display: 'none' }}>
          <ItemsReportToPrint
            lines={lines}
            ref={componentRef}
            selectRow={selectRow}
            invoicDetails={invoicDetails}
            locationSettings={locationSettings}
          />
        </div>
      } */}
      <div className="page-content-style card">
        <h5> Product Purchase Report</h5>
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
          components={{ Toolbar: CustomToolbar }}
        />
      </div>
      {/* FOR VIEW ELEMENT */}
      {/* <Dialog open={showViewPopUp} fullWidth={true} className="poslix-modal" onClose={handleClose}>
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
      </Dialog> */}
    </AdminLayout>
  );
}

export default withAuth(PurchaseReport);
