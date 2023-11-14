import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { IOpenCloseReport } from '@models/reports.types';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import withAuth from 'src/HOCs/withAuth';
import AlertDialog from 'src/components/utils/AlertDialog';
import { useUser } from 'src/context/UserContext';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import RegisterToPrint from 'src/modules/reports/_components/RegisterToPrint';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import Pagination from '@mui/material/Pagination';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
interface IDetails {
  total_hand_cash: number;
  total_cash: number;
  total_cheque: number;
  total_bank: number;
  total_cart: number;
  total: number;
}

const initialDetailsState: IDetails = {
  total_hand_cash: 0,
  total_cash: 0,
  total_cheque: 0,
  total_bank: 0,
  total_cart: 0,
  total: 0,
};

function SalesReport() {
  const router = useRouter();
  const shopId = router.query.id ?? '';
  const { invoicDetails } = useUser();
  const [locationSettings, setLocationSettings] = useState<any>();

  const componentRef = useRef(null);

  const { t } = useTranslation();
  const NUMBER_PAGE_DEFAULT = 1;

  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [lines, setLines] = useState<any[]>([]);
  const [selectRow, setSelectRow] = useState<any>({});
  const [isLoadItems, setIsLoadItems] = useState(false);
  const [sales, setSales] = useState<IOpenCloseReport[]>([]);
  const [details, setDetails] = useState(initialDetailsState);
  const [paginationTotal, setPaginationTotal] = useState(NUMBER_PAGE_DEFAULT);

  const pageNumRef = useRef(NUMBER_PAGE_DEFAULT) as React.MutableRefObject<number>;

  const columns: GridColDef<IOpenCloseReport>[] = [
    { field: 'id', headerName: '#', maxWidth: 72 },
    {
      field: 'name',
      headerName: t('g.Cashier'),
      maxWidth: 100,
      renderCell: ({ row }: Partial<GridRowParams>) => row.status,
    },
    {
      field: 'status',
      headerName: t('g.type'),
      maxWidth: 100,
      disableColumnMenu: true,
      renderCell: ({ row }: Partial<GridRowParams>) => row.status,
    },
    {
      field: 'closing_amount',
      headerName: t('g.handCash'),
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        Number(row.hand_cash).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'total_card_slips',
      headerName: t('g.Card'),
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        Number(row.cart).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'total_cash',
      headerName: t('g.Cash'),
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        Number(row.cash).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'total_cheques',
      headerName: t('g.Cheques'),
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        Number(row.cheque).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'total_bank',
      headerName: t('g.Bank'),
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        Number(row.bank).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'date',
      headerName: t('g.Date'),
      minWidth: 120,
      renderCell: ({ row }: Partial<GridRowParams>) => `${new Date(row.date).toLocaleDateString()}`,
    },
    {
      field: 'closing_note',
      headerName: t('g.Note'),
      flex: 1,
      disableColumnMenu: true,
      renderCell: ({ row }) => row.note?.trim() || '---',
    },
  ];

  async function initDataPage(pageNum = NUMBER_PAGE_DEFAULT) {
    setIsLoadItems(true);
    pageNumRef.current = pageNum;
    api
      .get(`reports/register/${shopId}?page=${pageNum}`)
      .then(({ data }) => {
        const { data: ocReports, ...details } = data.result ?? { data: [], details: {} };

        setSales(ocReports.data as IOpenCloseReport[]);
        setPaginationTotal(ocReports.last_page);
        setDetails((data) => ({ ...data, ...details }));
      })
      .finally(() => {
        setIsLoadItems(false);
      });
  }

  useEffect(() => {
    if (!shopId) return;

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);

    initDataPage();
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
          <RegisterToPrint
            lines={lines}
            ref={componentRef}
            selectRow={selectRow}
            invoicDetails={invoicDetails}
            locationSettings={locationSettings}
          />
        </div>
      }
      <div className="page-content-style card">
        <h5>{t('g.ReportOpenRegister')}</h5>
        <div className="deatils_box">
          <div>
            <span>{t('g.Total')}: </span>
            {details.total?.toFixed(locationSettings?.location_decimal_places)}{' '}
            {locationSettings?.currency_code}
          </div>
          <div>
            <span>{t('g.TotalBank')}: </span>
            {details.total_bank?.toFixed(locationSettings?.location_decimal_places)}{' '}
            {locationSettings?.currency_code}
          </div>
          <div>
            <span>{t('g.TotalCard')}: </span>
            {details.total_cart?.toFixed(locationSettings?.location_decimal_places)}{' '}
            {locationSettings?.currency_code}
          </div>
        </div>

        <DataGrid
          rows={sales}
          columns={columns}
          loading={isLoadItems}
          className="datagrid-style"
          autoPageSize
          // pageSize={30}
          // rowsPerPageOptions={[10, 20, 30]}
          components={{ Toolbar: CustomToolbar, Pagination: CustomPagination }}
          sx={{
            '.MuiDataGrid-columnSeparator': { display: 'none' },
            '&.MuiDataGrid-root': { border: 'none' },
          }}
        />
      </div>
    </AdminLayout>
  );
}

export default withAuth(SalesReport);

export async function getServerSideProps(context) {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}
