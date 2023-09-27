import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { IProduct } from '@models/pos.types';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Form } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import Select from 'react-select';
import { useReactToPrint } from 'react-to-print';
import { ToastContainer } from 'react-toastify';
import { useRecoilState } from 'recoil';
import withAuth from 'src/HOCs/withAuth';
import BarcodeGenerator from 'src/components/dashboard/BarcodeGenerator';
import VariationModal from 'src/components/pos/modals/VariationModal';
import AlertDialog from 'src/components/utils/AlertDialog';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import BarcodeToPrint from 'src/modules/barcode/_components/BarcodeToPrint';
import { barcodeSelectStyles } from 'src/modules/barcode/_utils/barcode-select-styles';
import { cartJobType } from 'src/recoil/atoms';
import { apiFetchCtr } from '../../../../libs/dbUtils';
import api from 'src/utils/app-api';
import { ILocation } from '@models/auth.types';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

const Barcodes: NextPage = ({ shopId, rules }: any) => {
  const router = useRouter();

  const { locationSettings, setLocationSettings } = useUser();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [options, setOptions] = useState<{
    name: boolean;
    category: boolean;
    price: boolean;
    businessName: boolean;
  }>({ name: false, category: false, price: false, businessName: false });
  const [selectedProducts, setSelectedProducts] = useState<
    {
      id: number;
      product_id: number;
      variation_id: number;
      sku: string;
      name: string;
      price: number;
      quantity: number;
      category: string;
    }[]
  >([]);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<{
    product_id: number;
    product_name: string;
    is_service: number;
  }>({ product_id: 0, product_name: '', is_service: 0 });
  const [isOpenVariationDialog, setIsOpenVariationDialog] = useState(false);
  const [allVariations, setAllVariations] = useState([]);
  const [jobType] = useRecoilState(cartJobType);

  const columns: GridColDef[] = [
    { field: 'id', minWidth: 50 },
    { field: 'name', headerName: 'name', minWidth: 150 },
    {
      field: 'quantity',
      headerName: 'qty',
      editable: true,
      type: 'number',
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
  ];
  async function initDataPage() {
    try {
      const data: IProduct[] = await api
        .get(`products/${shopId}?all_data=1`)
        .then(({ data }) => data.result);

      const _products = data.map((product) => ({
        ...product,
        label: product.name,
        value: product.id,
      }));
      setProducts(_products);
      // setAllVariations(data.variations);
    } catch (e) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!shopId) return;

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);

    initDataPage();
  }, [shopId]);

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (result) {
      const _data = [...products];
      const idx = _data.findIndex((itm: any) => itm.id == selectId);
      if (idx != -1) {
        _data.splice(idx, 1);
        setProducts(_data);
      }
    }
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
  };
  const saveToCell = (params: any) => {
    const found = selectedProducts.findIndex((el) => el.id === params.id);
    if (found > -1) {
      var _datas: any = selectedProducts;
      _datas[found][params.field] = params.value;
      setSelectedProducts([..._datas]);
    }
  };
  const addPackageProducts = (e: any) => {
    if (e.type == 'variable') {
      setSelectedProductForVariation({
        ...e,
        product_id: e.id,
        is_service: 0,
        product_name: e.name,
      });
      setIsOpenVariationDialog(true);
      return;
    }
    const found = selectedProducts.some((el) => el.product_id === e.value);
    if (!found)
      setSelectedProducts([
        ...selectedProducts,
        {
          ...e,
          product_id: e.product_id,
          variation_id: 0,
          name: e.name,
          quantity: 1,
          price: e.price,
          category: e.category,
          sku: e.sku,
        },
      ]);
    else Toastify('error', 'already exists in list');
  };
  // useEffect(() => {
  //   if (jobType.req == 4) {
  //     // when Select Variation From PopUp

  //   //   allVariations.map((varItm: any, index: number) => {
  //   //     if (varItm.variation_id == jobType.val) {
  //   //       const found = selectedProducts.some((el) => el.variation_id == varItm.variation_id);
  //   //       if (!found)
  //   //         setSelectedProducts([
  //   //           ...selectedProducts,
  //   //           {
  //   //             id: +Number(varItm.product_id) + Math.floor(Math.random() * 1200),
  //   //             product_id: varItm.product_id,
  //   //             variation_id: varItm.variation_id,
  //   //             name: selectedProductForVariation.product_name + ' ' + varItm.name,
  //   //             quantity: 1,
  //   //             price: varItm.variation_price,
  //   //             sku: varItm.sku,
  //   //             category: 'no set',
  //   //           },
  //   //         ]);
  //   //       else Toastify('error', 'already exists in list');
  //   //     }
  //   //   });
  //   // }
  // }, [jobType]);

  //start
  const componentRef = React.useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
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
      <AlertDialog
        alertShow={show}
        alertFun={handleDeleteFuc}
        shopId={shopId}
        id={selectId}
        type="products"
        subType="deleteProduct">
        Are you Sure You Want Delete This Item ?
      </AlertDialog>
      {!isLoading ? (
        <>
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
              className="datagrid-style"
              sx={{
                '.MuiDataGrid-columnSeparator': {
                  display: 'none',
                },
                '&.MuiDataGrid-root': {
                  border: 'none',
                },
              }}
              rows={selectedProducts}
              columns={columns}
              pageSize={10}
              onCellEditCommit={saveToCell}
              columnVisibilityModel={{ id: false }}
              rowsPerPageOptions={[10]}
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
                    onChange={(e) => {
                      setOptions({ ...options, businessName: e.target.checked });
                    }}
                  />
                </div>
              </div>
              <div className="invoice-settings-item">
                <div>Product Name</div>
                <div>
                  <Form.Check
                    type="switch"
                    className="custom-switch"
                    onChange={(e) => {
                      setOptions({ ...options, name: e.target.checked });
                    }}
                  />
                </div>
              </div>
              <div className="invoice-settings-item">
                <div>Price</div>
                <div>
                  <Form.Check
                    type="switch"
                    className="custom-switch"
                    onChange={(e) => {
                      setOptions({ ...options, price: e.target.checked });
                    }}
                  />
                </div>
              </div>
              <div className="invoice-settings-item">
                <div>Category</div>
                <div>
                  <Form.Check
                    type="switch"
                    className="custom-switch"
                    onChange={(e) => {
                      setOptions({ ...options, category: e.target.checked });
                    }}
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
        </>
      ) : (
        <div className="d-flex justify-content-around">
          <Spinner animation="grow" />
        </div>
      )}
      {
        <div style={{ display: 'none' }}>
          <BarcodeToPrint options={options} selected={selectedProducts} ref={componentRef} />
        </div>
      }
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
