import { faArrowAltCircleLeft } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { ICurrency, IProduct } from '@models/pos.types';
import { ISupplier } from '@models/suppliers.types';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { ToastContainer } from 'react-toastify';
import { useRecoilState } from 'recoil';
import withAuth from 'src/HOCs/withAuth';
import VariationModal from 'src/components/pos/modals/VariationModal';
import { TableExpeseRows, TableTaxRows } from 'src/components/utils/ExpendsRow';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import { apiUpdateCtr } from 'src/libs/dbUtils';
import { IPurchaseExpndes, IpurchaseProductItem } from 'src/models/common-model';
import {
  purchasesColumns,
  purchasesInitFormError,
  purchasesInitFormObj,
  purchasesInitPurchaseDetails,
} from 'src/modules/purchases/_utils';
import { cartJobType } from 'src/recoil/atoms';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import { paymentStatusData, paymentTypeData, purchaseStatusDataAdd } from '../../../../models/data';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import 'react-datepicker/dist/react-datepicker.css';

interface ICurrencySelect extends ICurrency {
  value: number;
  label: string;
}
interface ISupplierSelect extends Partial<ISupplier> {
  supplier_id: number;
  value: number;
  label: string;
}

const purchasesColourStyles = { control: (style: any) => ({ ...style, borderRadius: '10px' }) };
const purchasesSelectStyle = {
  control: (style: any) => ({ ...style, color: '#db3333', borderRadius: '10px' }),
};

const initialSupplier = [{ supplier_id: -1, id: -1, value: -1, label: 'Loading ... ' }];
const mapToSelectList = (item) => ({ ...item, label: item.name, value: item.id });

