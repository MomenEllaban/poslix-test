import { IReportData } from '@models/pos.types';
// import classNames from 'classnames';
import Fuse from 'fuse.js';
import { useEffect, useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { MdAutorenew, MdInfoOutline } from 'react-icons/md';
// import { FixedSizeList } from 'react-window';
// import InfiniteLoader from 'react-window-infinite-loader';
// import { useUser } from 'src/context/UserContext';
import { addMultipleToCart } from 'src/redux/slices/cart.slice';
import posService, { useGetSalesReport } from 'src/services/pos.service';
import OrderInfoTable from './OrderInfoTable';
// import { motion } from 'framer-motion';
import { useAppDispatch } from 'src/hooks';
import { findAllData } from 'src/services/crud.api';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { ButtonGroup } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { ILocationSettings } from '@models/common-model';

export default function OrdersTable({ lang, shopId, searchQuery = '', closeModal }) {
  const dispatch = useAppDispatch();

  // const { locationSettings } = useUser();
  const [isOrderDetails, setIsOrderDetails] = useState<boolean>(false);

  const [orderId, setOrderId] = useState<string | number>('');

  const [renderdItems, setRenderdItems] = useState<IReportData[]>([]);

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

  console.log(renderdItems);

  const NUMBER_PAGE_DEFAULT = 1;

  const pageNumRef = useRef(NUMBER_PAGE_DEFAULT);

  const [loadingChangePage, setLoadingChangePage] = useState(true);

  // this listing all orders once
  const { isLoading, salesReport, refetch } = useGetSalesReport(
    shopId,
    null,
    {},
    pageNumRef.current,
    setLoadingChangePage
  );

  const handleOrderInfo = (order_id: string | number) => {
    setOrderId(order_id);
    setIsOrderDetails(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '#',
      minWidth: 50,
      renderCell({ row }) {
        return `#${row.id}`;
      },
    },
    {
      field: 'contact_name',
      headerName: `${lang.cartComponent.orderModal.customer}`,
      flex: 1,
      renderCell({ row }) {
        return row.contact_name !== ' ' ? row.contact_name : 'walk-in customer';
      },
    },
    {
      field: 'contact_mobile',
      headerName: `${lang.cartComponent.orderModal.mobile}`,
      flex: 1,
      disableColumnMenu: true,
      renderCell({ row }) {
        return row.contact_mobile;
      },
    },
    {
      field: 'sub_total',
      headerName: `${lang.cartComponent.orderModal.price}`,
      flex: 1,
      disableColumnMenu: true,
      renderCell({ row }) {
        
        return row.sub_total.toFixed(locationSettings?.location_decimal_places);
      },
    },
    {
      flex: 1,
      field: 'action',
      headerName: `${lang.cartComponent.orderModal.action}`,
      filterable: false,
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            <Button
              variant="outline-info"
              onClick={async () => {
                const res = await findAllData(`sales/${row.id}`);
                dispatch(
                  addMultipleToCart({
                    location_id: shopId,
                    products: res.data.result.products,
                    orderId: row.id,
                    customerId: row.contact_id,
                    lastTotal: row.sub_total,
                    lastDue: +row.due,
                  })
                );
                closeModal();
              }}>
              <MdAutorenew />
            </Button>
            <Button variant="outline-info" onClick={() => handleOrderInfo(row.id)}>
              <MdInfoOutline />
            </Button>
          </ButtonGroup>
          {/*edited*/}
          {/* <TestModal statusDialog={paymentModalShow} open={setPaymentModalShow}></TestModal> */}
        </>
      ),
    },
  ];

  useEffect(() => {
    if (salesReport.data.length === 0) setRenderdItems([]);
    else if (!searchQuery) setRenderdItems(salesReport?.data);
    else {
      let orderlistPaginated = salesReport?.data;
      const fuse = new Fuse(orderlistPaginated, {
        threshold: 0.0,
        ignoreLocation: true,
        keys: ['id', 'contact_name'],
      });
      const result = fuse.search(searchQuery);
      if (searchQuery) orderlistPaginated = result.map((r) => r.item);
      setRenderdItems(orderlistPaginated);
    }
  }, [salesReport, searchQuery]);
  useEffect(() => {
    refetch();
  }, [pageNumRef.current]);

  function CustomPagination() {
    return (
      <Pagination
        color="primary"
        variant="outlined"
        shape="rounded"
        page={pageNumRef.current}
        count={salesReport?.pagination?.last_page}
        onChange={(event, value) => {
          pageNumRef.current = value;
          setLoadingChangePage(true);
        }}
      />
    );
  }

  useEffect(() => {
    let _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.location_id == shopId;
          })
        ]
      );
  }, []);
  return (
    <>
      {/* <div className="page-content-style card"> */}
      <DataGrid
        className="datagrid-style"
        sx={{
          '.MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '&.MuiDataGrid-root': {
            border: 'none',
          },
          display: isOrderDetails ? 'none' : 'flex',
          height: isLoading ? '200px' : '630px',
        }}
        loading={isLoading || loadingChangePage}
        rows={renderdItems}
        columns={columns}
        initialState={{
          columns: { columnVisibilityModel: { mobile: false } },
        }}
        // pageSize={10}
        // rowsPerPageOptions={[10]}
        components={{ Pagination: CustomPagination }}
      />
      {/* </div> */}
      {/* <Table
          responsive
          className={classNames({
            'd-none': isOrderDetails,
          })}>
          <thead className="text-muted table-light fixed-header">
            <tr>
              <th
                scope="col"
                style={{
                  borderRadius: '12px 0px 0px 10px',
                }}>
                #
              </th>
              <th scope="col">{lang.cartComponent.orderModal.customer}</th>
              <th scope="col">{lang.cartComponent.orderModal.mobile}</th>
              <th scope="col">{lang.cartComponent.orderModal.price}</th>
              <th
                scope="col"
                style={{
                  borderRadius: '0px 10px 10px 0px',
                }}>
                {lang.cartComponent.orderModal.action}
              </th>
            </tr>
          </thead>
          <tbody
            style={{
              maxHeight: '50vh',
            }}>
            {renderItems}
          </tbody>

          {!isLoading && (
            <table className="table table-centered table-hover align-middle  mb-0">
              <tbody> */}
      {/* {filteredOrdersList.length > 0 &&
            [filteredOrdersList].map((ord: any, i) => {
              return (
                <tr key={i}>
             
                  <td>
                    <a
                      href="#"
                      className="px-1 fs-16 text-info"
                      onClick={() => {
                        // setJobType({
                        //   req: 3,
                        //   val: ord.id,
                        // });
                        // handleClose();
                      }}>
                      <i className="ri-edit-line" />
                    </a>
                  
                  </td>
                </tr>
              );
            })} */}
      {/* </tbody>
            </table>
          )} */}
      {/* {!isLoadingDetails && (
      <table className="table table-centered table-hover align-middle  mb-0">
     <thead className="text-muted table-light">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Rate</th>
            <th scope="col">Qny</th>
          </tr>
        </thead>
        <tbody>
        {filteredDisplayOrder.length > 0 &&
            filteredDisplayOrder.map((ord: any, i) => {
              return (
                <tr key={i}>
                  <td>#{i + 1}</td>
                  <td>({ord.name})</td>
                  <td>${Number(ord.price).toFixed(locationSettings?.location_decimal_places)}</td>
                  <td>{Number(ord.qty).toFixed(0)}</td>
                </tr>
              );
            })} 
          <tr>
            <td></td>
            <td style={{ fontWeight: '800' }}>Total</td>
            <td style={{ fontWeight: '800' }}>$1500</td>
            <td></td>
          </tr>
        </tbody>
        <div className="row justify-content-center">
          <button
            className="btn btn-success fw-medium m-1"
            onClick={() => {
              setIsLoading(false);
              // setIsLoadingDetails(true);
            }}>
            <i className="ri-arrow-left-fill me-1 align-middle" /> back
          </button>
        </div>
      </table>
    )} */}
      {/* </Table> */}
      <OrderInfoTable
        shopId={shopId}
        orderId={orderId}
        isOrderDetails={isOrderDetails}
        setIsOrderDetails={setIsOrderDetails}
      />
    </>
  );
}
