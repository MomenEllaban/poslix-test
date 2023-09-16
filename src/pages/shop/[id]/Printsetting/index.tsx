import { faEye, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocationSettings } from '@models/common-model';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {  useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import PrinterModal from '../../../../components/pos/modals/PrinterModal';
import { ProductContext } from '../../../../context/ProductContext';

const Printers: NextPage = (props: any) => {
  const { shopId, rules } = props;

  // const [locationSettings, setLocationSettings] = useState<ILocationSettings>({});
  const router = useRouter();
 
  
  const [printersList, setPrinters] = useState<{ id: number; name: string; ip: string; print_type: string;status:string,connection:string }[]>(
    []
  );
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showType, setShowType] = useState(String);
  const [printer, setPrinter] = useState<{
    value: string;
    label: string;
    isNew: boolean;
  }>({ value: '1', label: 'walk-in printer', isNew: false });
  const [printerIsModal, setPrinterIsModal] = useState<boolean>(false);
  async function initDataPage() {
    if (router.query.id) {
      const res = await findAllData(`print-settings/${router.query.id}`);
      console.log(res,"res");
      if (res.data.status !== 200) {
        Toastify('error', 'Somthing wrong!!, try agian');
        return;
      }
      console.log(res.data.result,"object");
      setPrinters([res.data.result]);
    }
    setIsLoading(false);
  }
  const printerModalHandler = (status: any) => {
    setPrinterIsModal(false);
    initDataPage();
  };
console.log(router.query.id,printersList);
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    {field: 'name',headerName: 'Printer Name',flex: 1,},
    { field: 'ip', headerName: 'IP', flex: 1 },
    { field: 'status', headerName: 'printer status', flex: 1 },
    { field: 'print_type', headerName: 'Printer Type', flex: 1 },
    { field: 'connection', headerName: 'connection method', flex: 1 },
    {field: 'action',headerName: 'Action ',
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
                  setPrinter({
                    value: row.id,
                    label: row.name,
                    isNew: false,
                  });
                  setSelectId(row.id);
                  setShowType('edit');
                  setPrinterIsModal(true);
                }}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
           
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
          url={'printers'}>
          Are you Sure You Want Delete This printer ?
        </AlertDialog>
        {!isLoading && (
          <div className="mb-2">
            <button
              className="btn btn-primary p-3"
              onClick={() => {
                setShowType('add');
                setPrinterIsModal(true);
              }}>
              <FontAwesomeIcon icon={faPlus} /> Add New printer{' '}
            </button>
          </div>
        )}
        {!isLoading ? (
          <>
            <div className="page-content-style card">
              <h5>printer List</h5>
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
                rows={printersList}
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
      <PrinterModal
        shopId={shopId}
        printersList={printersList}
        id={selectId}
        showType={showType}
        userdata={printer}
        printers={printersList}
        statusDialog={printerIsModal}
        openDialog={printerModalHandler}
      />
    </>
  );
};
export default withAuth(Printers);
