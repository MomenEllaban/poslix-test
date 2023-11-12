import { faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
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
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import PrinterModal from '../../../../components/pos/modals/PrinterModal';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

const Printers: NextPage = (props: any) => {
  const { shopId, rules } = props;
  const { t } = useTranslation();
  const router = useRouter();
  const [printersList, setPrinters] = useState<
    {
      id: number;
      name: string;
      ip: string;
      print_type: string;
      status: string;
      connection: string;
    }[]
  >([]);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [locatiooID, setLocatiooID] = useState(shopId);

  const [showType, setShowType] = useState(String);
  const [printer, setPrinter] = useState<{
    value: string;
    label: string;
    isNew: boolean;
  }>({ value: '1', label: 'walk-in printer', isNew: false });
  const [printerIsModal, setPrinterIsModal] = useState<boolean>(false);
  async function initDataPage() {
    if (router.query.id) {
      try{
      const res = await findAllData(`print-settings/showAll/${router.query.id}`);
      if (res.data.status == 404) {
        Toastify('error', 'not found');
        return false ;
      }
      if (res.data.status !== 200) {
        Toastify('error', 'Somthing wrong!!, try agian');

        return false ;
      }
      setPrinters(res.data.result);
  }catch(e){
setPrinters([])
  }
     
    }
    setIsLoading(false);
  }
  const printerModalHandler = (status: any) => {
    setPrinterIsModal(false);
    initDataPage();
  };
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'name', headerName: t('printer.printer_name'), flex: 1 },
    { field: 'ip', headerName: 'IP', flex: 1 },
    { field: 'status', headerName: t('printer.printer_status'), flex: 1,renderCell({ row }){
     
      return  row.status==1?"on":"off"
   } },
    { field: 'print_type', headerName: t('printer.printer_type'), flex: 1 },
    { field: 'connection', headerName: t('printer.connection_method'), flex: 1 },
    {
      field: 'action',
      headerName: t('printer.action'),
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
    setLocatiooID(router.query.id)
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
          locatiooID={locatiooID}
          url={'print-settings'}>
          {t('alert_dialog.delete_printer')}
        </AlertDialog>
        {!isLoading && (
          <div className="mb-2">
            <button
              className="btn btn-primary p-3"
              onClick={() => {
                setShowType('add');
                setPrinterIsModal(true);
              }}>
              <FontAwesomeIcon icon={faPlus} /> {t('printer.add_new_printer')}
            </button>
          </div>
        )}
        {!isLoading ? (
          <>
            <div className="page-content-style card">
              <h5>{t('printer.printer_list')}</h5>
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
        shopId={locatiooID}
        t={t}
        printersList={printersList}
        selectId={selectId}
        showType={showType}
        userdata={printer}
        printers={printersList}
        statusDialog={printerIsModal}
        openDialog={printerModalHandler} />
    </>
  );
};
export default withAuth(Printers);

export async function getServerSideProps({ locale }) {
  return {
    props: { ...(await serverSideTranslations(locale)) },
  };
}
