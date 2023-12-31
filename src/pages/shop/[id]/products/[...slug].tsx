import { faInfoCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { productTypeData } from '@models/data';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  styled,
} from '@mui/material';
import Switch from '@mui/material/Switch';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { ButtonGroup, Card } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Select from 'react-select';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import { generateUniqueString, handleNumberKeyPress } from 'src/libs/toolsUtils';
import { productDetailsColourStyles } from 'src/modules/products/styles';
import { createNewData, findAllData, updateData } from 'src/services/crud.api';
import storage from '../../../../../firebaseConfig';
import NotifiModal from '../../../../components/utils/NotifiModal';
import { apiDeleteCtr } from '../../../../libs/dbUtils';

import { getSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const colourStyles = productDetailsColourStyles;

const initialFormObject: TFormObject = {
  id: 0,
  img: '',
  name: '',
  productName2: '',
  type: 'single',
  sku: '',
  barcode_type: 'C128',
  tax_id: null,
  unit_id: 11,
  brand: null,
  category_id: 0,
  subCat: '',
  alertQuantity: 0,
  cost_price: 0,
  sell_price: 0,
  is_fabric: false,
  is_service: false,
  isSellOverStock: false,
  isMultiPrice: false,
  isFifo: false,
  isTailoring: 0,
  variations: [{ name: '', name2: '', sku: '', cost: 0, price: 0, isNew: true }],
  tailoringPrices: [{ name: '', from: 0, to: 0, price: 0 }],
  extrasCategories: [],
};

const initFormError = {
  name: false,
  barcode_type: false,
  productName2: false,
  sku: false,
  img: false,
  isTailoring: false,
  fabs: false,
  rules: false,
  skuExist: false,
  brand: false,
  category_id: false,
  variation: false,
};

const Product: NextPage = ({
  editId,
  iType,
  resCategories,
  resTaxes,
  resUnits,
  resBrands,
  resExtrasCategories,
  dataProduct,
}: any) => {
  const { locationSettings, setLocationSettings } = useUser();
  const [locations, setLocations] = useState();
  const [img, setImg] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [errorForm, setErrorForm] = useState(initFormError);
  const [formObj, setFormObj] = useState<any>(initialFormObject);
  const { t } = useTranslation();

  const [tailoring, seTtailoring] = useState<{ value: number; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [products, setProducts] = useState<{ value: number; label: string }[]>([]);
  const [allFabrics, setAllFabrics] = useState<{ value: number; label: string }[]>([]);
  const [producTypes, setProducTypes] =
    useState<{ value: string; label: string }[]>(productTypeData);
  const [selecetdId, setSelecetdId] = useState(0);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [removeDialogType, setRemoveDialogType] = useState<{
    type: string;
    id: number;
    index: number;
  }>({ type: '', id: 0, index: 0 });
  const [selectedProducts, setSelectedProducts] = useState<
    {
      id: number;
      product_id: number;
      name: string;
      cost: number;
      price: number;
      quantity: number;
      isNew: boolean;
    }[]
  >([]);
  const [selectedFabrics, setSelectedFabrics] = useState<
    { id: number; product_id: number; value?: number; name: string; isNew: boolean }[]
  >([]);
  const [percent, setPercent] = useState(0);
  const router = useRouter();
  const shopId = router.query.id;

  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  var errors = [];
  const barcodes = [
    { value: 'C39', label: 'C39' },
    { value: 'C128', label: 'C128' },
    { value: 'EAN13', label: 'EAN13' },
    { value: 'EAN8', label: 'EAN8' },
    { value: 'UPCA', label: 'UPCA' },
    { value: 'UPCE', label: 'UPCE' },
  ];
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Product Name', minWidth: 250 },
    { field: 'price', headerName: 'Price', minWidth: 150, editable: true, type: 'number' },
    {
      field: 'action',
      headerName: 'Action',
      minWidth: 100,
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <Button
            variant="outlined"
            onClick={() => {
              setSelecetdId(row.product_id);
              setOpenRemoveDialog(true);
            }}>
            <DeleteIcon />
          </Button>
        </>
      ),
    },
  ];
  const columnsTailoringPackages: GridColDef[] = [
    { field: 'name', headerName: 'Product Name', minWidth: 250 },
    {
      field: 'action',
      headerName: 'Action',
      minWidth: 100,
      sortable: false,
      disableExport: true,
      renderCell: ({ rowIndex, row }: GridRenderCellParams | any) => (
        <>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenRemoveDialog(true);
              setRemoveDialogType({
                type: 'tailoring_item',
                id: parseInt(row.product_id),
                index: rowIndex,
              });
            }}>
            <DeleteIcon />
          </Button>
        </>
      ),
    },
  ];
  var formObjRef = useRef<any>();

  formObjRef.current = formObj;

  var imgRef = useRef<any>();
  imgRef.current = img;

  var prevUrlRef = useRef<any>();
  prevUrlRef.current = previewUrl;
  const units = resUnits?.units.map((unit) => {
    return { ...unit, label: unit.name, value: unit.id };
  });
  const brands = resBrands?.map((brand) => {
    return { ...brand, label: brand.name, value: brand.id };
  });
  const cats = resCategories?.map((cat) => {
    return { ...cat, label: cat.name, value: cat.id };
  });
  const taxGroup = resTaxes?.taxes.map((tax) => {
    return { ...tax, label: tax.name, value: tax.id };
  });
  const extrasCategories = resExtrasCategories?.map((cat)=>{
    return {...cat,label: cat.name, value: cat.id};
  });
  async function handleUpload() {
    if (prevUrlRef.current.length < 2) {
    } else {
      const storageRef = ref(storage, `/files/images/${generateUniqueString(12)}${shopId}`);
      const uploadTask = uploadBytesResumable(storageRef, img);
      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setPercent(percent);
        },
        (err) => console.error(err),
        async () => {
          await getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            isEdit ? editProduct(url) : insertProduct(url);
          });
        }
      );
    }
  }

  async function insertProduct(url: string = null) {
    const res = await createNewData('products', {
      name: formObjRef.current.name,
      category_id: formObjRef.current.category_id,
      location_id: router.query.id,
      type: formObjRef.current.type,
      is_service: formObjRef.current.is_service,
      is_fabric: formObjRef.current.is_fabric,
      subproductname: formObjRef.current.productName2,
      unit_id: formObjRef.current.unit_id,
      brand_id: formObjRef.current.brand,
      sku: formObjRef.current.sku,
      barcode_type: formObjRef.current.barcode_type,
      sell_price: formObjRef.current.sell_price,
      cost_price: formObjRef.current.cost_price,
      sell_over_stock: formObjRef.current.isSellOverStock,
      never_tax: 0,
      is_fifo: formObjRef.current.isFifo,
      // extrasCategories: formObjRef.current?.extrasCategories || [],
      variations:
        formObjRef.current === 'single'
          ? []
          : formObjRef.current.variations
              .filter((va) => !!+va.cost && !!+va.price)
              .map((va) => {
                return {
                  name: va.name,
                  sku: va.sku,
                  cost: va.cost,
                  price: va.price,
                  sell_over_stock: formObjRef.current.isSellOverStock,
                  is_selling_multi_price: 0,
                  is_service: formObjRef.current.is_service,
                };
              }),
      image: url,
    });
    if (res.data.success) {
      Toastify('success', 'Product Successfuly Created..');
      router.push('/shop/' + router.query.id + '/products');
    } else {
      Toastify('error', 'Error');
      // if (code == 100) setErrorForm({ ...errorForm, skuExist: true });
      setIsSaving(false);
    }
  }
  async function editProduct(url: string = '') {
    const { productName2, tax_id, ...form } = formObjRef.current as TFormObject;
    const _form = formObjRef.current;
    const originalImageUrl = _form.img === 'n' ? null : _form.img;
    const newUrl = url || originalImageUrl;
    const _data =
      // : IPayload
      {
        location_id: +shopId,
        unit_id: _form.unit_id,
        category_id: _form.category_id,
        brand_id: _form.brand,

        name: _form.name,
        subproductname: _form.productName2,
        image: newUrl,

        type: _form.type,

        is_service: _form.is_service,
        is_fabric: _form.is_fabric,
        is_fifo: _form.isFifo, // Convert to boolean

        never_tax: _form.never_tax,

        alert_quantity: _form.alertQuantity, // Convert to number
        sku: _form.sku,

        barcode_type: _form.barcode_type,
        sell_price: parseFloat(_form.sell_price), // Convert to number
        cost_price: parseFloat(_form.cost_price), // Convert to number
        sell_over_stock: _form.isSellOverStock, // Convert to boolean
        variations:
          _form.type === 'single'
            ? []
            : _form.variations
                .filter((va) => !!+va.cost && !!+va.price)
                .map((va) => {
                  return {
                    name: va.name,
                    sku: va.sku,
                    cost: va.cost,
                    price: va.price,
                    sell_over_stock: _form.isSellOverStock,
                    is_selling_multi_price: 0,
                    is_service: _form.is_service,
                  };
                }),
      };

    try {
      if (_data['brand_id'] == 0) {
        delete _data['brand_id'];
      }
      console.log(_data);
      const res = await updateData('products', router.query.slug[1], _data);
      Toastify('success', 'Product updated successfully!');
      router.push('/shop/' + router.query.id + '/products');
    } catch (e) {
      console.warn(e.response.data.error);
      Toastify('error', 'Something went wrong, please check your inputs!');
    }

    setIsSaving(false);
  }
  async function deleteFunction(delType = '', id = 0, index: number) {
    var result = await apiDeleteCtr({
      type: 'products',
      subType: 'delete_items',
      shopId,
      delType,
      id,
    });
    const { success, msg } = result;
    if (success) {
      Toastify('success', 'Product Successfuly Edited..');
      if (delType == 'var_items') {
        const _rows: any = [...formObj.variations];
        _rows.splice(index, 1);
        setFormObj({ ...formObj, variations: _rows });
      }
    } else Toastify('error', 'Error, Try Again');
  }

  useEffect(() => {
    const _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    setLocations(_locs);
    if (_locs.length > 0) {
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.location_id == +shopId;
          })
        ]
      );
    }
  }, [router.query]);
  useEffect(() => {
    if (router.isReady) {
      if (dataProduct.hasOwnProperty('id') && !dataProduct.hasOwnProperty('error')) {
        setIsEdit(true);
        setSelectedProducts(dataProduct);
        const itm = dataProduct;
        setPreviewUrl(itm?.image);
        setFormObj({
          ...formObj,
          id: itm.id,
          img: itm?.image,
          type: itm.type,
          name: itm.name,
          productName2: itm.subproductname,
          location_id: itm.location_id,
          unit_id: itm.unit_id,
          brand: itm.brand_id,
          sku: itm.sku,
          sell_over_stock: !!itm.sell_over_stock,
          isSellOverStock: !!itm.sell_over_stock,
          barcode_type: itm.barcode_type,
          category_id: itm.category_id,
          cost_price: Number(itm.cost_price).toFixed(locationSettings?.location_decimal_places),
          sell_price: Number(itm.sell_price).toFixed(locationSettings?.location_decimal_places),
          alertQuantity: Number(itm.alert_quantity),
          tax_id: itm.never_tax == 1 ? -1 : itm.tax,
          is_service: itm.is_service == 1,
          is_fabric: itm.is_fabric == 1,
          isMultiPrice: itm.is_selling_multi_price == 1,
          isFifo: itm.is_fifo == 1,
          never_tax: itm.never_tax,
          variations: [
            ...dataProduct.variations.map((item: IVariation) => ({
              ...item,
              cost: (+item.cost).toFixed(locationSettings?.location_decimal_places),
              price: (+item.price).toFixed(locationSettings?.location_decimal_places),
            })),
            { name: '', name2: '', sku: '', cost: 0, price: 0, isNew: true },
          ],
          isTailoring:
            itm.type == 'tailoring_package' ? itm.tailoring_type_id : itm.is_tailoring == 1,
          tailoringPrices:
            itm.prices_json != undefined && (itm.prices_json + '').length > 8
              ? [...JSON.parse(itm.prices_json), { name: '', from: 0, to: 0, price: 0 }]
              : [{ name: '', from: 0, to: 0, price: 0 }],
        });
      } else {
        setIsEdit(false);
      }
      if (dataProduct?.error) {
        Toastify('error', 'Something went wrong, please try again later!');
      }
    }
  }, [router.asPath, dataProduct, locationSettings]);

  const imageChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setImg(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    } else {
      //  console.log('na image', e.target.files);
    }
  };
  const checkboxHandleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name == 'is_service')
      setFormObj({ ...formObj, is_service: event.target.checked });
    // setFormObj({ ...formObj, is_service: event.target.checked, isSellOverStock: !formObj.isSellOverStock || false });
    else if (event.target.name == 'sell_over')
      setFormObj({ ...formObj, isSellOverStock: event.target.checked });
    else if (event.target.name == 'multi_price')
      setFormObj({ ...formObj, isMultiPrice: event.target.checked });
    else if (event.target.name == 'is_fifo')
      setFormObj({ ...formObj, isFifo: event.target.checked });
    else if (event.target.name == 'is_fabric')
      setFormObj({ ...formObj, is_fabric: event.target.checked });
  };

  const handleTooltipClose = () => {
    setOpen(false);
    setOpen2(false);
    setOpen3(false);
  };

  const handleTooltipOpen = (type = '') => {
    if (type == 'tax') {
      setOpen(true);
      setTimeout(() => {
        setOpen(false);
      }, 2000);
    } else if (type == 'multi') {
      setOpen2(true);
      setTimeout(() => {
        setOpen2(false);
      }, 2000);
    } else if (type == 'msg') {
      setOpen3(true);
      setTimeout(() => {
        setOpen3(false);
      }, 2000);
    }
  };

  const handleInputChange = (e: any, i: number) => {
    const _rows: any = [...formObj.variations];
    const { name, value } = e.target;
    _rows[i][name] = value;

    var hasEmpty = false;
    for (var j = 0; j < _rows.length; j++) if (_rows[j].name.length == 0) hasEmpty = true;

    if (!hasEmpty)
      _rows.push({ id: 0, name: '', name2: '', sku: '', cost: 0, price: 0, isNew: true });

    setFormObj({ ...formObj, variations: _rows });
  };
  const handleInputChangeTailoring = (e: any, i: number) => {
    const _rows: any = [...formObj.tailoringPrices];
    const { name, value } = e.target;
    _rows[i][name] = value;
    var hasEmpty = false;
    for (var j = 0; j < _rows.length; j++) if (_rows[j].name.length == 0) hasEmpty = true;

    if (!hasEmpty) _rows.push({ name: '', from: 0, to: 0, price: 0 });

    setFormObj({ ...formObj, tailoringPrices: _rows });
  };
  const handleDeleteVariation = (i: number) => {
    if (formObj.variations.length > 1) {
      const _rows: any = [...formObj.variations];
      if (_rows[i].isNew) {
        _rows.splice(i, 1);
      } else {
        setOpenRemoveDialog(true);
        setRemoveDialogType({ type: 'var_items', id: _rows[i].id, index: i });
      }
      setFormObj({ ...formObj, variations: _rows });
    }
  };
  const handleDeleteTailoringPrices = (i: number) => {
    if (formObj.tailoringPrices.length > 1) {
      setOpenRemoveDialog(true);
      setRemoveDialogType({ type: 'tail_items', id: -1, index: i });
    }
  };

  const saveToCell = (params: any) => {
    const found = selectedProducts.findIndex((el) => el.product_id === params.id);
    if (found > -1) {
      var _datas: any = selectedProducts;
      _datas[found][params.field] = params.value;
      setSelectedProducts([..._datas]);
    }
  };
  const formatProductsOptions = (products: any) => (
    <div>
      <div>({products.sell_price})</div>
      <div style={{ opacity: '0.8' }}>
        <span>{products.name}</span>
      </div>
    </div>
  );
  const addPackageProducts = (e: any) => {
    const found = selectedProducts.some((el) => el.product_id === e.value);
    if (!found)
      setSelectedProducts([
        ...selectedProducts,
        {
          id: e.product_id,
          product_id: e.product_id,
          name: e.name,
          quantity: 1,
          cost: e.cost,
          price: e.price,
          isNew: true,
        },
      ]);
    else Toastify('error', 'already exists in list');
  };
  const addToTailoringPackage = (e: any) => {
    const found = selectedFabrics.some((el) => el.product_id === e.value);
    if (!found)
      setSelectedFabrics([
        ...selectedFabrics,
        { id: e.value, product_id: e.value, name: e.label, isNew: true },
      ]);
    else Toastify('error', 'already exists in list');
  };
  const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 500,
    },
  });
  useEffect(() => {
    if (formObj.type != 'package') return;
    let sumCost = 0,
      sumPrice = 0;
    selectedProducts.map((sp) => {
      sumCost += Number(sp.cost);
      sumPrice += Number(sp.price);
    });
    setFormObj({ ...formObj, cost_price: sumCost, سثمم_price: sumPrice });
  }, [selectedProducts]);
  const handleRemoveImg = (e: any) => {
    if (!img) {
      const desertRef = ref(storage, formObj.img);
      deleteObject(desertRef)
        .then(() => {
          setFormObj({ ...formObj, img: '' });
        })
        .catch((error: any) => {
          setFormObj({ ...formObj, img: '' });
        });
    }
    setImg(null);
    setPreviewUrl('');
    return;
  };

  return (
    <AdminLayout shopId={shopId}>
      <ToastContainer />
      <NotifiModal alertShow={show} alertFun={(e: boolean) => setShow(e)}>
        {isEdit ? 'Product Successfuly Edited..' : 'Product Successfuly Created..'}
      </NotifiModal>
      <div className="row">
        <div className="mb-4">
          <Link className="btn btn-primary p-3" href={'/shop/' + router.query.id + '/products'}>
            {t('products.Back_To_List')}
          </Link>
        </div>
      </div>
      <Dialog
        open={openRemoveDialog}
        onClose={() => {
          setOpenRemoveDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">Delete Item</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you Sure You Want Remove This Item ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemoveDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (removeDialogType.type == 'var_items') {
                deleteFunction(removeDialogType.type, removeDialogType.id, removeDialogType.index);
              } else if (removeDialogType.type == 'tailoring_item') {
                const _rows: any = [...selectedFabrics];
                _rows.splice(removeDialogType.index, 1);
                setSelectedFabrics(_rows);
              } else if (removeDialogType.type == 'tail_items') {
                const _rows: any = [...formObj.tailoringPrices];
                _rows.splice(removeDialogType.index, 1);
                setFormObj({ ...formObj, tailoringPrices: _rows });
              } else {
                const rows = [...selectedProducts];
                const _index = rows.findIndex((it: any) => it.product_id == selecetdId);
                if (_index > -1) rows.splice(_index, 1);
                setSelectedProducts(rows);
              }
              setOpenRemoveDialog(false);
            }}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Card className="mb-4">
        <Card.Header className="p-3 bg-white">
          <h5>{isEdit ? t('products.Edit_Product') : t('products.Add_New_Product')} </h5>
        </Card.Header>
        <Card.Body>
          {!loading ? (
            <div className="forms-style-parent">
              <form className="form-style-products flex-wrap justify-content-center">
                <div className="products-columns ">
                  <div className="row">
                    <div className="upload-dots-box">
                      {img || formObj?.img?.length > 2 ? (
                        <>
                          <img src={previewUrl} />
                          {!isSaving && (
                            <button
                              className="btn btn-danger"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveImg(e);
                              }}>
                              Remove This Image
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <label htmlFor={'product-image'}>
                            <img src={'/images/dashboard/imageholder.jpg'} />
                            <br />
                            {t('products.Drop_Your_Image_Or')} <span>{t('products.Click')}</span>
                            <p>{t('Supports')} : JPG,PNG</p>
                          </label>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        id="product-image"
                        name="product-image"
                        hidden
                        onChange={imageChange}
                        onClick={(event) => {
                          event.currentTarget.value = null;
                        }}
                      />
                      {errorForm.img && (
                        <p className="p-1 h6 text-danger ">{t('products.Select_Image')} </p>
                      )}
                      {isSaving && (
                        <div className="uploader-bar-box">
                          <p>
                            {percent != 100
                              ? t('products.Uploading_Image...')
                              : t('products.Saveing_Form_Data...')}
                          </p>
                          <div className="uploader-bar" style={{ width: `${percent}%` }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <br />
                  {!isSaving && (
                    <>
                      {/* name  */}
                      <div className="field-cover">
                        <div className="field-section">
                          <p>
                            {t('products.Product/Service_Name')}:{' '}
                            <span className="text-danger">*</span>
                          </p>
                        </div>
                        <div className="field-section">
                          <input
                            type="text"
                            className="form-control"
                            placeholder={t('products.Product/Service_Name')}
                            value={formObj.name}
                            onChange={(e) => {
                              if (formObj.type === 'variable') {
                                setFormObj({ ...formObj, name: e.target.value });
                              } else {
                                setFormObj({ ...formObj, name: e.target.value });
                              }
                            }}
                          />
                          {errorForm.name && (
                            <p className="p-1 h6 text-danger ">
                              {t('products.Enter_Product_name')}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* second  */}
                      <div className="field-cover">
                        <div className="field-section">
                          <p>{t('products.Product/Service_Second_Name')}:</p>
                        </div>

                        <div className="field-section">
                          <input
                            type="text"
                            className="form-control"
                            placeholder={t('products.Product/Service_Second_Name')}
                            value={formObj.productName2}
                            onChange={(e) => {
                              setFormObj({ ...formObj, productName2: e.target.value });
                            }}
                          />
                        </div>
                      </div>
                      {/* sku  */}
                      <div className="field-cover">
                        <div className="field-section">
                          <p>
                            {t('products.sku')}: <span className="text-danger">*</span>
                          </p>
                        </div>
                        <div className="field-section">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Sku"
                            value={formObj.sku}
                            onChange={(e) => {
                              setFormObj({ ...formObj, sku: e.target.value });
                            }}
                          />
                          {errorForm.sku && (
                            <p className="p-1 h6 text-danger ">{t('products.Enter_Product_Sku')}</p>
                          )}
                          {errorForm.skuExist && (
                            <p className="p-1 h6 text-danger ">
                              {t('products.Enter_Product_unique_Sku')}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Barcode Type  */}
                      <div className="field-cover">
                        <div className="field-section">
                          <p>{t('products.Barcode_Type')}:</p>
                        </div>
                        <div className="field-section">
                          <Select
                            styles={colourStyles(false)}
                            options={barcodes}
                            value={barcodes.filter((f: any) => {
                              return f.value == formObj.barcode_type;
                            })}
                            onChange={(itm) => {
                              setFormObj({ ...formObj, barcode_type: itm!.value });
                            }}
                          />
                          {errorForm.barcode_type && (
                            <p className="p-1 h6 text-danger ">{t('products.Select_One_Option')}</p>
                          )}
                        </div>
                      </div>
                      {/* Tailoring Type  */}
                      {iType == 'Kianvqyqndr' && (
                        <div className="field-cover">
                          <div className="field-section">
                            <p>
                              {t('products.Tailoring_Type')}: <span className="text-danger">*</span>
                            </p>
                          </div>

                          <div className="field-section">
                            <Select
                              styles={colourStyles(false)}
                              options={tailoring}
                              value={tailoring.filter((f: any) => {
                                return f.value == formObj.isTailoring;
                              })}
                              onChange={(itm) => {
                                setFormObj({ ...formObj, isTailoring: itm!.value });
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {errorForm.isTailoring && (
                        <p className="p-1 h6 text-danger ">{t('products.You_must_select_One')}</p>
                      )}
                      {/* Unit */}
                      <div className="field-cover">
                        <div className="field-section">
                          <p>{t('products.Unit')}:</p>
                        </div>
                        <div className="field-section">
                          <Select
                            styles={colourStyles(false)}
                            options={units}
                            value={units.filter((f: any) => {
                              return f.value == formObj.unit_id;
                            })}
                            onChange={(itm) => {
                              setFormObj({ ...formObj, unit_id: itm!.value });
                            }}
                          />
                        </div>
                      </div>
                      {/* is Fabric */}
                      {iType == 'Kianvqyqndr' && (
                        <div className="field-cover">
                          <div className="field-section">
                            <p>{t('products.Is_Fabric')}:</p>
                          </div>
                          <div className="field-section">
                            <Switch
                              name={'is_fabric'}
                              checked={formObj.is_fabric}
                              onChange={checkboxHandleChange}
                            />
                          </div>
                        </div>
                      )}
                      {/* Brand */}
                      <div className="field-cover">
                        <div className="field-section">
                          <p>{t('products.Brand')}:</p>
                        </div>
                        <div className="field-section">
                          <Select
                            styles={colourStyles(false)}
                            options={brands}
                            value={brands.find((f: any) => {
                              return f.value == formObj.brand;
                            })}
                            onChange={(itm) => {
                              setFormObj({ ...formObj, brand: itm!.value });
                            }}
                          />
                          {errorForm.brand && (
                            <p className="p-1 h6 text-danger ">{t('products.Select_brand')}</p>
                          )}
                          <Button
                            variant="contained"
                            className="btn m-btn btn-primary  mt-3"
                            target="_blank"
                            href={`/shop/${shopId}/category/add?type=brands`}>
                            {t('products.Add_Brand')}
                          </Button>
                        </div>
                      </div>
                      {/* Category */}
                      <div className="field-cover">
                        <div className="field-section">
                          <p>
                            {t('products.Category')}: <span className="text-danger">*</span>
                          </p>
                        </div>
                        <div className="field-section">
                          <Select
                            styles={colourStyles(false)}
                            options={cats}
                            value={cats.find((f: any) => {
                              return f.value == formObj.category_id;
                            })}
                            onChange={(itm) => {
                              setFormObj({ ...formObj, category_id: itm!.value });
                            }}
                          />
                          {errorForm.category_id && (
                            <p className="p-1 h6 text-danger ">{t('products.Select_Category')}</p>
                          )}
                          <Button
                            variant="contained"
                            className="btn m-btn btn-primary mt-3"
                            target="_blank"
                            href={`/shop/${shopId}/category/add?type=categories`}>
                            {t('products.Add_Category')}
                          </Button>
                        </div>
                      </div>
                      {/* ُSub Category */}
                      <div className="field-cover" style={{ display: 'none' }}>
                        <div className="field-section">
                          <p>{t('products.Sub_Category')}:</p>
                        </div>
                        <div className="field-section">
                          <Select styles={colourStyles(false)} />
                        </div>
                      </div>
                    </>
                  )}
                  <br />
                </div>
                {!isSaving && (
                  <div className="products-columns">
                    <div className="first-gap"></div>
                    {/* is service */}
                    <div className="field-cover">
                      <div className="field-section">
                        <p>
                          {t('products.Is_Service')}:{' '}
                          <CustomWidthTooltip
                            PopperProps={{
                              disablePortal: true,
                            }}
                            placement="right-start"
                            onClose={handleTooltipClose}
                            open={open3}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            title={
                              <React.Fragment>
                                <Typography color="inherit">
                                  {t('products.Service_Product')}
                                </Typography>
                                {t('This_Product_will_be_as_service')}
                                <br />
                                <em>{t('without_stock_like_massage_etc')}</em>
                              </React.Fragment>
                            }>
                            <span onClick={() => handleTooltipOpen('msg')}>
                              {' '}
                              <FontAwesomeIcon icon={faInfoCircle} className={'text-primary'} />
                            </span>
                          </CustomWidthTooltip>
                        </p>
                      </div>
                      <div className="field-section">
                        <Switch
                          name={'is_service'}
                          checked={formObj.is_service}
                          onChange={checkboxHandleChange}
                        />
                      </div>
                    </div>
                    {/* Type */}
                    <div className="field-cover">
                      <div className="field-section">
                        <p>{t('products.Type')}:</p>
                      </div>
                      <div className="field-section">
                        <Select
                          // isDisabled={isEdit}
                          styles={colourStyles(false)}
                          options={producTypes}
                          value={producTypes.find((f: any) => {
                            return f.value == formObj.type;
                          })}
                          onChange={(itm) => {
                            setFormObj({ ...formObj, type: itm!.value });
                          }}
                        />
                      </div>
                    </div>
                    {/* package content */}
                    {formObj.type == 'package' && (
                      <div className="form-group mt-4">
                        <Select
                          formatOptionLabel={formatProductsOptions}
                          styles={colourStyles(false)}
                          options={products}
                          onChange={(e) => addPackageProducts(e)}
                        />
                        <br />
                        <div style={{ height: 300, width: '100%' }}>
                          <DataGrid
                            rows={selectedProducts}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10]}
                            onCellEditCommit={saveToCell}
                          />
                        </div>
                      </div>
                    )}
                    {/* variable content */}
                    {formObj.type == 'variable' && (
                      <div className="form-group mt-4">
                        <Table
                          className="table table-hover variation"
                          style={{ maxWidth: '700px' }}>
                          <thead>
                            <th>{t('products.Name')}</th>
                            <th>{t('products.Second_Name')}</th>
                            <th>{t('products.sku')}</th>
                            <th>{t('products.cost')}</th>
                            <th>{t('products.price')}</th>
                          </thead>
                          <tbody>
                            {formObj.variations.map((vr: any, i: number) => {
                              return (
                                <tr key={i}>
                                  <td>
                                    <input
                                      type="text"
                                      name="name"
                                      className="form-control p-2"
                                      placeholder={t('products.Enter_Name')}
                                      value={vr.name}
                                      onChange={(e) => {
                                        handleInputChange(e, i);
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      name="name2"
                                      className="form-control p-2"
                                      placeholder={t('products.Enter_second_Name')}
                                      value={vr.name2}
                                      onChange={(e) => {
                                        handleInputChange(e, i);
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      name="sku"
                                      className="form-control p-2"
                                      placeholder={t('products.Enter_sku')}
                                      value={vr.sku}
                                      onChange={(e) => {
                                        handleInputChange(e, i);
                                      }}
                                    />
                                    {errorForm.variation && (
                                      <p className="p-1 h6 text-danger ">
                                        {t('products.Enter_sku')}
                                      </p>
                                    )}
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      name="cost"
                                      min={0}
                                      className="form-control p-2"
                                      placeholder={t('products.Enter_cost')}
                                      value={vr.cost}
                                      onChange={(e) => {
                                        handleInputChange(e, i);
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      name="price"
                                      min={0}
                                      className="form-control p-2"
                                      placeholder={t('products.Enter_price')}
                                      value={vr.price}
                                      onChange={(e) => {
                                        handleInputChange(e, i);
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <ButtonGroup className="mb-2 m-buttons-style">
                                      <Button onClick={() => handleDeleteVariation(i)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                      </Button>
                                    </ButtonGroup>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    )}
                    {/* Tailoring package content */}
                    {formObj.type == 'tailoring_package' && iType == 'Kianvqyqndr' && (
                      <div className="form-group mt-4">
                        <p>{t('products.Select_Fabrics')}: *</p>
                        <Select
                          styles={colourStyles(false)}
                          options={allFabrics}
                          onChange={(e) => addToTailoringPackage(e)}
                        />
                        <br />
                        {errorForm.fabs && (
                          <p className="p-1 h6 text-danger ">
                            {t('products.Select_One_Option_at_Least')}
                          </p>
                        )}
                        <div style={{ height: 300, width: '100%' }}>
                          <DataGrid
                            rows={selectedFabrics}
                            columns={columnsTailoringPackages}
                            pageSize={10}
                            rowsPerPageOptions={[10]}
                            onCellEditCommit={saveToCell}
                          />
                        </div>
                        <p className="mt-4">{t('products.Enter_The_Prices')}</p>
                        {errorForm.rules && (
                          <p className="p-1 h6 text-danger ">
                            {t('products.Enter_The_Price_Rules')}
                          </p>
                        )}
                        <div className="form-group mt-4">
                          <Table
                            className="table table-hover variation"
                            style={{ maxWidth: '700px' }}>
                            <thead>
                              <th>{t('products.Name')}</th>
                              <th>{t('products.From')}</th>
                              <th>{t('products.To')}</th>
                              <th>{t('products.price')}</th>
                            </thead>
                            <tbody>
                              {formObj.tailoringPrices.map((vr: any, i: number) => {
                                return (
                                  <tr key={i}>
                                    <td>
                                      <input
                                        type="text"
                                        name="name"
                                        className="form-control p-2"
                                        placeholder={t('products.Enter_Name')}
                                        value={vr.name}
                                        onChange={(e) => {
                                          handleInputChangeTailoring(e, i);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        name="from"
                                        min={0}
                                        className="form-control p-2"
                                        placeholder={t('products.Enter_Start_Length')}
                                        value={vr.from}
                                        onChange={(e) => {
                                          handleInputChangeTailoring(e, i);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        name="to"
                                        min={0}
                                        className="form-control p-2"
                                        placeholder={t('products.Enter_End_Length')}
                                        value={vr.to}
                                        onChange={(e) => {
                                          handleInputChangeTailoring(e, i);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        name="price"
                                        min={0}
                                        className="form-control p-2"
                                        placeholder={t('products.Enter_Price')}
                                        value={vr.price}
                                        onChange={(e) => {
                                          handleInputChangeTailoring(e, i);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <ButtonGroup className="mb-2 m-buttons-style">
                                        <Button onClick={() => handleDeleteTailoringPrices(i)}>
                                          <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                      </ButtonGroup>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    )}
                    {/* cost */}
                    {formObj.type == 'single' && (
                      <>
                        <div className="field-cover">
                          <div className="field-section">
                            <p>
                              {t('products.Cost')}: <span className="text-danger">*</span>
                            </p>
                          </div>
                          <div className="field-section">
                            <input
                              type="text"
                              className="form-control"
                              placeholder={t('products.Purchase_Price')}
                              value={formObj.cost_price}
                              onKeyPress={handleNumberKeyPress}
                              onChange={(e) => {
                                setFormObj({ ...formObj, cost_price: e.target.value });
                              }}
                            />
                          </div>
                        </div>
                        {/* Price */}
                        <div className="field-cover">
                          <div className="field-section">
                            <p>
                              {t('products.Price')}: <span className="text-danger">*</span>
                            </p>
                          </div>
                          <div className="field-section">
                            <input
                              type="text"
                              className="form-control"
                              placeholder={t('products.Sell_Price')}
                              value={formObj.sell_price}
                              onKeyPress={handleNumberKeyPress}
                              onChange={(e) => {
                                setFormObj({ ...formObj, sell_price: e.target.value });
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {/* Alert Quantity */}
                    {!formObj.is_service && (
                      <div className="field-cover">
                        <div className="field-section">
                          <p>
                            {t('products.Alert_Quantity')}: <span className="text-danger">*</span>
                          </p>
                        </div>
                        <div className="field-section">
                          <input
                            type="number"
                            className="form-control"
                            placeholder={t('products.Alert_Quantity')}
                            value={formObj.alertQuantity}
                            min={0}
                            onChange={(e) => {
                              setFormObj({ ...formObj, alertQuantity: Number(e.target.value) });
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {formObj.is_service == 0 && (
                      <>
                        {/* Sell Over Stock */}
                        <div className="field-cover">
                          <div className="field-section">
                            <p>{t('products.Sell_Over_Stock')}:</p>
                          </div>
                          <div className="field-section">
                            <Switch
                              name={'sell_over'}
                              value={formObj.isSellOverStock}
                              checked={formObj.isSellOverStock}
                              onChange={checkboxHandleChange}
                            />
                          </div>
                        </div>
                        {/* Enable Multi Price */}
                        <div className="field-cover">
                          <div className="field-section">
                            <p>
                              {t('products.Enable_Multi_Price')}:{' '}
                              <CustomWidthTooltip
                                PopperProps={{
                                  disablePortal: true,
                                }}
                                placement="right-start"
                                onClose={handleTooltipClose}
                                open={open2}
                                disableFocusListener
                                disableHoverListener
                                disableTouchListener
                                title={
                                  <React.Fragment>
                                    <Typography color="inherit">
                                      {t('products.Multi_Price')}
                                    </Typography>
                                    {t('products.A_product_can_have_several_prices')}
                                    <br />
                                    <em>{t('It_depends_on_the_price_of_your_purchases')}</em>
                                  </React.Fragment>
                                }>
                                <span onClick={() => handleTooltipOpen('multi')}>
                                  {' '}
                                  <FontAwesomeIcon icon={faInfoCircle} className={'text-primary'} />
                                </span>
                              </CustomWidthTooltip>
                            </p>
                          </div>
                          <div className="field-section">
                            <Switch
                              name={'multi_price'}
                              checked={formObj.isMultiPrice}
                              onChange={checkboxHandleChange}
                            />
                          </div>
                        </div>
                        {/* FIFO OR LIFO */}
                        <div className="field-cover">
                          <div className="field-section">
                            <p>{t('products.FIFO_OR_LIFO')}:</p>
                          </div>
                          <div className="field-section">
                            <Switch
                              name={'is_fifo'}
                              checked={formObj.isFifo}
                              onChange={checkboxHandleChange}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {/* Extras Categories */}
                    <div className="field-cover">
                      <div className="field-section">
                        <p>
                          {t('extra.extras_categories')}:{' '}
                          <CustomWidthTooltip
                            PopperProps={{
                              disablePortal: true,
                            }}
                            placement="right-start"
                            onClose={handleTooltipClose}
                            open={open}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            title={
                              <React.Fragment>
                                <Typography color="inherit">
                                  {t('extra.extras_categories')}
                                </Typography>
                                {t('extra.you_can_Choose_as_many_extras_categories_for_this_product')}
                                <br />
                                <em>{t('extra.to_create_extras_category,_go_to_setting/extras')}</em>
                              </React.Fragment>
                            }>
                            <span onClick={() => handleTooltipOpen('tax')}>
                              {' '}
                              <FontAwesomeIcon icon={faInfoCircle} className={'text-primary'} />
                            </span>
                          </CustomWidthTooltip>
                        </p>
                      </div>
                      <div className="field-section">
                        <Select
                          isMulti
                          onKeyDown={(e) => e.stopPropagation()}
                          styles={colourStyles(true)}
                          options={extrasCategories} 
                          value={extrasCategories.filter((f: any) => formObj.extrasCategories.includes(f.value))}
                          onChange={(selectedItems) => {
                            const selectedValues = selectedItems.map((item) => item.value);
                            setFormObj({ ...formObj, extrasCategories: selectedValues });
                          }}

                        />
                      </div>
                    </div>
                    {/* Custom Tax */}
                    <div className="field-cover">
                      <div className="field-section">
                        <p>
                          {t('products.Custom_Tax')}:{' '}
                          <CustomWidthTooltip
                            PopperProps={{
                              disablePortal: true,
                            }}
                            placement="right-start"
                            onClose={handleTooltipClose}
                            open={open}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            title={
                              <React.Fragment>
                                <Typography color="inherit">
                                  {t('products.specific_Group_A_Tax')}
                                </Typography>
                                {t('You_can_Choose_a_specific_Group_tax_For_this_Product')}
                                <br />
                                <em>{t('For_Create_Group_Tax,_go_to_setting/taxes')}</em>
                              </React.Fragment>
                            }>
                            <span onClick={() => handleTooltipOpen('tax')}>
                              {' '}
                              <FontAwesomeIcon icon={faInfoCircle} className={'text-primary'} />
                            </span>
                          </CustomWidthTooltip>
                        </p>
                      </div>
                      <div className="field-section">
                        <Select
                          styles={colourStyles(false)}
                          options={taxGroup}
                          value={taxGroup.find((f: any) => {
                            return f.value == formObj.tax_id;
                          })}
                          onChange={(itm) => {
                            setFormObj({ ...formObj, tax_id: itm!.value });
                          }}
                        />
                      </div>
                    </div>



                    <button
                      type="button"
                      style={{
                        height: 'fit-content',
                      }}
                      disabled={isSaving}
                      className="btn m-btn btn-primary p-2"
                      onClick={(e) => {
                        e.preventDefault();
                        if (isSaving) return Toastify('warning', 'There is a current process');

                        errors = [];
                        if (formObj.type == 'variable') {
                          formObj.variations.forEach((el, index) => {
                            if (el.sku === '') {
                              errors.push(`error1${index + 1}`);
                            }
                          });
                        }
                        if (formObj.category_id == 0) errors.push('error10');
                        // if (formObj.brand == null) errors.push('error9');
                        if (formObj.name.length == 0) errors.push('error8');
                        if (formObj.sku.length == 0) errors.push('error7');
                        if (formObj.barcode_type == '0') errors.push('error6');
                        if (formObj.type == 'tailoring_package') {
                          if (formObj.tailoringPrices.length <= 1) errors.push('error5');
                          if (selectedFabrics.length == 0) errors.push('error1');
                          if (formObj.tailoringPrices.length <= 1) errors.push('error2');
                          if (formObj.isTailoring == null || formObj.isTailoring <= 0) {
                            errors.push('error3');
                            Toastify('error', ' Error,You must select One Item For Tailoring Type');
                            setErrorForm({ ...errorForm, isTailoring: true });
                          }
                        }
                        setErrorForm({
                          ...errorForm,
                          category_id: formObj.category_id == 0,
                          // brand: formObj.brand == null,
                          name: formObj.name.length == 0,
                          sku: formObj.sku.length == 0,
                          barcode_type: formObj.barcode_type == '0',
                          fabs: formObj.type == 'tailoring_package' && selectedFabrics.length == 0,
                          rules:
                            formObj.type == 'tailoring_package' &&
                            formObj.tailoringPrices.length <= 1,
                        });
                        if (formObj.type === 'variable') {
                          formObj.variations.forEach((el, index) => {
                            if (el.sku === '') {
                              setErrorForm({
                                ...errorForm,
                                variation: true,
                              });
                            }
                          });
                        }
                        if (errors.length == 0) {
                          setIsSaving(true);
                          if (isEdit) img == null ? editProduct() : handleUpload();
                          else img != null ? handleUpload() : insertProduct();
                        } else Toastify('error', 'Enter Requires Field');
                      }}>
                      {isEdit ? t('products.Edit') : t('products.Save')}
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="d-flex justify-content-around">
              <Spinner animation="grow" />
            </div>
          )}
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};
export default withAuth(Product);

interface IPayload {
  name: string; // required|string
  subproductname?: string;
  category_id: number; // required|numeric
  location_id: number; // required|numeric
  type: 'single' | 'package' | 'variable' | 'tailoring_package'; // required|string:in:single,package,variable,tailoring_package
  is_service: boolean; // required|boolean
  is_fabric: boolean; // required|boolean
  unit_id: number; // required|exists:units,id
  never_tax?: boolean; // required|boolean
  alert_quantity?: number; // nullable|numeric
  sku: string; // required|string
  barcode_type: 'C128' | 'C39' | 'C93' | 'EAN8' | 'EAN13' | 'UPCA' | 'UPCE'; // required|string:in:C128,C39,C93,EAN8,EAN13,UPCA,UPCE
  sell_price: number; // required|numeric
  cost_price: number; // required|numeric
  sell_over_stock?: boolean; // nullable|boolean
  is_fifo?: boolean; // nullable|boolean
  packages?: IPackage[]; // nullable|array
  variations?: IVariation[]; // nullable|array
  image?: string;
  qty_over_sold?: number;
  brand_id?: number;
}

interface Price {
  name: string;
  from: string;
  to: string;
  price: string;
}

interface IPackage {
  prices_json: Price[]; // nullable|string
  tailoring_type_id?: number; // nullable|exists:tailoring_types,id
  fabric_ids?: number[]; // nullable|array
}

interface IVariation {
  name?: string; // nullable|string
  sku?: string; // nullable|string
  cost?: number; // nullable|numeric
  price?: number; // nullable|numeric
  sell_over_stock?: boolean; // nullable|boolean
  is_selling_multi_price?: number; // nullable|numeric
  is_service?: boolean; // nullable|boolean
}

type TFormObject = {
  id: number;
  img: string;
  name: string;
  productName2: string;
  type: 'single' | 'package' | 'variable' | 'tailoring_package';
  sku: string;
  barcode_type: 'C128' | 'C39' | 'C93' | 'EAN8' | 'EAN13' | 'UPCA' | 'UPCE';
  tax_id: number;
  unit_id: number;
  brand: string;
  category_id: number;
  subCat: string;
  alertQuantity: number;
  cost_price: number;
  sell_price: number;
  is_fabric: boolean;
  is_service: boolean;
  isSellOverStock: boolean;
  isMultiPrice: boolean;
  isFifo: boolean;
  isTailoring: number;
  variations: {
    name: string;
    name2: string;
    sku: string;
    cost: number;
    price: number;
    isNew: boolean;
  }[];
  tailoringPrices: {
    name: string;
    from: number;
    to: number;
    price: number;
  }[];
  extrasCategories?:{
    name:string;
    second_name:string;
    extras:{
      name:string;
      second_name:string;
      price:number;
    }[];
  }[]
};

async function getData(endPoint: string, API_BASE: string, _token: string) {
  try {
    const res = await fetch(`${API_BASE}${endPoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${_token}`,
      },
    });
    const data = await res.json();

    if (data.status === 200) {
      return data?.result;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function getServerSideProps(context) {
  const { query, req, locale } = context;

  if (Number.isNaN(+query?.id)) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
      props: {},
    };
  }
  const session = await getSession({ req: req });
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
  const _token = session?.user?.token;

  let dataProduct = {};

  if (query?.slug.length === 2 && !Number.isNaN(+query?.slug[1])) {
    dataProduct = (await getData(`products/${query.slug[1]}/show`, API_BASE, _token)) ?? {
      error: true,
    };
  }

  const resCategories = (await getData(`categories/${query.id}`, API_BASE, _token)) ?? [];
  const resBrands = (await getData(`brands/${query.id}`, API_BASE, _token)) ?? [];
  const resUnits = (await getData(`units`, API_BASE, _token)) ?? [];
  const resTaxes = (await getData(`taxes/${query.id}`, API_BASE, _token)) ?? [];
  const resExtrasCategories = (await getData(`extras-categories`,API_BASE,_token)) ?? [];


  return {
    props: {
      resExtrasCategories,
      resCategories,
      resTaxes,
      resUnits,
      resBrands,
      dataProduct,
      ...(await serverSideTranslations(locale)),
    },
  };
}