const AddPurchase: NextPage = ({ shopId, id: editId }: any) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [jobType] = useRecoilState(cartJobType);
  const { locationSettings, setLocationSettings } = useUser();

  const formObjRef = useRef<any>();

  const [formObj, setFormObj] = useState(purchasesInitFormObj);
  
  const [errorForm, setErrorForm] = useState(purchasesInitFormError);
  const [suppliers, setSuppliers] = useState<ISupplierSelect[]>(initialSupplier);
  const [purchaseDetails, setPurchaseDetails] = useState(purchasesInitPurchaseDetails);

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditSort, setIsEditSort] = useState(false);
  const [vatInColumn, setVatInColumn] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [isOpenVariationDialog, setIsOpenVariationDialog] = useState(false);

  const [selectedProductForVariation, setSelectedProductForVariation] = useState<{
    product_id: number;
    product_name: string;
    is_service: number;
  }>({ product_id: 0, product_name: '', is_service: 0 });
  const [purchaseStatus, setPurchaseStatus] =
    useState<{ value: string; label: string }[]>(purchaseStatusDataAdd);
  const [paymentTypes, setPaymentTypes] =
    useState<{ value: string; label: string }[]>([
      { label: 'Cash', value: "cash" },
      { label: 'Card', value: 'card' },
      { label: 'Bank', value: 'bank' },
      { label: 'Cheque', value: 'cheque' },
    ]);
  const [paymentStatus, setPaymentStatus] =
    useState<{ value: string; label: string }[]>(paymentStatusData);
  const [products, setProducts] = useState<{ value: number; label: string }[]>([]);
  const [selectProducts, setSelectProducts] = useState<IpurchaseProductItem[]>([]);
  const [allVariations, setAllVariations] = useState([]);
  const [expends, setExpends] = useState<{ label: ''; value: 0 }[]>([]);
  const [selectedExpends, setSelectedExpends] = useState<IPurchaseExpndes[]>([]);
  const [selectedExpendsEdit, setSelectedExpendsEdit] = useState<IPurchaseExpndes[]>([]);
  const [selectedTaxes, setSelectedTaxes] = useState<IPurchaseExpndes[]>([]);

  const [total_qty, setTotal_qty] = useState(0);
  const [totalExpends, setTotalExpends] = useState(0);
  const [expenseCounter, setExpenseCounter] = useState(0);

  const [selecetdId, setSelecetdId] = useState({ product_id: 0, variation_id: 0 });

  const [currencies, setCurrencies] = useState<ICurrencySelect[]>([]);

  const onCostClick = (type: string, id: number, vr: number) => {
    const found = selectProducts.findIndex((el) => el.product_id === id && el.variation_id == vr);
    if (found > -1) {
      var _datas: any = selectProducts;
      if (type == 'useExpnds') _datas[found].costType = _datas[found].costType == 1 ? 0 : 1;
      else if (type == 'useTax') _datas[found].costType = _datas[found].costType == 2 ? 0 : 2;
      else if (type == 'useTotal') _datas[found].costType = _datas[found].costType == 3 ? 0 : 3;

      setSelectProducts([..._datas]);
    }
  };

  const formatProductsOptions = (products: any) => (
    <div>
      <div>({Number(products.sell_price).toFixed(3)})</div>
      <div style={{ opacity: '0.8' }}>
        <span>{products.name}</span>
      </div>
    </div>
  );

  async function insertPurchase() {
    const data = {
      // ...formObj,
      location_id: +shopId, //  "required|numeric",
      status: formObj?.purchaseStatus, //  "required|string:in:draft,partially_received,processing,received,cancelled",
      payment_status: formObj?.paymentStatus, //  "required|string:in:credit,partially_paid,paid,due",
      supplier_id: formObj?.supplier_id || undefined,
      payment_type: formObj?.paymentType,
      currency_id: formObj?.currency_id,
      ...((formObj?.paymentStatus === 'partially_paid') && {total_paid: formObj?.paid_amount}),
      cart: [
        ...selectProducts.map((item) => ({
          product_id: item.product_id,
          variation_id: item.variation_id,
          qty: item.quantity,
          note: '',
          cost: item.cost,
          price: item.price,
        })),
      ],
      // expense: {
      //   amount: null,
      //   category: {
      //     id: 35,
      //   },
      // },
      notes: '',
    };

    api.post(`/purchase/${shopId}`, data).then((res) => {

      if (!res.data.success) {
        alert('Has Error ,try Again');
        return;
      }
      Toastify('success', 'Purchase Successfully Created..');
      router.push('/shop/' + shopId + '/purchases');
    });
  }
  async function editPurchase() {
    const data = {
      // ...formObj,
      location_id: +shopId, //  "required|numeric",
      status: formObj.purchaseStatus, //  "required|string:in:draft,partially_received,processing,received,cancelled",
      payment_status: formObj.paymentStatus, //  "required|string:in:credit,partially_paid,paid,due",
      supplier_id: formObj.supplier_id || undefined,
      payment_type: formObj.paymentType,
      currency_id: formObj.currency_id,
      cart: [...selectProducts.map((item) => ({ ...item, qty: item.quantity, note: '' }))],
      expense: {
        amount: null,
        category: {
          id: 35,
        },
      },
      notes: '',
    };
    api.put(`/purchase/${shopId}`, data).then((res) => {
      if (!res.data.success) {
        alert('Has Error ,try Again');
        return;
      }
      Toastify('success', 'Purchase Successfully Created..');
      router.push('/shop/' + shopId + '/purchases');
    });
  }
  var errors = [];

  useEffect(() => {
    if (!shopId) return;

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);
  }, [shopId, router.query.slug]);

  function getPriority(type: string, subTotal: number): number {
    switch (type) {
      case 'discount':
        return subTotal - formObj.total_discount;
      case 'expense':
        return subTotal + formObj.total_expense;
      case 'taxes':
        return (formObj.total_tax / 100) * subTotal + subTotal;
    }
    return 0;
  }
  function finalCalculation(subTotal = 0) {
    subTotal = subTotal > 0 ? subTotal : formObj.subTotal_price;
    var _total = subTotal;
    if (_total <= 0) return;
    purchaseDetails.map((dp) => (_total = getPriority(dp.value, _total)));

    setFormObj((prev) => ({
      ...prev,
      total_price: _total,
      subTotal_price: subTotal,
      paid_amount:
        formObj.paymentStatus == 'paid' || formObj.paymentStatus == 'credit'
          ? _total
          : formObj.paid_amount,
    }));
  }
  useEffect(() => {
    var _prices = 0,
      _qty = 0;
    selectProducts.map((p: IpurchaseProductItem) => {
      _qty += Number(p.quantity);
      _prices += Number(p.lineTotal);
    });
    setTotal_qty(_qty);
    setFormObj((prev) => ({ ...prev, subTotal_price: _prices }));
    finalCalculation(_prices);
  }, [selectProducts]);

  useEffect(() => {
    var _disAmount = 0,
      _total = 0;
    _disAmount = formObj.discount_amount;

    // formObj.discount_type == 'fixed' ?  : ((formObj.discount_amount / 100) * formObj.subTotal_price).toFixed(3)

    if (formObj.discount_type == 'percent') {
      _disAmount = _disAmount > 100 ? 100 : _disAmount;
      _total = (_disAmount / 100) * formObj.subTotal_price;
    } else {
      _disAmount = _disAmount > formObj.subTotal_price ? formObj.subTotal_price : _disAmount;
      _total = _disAmount;
    }
    setFormObj((prev) => ({ ...prev, total_discount: _total, discount_amount: _disAmount }));
  }, [formObj.discount_type, formObj.discount_amount]);

  //expenses
  useEffect(() => {
    var _sum = 0;

    selectedExpends.map((ep) => (_sum += Number(ep.enterd_value * ep.currency_rate)));
    selectedExpendsEdit.map((ep) => (_sum += Number(ep.enterd_value * ep.currency_rate)));
    setTotalExpends(_sum);

    setFormObj((prev) => ({
      ...prev,
      total_expense: +_sum.toFixed(locationSettings?.location_decimal_places),
    }));
    calculationLabels(_sum, formObj.total_tax);
  }, [selectedExpends, selectedExpendsEdit]);

  useEffect(() => {
    finalCalculation();
  }, [purchaseDetails]);
  useEffect(() => {
    finalCalculation();
  }, [formObj.total_discount]);
  useEffect(() => {
    finalCalculation();
  }, [formObj.total_expense]);
  useEffect(() => {
    finalCalculation();
  }, [formObj.total_tax]);
  
  useEffect(() => {
    setFormObj((prev) => ({...prev,
      currency_id: locationSettings?.currency_id,
      currency_code: locationSettings?.currency_code,
    }));
  }, [locationSettings]);
  useEffect(() => {
    calculationLabels(formObj.total_expense, formObj.total_tax);
  }, [formObj.currency_rate]);

  const addTableRows = (rowType = 'expense') => {
    if (rowType == 'expense') {
      //expense
      if (selectedExpends.length < 5)
        setSelectedExpends([
          ...selectedExpends,
          {
            label: 'Select One',
            value: 0,
            currency_code: '',
            currency_id: 0,
            currency_rate: 1,
            converted_value: 0,
            enterd_value: 0,
            isNew: true,
          },
        ]);
      else alert('Erorr , maximum 5 fileds');
    } else {
      //add taxes

      setSelectedTaxes([
        ...selectedTaxes,
        {
          label: '',
          value: 0,
          currency_code: '',
          currency_id: 0,
          currency_rate: 1,
          converted_value: 0,
          enterd_value: 0,
          isNew: true,
        },
      ]);
    }
  };
  const deleteTableRows = (index: any) => {
    const _rows = [...selectedExpends];
    _rows.splice(index, 1);

    setSelectedExpends(_rows);

    setExpenseCounter(expenseCounter - 1);
  };
  const handleChange = (index: any, evnt: any, isNew: Boolean) => {
    const _expends: IPurchaseExpndes[] | any = isNew
      ? [...selectedExpends]
      : [...selectedExpendsEdit];
    if ('label' in evnt && 'code' in evnt) {
      _expends[index].currency_code = evnt.code;
      _expends[index].currency_rate = evnt.exchange_rate;
      _expends[index].currency_id = evnt.value;
    } else if ('label' in evnt) {
      _expends[index].label = evnt.label;
      _expends[index].value = evnt.value;
    } else {
      const { name, value } = evnt.target;
      _expends[index][name] = value;
    }
    _expends[index].converted_value = +Number(
      _expends[index].currency_id == locationSettings?.currency_id
        ? _expends[index].value
        : _expends[index].value * _expends[index].currency_rate
    ).toFixed(locationSettings?.location_decimal_places);
    if (isNew) setSelectedExpends(_expends);
    else setSelectedExpendsEdit(_expends);
  };
  //taxes

  const deleteRowTaxes = (index: any) => {
    const _rows = [...selectedTaxes];
    _rows.splice(index, 1);
    setSelectedTaxes(_rows);
  };
  const handlerRowTaxes = (index: any, evnt: any) => {
    const _rows: IPurchaseExpndes[] | any = [...selectedTaxes];

    if ('label' in evnt) {
      _rows[index].currency_rate = evnt.exchange_rate;
      _rows[index].currency_id = evnt.value;
    } else {
      const { name, value } = evnt.target;
      _rows[index][name] = value;
    }
    _rows[index].converted_value = +Number(
      _rows[index].currency_id == locationSettings?.currency_id
        ? _rows[index].value
        : _rows[index].value * _rows[index].currency_rate
    ).toFixed(locationSettings?.location_decimal_places);
    setSelectedTaxes(_rows);
  };

  //product add / update
  const addToProductQuotations = (e: IProduct & { value: number; label: string }) => {
    if (e.type == 'variable') {
      setSelectedProductForVariation({
        ...e,

        product_id: e.id,
        is_service: 0,
        product_name: e.name,
      });
      setAllVariations(e.variations);
      setIsOpenVariationDialog(true);
      return;
    }
    const found = selectProducts.some((el) => el.product_id === e.value);
    if (!found) {
      setSelectProducts([
        ...selectProducts,
        {
          ...e,
          product_id: e.id,
          variation_id: 0,
          name: e.name,
          quantity: 1,
          price: +e.sell_price,
          cost: +e.cost_price,
          lineTotal: +e.cost_price,
          taxAmount: 0,
          costType: 0,
          isNew: true,
        },
      ]);
      setSelectedExpends([...selectedExpends]);
    } else Toastify('error', 'already exists in list');
  };
  const saveToCell = (params: any) => {
    const found = selectProducts.findIndex((el) => el.id === params.id);
    if (found > -1) {
      var _datas: any = selectProducts;
      _datas[found][params.field] = params.value < 0 ? 0 : params.value; 
      if ((params.field == 'cost' || params.field == 'quantity') && (params.value >= 0)) {
        _datas[found].lineTotal = Number(_datas[found].cost * _datas[found].quantity).toFixed(
          locationSettings?.location_decimal_places
        );
        const totalPrice = selectProducts.reduce(
          (sum, product) => sum + product.cost * product.quantity,
          0
        );
        setFormObj((prev)=>({
          ...prev,
          subTotal_price: totalPrice,
        }));
      }
      setSelectProducts([..._datas]);
      calculationLabels(formObj.total_expense, formObj.total_tax);
    }
  };
  const sortHandler = (i: number, type: string) => {
    var _data = [...purchaseDetails];
    var _temp = _data[i].priority;
    if (type == 'd') {
      _data[i].priority = _data[i + 1].priority;
      _data[i + 1].priority = _temp;
    } else {
      _data[i].priority = _data[i - 1].priority;
      _data[i - 1].priority = _temp;
    }
    _data.sort((a: any, b: any) => (a.priority > b.priority ? 1 : -1));
    setPurchaseDetails(_data);
  };
  function getCost(cost = 0) {
    return locationSettings?.currency_code == formObj.currency_code
      ? cost
      : cost * formObj.currency_rate;
  }
  function calculationLabels(totalEpx: number, totalTax: number) {
    var _subtotal = 0;
    var _rows: any = [...selectProducts];
    _rows.map((rs: any) => (_subtotal += parseFloat(rs.lineTotal)));
    totalTax = (totalTax / 100) * _subtotal;
    _rows.map((sp: IpurchaseProductItem, i: number) => {
      var _ExpVal = ((sp.lineTotal / _subtotal) * totalEpx) / sp.quantity;
      var _TaxVal = ((sp.lineTotal / _subtotal) * totalTax) / sp.quantity;

      _rows[i].notifyExpensePrice =
        _ExpVal > 0
          ? +Number(_ExpVal + parseFloat(getCost(sp.cost).toString())).toFixed(
              locationSettings?.location_decimal_places
            )
          : 0;
      if (_ExpVal == 0 && _rows[i].costType == 1) _rows[i].costType = 0;

      _rows[i].notifyTaxPrice =
        _TaxVal > 0
          ? +Number(_TaxVal + parseFloat(getCost(sp.cost).toString())).toFixed(
              locationSettings?.location_decimal_places
            )
          : 0;
      if (_TaxVal == 0 && _rows[i].costType == 2) _rows[i].costType = 0;

      _rows[i].notifyTotalPrice = Number(
        _rows[i].notifyExpensePrice + _rows[i].notifyTaxPrice
      ).toFixed(locationSettings?.location_decimal_places);
      if (_rows[i].notifyTotalPrice == 0 && _rows[i].costType == 2) _rows[i].costType = 0;
    });
    setSelectProducts(_rows);
  }

  const columns = useMemo(
    () =>
      purchasesColumns({
        locationSettings,
        formObj,
        onCostClick,
        setSelecetdId,
        setOpenRemoveDialog,
        t
      }),
    [locationSettings, formObj, formObjRef]
  );

  formObjRef.current = formObj;

  async function getPageData(shopId) {
    setDataLoading(true);
    try {
      const _suppliers = await api
        .get(`/suppliers/${shopId}?all_data=1`)
        .then(({ data }) => data.result?.map(mapToSelectList));
      const _products = await api
        .get(`/products/${shopId}?all_data=1`)
        .then(({ data }) => data.result?.map(mapToSelectList));
      const _currencies = await api.get(`/currencies?all_data=1`).then(
        ({ data }) =>
          data.result?.map((itm: ICurrency) => ({
            ...itm,
            value: itm.id,
            label: `${itm.currency} (${itm.code})`,
          }))
      );



      setSuppliers([{ supplier_id: 0, id: 0, value: 0, label: 'walk-in supplier' }, ..._suppliers]);
      setFormObj((prev)=>({ ...prev, supplier_id: 0}));

      setProducts(_products);
      setCurrencies(_currencies);
    } catch {
      Toastify('error', 'Somethig went wrong, please refresh and try again!');
      setSuppliers([]);
      setProducts([]);
      setCurrencies([]);
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    var _tx = 0;
    selectedTaxes.map((ep: any) => (_tx += Number(ep.converted_value)));
    setFormObj((prev) => ({ ...prev, total_tax: +_tx.toFixed(locationSettings?.location_decimal_places) }));
    calculationLabels(formObj.total_expense, _tx);
  }, [selectedTaxes]);
  useEffect(() => {
    if (jobType.req == 4) {
      allVariations.map((varItm: any, index: number) => {
        if (varItm.id == jobType.val) {
          const found = selectProducts.some((el) => el.id == varItm.id);
          if (!found) {
            setSelectProducts([
              ...selectProducts,
              {
                id: varItm.id,
                product_id: varItm.parent_id,
                variation_id: varItm.id,
                name: selectedProductForVariation.product_name + ' ' + varItm.name,
                quantity: 1,
                price: varItm.price,
                cost: varItm.cost,
                lineTotal: parseFloat(varItm.cost),
                taxAmount: 0,
                costType: 0,
                isNew: true,
              },
            ]);
            setSelectedExpends([...selectedExpends]);
          } else Toastify('error', 'already exists in list');
        }
      });
    }
  }, [jobType]);
  useEffect(() => {
    if (!shopId) return Toastify('warning', 'Please refresh the page!');
    getPageData(shopId);
  }, [shopId]);

  return (
    <AdminLayout shopId={shopId}>
      {isOpenVariationDialog && (
        <VariationModal
          selectedProductForVariation={selectedProductForVariation}
          isOpenVariationDialog={isOpenVariationDialog}
          setIsOpenVariationDialog={setIsOpenVariationDialog}
          variations={allVariations}
        />
      )}
      <ToastContainer />
      <Dialog
        open={openRemoveDialog}
        onClose={() => {
          setOpenRemoveDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{t("purchases.Remove_Product")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t("purchases.Are_you_Sure_You_Want_Remove_This_Item?")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemoveDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const rows = [...selectProducts];
              const _index = rows.findIndex(
                (it: any) =>
                  it.product_id == selecetdId.product_id &&
                  it.variation_id == selecetdId.variation_id
              );
              if (_index > -1) rows.splice(_index, 1);
              setSelectProducts(rows);
              setOpenRemoveDialog(false);
              setSelectedExpends([...selectedExpends]);
            }}>
            {t("purchases.Yes")}
          </Button>
        </DialogActions>
      </Dialog>
      <div className="mb-4">
        <button
          className="btn m-btn btn-primary p-3"
          onClick={() => router.push('/shop/' + shopId + '/purchases')}>
          <FontAwesomeIcon icon={faArrowAltCircleLeft} /> {t("purchases.Back_To_List")}{' '}
        </button>
      </div>
      {loading ? (
        <Card className="mb-4">
          <Card.Header className="p-3 bg-white">
            <h5>{t("purchases.Loading")}</h5>
          </Card.Header>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Header className="p-3 bg-white">
              <h5>{isEdit ? t('purchases.Edit_Purchase ') : t('purchases.Add_Purchase')}</h5>
            </Card.Header>
            <Card.Body>
              <div className="form-style2">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group2">
                      <label>
                        {t("purchases.Supplier")} : <span className="text-danger">*</span>
                      </label>
                      <Select
                        isLoading={dataLoading}
                        styles={purchasesSelectStyle}
                        options={suppliers}
                        defaultValue={suppliers[0]}
                        value={suppliers.filter((sp) => sp.value == formObj.supplier_id)}
                        onChange={(itm) => {
                          setFormObj((prev) => ({ ...prev, supplier_id: itm.value }));
                        }}
                      />
                      {errorForm.supplier_id && (
                        <p className="p-1 h6 text-danger ">{t("purchases.Select_a_Supplier")}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group2">
                      <label>{t("purchases.Reference_No")} :</label>
                      <input
                        type="text"
                        className="form-control p-2"
                        placeholder={t("purchases.Reference_No")}
                        value={formObj.ref_no}
                        onChange={(e) => {
                          setFormObj((prev)=>({ ...prev, ref_no: e.target.value }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group2">
                      <label>{t("purchases.Purchase_Date")} :</label>
                      <DatePicker
                        className="form-control p-2"
                        selected={formObj.date}
                        onChange={(date: Date) => setFormObj((prev) => ({ ...prev, date: date }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-3" style={{ display: 'none' }}>
                    <div className="form-group">
                      <label>{t("purchases.Document")} : </label>
                      <input type="file" accept="image/*" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        {t("purchases.Purchase_Status")}: <span className="text-danger">*</span>
                      </label>
                      <Select
                        styles={purchasesColourStyles}
                        options={purchaseStatus}
                        value={purchaseStatus.filter((f: any) => {
                          return f.value == formObj.purchaseStatus;
                        })}
                        onChange={(itm) => {
                          setFormObj((prev)=>({ ...prev, purchaseStatus: itm!.value }));
                        }}
                      />
                      {errorForm.purchaseStatus && (
                        <p className="p-1 h6 text-danger ">{t("purchases.Select_One_Item")}</p>
                      )}
                    </div>
                  </div>
                </div>

                {formObj.purchaseStatus != 'draft' && formObj.purchaseStatus != '' && (
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          {t("purchases.Payment_Status")}: <span className="text-danger">*</span>
                        </label>
                        <Select
                          styles={purchasesColourStyles}
                          options={paymentStatus}
                          value={paymentStatus.filter((f: any) => {
                            return f.value == formObj.paymentStatus;
                          })}
                          onChange={(itm) => {
                            setFormObj((prev)=>({
                              ...prev,
                              paymentStatus: itm!.value,
                              paid_amount:
                                itm!.value == 'paid' || itm!.value == 'credit'
                                  ? formObj.total_price
                                  : 0,
                            }));
                          }}
                        />
                        {errorForm.paymentStatus && (
                          <p className="p-1 h6 text-danger ">{t("purchases.Select_One_Item")}</p>
                        )}
                      </div>
                    </div>
                    {formObj.paymentStatus == 'partially_paid' && (
                      <div className="col-md-3">
                        <div className="form-group2">
                          <label>{t("purchases.Paid_Amount")} :</label>
                          <input
                            type="text"
                            className="form-control p-2"
                            placeholder={t("purchases.Paid_Amount")}
                            value={formObj.paid_amount}
                            onChange={(e) => {
                              setFormObj((prev)=>({ ...prev, paid_amount: +e.target.value }));
                            }}
                          />
                          {errorForm.paid && <p className="p-1 h6 text-danger ">{t("purchases.Enter_A_Amount")}</p>}
                        </div>
                      </div>
                    )}
                    {formObj.paymentStatus != 'due' && (
                      <div className="col-md-3">
                        <div className="form-group2">
                          <label>{t("purchases.Payment_Date")} :</label>
                          <DatePicker
                            className="form-control p-2"
                            selected={formObj.paymentDate}
                            onChange={(date: Date) => setFormObj((prev)=>({ ...prev, paymentDate: date }))}
                          />
                          {errorForm.paymentDate && (
                            <p className="p-1 h6 text-danger ">{t("purchases.Enter_Payment_Date_From_Calander")}</p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="col-md-3">
                      <div className="form-group2">
                        <label>{t("purchases.Payment_Type")} :</label>
                        <Select
                          styles={purchasesColourStyles}
                          options={paymentTypes}
                          value={paymentTypes.filter((f: any) => {
                            return f.value == formObj.paymentType;
                          })}
                          onChange={(itm) => {
                            setFormObj((prev)=>({ ...prev, paymentType: itm!.value }));
                          }}
                        />
                        {errorForm.paymentType && (
                          <p className="p-1 h6 text-danger ">{t("purchases.Select_One_Item")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
          <div className="row">
         
            <div className="col-md-3">
              <div className="form-group">
                <Select
                  options={currencies}
                  isLoading={dataLoading}
                  styles={purchasesSelectStyle}
                  value={currencies?.filter((f: any) => f.value == (formObj.currency_id || locationSettings.currency_id))}
                  onChange={(itm) => {
                    
                    setFormObj((prev) => ({
                      ...prev,
                      currency_code: itm!.currency_code,
                      currency_id: itm!.id,
                    }));
                  }}
                />
                {errorForm.currency_id && <p className="p-1 h6 text-danger ">{t("purchases.Select_a_Currency")}</p>}
              </div>
            </div>
            <div className="col-md-3" style={{ display: 'none' }}>
              <div className="form-group">
                <button
                  type="button"
                  className="btn m-btn btn-primary p-2"
                  onClick={() => {
                    setVatInColumn(!vatInColumn);
                  }}>
                  {vatInColumn ? 'VAT In Table' : 'In Order Only'}
                </button>
              </div>
            </div>
          </div>

          <Card className="mb-4">
            <Card.Header className="p-3 bg-white">
              <Select
                options={products}
                isLoading={dataLoading}
                styles={purchasesColourStyles}
                formatOptionLabel={formatProductsOptions}
                onChange={(e) => addToProductQuotations(e)}
              />
              {errorForm.products && (
                <p className="p-1 h6 text-danger ">{t("purchases.Select_One_Product_at_Least")}</p>
              )}
            </Card.Header>
            <Card.Body>
              <div style={{ height: 300, width: '100%' }}>
                <DataGrid
                  rows={selectProducts}
                  columns={columns.map(el=>({...el,headerName:t(`purchases.${el.headerName}`)}))}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  onCellEditCommit={saveToCell}
                  columnVisibilityModel={{
                    vat: vatInColumn,
                  }}
                />
              </div>
              <Grid container spacing={2} className="mt-3 d-flex justify-content-end">
                <Grid item xs={6} textAlign="left">
                  <table className="m-table-expends">
                    <tbody>
                      <TableExpeseRows
                        rowsData={selectedExpendsEdit}
                        curencise={currencies}
                        selData={selectedExpendsEdit}
                        deleteTableRows={deleteTableRows}
                        handleChange={handleChange}
                      />
                      <TableExpeseRows
                        rowsData={expends}
                        curencise={currencies}
                        selData={selectedExpends}
                        deleteTableRows={deleteTableRows}
                        handleChange={handleChange}
                      />
                      <tr>
                        <td colSpan={3}>
                          <button
                            onClick={() => addTableRows()}
                            className="btn m-btn btn-primary p-2"
                            style={{ borderRadius: '0px' }}>
                            {' '}
                            + {t("purchases.Add_Shipping_Expends")}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Grid>
                <Grid item xs={6}>
                  <div className="purchase-items">
                    <div className="purchase-item">
                      <p className="puchase-arrow" style={{ width: '100px' }}></p>
                      <div className="purchase-text">
                        <p></p>
                        <p>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setIsEditSort(!isEditSort);
                            }}>
                            <EditIcon />
                          </Button>
                        </p>
                      </div>
                    </div>
                    <div className="purchase-item">
                      {isEditSort && <p className="puchase-arrow" style={{ width: '100px' }}></p>}
                      <div className="purchase-text">
                        <p>{t("purchases.items")}</p>
                        <p>
                          {selectProducts.length}{' '}
                          <span style={{ opacity: '0.5' }}> [{total_qty}]</span>{' '}
                        </p>
                      </div>
                    </div>
                    <Divider flexItem></Divider>
                    <div className="purchase-item">
                      {isEditSort && <p className="puchase-arrow" style={{ width: '100px' }}></p>}
                      <div className="purchase-text">
                        <p>{t("purchases.Sub_Total")}</p>
                        <p>
                          {Number(formObj.subTotal_price).toFixed(
                            locationSettings?.location_decimal_places
                          )}{' '}
                          <span style={{ opacity: '0.5' }}> {locationSettings?.currency_code}</span>{' '}
                        </p>
                      </div>
                    </div>
                    <Divider flexItem></Divider>
                    {purchaseDetails.map((pd, i: number) => {
                      
                      return (
                        <Fragment key={`${pd.value}-purchase-details`}>
                          <div className="purchase-item">
                            {isEditSort && (
                              <p className="puchase-arrow" style={{ width: '100px' }}>
                                {isEditSort && i != 0 && (
                                  <Button variant="outlined" onClick={() => sortHandler(i, 'u')}>
                                    <KeyboardArrowUpIcon />
                                  </Button>
                                )}
                                {isEditSort && purchaseDetails.length - 1 != i && (
                                  <Button variant="outlined" onClick={() => sortHandler(i, 'd')}>
                                    <KeyboardArrowDownIcon />
                                  </Button>
                                )}
                              </p>
                            )}
                            <div className="purchase-text">
                              <p>{t(`purchases.${pd.label}`)}</p>
                              {pd.value == 'discount' && (
                                <div className="d-flex">
                                  <div className="px-3">
                                    <Form.Select
                                      style={{ width: '130px' }}
                                      onChange={(e) => {
                                        setFormObj((prev)=> ({ ...prev, discount_type: e.target.value }));
                                      }}>
                                      <option value={'fixed'}>{t("purchases.Fixed")}</option>
                                      <option value={'percent'}>{t("purchases.Percent")} %</option>
                                    </Form.Select>
                                  </div>
                                  <div>
                                    <Form.Control
                                      size="sm"
                                      type="number"
                                      min={0}
                                      value={formObj.discount_amount}
                                      onChange={(e) => {
                                        setFormObj((prev)=>({
                                          ...prev,
                                          discount_amount: +e.target.value,
                                        }));
                                      }}
                                    />
                                  </div>
                                  <p>&nbsp;</p>
                                  <p className="fixed-width">
                                    {formObj.total_discount.toFixed(
                                      locationSettings?.location_decimal_places
                                    )}{' '}
                                  </p>
                                </div>
                              )}
                              {pd.value == 'expense' && (
                                <p>
                                  {formObj.total_expense.toFixed(
                                    locationSettings?.location_decimal_places
                                  )}
                                </p>
                              )}
                              {pd.value == 'taxes' && !vatInColumn && (
                                <div>
                                  <table className="m-table-expends">
                                    <tbody>
                                      <TableTaxRows
                                        rowsData={selectedTaxes}
                                        curencise={currencies}
                                        deleteTableRows={deleteRowTaxes}
                                        handleChange={handlerRowTaxes}
                                      />
                                      <tr>
                                        <td colSpan={3}>
                                          <button
                                            onClick={() => addTableRows('taxes')}
                                            className="btn m-btn btn-primary p-2"
                                            style={{ borderRadius: '0px' }}>
                                            {' '}
                                            + {t("purchases.Add_Taxe")}(s)
                                          </button>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <p className="fixed-width">
                                    {formObj.total_tax}%(
                                    {((formObj.total_tax / 100) * formObj.subTotal_price).toFixed(
                                      locationSettings?.location_decimal_places
                                    )}
                                    )
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <Divider flexItem></Divider>
                        </Fragment>
                      );
                    })}
                    <div className="purchase-item">
                      {isEditSort && <p className="puchase-arrow" style={{ width: '100px' }}></p>}
                      <div className="purchase-text">
                        <p>{t("purchases.Total")}</p>
                        <p>
                          {Number(formObj.total_price).toFixed(
                            locationSettings?.location_decimal_places
                          )}
                          <span style={{ opacity: '0.5', fontSize: '10px' }}>
                            {' '}
                            {locationSettings?.currency_code}
                          </span>
                        </p>
                      </div>
                      <div className="purchase-text">
                        <p>{t("purchases.Total_Paid")}</p>
                        <p>
                          {formObj.paid_amount.toFixed(locationSettings?.location_decimal_places)}
                          <span style={{ opacity: '0.5', fontSize: '10px' }}>
                            {' '}
                            {locationSettings?.currency_code}
                          </span>
                        </p>
                      </div>
                      <div className="purchase-text">
                        <p>{t("purchases.Total_Remaining")}</p>
                        <p>
                          {(formObj.total_price - formObj.paid_amount).toFixed(
                            locationSettings?.location_decimal_places
                          )}
                          <span style={{ opacity: '0.5', fontSize: '10px' }}>
                            {' '}
                            {locationSettings?.currency_code}
                          </span>
                        </p>
                      </div>
                      {errorForm.morePaid && (
                        <p className="p-1 h6 text-danger ">{t("purchases.Error!_,Enter_Right_Amount")}</p>
                      )}
                    </div>
                  </div>
                </Grid>
              </Grid>
              <button
                type="button"
                className="btn m-btn btn-primary p-2"
                onClick={(e) => {
                  e.preventDefault();
                  errors = [];
                  
                  if (
                    formObj.supplier_id === null ||
                    formObj.supplier_id === undefined ||
                    formObj.supplier_id.toString() === ''
                  )
                    errors.push('supplier id');
                  if (selectProducts.length == 0) errors.push('selected products');
                  if (formObj.currency_id == 0 || formObj.currency_id == undefined)
                    errors.push('currency id');
                  if (formObj?.purchaseStatus.length <= 2)
                    errors.push('purchaseStatus less than 2');
                  if (formObj?.purchaseStatus != 'draft') {
                    if (formObj?.paymentStatus.length <= 2)
                      errors.push('paymentStatus less than 2');
                    if ((formObj?.paymentDate + '').length <= 2) errors.push('payment error');
                    if (formObj?.paymentType.length <= 2) errors.push('payment type');
                  }
                  if (formObj.paymentStatus == 'partially_paid' && formObj.paid_amount < 0.5)
                    errors.push(' partially paid');
                  setErrorForm({
                    ...errorForm,

                    currency_id: formObj.currency_id == 0 || formObj.currency_id == undefined,
                    purchaseStatus: formObj.purchaseStatus.length <= 2,
                    paymentDate: (formObj.paymentDate + '').length <= 2,
                    paymentStatus: formObj.paymentStatus.length <= 2,
                    paymentType: formObj.paymentType.length <= 2,
                    products: selectProducts.length == 0,
                    paid: formObj.paymentStatus == 'partially_paid' && formObj.paid_amount < 0.5,
                    morePaid: formObj.paid_amount > formObj.total_price,
                  });

                  if (errors.length == 0) {
                    if (isEdit) editPurchase();
                    else insertPurchase();
                  } else Toastify('error', 'Enter Requires Field');
                }}>
                {isEdit ? t('purchases.Edit') : t('purchases.Save')}
              </button>
            </Card.Body>
          </Card>
        </>
      )}
    </AdminLayout>
  );
};
export default withAuth(AddPurchase);

export async function getServerSideProps({ params, query ,locale}) {
  const { id } = params;
  return {
    props: { id, shopId: query.id,     
            ...(await serverSideTranslations(locale))
    },
  };
}
