import { AdminLayout } from '@layout';
import { ILocationSettings, ITokenVerfy } from '@models/common-model';
import React, { useEffect, useState } from 'react';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import * as cookie from 'cookie';
import { Button, ButtonGroup, Spinner, ToastContainer } from 'react-bootstrap';
import { apiFetchCtr } from 'src/libs/dbUtils';
import { DataGrid, GridColDef, GridRowParams, GridToolbarContainer } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import { findAllData, updateData } from 'src/services/crud.api';
import { Toastify } from 'src/libs/allToasts';


const PricingGroup = (props: any) => {
  const router = useRouter()
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
  const [products, setProducts] = useState<any>();
  const [productsPricingGroup, setProductsPricingGroup] = useState<any>();
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    {
      field: 'name', headerName: 'Name', flex: 1, renderCell: ({ row }: Partial<GridRowParams>) => {

        return <div>{row.name} {row.parent_name ? ' , ' : ''}<span style={{ fontSize: '10px' }} className='text-primary'>{row.parent_name}</span></div>
      }
    },
    { field: 'type', headerName: 'Type', flex: 1 },
    // { field: 'parent_name', headerName: 'parent Name', flex: 1 },
    // { field: 'sku', headerName: 'SKU', flex: 1 },
    {
      field: 'old_price',
      headerName: 'Sell',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => {

        if (row.variants?.length > 0) {
          return (
            Number(row.min_price || 0).toFixed(locationSettings?.location_decimal_places) +
            ' - ' +
            Number(row.max_price || 0).toFixed(locationSettings?.location_decimal_places)
          );
        } else {
          return Number(row.old_price).toFixed(locationSettings?.location_decimal_places);
        }
      },
    },
    {
      field: 'price',
      headerName: 'Price',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (row.variants?.length > 0) {
          return <div>-</div>
        } else {
          return <input
            value={row?.price || ''}
            onChange={(e) => {
              setProducts((prev: any) => {

                const updatedProducts = prev.map((product: any) => {
                  if (product.id === row.id) {

                    return {
                      ...product,
                      price: +e.target.value
                    };
                  }

                  return product;
                });
console.log(updatedProducts);

                return updatedProducts;
              })
            }
            }
            type="number" />
        }
      }
    }
    // {
    //   field: 'action',
    //   headerName: 'Action ',
    //   sortable: false,
    //   disableExport: true,
    //   flex: 1,
    //   renderCell: ({ row }: Partial<GridRowParams>) => (
    //     <>
    //       <ButtonGroup className="mb-2 m-buttons-style">
    //         {permissions.hasEdit && (
    //           <Button
    //             onClick={(event) => {
    //               // router.push('/shop/' + shopId + '/customers/edit/' + row.id)
    //               event.stopPropagation();
    //             }}>
    //             <FontAwesomeIcon icon={faPenToSquare} />
    //           </Button>
    //         )}
    //       </ButtonGroup>
    //     </>
    //   ),
    // },
  ];
  // ----------------------------------------------------------------------------------------------
  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <Button variant='success' onClick={updatePricing}>
          Save
        </Button>
      </GridToolbarContainer>
    );
  }
  // ----------------------------------------------------------------------------------------------
  const updatePricing = async () => {

    const url = 'pricing-group'
    // Deep clone the original array
    console.log(products);
    
    let productsBody = JSON.parse(JSON.stringify(products));

    // Create a map to store items by their IDs for faster access
    const productMap = new Map(productsBody.map((item) => [item.id, item]));

    // Iterate over the array and move 'sub-variable' items to their parent's 'variants' array or create it
    productsBody = productsBody.filter((item) => {
      if (item.type === 'sub-variable') {
        // Find the parent item based on the parent_id
        const parentItem: any = productMap.get(item.parent_id);
        if (parentItem) {
          // Check if the parent item has a 'variants' key, and if not, create it as an array
          if (!parentItem.variants) {
            parentItem.variants = [];
          }
          // Push the 'sub-variable' item into the parent's 'variants' array
          parentItem.variants.push(item);
        } else {
          // If the parent item is not found, you may choose to handle this case as needed
        }
        return false; // Return false to remove 'sub-variable' items from their original position
      }
      return true; // Keep other items in their original position
    });


    const result = productsBody.map((product) => {
      // const { id, price, variants } = product;
      let variantData = product?.variants
        if(variantData){
          variantData= variantData.map((variant) => ({
            id: variant.id,
            price: +variant.price,
          }))
        }
    
      return {
        id:product?.id,
        price:+product?.price,
        variants: variantData,
      };
    });
    
  
    const data = {
      "location_id": router.query.id,
      products: result
    }


    try {
      
      const res = await updateData(url, router.query.pricingId, data)
      
      Toastify('success', 'Groups updated successfully')

    } catch (e) {

      Toastify('error', 'Something went wrong')
    }
  }
  // ----------------------------------------------------------------------------------------------

  // ----------------------------------------------------------------------------------------------
  const onRowsSelectionHandler = (ids: any) => { };
  async function initDataPage() {

    try {

      const res2: any = await findAllData(`pricing-group/${router.query.id}?group_id=${router.query.pricingId}&all_data=1`);


      // set pricing for grop with old pricing if exist if not set it with the prodact normal sell price
      let res2ResultProductsData = JSON.parse(JSON.stringify(res2?.data?.result[0]?.products));

      res2ResultProductsData?.forEach((p, index) => {
        if (p.variants?.length > 0) {

          // Create an array of variation objects with additional properties
          const variableProducts = p.variants.map((v) => ({
            ...v,
            parent_id: p.id,
            old_price: +v.old_price,
            price: +(v.price || v.old_price)
            ,
            // bg: '#9ee8f176',
            parent_name: p.name,
            type: 'sub-variable',
          }));

          // Calculate min and max prices for variants
          const minPrice = Math.min(...variableProducts.map((v) => v.old_price));
          const maxPrice = Math.max(...variableProducts.map((v) => v.old_price));

          // Insert the variation objects after the parent object
          res2ResultProductsData.splice(index + 1, 0, ...variableProducts);

          // Update the parent object with min_price and max_price
          p.min_price = minPrice;
          p.max_price = maxPrice;

        }
        delete p.variants
      });
      // const uniqueProducts = removeDuplicates(res2ResultProductsData, 'id');

      setProducts(res2ResultProductsData);


    } catch (e) {
      Toastify('error', 'Something went wrong')

    }


    setIsLoading(false);
  }
  const [locations, setLocations] = useState<{ value: number; label: string }[]>([]);
  const [permissions, setPermissions] = useState<any>();

  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions'));
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms?.pos?.map((perm) =>
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
    if (_locs?.toString()?.length > 10)
      setLocationSettings(
        _locs[
        _locs.findIndex((loc: any) => {
          return loc.value == shopId;
        })
        ]
      );

  }, []);
  // /-------------------------------------------------------------------------------------------
  useEffect(() => {
    if (router.query.id) initDataPage();
  }, [router.query.id])
  // /-------------------------------------------------------------------------------------------
  const getRowClass = (params) => {

    if ((params?.row?.variants?.length > 0) || params?.row?.type === 'sub-variable') {
      return "variants-bg";
    }
    return "";
  };
  // /-------------------------------------------------------------------------------------------

  return (
    <>
      <AdminLayout shopId={shopId}>
        <div>PricingGroup</div>
        <ToastContainer />

        <div className="page-content-style card">
          <h5>Pricing Group List</h5>

          <DataGrid
            getRowClassName={getRowClass}
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
            rows={products || []}
            columns={columns || []}
            pageSize={10}
            rowsPerPageOptions={[10]}
            onSelectionModelChange={(ids: any) => onRowsSelectionHandler(ids)}
            components={{
              Toolbar: CustomToolbar,
            }}
          /></div>

      </AdminLayout>
    </>
  );
};

export default PricingGroup;