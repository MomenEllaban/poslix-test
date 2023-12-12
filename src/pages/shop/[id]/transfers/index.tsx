import { faEye, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocationSettings, ITransferItem } from '@models/common-model';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import { AddTranseferModal } from 'src/components/pos/modals/transefer-modals.js/add-transefer-modal';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Toastify } from 'src/libs/allToasts';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import { findAllData } from 'src/services/crud.api';
import {ReceiveTransferModal} from '../../../../components/transefers/recieve-transfer-modal';
import {TransferDetailsModal} from '../../../../components/transefers/transefer-details-modal'
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

let locations;
const Transfer: NextPage = (props: any) => {
  const { shopId, id } = props;
  const myLoader = (img: any) => img.src;
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    // @ts-ignore
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });
  const router = useRouter();
  const [products, setProducts] = useState<
    { id: number; name: string; sku: string; type: string; qty: number }[]
  >([]);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [type, setType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);
  const { t } = useTranslation();

  async function initDataPage() {
    if (router.isReady) {
      const res = await findAllData(`transfer/${router.query.id}`);
      if (!res.data.success || res.data.status === 201) {
        Toastify('error', 'Somthing wrong!!, try agian');
        return;
      }
      setProducts(res.data.result);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    var _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
        _locs.findIndex((loc: any) => {
          return loc.value == shopId;
        })
        ]
      );

    initDataPage();
  }, [router.asPath]);
  useEffect(() => {

    if (router.query.id) {
      locations = JSON.parse(localStorage.getItem('locations') || '[]');

    }
  }, [router.query.id])
  const [permissions, setPermissions] = useState<any>();
  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions')).filter(
      (loc) => loc.id == router.query.id
    );
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms[0]?.permissions.map((perm) =>
      perm.name.includes('transfers/show')
        ? (getPermissions.hasView = true)
        : perm.name.includes('transfers/add')
          ? (getPermissions.hasInsert = true)
          : perm.name.includes('transfers/update')
            ? (getPermissions.hasEdit = true)
            : perm.name.includes('transfers/delete')
              ? (getPermissions.hasDelete = true)
              : null
    );

    setPermissions(getPermissions);
  }, []);

  const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);
  const customerModalHandler = (trans: ITransferItem) => {
    setCustomerIsModal(false);
    setTransferList((prev) => prev.concat(trans));

    // initDataPage();
  };

  const handleClick = (index: number) => {
    if (products[index].type != 'package' && products[index].qty > 0) {
      setSelectId(products[index].id);
      setType(products[index].type);
      setIsOpenPriceDialog(true);
    }
  };
  const handleDeleteFuc = (result: boolean, msg: string, id: string) => {
    if (result) {
      const _data = [...products];
      const idx = _data.findIndex((itm: any) => itm.id == selectId);
const updatedProduct:any=products.find((p:any)=>p.id===id)

      if (idx != -1) {
        _data.splice(idx, 1,{...updatedProduct,status:"cancelled"});
        setProducts(_data);
      }
    }
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
  };

  const [transferList, setTransferList] = useState<ITransferItem[]>([]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    {
      field: 'created_at', headerName: t('transfers.Date'), flex: 1, valueGetter: (params) => {
     

        return new Date(params.value)?.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    { field: 'ref_no', headerName: t('transfers.Refrence_No'), flex: 1 },
    { field: 'status', headerName: t('transfers.Status'), flex: 1 },
    {
      field: 'location_from_name', headerName: t('transfers.Location_From'), flex: 1, valueGetter: (params) => {
       return params.value
      },
    },
    {
      field: 'location_to_name', headerName: t('transfers.Location_To'), flex: 1, valueGetter: (params) => {
      return  params.value
      },
    },
    {
      field: 'name',
      headerName: t('transfers.Products'),
      flex: 1,
      valueGetter: (params) => {
        
        let name = '';
        params.row.products.map((prod:any, i:number) => {
          name += prod.name +'('+ parseFloat(prod?.pivot?.qty)+')'  + (i === (params.row.products.length - 1) ? '' : ', ');
        });
        return name;
      },
    },
    // {
    //   field: 'qty',
    //   headerName: 'Quantity',
    //   flex: 1,
    //   valueGetter: (params) => params.row.product.qty,
    // },
    // {
    //   field: 'totalPrice',
    //   headerName: 'Total Price',
    //   flex: 1,
    //   valueGetter: (params) => params.row.product.totalPrice,
    // },

    {
      field: 'action',
      headerName: t('transfers.Action'),
      sortable: false,
      disableExport: true,
      flex: 1.5,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            {/* {permissions.hasEdit && (
              <Button
                onClick={(event) => {
                  // router.push('/shop/' + shopId + '/customers/edit/' + row.id)
                  event.stopPropagation();
                }}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )} */}
            {permissions.hasDelete && (
              <Button
              disabled={row.status==='received'||row.status==='cancelled'}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectId(row.id);
                  setShow(true);
                }}>
                <CloseIcon  style={{color:(row.status==='received'||row.status==='cancelled')?'gray':''}}/>
              </Button>
            )}
           
           <TransferDetailsModal locations={locations} shopId={shopId} transfer={row}/>
           <ReceiveTransferModal setProducts={setProducts} locations={locations} shopId={shopId} transfer={row}/>
          </ButtonGroup>
        </>
      ),
    },
  ];
  // function CustomToolbar() {
  //   return (
  //     <GridToolbarContainer>
  //       <GridToolbarExport />
  //       <GridToolbarColumnsButton />
  //     </GridToolbarContainer>
  //   );
  // }
  return (
    <>
      <AdminLayout shopId={id}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}    
          alertFun={handleDeleteFuc}
          shopId={id}
          id={selectId}
          url={'transfer'}>
         {t("transfers.Are_you_Sure_You_Want_Cancel_This_transefer_?")}
        </AlertDialog>
        {!isLoading && permissions.hasInsert && (
          <div className="mb-2">
            <button
              className="btn btn-primary p-3"
              onClick={() => {
                router.push(`/shop/${router.query.id}/transfers/add`);
              }}>
              <FontAwesomeIcon icon={faPlus} /> {t("transfers.Add_New_Transfer")}{' '}
            </button>
            {/* <AddTranseferModal getTransefers={initDataPage}/> */}
          </div>
        )}
       
          <div className="page-content-style card">
            <h5>{t("transfers.Transfers_List")}</h5>
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
              rows={products}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              components={{ Toolbar: CustomToolbar }}
            
            />
          </div>
        ) 
      </AdminLayout>
      {/* <TransferModal
        shopId={shopId}
        showType={'add'}
        userdata={{}}
        customers={{}}
        statusDialog={customerIsModal}
        openDialog={customerModalHandler}
        initData={initDataPage}
      /> */}
    </>
  );
};
export default withAuth(Transfer);
export async function getServerSideProps({ params,locale }) {
  const { id } = params;
  return {
    props: { id ,
      ...(await serverSideTranslations(locale))},
  };
}
