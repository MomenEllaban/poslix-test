import { faBarcode, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { Button as MButton } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { debounce } from '@mui/material/utils';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import type { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import ShowPriceListModal from 'src/components/dashboard/modal/ShowPriceListModal';
import ConfirmationModal from 'src/components/modals/confirmation-modal/ConfirmationModal';
import LocationModal from 'src/components/pos/modals/LocationModal';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import { createNewData, findAllData } from 'src/services/crud.api';
import api from 'src/utils/app-api';
import { darkModeContext } from '../../../../context/DarkModeContext';
import styles from './table.module.css';
import { grey } from '@mui/material/colors';

// const CustomToolbar = ({
//   importFileClickHandler,
//   importFileHandler,
//   fileRef,
//   setShowDeleteSelected,
//   isLoading
// }) => {
//   const [isHovered, setIsHovered] = useState(false);

//   const divStyle = {
//     background: isHovered ? '#99CC66' : '#779933',
//     padding: '4px',
//     display: 'flex',
//     alignItems: 'center',
//     borderRadius: '12px',
//     marginRight: '0.5rem',
//     transition: 'background-color 0.3s',
//   };
//   return (
//     <GridToolbarContainer className="d-flex align-items-center">
//       <GridToolbarExport />
//       {/* mohamed elsayed */}
//       <MButton onClick={importFileClickHandler}>Import</MButton>
//       <input style={{ display: 'none' }} ref={fileRef} type="file" onChange={importFileHandler} />
//       {/* /////////// */}

//       <GridToolbarColumnsButton />
//       <MButton onClick={() => setShowDeleteSelected(true)}>Delete Selected</MButton>

//       {!isLoading && permissions.hasInsert && (
//         <TextField label="search name/sku" variant="filled" onChange={handleSearch} />
//       )}
//     </GridToolbarContainer>
//   );
// };

const Product: NextPage = (props: any) => {
  const { id } = props;
  const [shopId, setShopId] = useState('');
  const myLoader = (img: any) => img.src;
  const [locationSettings, setLocationSettings] = useState<any>();
  const dataGridRef = useRef(null);
  const router = useRouter();
  const [products, setProducts] = useState<
    { id: number; name: string; sku: string; type: string; qty: number }[]
  >([]);
  const [show, setShow] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [type, setType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState<Array<string>>([]);
  const [locationModal, setLocationModal] = useState<boolean>(false);
  const [locations, setLocations] = useState<{ value: number; label: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState();
  const [totalRows, setTotalRows] = useState();
  const { darkMode } = useContext(darkModeContext);
  const [permissions, setPermissions] = useState<any>();

  const [showDeleteSelected, setShowDeleteSelected] = useState(false);
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '#',
      minWidth: 50,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
    },
    {
      field: 'image',
      headerName: 'Image',
      flex: 1,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <Image
          alt=""
          loader={myLoader}
          width={50}
          height={50}
          src={row.image && row.image.length > 0 ? row.image : '/images/pos/placeholder.png'}
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 0.5,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
    },
    {
      field: 'sku',
      headerName: 'sku ',
      flex: 0.5,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
    },
    {
      field: 'name',
      headerName: 'name ',
      flex: 1,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
    },
    {
      field: 'sell_price',
      headerName: 'Sell (Min - Max)',
      flex: 1,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (row.type == 'single')
          return Number(row.sell_price).toFixed(locationSettings?.location_decimal_places);
        else {
          const getPrices = []
          row.variations.map(va => getPrices.push(va.price))
          return (
            Number(Math.min(...getPrices)).toFixed(locationSettings?.location_decimal_places)
            + ' - ' +
            Number(Math.max(...getPrices)).toFixed(locationSettings?.location_decimal_places));
        }
      },
    },

    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      renderCell: ({ row }) => <p>{row.category?.name}</p>,
    },
    {
      field: 'stock',
      headerName: 'Qty',
      flex: 0.5,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <p>{row.stock} <span style={{fontSize: '13px', color: 'grey'}}>[{row.total_qty_sold}]</span></p>
      )
    },
    {
      field: 'action',
      headerName: 'Action ',
      sortable: false,
      disableExport: true,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <ButtonGroup className="mb-2 m-buttons-style">
          {permissions.hasEdit && (
              <Button
                onClick={() => {
                  router.push('/shop/' + shopId + '/products/edit/' + row.id);
                }}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
          {permissions.hasDelete && (
            <Button
              onClick={() => {
                setSelectId(row.id);
                setShow(true);
              }}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
          <Button onClick={() => router.push('/shop/' + shopId + '/products/barcodes/')}>
            <FontAwesomeIcon icon={faBarcode} />
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  const fileRef = useRef(null);
  const importFileClickHandler = () => {
    fileRef.current.click();
  };
  const importFileHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    const res = await createNewData(`products/${router.query.id}/import`, formData);
    if (res.data.success) initDataPage();
    else Toastify('error', 'Something went wrong, please try again.');
  };

  function CustomToolbar() {
    const [isHovered, setIsHovered] = useState(false);

    const divStyle = {
      background: isHovered ? '#99CC66' : '#779933',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: '12px',
      marginRight: '0.5rem',
      transition: 'background-color 0.3s',
    };
    return (
      <GridToolbarContainer className="d-flex align-items-center">
        <GridToolbarExport />
        {/* mohamed elsayed */}
        <MButton onClick={importFileClickHandler}>Import</MButton>
        <input style={{ display: 'none' }} ref={fileRef} type="file" onChange={importFileHandler} />
        {/* /////////// */}

        <GridToolbarColumnsButton />
        <MButton onClick={() => setShowDeleteSelected(true)}>Delete Selected</MButton>

        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  }

  async function initDataPage() {
    setIsLoading(true);
    if (router.isReady) {
      const res = await findAllData(`products/${router.query.id}?all_data=1`);
      if (!res.data.success) {
        Toastify('error', 'Somthing wrong!!, try agian');
        return;
      }
      setProducts(res.data.result);
      setFilteredProducts(res.data.result);
      setIsLoading(false);
    }
    setIsLoading(false);
  }
  useEffect(() => {
    const localPermissions = localStorage.getItem('permissions');
    if (!localPermissions) return;

    const permsArr = JSON.parse(localStorage.getItem('permissions'));
    if (!permsArr) return;

    const perms = JSON.parse(localStorage.getItem('permissions'))?.filter(
      (loc) => loc.id == router.query.id
    );

    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms[0]?.permissions?.map((perm) =>
      perm.name.includes('products/show')
        ? (getPermissions.hasView = true)
        : perm.name.includes('products/add')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('products/update')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('products/delete')
        ? (getPermissions.hasDelete = true)
        : null
    );

    setPermissions(getPermissions);
  }, [router.asPath]);

  useEffect(() => {
    const _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    setLocations(_locs);
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.location_id == +id;
          })
        ]
      );
    
  }, [router.asPath]);

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    initDataPage();
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
    setShowDeleteAll(false);
  };
  const onRowsSelectionHandler = (ids: any) => {
    setSelectedItems(ids);
  };
  const handleCellClick = (params, event) => {
    if (params.field === 'qty') {
      let index = products.findIndex((p) => params.id == p.id);
      if (index == -1) return;
      if (products[index].type != 'package' && products[index].qty > 0) {
        setSelectId(products[index].id);
        setType(products[index].type);
        setIsOpenPriceDialog(true);
      }
    }
  };
  const handleSearch = (event) => {
    debounceSearchTerm(event.target.value);
  };
  // Debounce user input with lodash debounce function
  const debounceSearchTerm = debounce((value) => {
    setSearchTerm(value);
  }, 500);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filteredList = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filteredList);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    if (router.isReady) setShopId(router.query.id.toString());
  }, [router.asPath]);

  useEffect(() => {
    initDataPage();
  }, [shopId]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const getRowClassName = () => styles.rowStyling;

  const handleDeleteMultiProducts = () => {
    setIsLoading(true);
    api
      .delete('/products/delete', {
        params: {
          product_ids: [...selectedItems],
        },
      })
      .then(() => {
        initDataPage();
        Toastify('success', 'Item deleted successfully!');
      })
      .catch(() => {
        Toastify('error', 'Something went wrong!, try again later..');
      })
      .finally(() => {
        setShowDeleteSelected(false);
        setIsLoading(false);
      });
  };

  const handleDeleteSingleProduct = () => {
    setIsLoading(true);
    api
      .delete('/products/delete', {
        params: {
          product_ids: [selectId],
        },
      })
      .then(() => {
        initDataPage();
        Toastify('success', 'Item deleted successfully!');
      })
      .catch(() => {
        Toastify('error', 'Something went wrong!, try again later..');
      })
      .finally(() => {
        setShow(false);
        setIsLoading(false);
      });
  };
  return (
    <AdminLayout shopId={id}>
      <ToastContainer />
      <ConfirmationModal
        show={show}
        onClose={() => setShow(false)}
        onConfirm={handleDeleteSingleProduct}
        message="Are you sure to delete this item?"
      />
      <ConfirmationModal
        show={showDeleteSelected}
        onClose={() => setShowDeleteSelected(false)}
        onConfirm={handleDeleteMultiProducts}
        message="Are you sure to delete the items?"
      />

      <ShowPriceListModal
        shopId={id}
        productId={selectId}
        type={type}
        isOpenPriceDialog={isOpenPriceDialog}
        setIsOpenPriceDialog={() => setIsOpenPriceDialog(false)}
      />
      <LocationModal
        showDialog={locationModal}
        setShowDialog={setLocationModal}
        locations={locations}
        data={selectedItems}
        setData={setSelectedItems}
        shopId={id}
        value={locations.findIndex((loc: any) => {
          return loc.value == id;
        })}
      />
      {/* start */}
      {!isLoading && permissions.hasInsert && (
        <div className="mb-2 flex items-center justify-between">
          <button
            className="btn btn-primary p-3"
            onClick={() => router.push('/shop/' + shopId + '/products/add')}>
            <FontAwesomeIcon icon={faPlus} /> Add New Product{' '}
          </button>
          {/* <TextField label="search name/sku" variant="filled" onChange={handleSearch} /> */}
        </div>
      )}

      {!isLoading ? (
        <>
          <div className="page-content-style card">
            <h5>Product List</h5>
            <DataGrid
              ref={dataGridRef}
              checkboxSelection
              className="datagrid-style"
              sx={{
                '.MuiDataGrid-columnSeparator': {
                  display: 'none',
                },
                '&.MuiDataGrid-root': {
                  border: 'none',
                },
              }}
              rows={filteredProducts}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              onSelectionModelChange={(ids: any) => onRowsSelectionHandler(ids)}
              onCellClick={handleCellClick}
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
  );
};

export default withAuth(Product);


export async function getServerSideProps({ params }) {
  const { id } = params;
  return {
    props: { id },
  };
}
