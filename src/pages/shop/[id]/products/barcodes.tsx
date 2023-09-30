import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { IProduct } from '@models/pos.types';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ButtonGroup, Form } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { BiEdit } from 'react-icons/bi';
import Select from 'react-select';
import { useReactToPrint } from 'react-to-print';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import VariationModal from 'src/components/pos/modals/VariationModal';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import BarcodeToPrint from 'src/modules/barcode/_components/BarcodeToPrint';
import { barcodeSelectStyles } from 'src/modules/barcode/_utils/barcode-select-styles';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

interface IOption {
  name: boolean;
  category: boolean;
  price: boolean;
  businessName: boolean;
}

interface ISelectedVariation {
  product_id: number;
  product_name: string;
  is_service: number;
}

interface IProductSelect extends IProduct {
  value: number;
  label: string;
  quantity: number;
}

const initOption = { name: false, category: false, price: false, businessName: false };
const initProductVariation = { product_id: 0, product_name: '', is_service: 0 };

const Barcodes: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ shopId }) => {
  const componentRef = useRef(null);
  const { locationSettings, setLocationSettings } = useUser();

  const [allVariations, setAllVariations] = useState([]);
  const [products, setProducts] = useState<IProductSelect[]>([]);
  const [options, setOptions] = useState<IOption>(initOption);
  const [selectedProducts, setSelectedProducts] = useState<IProductSelect[]>([]);
  const [selectedProductForVariation, setSelectedProductForVariation] =
    useState<ISelectedVariation>(initProductVariation);

  const [isLoading, setIsLoading] = useState(true);
  const [isOpenVariationDialog, setIsOpenVariationDialog] = useState(false);

  const columns: GridColDef[] = useMemo(
    () =>
      [
        { field: 'id', minWidth: 50 },
        { field: 'name', headerName: 'name', minWidth: 150 },
        {
          field: 'quantity',
          headerName: 'Quantity to Print',

          renderHeader(params) {
            return (
              <div className="d-flex w-100 flex-row gap-3 align-items-center justify-content-center">
                Qty <BiEdit />
              </div>
            );
          },
          width: 100,
          editable: true,
        },
        {
          field: 'action',
          headerName: 'Action ',
          sortable: false,
          disableExport: true,
          renderCell: ({ row }: Partial<GridRowParams>) => (
            <ButtonGroup className="mb-2 m-buttons-style">
              <Button
                onClick={() => {
                  const rows = [...selectedProducts];
                  const _index = rows.findIndex((it: any) => it.product_id == row.product_id);
                  if (_index > -1) rows.splice(_index, 1);
                  setSelectedProducts(rows);
                }}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </ButtonGroup>
          ),
        },
      ] as GridColDef[],
    [selectedProducts]
  );

  async function initDataPage() {
    try {
      const data: IProduct[] = await api
        .get(`products/${shopId}?all_data=1`)
        .then(({ data }) => data.result);

      const _products: IProductSelect[] = data.map((product) => ({
        ...product,
        quantity: 1,
        label: product.name,
        value: product.id,
      }));

      setProducts(_products);
    } catch (e) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }

  const saveToCell = useCallback(
    (params: any) => {
      const found = selectedProducts.findIndex((el) => el.id === params.id);
      if (found > -1) {
        const _data = selectedProducts;
        _data[found][params.field] = params.value;
        setSelectedProducts([..._data]);
      }
    },
    [selectedProducts]
  );

  const addPackageProducts = (product: IProductSelect) => {
    if (product.type == 'variable') {
      setSelectedProductForVariation({
        ...product,
        product_id: product.id,
        is_service: 0,
        product_name: product.name,
      });

      return setIsOpenVariationDialog(true);
    }

    const found = selectedProducts.some((el) => el.id === product.value);

    if (!found) setSelectedProducts([...selectedProducts, { ...product }]);
    else Toastify('error', 'already exists in list');
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    if (!shopId) return;

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);

    initDataPage();
  }, [shopId]);

  return (
    <AdminLayout shopId={shopId}>
      <ToastContainer />
      {isOpenVariationDialog && (
        <VariationModal
          selectedProductForVariation={selectedProductForVariation}
          isOpenVariationDialog={isOpenVariationDialog}
          setIsOpenVariationDialog={setIsOpenVariationDialog}
          variations={allVariations}
        />
      )}

      {!isLoading ? (
        <div className="page-content-style card">
          <h5>Barcode Generator</h5>
          <h5>
            Step1: <span style={{ color: '#cdc8c8' }}>Selecet Products</span>
          </h5>
          <Select
            styles={barcodeSelectStyles}
            options={products}
            onChange={(e) => addPackageProducts(e)}
          />
          <DataGrid
            pageSize={10}
            columns={columns}
            rows={selectedProducts}
            rowsPerPageOptions={[10]}
            onCellEditCommit={saveToCell}
            columnVisibilityModel={{ id: false }}
            // styles
            className="datagrid-style"
            sx={{
              '.MuiDataGrid-columnSeparator': { display: 'none' },
              '&.MuiDataGrid-root': { border: 'none' },
            }}
          />
          <h5>
            Step2: <span style={{ color: '#cdc8c8' }}>Options</span>
          </h5>
          <div className="invoice-settings-body" style={{ maxWidth: '500px' }}>
            <div className="invoice-settings-item">
              <div>Business Name</div>
              <div>
                <Form.Check
                  type="switch"
                  className="custom-switch"
                  onChange={(e) => setOptions({ ...options, businessName: e.target.checked })}
                />
              </div>
            </div>
            <div className="invoice-settings-item">
              <div>Product Name</div>
              <div>
                <Form.Check
                  type="switch"
                  className="custom-switch"
                  onChange={(e) => setOptions({ ...options, name: e.target.checked })}
                />
              </div>
            </div>
            <div className="invoice-settings-item">
              <div>Price</div>
              <div>
                <Form.Check
                  type="switch"
                  className="custom-switch"
                  onChange={(e) => setOptions({ ...options, price: e.target.checked })}
                />
              </div>
            </div>
            <div className="invoice-settings-item">
              <div>Category</div>
              <div>
                <Form.Check
                  type="switch"
                  className="custom-switch"
                  onChange={(e) => setOptions({ ...options, category: e.target.checked })}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary p-2"
            onClick={handlePrint}
            style={{ width: '100%', maxWidth: '500px', marginTop: '10px' }}>
            Show
          </button>
        </div>
      ) : (
        <div className="d-flex justify-content-around">
          <Spinner animation="grow" />
        </div>
      )}
      <div style={{ display: 'none' }}>
        <BarcodeToPrint options={options} selected={selectedProducts} ref={componentRef} />
      </div>

      <div style={{ display: 'none' }} className="page-content-style card">
        <div className="barcode-print-container"></div>
      </div>
    </AdminLayout>
  );
};

export default withAuth(Barcodes);

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      shopId: context.query.id,
    },
  };
};
