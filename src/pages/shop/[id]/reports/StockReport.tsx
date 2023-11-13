import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { IBrand, ICategory } from '@models/pos.types';
import { IStockReport } from '@models/reports.types';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import FormControl from '@mui/material/FormControl';
// import InputLabel from '@mui/material/InputLabel';
// import { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { nanoid } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import withAuth from 'src/HOCs/withAuth';
import AlertDialog from 'src/components/utils/AlertDialog';
import { useUser } from 'src/context/UserContext';
// import { apiFetchCtr } from 'src/libs/dbUtils';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import posService from 'src/services/pos.service';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import Select from 'react-select';
import { StateManagerProps } from 'react-select/dist/declarations/src/useStateManager';
import { intersectionBy } from 'lodash';
import Pagination from '@mui/material/Pagination';

type IBrandWithSelect = IBrand & { label: string; value: number };
type ICategoryWithSelect = ICategory & { label: string; value: number };

function StockReport() {
  const router = useRouter();
  const shopId = router.query.id;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sales, setSales] = useState<any>([]);
  const [brands, setBrands] = useState<IBrandWithSelect[]>([]);
  const [categories, setCategories] = useState<(ICategory & { label: string; value: number })[]>(
    []
  );
  const handleClose = () => {
    setAnchorEl(null);
  };

  const NUMBER_PAGE_DEFAULT = 1;

  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({});
  const [lines, setLines] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [isLoadItems, setIsLoadItems] = useState(false);
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  // const [handleSearchTxt, setHandleSearchTxt] = useState('');
  // const [details, setDetails] = useState({ subTotal: 1, tax: 0, cost: 0 });
  const { setInvoicDetails, invoicDetails, locationSettings, setLocationSettings } = useUser();

  const [selectedBrand, setSelectedBrand] = useState<IBrandWithSelect | null>();
  const [selectedCategory, setSelectedCategory] = useState<ICategoryWithSelect | null>();

  const [filteredByBrands, setFilteredByBrands] = useState([]);
  const [filteredByCategories, setFilteredByCategories] = useState([]);

  const [filteredSales, setFilteredSales] = useState<any>([]);
  // const [selectedRange, setSelectedRange] = useState(null);
  // const [strSelectedDate, setStrSelectedDate] = useState([]);
  // const [selectedDateVlaue, setSelectedDateValue] = useState('');
  // const [selectedCustomer, setSelectedCustomer] = useState('');
  // const [customersOptions, setCustomersOptions] = useState([]);

  const [paginationTotal, setPaginationTotal] = useState(NUMBER_PAGE_DEFAULT);

  const pageNumRef = useRef(NUMBER_PAGE_DEFAULT) as React.MutableRefObject<number>;

  const getLocalizedPrice = useCallback(
    (price: number | string): string =>
      `${(+price).toFixed(
        locationSettings?.location_decimal_places
      )} ${locationSettings?.currency_code}`,
    [locationSettings]
  );

  const handleSelectBrand: StateManagerProps['onChange'] = (
    brand: IBrand & { label: string; value: number }
  ) => {
    setSelectedBrand(brand);
    if (!brand) return setFilteredByBrands(sales);

    const _filteredSales = sales?.filter((sale) => sale.brand_id === brand.id);
    setFilteredByBrands(_filteredSales);
    console.log(_filteredSales);
  };

  const handleSelectCategory: StateManagerProps['onChange'] = (
    category: ICategory & { label: string; value: number }
  ) => {
    setSelectedCategory(category);
    if (!category) return setFilteredByCategories(sales);
    const _filteredSales = sales?.filter((sale) => sale.category_id === category.id);
    setFilteredByCategories(_filteredSales);
  };

  const filteredArr = intersectionBy(filteredByBrands, filteredByCategories, 'id');

  // useEffect(() => {
  //   let localFilteredSales = [];
  //   if (strSelectedDate?.length === 2) {
  //     const filteredList = sales?.filter((sale) => {
  //       const dateCreated = sale.created_at.split(' ')[0];
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
  //   } else if (strSelectedDate?.length === 1) {
  //     const filteredList = sales.filter((sale) => {
  //       const dateCreated = sale.created_at.split(' ')[0];
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
  //   if (selectedCustomer) {
  //     localFilteredSales = localFilteredSales.filter(
  //       (sale) => sale.customer_name === selectedCustomer
  //     );
  //   }
  //   //Eslam 19
  //   let totalPrice = 0;
  //   let taxAmount = 0;
  //   localFilteredSales.forEach((obj) => {
  //     const price = parseFloat(obj.total_price);
  //     const tax = parseFloat(obj.tax_amount);
  //     totalPrice += price;
  //     taxAmount += tax;
  //   });
  //   const totalPriceAndTax = totalPrice + taxAmount;
  //   setDetails({
  //     subTotal: totalPrice,
  //     tax: taxAmount,
  //     cost: totalPriceAndTax,
  //   });
  //   setFilteredSales(localFilteredSales);
  // }, [strSelectedDate, selectedCustomer]);

  const resetFilters = () => {
    setFilteredByCategories(sales);
    setFilteredByBrands(sales);

    setSelectedCategory(null);
    setSelectedBrand(null);
  };

  //table columns
  const columns: GridColDef<IStockReport>[] = [
    { field: 'sku', headerName: 'SKU', width: 80 },
    { field: 'product_name', headerName: 'Product Name', minWidth: 80, flex: 1 },
    { field: 'brand_name', headerName: 'Brand Name' },
    { field: 'category_name', headerName: 'Category' },
    // { field: 'location_name', headerName: 'Location', flex: 1, minWidth: 120 },
    {
      field: 'unit_name',
      headerName: 'Unit Price',
      flex: 1,
      renderCell: ({ row }) => getLocalizedPrice(row.sell_price),
    },
    {
      field: 'available_qty',
      headerName: 'Current Stock',
      flex: 1,
      renderCell: ({ row }) => `${+row?.available_qty || 0} ${row.unit_name}`,
    },
    {
      field: 'current_stock_value_purchase',
      headerName: 'Current Stock (By Purchse)',
      renderCell: ({ row }) => getLocalizedPrice(+row?.available_qty * +row.cost_price),
    },
    {
      field: 'current_stock_value_sell',
      headerName: 'Current Stock (By Sell)',
      renderCell: ({ row }) => getLocalizedPrice(+row?.available_qty * +row.sell_price),
    },

    {
      field: 'profit',
      headerName: 'Potential Profit',
      renderCell: ({ row }) =>
        getLocalizedPrice(+row?.available_qty * (+row.sell_price - +row.cost_price)),
    },
    {
      field: 'sell_price',
      headerName: 'Sell Price',
      renderCell: ({ row }) => getLocalizedPrice(row.sell_price),
    },
    {
      field: 'sold_qty',
      headerName: 'Total Unit Sold',
      renderCell: ({ row }) => (+row.sold_qty).toFixed(0),
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
  const handelFilterEndPoint = (): string => {
    let endPoint = '';

    if (selectedBrand) {
      endPoint = endPoint + `&brand_id=${selectedBrand.value}`;
    }
    if (selectedCategory) {
      endPoint = endPoint + `&category_id=${selectedCategory.value}`;
    }
    return endPoint;
  };

  // init sales data
  async function initDataPage(numPages = NUMBER_PAGE_DEFAULT) {
    setIsLoadItems(true);
    pageNumRef.current = numPages;
    const endPoint = handelFilterEndPoint();

    api
      .get(`reports/itemStock?location_id=${shopId}&page=${numPages}${endPoint}`)
      .then(({ data }) => {
        const brandSet = new Map();
        const _sales = data?.result?.data?.map((item) => ({
          id: nanoid(5),
          ...item,
        }));

        setPaginationTotal(data.result.last_page);
        setSales(_sales);
        setFilteredSales(_sales);
        setFilteredByBrands(_sales);
        setFilteredByCategories(_sales);
        _sales.forEach(({ brand_id, brand_name }) => {
          if (!brandSet.has(brand_id)) {
            brandSet.set(brand_id, {
              id: brand_id,
              name: brand_name,
            });
          }
        });
        // const brandList = Array.from(brandSet).map(([name, value]) => ({ ...value }));
        // console.log(brandList);
      })
      .finally(() => {
        setIsLoadItems(false);
      });
  }

  const getSelectedData = () => {
    posService.getBrands(shopId as string).then(({ result }) => {
      setBrands(result.map((p) => ({ ...p, label: p.name, value: p.id })));
    });
    posService.getCategories(shopId as string).then(({ result }) => {
      setCategories(result.map((p) => ({ ...p, label: p.name, value: p.id })));
    });
  };

  useEffect(() => {
    if (!shopId) return;
    initDataPage(NUMBER_PAGE_DEFAULT);
  }, [shopId, router.query.slug, selectedBrand, selectedCategory]);

  useEffect(() => {
    if (!shopId) return;
    getSelectedData();

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);
  }, [shopId, router.query.slug]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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
          <Select
            options={categories}
            isClearable
            value={selectedCategory}
            id="category-select"
            placeholder="Category"
            onChange={handleSelectCategory}
          />
        </FormControl>

        <FormControl sx={{ m: 1, width: 220 }}>
          <Select
            // labelId="Brand-select-label"
            id="brand-select"
            isClearable
            options={brands}
            value={selectedBrand}
            placeholder="Brand"
            onChange={handleSelectBrand}
          />
        </FormControl>

        <Button onClick={resetFilters} style={{ height: '2.5rem', marginLeft: 'auto' }}>
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
        <h5> Stock Report</h5>
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
          rows={filteredArr}
          columns={columns}
          // pageSize={30}
          // rowsPerPageOptions={[10]}
          components={{ Toolbar: CustomToolbar, Pagination: CustomPagination }}
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

export default withAuth(StockReport);
