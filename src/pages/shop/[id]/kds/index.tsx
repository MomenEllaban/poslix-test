import type { NextPage } from 'next';
import withAuth from 'src/HOCs/withAuth';
import { faEye, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import ExtraModal from '../../../../components/pos/modals/ExtraModal';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const KDS: NextPage = (props: any) => {
    const { t } = useTranslation();
    const { shopId, rules } = props;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [locationID, setLocationID] = useState(shopId);
  
  async function initDataPage() {
    if (router.query.id) {
      try{
      const res = await findAllData(`extras-categories/`);
      if (res.data.status == 404) {
        Toastify('error', 'not found');
        return false ;
      }
      if (res.data.status !== 200) {
        Toastify('error', 'Somthing wrong!!, try agian');

        return false ;
      }
      }catch(e){

      }
    }
    setIsLoading(false);
  }
  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
        <GridToolbarColumnsButton placeholder={'gridd'} />
      </GridToolbarContainer>
    );
  }

  useEffect(() => {
    initDataPage();
    setLocationID(router.query.id)
  }, [router.asPath]);
  
  const onRowsSelectionHandler = (ids: any) => {};

    return (
        <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        
        {!isLoading && (
          <div className="mb-2">
            <h1>hello</h1>
          </div>
        )}
        {!isLoading ? (
          <>
            <div className="page-content-style card">
              <h5>{t('kds.')}</h5>
              
            </div>
          </>
        ) : (
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        )}
      </AdminLayout>
      
    </>
    );
}
export default withAuth(KDS);

export async function getServerSideProps({ params, locale }) {
  const { id } = params;
  return {
    props: { id, ...(await serverSideTranslations(locale)) },
  };
}