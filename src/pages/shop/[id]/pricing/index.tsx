import { faEye, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocationSettings, ITokenVerfy } from '@models/common-model';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import * as cookie from 'cookie';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup, Spinner, ToastContainer } from 'react-bootstrap';
import PricingModal from 'src/components/pos/modals/PricingGroupsModal';
import AlertDialog from 'src/components/utils/AlertDialog';
import { ProductContext } from 'src/context/ProductContext';
import { Toastify } from 'src/libs/allToasts';
import { apiFetchCtr } from 'src/libs/dbUtils';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { findAllData } from 'src/services/crud.api';

const PricingGroups = (props) => {
  const { shopId, rules } = props;
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
  const [pricingGroups, setPricingGroups] = useState<{ id: number; name: string; mobile: string }[]>(
    []
  );

  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [showType, setShowType] = useState(String);
  const [currentPricingGroup, setCurrentPricingGroup] = useState<{
    id: string;
    name: string;
    price: number;
  }>();
  const { customers } = useContext(ProductContext);

  const [addPricingModal, setAddPricingModal] = useState<boolean>(false);
  const pricingModalHandler = (status: any) => {
    setAddPricingModal(false);
    initDataPage();
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'price', headerName: 'Price', flex: 1 },
    {
      field: 'action',
      headerName: 'Action ',
      sortable: false,
      disableExport: true,
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            {permissions.hasEdit && (
              <Button
                onClick={(event) => {
                  // router.push('/shop/' + shopId + '/customers/edit/' + row.id)
                  event.stopPropagation();
                  setCurrentPricingGroup({
                    id: row.id,
                    name: row.name,
                    price: row.price
                  });
                  setShowType('edit');
                  setAddPricingModal(true);
                }}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
            {permissions.hasDelete && (
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  // setSelectId(row.id);
                  // setShow(true);
                  const _data = [...pricingGroups];
                  const idx = _data.findIndex((itm: any) => itm.id == row.id);
                  if (idx != -1) {
                    _data.splice(idx, 1);
                    setPricingGroups(_data);
                  }
                }}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
            {/* <Button
              onClick={() => {
                router.push('/shop/' + shopId + '/pricing/' + row.id);
              }}>
              <FontAwesomeIcon icon={faEye} />
            </Button> */}
          </ButtonGroup>
        </>
      ),
    },
  ];
  async function initDataPage() {
    if(router.isReady) {
      const res = await findAllData(`pricing-group/${router.query.id}`)
      if (!res.data.success) {
        Toastify('error', 'Somthing wrong!!, try agian');
        return;
      }
      setPricingGroups(res.data.result.pricingGroup);
      setIsLoading(false);
    }
  }
  const [locations, setLocations] = useState<{ value: number; label: string }[]>([]);
  const [permissions, setPermissions] = useState<any>();
  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions'));
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms.pos.map((perm) =>
      perm.name.includes('getpricinggroup get GET')
        ? (getPermissions.hasView = true)
        : perm.name.includes('pricinggroup add POST')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('pricinggroup update PUT')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('pricinggroup delete DELETE')
        ? (getPermissions.hasDelete = true)
        : null
    );

    setPermissions(getPermissions);

    const _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    setLocations(_locs);
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );
    else alert('errorr location settings');
    initDataPage();
  }, [router.asPath]);

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (result) {
      const _data = [...pricingGroups];
      const idx = _data.findIndex((itm: any) => itm.id == selectId);
      if (idx != -1) {
        _data.splice(idx, 1);
        setPricingGroups(_data);
      }
    }
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
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
          type="customer"
          subType="deleteCustomer">
          Are you Sure You Want Delete This Customer ?
        </AlertDialog>
        {/* start */}
        {/* router.push('/shop/' + shopId + '/customers/add') */}
        {!isLoading && permissions.hasInsert && (
          <div className="mb-2">
            <button
              className="btn btn-primary p-3"
              onClick={() => {
                setShowType('add');
                setAddPricingModal(true);
              }}>
              <FontAwesomeIcon icon={faPlus} /> Add New Pricing Group{' '}
            </button>
          </div>
        )}
        {!isLoading ? (
          <>
            <div className="page-content-style card">
              <h5>Pricing Group List</h5>
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
                rows={pricingGroups}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                onSelectionModelChange={(ids: any) => onRowsSelectionHandler(ids)}
              />
            </div>
          </>
        ) : (
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        )}
      </AdminLayout>
      <PricingModal
        shopId={shopId}
        showType={showType}
        userdata={currentPricingGroup}
        customers={customers}
        statusDialog={addPricingModal}
        openDialog={pricingModalHandler}
      />
    </>
  );
};
export default PricingGroups;