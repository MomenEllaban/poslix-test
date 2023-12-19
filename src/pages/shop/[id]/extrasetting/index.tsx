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

const Extras: NextPage = (props: any) => {
    const { t } = useTranslation();
    const { shopId, rules } = props;
    const router = useRouter();
    const [categoriesList, setCategoriesList] = useState<
    {
      id: number;
      name: string;
      second_name: string;
      extras: {
        id: number;
        name: string;
        second_name:string;
        price: number;
      }[];
    }[]
  >([]);

  const [category, setCategory] = useState<{
    id: string;
    name: string;
    second_name: string;
    allow_multi_selection:boolean;
  }>({ id: '1', name: 'sample category', second_name: 'sample', allow_multi_selection:false });
  
  const [categoryExtrasList,setCategoryExtrasList] = useState([]);
  const [categoryIsModal, setCategoryIsModal] = useState<boolean>(false);

  const [showType, setShowType] = useState(String); 

  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
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
      setCategoriesList(res.data.result);
      }catch(e){
        setCategoriesList([])
      }
    }
    setIsLoading(false);
  }
  
// only temporary until i solve the eager loading on the backend
  async function getExtras(id){
    try{
      const res = await findAllData(`extras-categories/extras/${id}`);
      console.log('Extras API Response:', res.data); 
      if (res.data.status == 404) {
        Toastify('error', 'not found');
        return false ;
      }
      if (res.data.status !== 200) {
        Toastify('error', 'Somthing wrong!!, try agian');

        return false ;
      }
      setCategoryExtrasList(res.data.result);
    }catch(e){
      setCategoryExtrasList([]);
    }
  }

  const extraModalHandler = (status: any) => {
    setCategoryIsModal(false);
    initDataPage();
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'name', headerName: t('extra.category_name'), flex: 1 },
    { field: 'second_name', headerName: t('extra.category_second_name'), flex: 1 },
    {
      field: 'actions',
      headerName: t('extra.actions'),
      sortable: false,
      disableExport: true,
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            {true && (
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  getExtras(row.id)
                  setCategory({
                    id: row.id,
                    name: row.name,
                    second_name: row.second_name,
                    allow_multi_selection: row.allow_multi_selection,
                  });
                  setSelectId(row.id);
                  setShowType('show');
                  setCategoryIsModal(true);
                }}>
                
                <FontAwesomeIcon icon={faEye} />
              </Button>
            )}
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  getExtras(row.id);
                  setCategory({
                    id: row.id,
                    name: row.name,
                    second_name: row.second_name,
                    allow_multi_selection: row.allow_multi_selection,
                  });
                  setSelectId(row.id);
                  setShowType('edit');
                  setCategoryIsModal(true);
                }}>
                
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>

            <Button
              onClick={(event) => {
                event.stopPropagation();
                setSelectId(row.id);
                setShow(true);
              }}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </ButtonGroup>
        </>
      ),
    },
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
        <GridToolbarColumnsButton placeholder="grid"/>
      </GridToolbarContainer>
    );
  }

  useEffect(() => {
    initDataPage();
    setLocationID(router.query.id)
  }, [router.asPath]);

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    initDataPage();
    setShow(false);
  };
  
  const onRowsSelectionHandler = (ids: any) => {};

    return (
        <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}
          alertFun={handleDeleteFuc}
          shopId={shopId}
          id={selectId}
          locationID={locationID}
          url={'extras-categories'}>
          Are you Sure You Want Delete This Category ?
        </AlertDialog>
        {!isLoading && (
          <div className="mb-2">
            <button
              className="btn btn-primary p-3"
              onClick={() => {
                setShowType('add');
                setCategoryIsModal(true);
              }}>
              <FontAwesomeIcon icon={faPlus} /> {t('extra.add_new_category')}{' '}
            </button>
          </div>
        )}
        {!isLoading ? (
          <>
            <div className="page-content-style card">
              <h5>{t('extra.categories_list')}</h5>
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
                rows={categoriesList}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                onSelectionModelChange={(ids: any) => onRowsSelectionHandler(ids)}
                components={{ Toolbar: CustomToolbar }}
              />
            </div>
          </>
        ) : (
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        )}
      </AdminLayout>
      <ExtraModal
        shopId={locationID}
        extrasList={categoryExtrasList}
        category={category}
        selectId={selectId}
        showType={showType}
        statusDialog={categoryIsModal}
        openDialog={extraModalHandler} />
    </>
    );
}
export default withAuth(Extras);

export async function getServerSideProps({ params, locale }) {
  const { id } = params;
  return {
    props: { id, ...(await serverSideTranslations(locale)) },
  };
}