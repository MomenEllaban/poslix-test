import { AdminLayout } from '@layout';
import { ILocationSettings, ITokenVerfy } from '@models/common-model';
import React, { useEffect, useState } from 'react';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import * as cookie from 'cookie';
import { Button, ButtonGroup, Spinner, ToastContainer } from 'react-bootstrap';
import { apiFetchCtr } from 'src/libs/dbUtils';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ROUTES } from 'src/utils/app-routes';
const PricingGroup = (props: any) => {
  const { shopId, initData } = props;
  const [isLoading, setIsLoading] = useState(true);
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
  const [products, setProducts] = useState();
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'sell_price',
      headerName: 'Sell',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (row.type == 'single')
          return Number(row.sell_price).toFixed(locationSettings?.location_decimal_places);
        else
          return (
            Number(row.min_price).toFixed(locationSettings?.location_decimal_places) +
            ' - ' +
            Number(row.max_price).toFixed(locationSettings?.location_decimal_places)
          );
      },
    },
    {
      field: 'price',
      headerName: 'Price',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => <input type="number" />,
    },
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
                }}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
          </ButtonGroup>
        </>
      ),
    },
  ];
  const onRowsSelectionHandler = (ids: any) => {};
  async function initDataPage() {
    const { success, data } = await apiFetchCtr({
      fetch: 'products',
      subType: 'getProducts',
      shopId,
    });
    if (success) setProducts(data.products);
    console.log(data.products);

    setIsLoading(false);
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
  }, []);
  return (
    <>
      <AdminLayout shopId={shopId}>
        <div>PricingGroup</div>
        <ToastContainer />
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
                rows={products}
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
    </>
  );
};

export default PricingGroup;