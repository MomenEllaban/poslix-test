import { AdminLayout } from '@layout';
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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import withAuth from 'src/HOCs/withAuth';
import AlertDialog from 'src/components/utils/AlertDialog';
import { useUser } from 'src/context/UserContext';
import api from 'src/utils/app-api';

interface ISummaryDetails {
  total_hand_cash: number;
  total_cash: number;
  total_cheque: number;
  total_bank: number;
  total_cart: number;
  total: number;
}

const initialDetails = {
  total_hand_cash: 0,
  total_cash: 0,
  total_cheque: 0,
  total_bank: 0,
  total_cart: 0,
  total: 0,
};

function SalesReport() {
  const router = useRouter();
  const shopId = router.query.id;
  const componentRef = useRef(null);
  const { locationSettings, invoicDetails } = useUser();

  const [show, setShow] = useState(false);
  const [lines, setLines] = useState<any>([]);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectRow, setSelectRow] = useState<any>({});
  const [sales, setSales] = useState<IOpenCloseReport[]>([]);
  const [details, setDetails] = useState<ISummaryDetails>(initialDetails);

  const columns: GridColDef<IOpenCloseReport>[] = useMemo(
    () => [
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
        renderCell: ({ row }: Partial<GridRowParams>) =>
          `${new Date(row.date).toLocaleDateString()}`,
      },
      {
        field: 'closing_note',
        headerName: 'Note',
        flex: 1,
        disableColumnMenu: true,
        renderCell: ({ row }) => row.note?.trim() || '---',
      },
    ],
    [locationSettings]
  );

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
    setIsLoading(true);
    api
      .get(`reports/register/${shopId}`, { params: { all_data: 1 } })
      .then(({ data }) => {
        const { data: ocReports, ...details } = data.result ?? { data: [], details: {} };
        setSales(ocReports as IOpenCloseReport[]);
        setDetails((data) => ({ ...data, ...details }));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    initDataPage();
  }, [router.query.id]);

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

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
      <GridToolbarColumnsButton />
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

export default withAuth(SalesReport);
