// import { faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
// import { ILocationSettings, ITokenVerfy } from '@models/common-model';
// import {
//   GridColDef,
//   GridRowParams,
//   GridToolbarColumnsButton,
//   GridToolbarContainer,
//   GridToolbarExport,
//   GridToolbarQuickFilter,
// } from '@mui/x-data-grid';
// import * as cookie from 'cookie';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
// import React, { useContext, useEffect, useState, useRef, RefObject } from 'react';
// import { Button, ButtonGroup } from 'react-bootstrap';
// import { useReactToPrint } from 'react-to-print';
import SalesListTable from 'src/components/dashboard/SalesListTable';
// import { UserContext } from 'src/context/UserContext';
// import { Toastify } from 'src/libs/allToasts';
// import { apiFetch, apiFetchCtr } from 'src/libs/dbUtils';
// import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { findAllData } from 'src/services/crud.api';
import Pagination from '@mui/material/Pagination';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

export default function SalesList(props: any) {
  const { shopId, id } = props;
  // const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
  //   // @ts-ignore
  //   value: 0,
  //   label: '',
  //   currency_decimal_places: 0,
  //   currency_code: '',
  //   currency_id: 0,
  //   currency_rate: 1,
  //   currency_symbol: '',
  // });
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const handleClose = () => {
  //   setAnchorEl(null);
  // };
  const [sales, setSales] = useState<any>([]);
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoadItems, setIsLoadItems] = useState(false);

  const NUMBER_PAGE_DEFAULT = 1;

  const pageNumRef = useRef(NUMBER_PAGE_DEFAULT) as React.MutableRefObject<number>;

  // init sales data

  async function initDataPage(numPage = NUMBER_PAGE_DEFAULT) {
    if (router.isReady) {
      pageNumRef.current = numPage;
      setIsLoadItems(true);
      const res = await findAllData(`reports/sales/${router.query.id}?page=${numPage}`); // 1256
      if (res.data.success) {
        setSales(res.data.result);
        setIsLoadItems(false);
      }
    }
  }

  const [permissions, setPermissions] = useState<any>();
  useEffect(() => {

    initDataPage(NUMBER_PAGE_DEFAULT);


    const perms = JSON.parse(localStorage.getItem('permissions')).filter(
      (loc) => loc.id == router.query.id
    );
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms[0]?.permissions?.map((perm) =>
      perm.name.includes('sales-list/view')
        ? (getPermissions.hasView = true)
        : perm.name.includes('sales-list/add')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('sales-list/update')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('sales-list/destroy')
        ? (getPermissions.hasDelete = true)
        : null
    );

    setPermissions(getPermissions);

  }, [router.asPath]);

  function CustomPagination(): React.JSX.Element {
    return (
      <Pagination
        color="primary"
        variant="outlined"
        shape="rounded"
        page={pageNumRef.current}
        count={sales?.pagination?.last_page}
        onChange={(event, value) => initDataPage(value)}
      />
    );
  }
  return (
    <AdminLayout shopId={id}>
      <SalesListTable
        shopId={id}
        t={t}
        rules={permissions}
        salesList={sales}
        loading={isLoadItems}
        CustomPagination={CustomPagination}
      />
    </AdminLayout>
  );
}


export async function getServerSideProps({ params, locale }) {
  const { id } = params;

  return {
    props: { id, ...(await serverSideTranslations(locale)) },
  };
}
