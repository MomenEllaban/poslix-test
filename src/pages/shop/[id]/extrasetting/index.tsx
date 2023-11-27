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


const Extras: NextPage = (props: any) => {
    const { shopId, rules } = props;
    const router = useRouter();
    const [extrasCategoriesList, setExtrasCategoriesList] = useState<
    {
      id: number;
      name: string;
      extras: {
        id: number;
        name: string;
        price: number;
      }[];
    }[]
  >([]);

  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [locationID, setLocationID] = useState(shopId);


  
  const [showType, setShowType] = useState(String); 
  const [category, setCategory] = useState<{
    value: string;
    label: string;
    isNew: boolean;
  }>({ value: '1', label: 'sample category', isNew: false });
  const [categoryIsModal, setCategoryIsModal] = useState<boolean>(false);


  async function initDataPage() {
    if (router.query.id) {
      try{
      const res = await findAllData(`extra-settings/showAll/${router.query.id}`);
      if (res.data.status == 404) {
        Toastify('error', 'not found');
        return false ;
      }
      if (res.data.status !== 200) {
        Toastify('error', 'Somthing wrong!!, try agian');

        return false ;
      }
      setExtrasCategoriesList(res.data.result);
  }catch(e){
    setExtrasCategoriesList([])
  }
     
    }
    setIsLoading(false);
  }
  const extraModalHandler = (status: any) => {
    setCategoryIsModal(false);
    initDataPage();
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'name', headerName: 'Category Name', flex: 1 },
    { field: 'second_name', headerName: 'Category Second Name', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions ',
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
                  setCategory({
                    value: row.id,
                    label: row.name,
                    isNew: false,
                  });
                  setSelectId(row.id);
                  setShowType('edit');
                  setCategoryIsModal(true);
                }}>
                
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  setCategory({
                    value: row.id,
                    label: row.name,
                    isNew: false,
                  });
                  setSelectId(row.id);
                  setShowType('show');
                  setCategoryIsModal(true);
                }}>
                
                <FontAwesomeIcon icon={faEye} />
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
        <GridToolbarColumnsButton />
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
          locatiooID={locationID}
          url={'extra-settings'}>
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
              <FontAwesomeIcon icon={faPlus} /> Add New Category{' '}
            </button>
          </div>
        )}
        {!isLoading ? (
          <>
            <div className="page-content-style card">
              <h5>Categories List</h5>
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
                rows={extrasCategoriesList}
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
        extrasList={extrasCategoriesList}
        selectId={selectId}
        showType={showType}
        userdata={category}
        extras={extrasCategoriesList}
        statusDialog={categoryIsModal}
        openDialog={extraModalHandler} />
    </>
    );
}
export default withAuth(Extras);