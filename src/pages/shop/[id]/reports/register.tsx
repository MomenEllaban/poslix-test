import { AdminLayout } from '@layout';
import { ILocationSettings } from '@models/common-model';
import { IOpenCloseReport } from '@models/reports.types';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import withAuth from 'src/HOCs/withAuth';
import AlertDialog from 'src/components/utils/AlertDialog';
import { UserContext, useUser } from 'src/context/UserContext';
import { apiFetchCtr } from 'src/libs/dbUtils';
import api from 'src/utils/app-api';

function SalesReport() {
  const router = useRouter();
  const shopId = router.query.id;
  const { locationSettings, setLocationSettings, invoicDetails } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [sales, setSales] = useState<IOpenCloseReport[]>([]);

  const [show, setShow] = useState(false);

  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({});
  const [lines, setLines] = useState<any>([]);
  const [isLoadItems, setIsLoadItems] = useState(false);
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  const [handleSearchTxt, setHandleSearchTxt] = useState('');
  const [details, setDetails] = useState<{
    total_hand_cash: number;
    total_cash: number;
    total_cheque: number;
    total_bank: number;
    total_cart: number;
    total: number;
  }>({
    total_hand_cash: 0,
    total_cash: 0,
    total_cheque: 0,
    total_bank: 0,
    total_cart: 0,
    total: 0,
  });

  const columns: GridColDef<IOpenCloseReport>[] = [
    { field: 'id', headerName: '#', maxWidth: 72 },
    {
      field: 'name',
      headerName: 'Cashier',
      maxWidth: 100,
      renderCell: ({ row }: Partial<GridRowParams>) => row.status,
    },
    {
      field: 'status',
      headerName: 'Type',
      maxWidth: 100,
      disableColumnMenu: true,
      renderCell: ({ row }: Partial<GridRowParams>) => row.status,
    },
    {
      field: 'closing_amount',
      headerName: 'hand cash',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        +Number(row.hand_cash).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'total_card_slips',
      headerName: 'Card',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        +Number(row.cart).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'total_cash',
      headerName: 'Cash',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        +Number(row.cash).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'total_cheques',
      headerName: 'Cheques',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        +Number(row.cheque).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'total_bank',
      headerName: 'Bank',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        +Number(row.bank).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => `${new Date(row.date).toLocaleDateString()}`,
    },
    {
      field: 'closing_note',
      headerName: 'Note',
      flex: 1,
      disableColumnMenu: true,
      renderCell: ({ row }) => row.note?.trim() || '---',
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
  async function initDataPage() {
    if (!shopId) return;

    api.get(`reports/register/${shopId}`, { params: { all_data: 1 } }).then(({ data }) => {
      console.log(data.result);
      const { data: ocReports, ...details } = data.result ?? { data: [], details: {} };
      setSales(ocReports as IOpenCloseReport[]);
      setDetails((data) => ({ ...data, ...details }));
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
    initDataPage();
  }, [router.query.id]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
        <GridToolbarColumnsButton />
        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  }
  return (
    <AdminLayout shopId={shopId}>
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
        <h5> Report Open Register</h5>
        <div className="deatils_box">
          <div>
            <span>Total: </span>
            {details.total?.toFixed(locationSettings?.location_decimal_places)}{' '}
            {locationSettings?.currency_code}
          </div>
          <div>
            <span>Total Bank: </span>
            {details.total_bank?.toFixed(locationSettings?.location_decimal_places)}{' '}
            {locationSettings?.currency_code}
          </div>
          <div>
            <span>Total Card: </span>
            {details.total_cart?.toFixed(locationSettings?.location_decimal_places)}{' '}
            {locationSettings?.currency_code}
          </div>
        </div>
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
          components={{ Toolbar: CustomToolbar }}
        />
      </div>
    </AdminLayout>
  );
}

export default withAuth(SalesReport);
