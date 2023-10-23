import { IReportData } from '@models/pos.types';
import classNames from 'classnames';
import Fuse from 'fuse.js';
import { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { MdAutorenew, MdInfoOutline } from 'react-icons/md';
// import { FixedSizeList } from 'react-window';
// import InfiniteLoader from 'react-window-infinite-loader';
import { useUser } from 'src/context/UserContext';
import { ICart, addMultipleToCart } from 'src/redux/slices/cart.slice';
import { useGetSalesReport } from 'src/services/pos.service';
import OrderInfoTable from './OrderInfoTable';
import { motion } from 'framer-motion';
import { useAppDispatch } from 'src/hooks';
import { findAllData } from 'src/services/crud.api';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { ButtonGroup } from '@mui/material';

export default function OrdersTable({ lang, shopId, searchQuery = '', closeModal }) {
  const dispatch = useAppDispatch();

  const { locationSettings } = useUser();
  const [isOrderDetails, setIsOrderDetails] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string | number>('');
  const [page, setPage] = useState<number>(0);
  const [visibleItems, setvisibleItems] = useState<number>(10);
  const [renderdItems, setRenderdItems] = useState<IReportData[]>([]);
  // this listing all orders once
  const { isLoading, salesReport } = useGetSalesReport(shopId, null, {});

  const handleOrderInfo = (order_id: string | number) => {
    setOrderId(order_id);
    setIsOrderDetails(true);
  };

  // const renderItems = () => {
  //   if (!salesReport?.data?.length) return [];

  //   let orderlistPaginated = salesReport?.data;
  //   const fuse = new Fuse(orderlistPaginated, {
  //     threshold: 0.0,
  //     ignoreLocation: true,
  //     keys: ['id', 'contact_name'],
  //   });
  //   const result = fuse.search(searchQuery);
  //   if (searchQuery) orderlistPaginated = result.map((r) => r.item);
  //   return orderlistPaginated?.slice(0, visibleItems);
  // };

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
    },
    {
      field: 'sub_total',
      headerName: `${lang.cartComponent.orderModal.price}`,
      flex: 1,
      disableColumnMenu: true,
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
    else {
      let orderlistPaginated = salesReport?.data;
      const fuse = new Fuse(orderlistPaginated, {
        threshold: 0.0,
        ignoreLocation: true,
        keys: ['id', 'contact_name'],
      });
      const result = fuse.search(searchQuery);
      if (searchQuery) orderlistPaginated = result.map((r) => r.item);
      setRenderdItems(orderlistPaginated.slice(0, visibleItems));
    }
  }, [salesReport]);

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
            minHeight: '100px'
          }}
          loading={isLoading}
          rows={renderdItems}
          columns={columns}
          initialState={{
            columns: { columnVisibilityModel: { mobile: false } },
          }}
          pageSize={10}
          rowsPerPageOptions={[10]}
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
            {renderItems()}
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
