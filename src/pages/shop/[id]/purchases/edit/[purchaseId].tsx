import { faArrowAltCircleLeft } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { paymentStatusData, paymentTypeData, purchaseStatusDataAdd } from '@models/data';
import { ICurrency, IPayment, IProduct, IPurchase } from '@models/pos.types';
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
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
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
import { IPurchaseExpndes, IpurchaseProductItem } from 'src/models/common-model';
import {
  purchasesEditColumns,
  purchasesInitFormError,
  purchasesInitFormObj,
  purchasesInitPurchaseDetails,
} from 'src/modules/purchases/_utils';
import { IPurchasePayload } from 'src/modules/purchases/purchases.types';
import { cartJobType } from 'src/recoil/atoms';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

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

const purchasesSelectStyle = {
  control: (style: any) => ({ ...style, color: '#db3333', borderRadius: '10px' }),
};
const purchasesColourStyles = {
  control: (style: any) => ({ ...style, borderRadius: '10px' }),
};

const initialSupplier = [{ supplier_id: 0, id: 0, value: 0, label: 'Loading ... ' }];
const mapToSelectList = (item) => ({ ...item, label: item.name, value: item.id });

const EditPurchase: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  shopId,
  purchaseId,
}) => {
  const router = useRouter();
  const [jobType] = useRecoilState(cartJobType);
  const { locationSettings, setLocationSettings } = useUser();

  const formObjRef = useRef<any>();

  const [formObj, setFormObj] = useState(purchasesInitFormObj);
  const [errorForm, setErrorForm] = useState(purchasesInitFormError);
  const [suppliers, setSuppliers] = useState<ISupplierSelect[]>(initialSupplier);
  const [purchaseDetails, setPurchaseDetails] = useState(purchasesInitPurchaseDetails);

  const [loading, setLoading] = useState(false);
  const [isEditSort, setIsEditSort] = useState(false);
  const [vatInColumn, setVatInColumn] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [isOpenVariationDialog, setIsOpenVariationDialog] = useState(false);

  const [purchaseStatus, setPurchaseStatus] =
    useState<{ value: string; label: string }[]>(purchaseStatusDataAdd);
  const [paymentTypes, setPaymentTypes] =
    useState<{ value: string; label: string }[]>(paymentTypeData);
  const [paymentStatus, setPaymentStatus] =
    useState<{ value: string; label: string }[]>(paymentStatusData);
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<{
    product_id: number;
    product_name: string;
    is_service: number;
  }>({ product_id: 0, product_name: '', is_service: 0 });

  const [allVariations, setAllVariations] = useState([]);
  const [expends, setExpends] = useState<{ label: ''; value: 0 }[]>([]);
  const [selectedTaxes, setSelectedTaxes] = useState<IPurchaseExpndes[]>([]);
  const [selectedExpends, setSelectedExpends] = useState<IPurchaseExpndes[]>([]);
  const [selectProducts, setSelectProducts] = useState<IpurchaseProductItem[]>([]);
  const [products, setProducts] = useState<{ value: number; label: string }[]>([]);
  const [selectedExpendsEdit, setSelectedExpendsEdit] = useState<IPurchaseExpndes[]>([]);

  const [total_qty, setTotal_qty] = useState(0);
  const [totalExpends, setTotalExpends] = useState(0);
  const [expenseCounter, setExpenseCounter] = useState(0);

  const [currencies, setCurrencies] = useState<ICurrencySelect[]>([]);
  const [selecetdId, setSelecetdId] = useState({ product_id: 0, variation_id: 0 });

  formObjRef.current = formObj;

  const onCostClick = (type: string, id: number, vr: number) => {
    const found = selectProducts.findIndex((el) => el.product_id === id && el.variation_id == vr);
    if (found > -1) {
      let _datas: any = selectProducts;
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

  async function editPurchase() {
    console.log(formObjRef.current);
    const form = formObjRef.current;
    const _data: IPurchasePayload = {
      location_id: +shopId,
      supplier_id: form.supplier_id,
      status: form.purchaseStatus,
      payment_status: form.paymentStatus,
      payment_type: form.paymentType,

      discount_type: form.discount_type,
      discount_amount: form.total_discount || form.discount_amount,

      tax_amount: form.total_tax,

      cart: selectProducts.map((product) => ({ ...product, qty: product.quantity })),
      expense: {
        amount: form.total_expense,
      },
      notes: form.notes || '',
    };
    console.log(_data);
    api.put(`purchase/${purchaseId}/payment`, { data: _data });

    // const { success } = await apiUpdateCtr({
    //   type: 'transactions',
    //   subType: 'editPurchase',
    //   shopId,
    //   data: {
    //     totalOrder: formObjRef.current,
    //     lines: selectProducts,
    //     expenses: selectedExpends,
    //     taxes: selectedTaxes,
    //   },
    // });
    // if (!success) {
    //   Toastify('error', 'Has Error ,Check You Inputs Try Again');
    //   return;
    // }
    // Toastify('success', 'Purchase Successfully Edited..');

    // router.push('/shop/' + shopId + '/purchases');
  }
  let errors = [];

  function getPriority(type: string, subTotal: number): number {
    switch (type) {
      case 'discount':
        return subTotal - formObj?.total_discount;
      case 'expense':
        return subTotal + formObj?.total_expense;
      case 'taxes':
        return (formObj?.total_tax / 100) * subTotal + subTotal;
    }
    return 0;
  }
  function finalCalculation(subTotal = 0) {
    subTotal = subTotal > 0 ? subTotal : formObj?.subTotal_price;
    let _total = subTotal;
    if (_total <= 0) return;
    purchaseDetails?.map((dp) => (_total = getPriority(dp.value, _total)));

    setFormObj({
      ...formObj,
      total_price: _total,
      subTotal_price: subTotal,
      paid_amount:
        formObj?.paymentStatus == 'paid' || formObj?.paymentStatus == 'credit'
          ? _total
          : formObj?.paid_amount,
    });
  }

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
    const _product = selectProducts.find((el) => el.id === params.id);

    if (!_product?.id || params.field !== 'quantity') return;

    const newSelected = selectProducts.map((product) => ({
      ...product,
      [params.field]: params.id === product.id ? params.value : product[params.field],
    }));

    // setSelectProducts(newSelected); //! it will be handled in the next function
    calculationLabels(formObj?.total_expense, formObj?.total_tax, newSelected);
  };

  const sortHandler = (i: number, type: string) => {
    let _data = [...purchaseDetails];
    let _temp = _data[i].priority;
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
    return locationSettings?.currency_code == formObj?.currency_code
      ? cost
      : cost * formObj?.currency_rate;
  }
  function calculationLabels(totalEpx: number, totalTax: number, arr?: any[]) {
    let _subtotal = 0;
    let _rows: any = arr?.length ? arr : [...selectProducts];
    _rows.map((rs: any) => (_subtotal += parseFloat(rs.lineTotal)));
    totalTax = (totalTax / 100) * _subtotal;
    _rows.map((sp: IpurchaseProductItem, i: number) => {
      let _ExpVal = ((sp.lineTotal / _subtotal) * totalEpx) / sp.quantity;
      let _TaxVal = ((sp.lineTotal / _subtotal) * totalTax) / sp.quantity;

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
      purchasesEditColumns({
        locationSettings,
        formObj,
        onCostClick,
        setSelecetdId,
        setOpenRemoveDialog,
      }),
    [locationSettings, selectProducts, formObj, formObjRef]
  );

  const handleSubmitEdit = (e) => {
    e.preventDefault();

    //! handle errors
    const errors = [];

    if (selectProducts.length == 0) errors.push('selected products');
    if (formObj?.currency_id == 0 || formObj?.currency_id == undefined) errors.push('currency id');
    if (formObj?.purchaseStatus.length <= 2) errors.push('purchaseStatus less than 2');
    if (formObj?.purchaseStatus != 'draft') {
      if (formObj?.paymentStatus.length <= 2) errors.push('paymentStatus less than 2');
      if ((formObj?.paymentDate + '').length <= 2) errors.push('payment error');
      if (formObj?.paymentType.length <= 2) errors.push('payment type');
    }
    if (formObj?.paymentStatus == 'partially_paid' && formObj?.paid_amount < 0.5)
      errors.push(' partially paid');

    setErrorForm({
      ...errorForm,
      currency_id: formObj?.currency_id == 0 || formObj?.currency_id == undefined,
      purchaseStatus: formObj?.purchaseStatus.length <= 2,
      paymentDate: (formObj?.paymentDate + '').length <= 2,
      paymentStatus: formObj?.paymentStatus.length <= 2,
      paymentType: formObj?.paymentType.length <= 2,
      products: selectProducts.length == 0,
      paid: formObj?.paymentStatus == 'partially_paid' && formObj?.paid_amount < 0.5,
      morePaid: formObj?.paid_amount > formObj?.total_price,
    });

    if (!errors.length) return editPurchase();

    Toastify('error', 'Enter Required Field');
  };

  async function getPageData(shopId: string) {
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

      const _purchaseDetails: IPurchase = await api
        .get(`/purchase/${purchaseId}/show`)
        .then(({ data }) => data.result);

      setSuppliers([{ supplier_id: 0, id: 0, value: 0, label: 'walk-in supplier' }, ..._suppliers]);
      setProducts(_products);
      setCurrencies(_currencies);

      const currentCurrency: ICurrencySelect = _currencies.find(
        (currency) => currency?.id === _purchaseDetails?.currency_id
      );

      console.log(
        (_purchaseDetails?.payment[0] as IPayment).created_at,
        new Date(_purchaseDetails?.created_at)
      );
      setFormObj((prev) => ({
        ...prev,
        ..._purchaseDetails,
        ...currentCurrency,

        payment_id: (_purchaseDetails?.payment[0] as IPayment)?.id,
        supplier_id: _purchaseDetails?.supplier?.id || 0,

        total_tax: +(_purchaseDetails?.total_taxes || 0),
        total_price: +(_purchaseDetails?.total_price || 0),
        subTotal_price: +(_purchaseDetails?.total_price || 0),

        currency_rate: +(currentCurrency?.exchange_rate || 1),
        paid_amount: +((_purchaseDetails?.payment[0] as IPayment).amount || 0),
        total_discount: +(_purchaseDetails?.discount_amount || 0),
        discount_amount: +(_purchaseDetails?.discount_amount || 0),

        currency_symbol: currentCurrency?.symbol,
        currency_code: currentCurrency?.code,

        date: new Date(_purchaseDetails?.created_at),

        total_expense: 0,

        purchaseStatus: _purchaseDetails?.status,
        paymentStatus: _purchaseDetails?.payment_status,
        paymentType: (_purchaseDetails?.payment[0] as IPayment).payment_type,

        // paymentDate: _purchaseDetails?.created_at as any,
      }));

      const _selectedProducts = [];
      _purchaseDetails?.stocks.forEach((stock) => {
        const _product = _products.find((product: IProduct) => +product.id === +stock.product_id);
        if (_product) {
          _selectedProducts.push({ ..._product, quantity: +stock.qty_received });
        }
      });
      console.log(_selectedProducts);
      setSelectProducts([..._selectedProducts]);
    } catch {
      Toastify('error', 'Somethig went wrong, please refresh and try again!');
      setSuppliers([]);
      setProducts([]);
      setCurrencies([]);
    } finally {
      setDataLoading(false);
    }
  }

  /*****************************************/
  //! very bad performance !!!!!!!!!!!!!!!!!!!!
  useEffect(() => {
    console.log('____HI________');
    const total_qty = selectProducts.reduce((prev, current) => prev + +current.quantity, 0);
    const subTotal_price = selectProducts.reduce(
      (prev, current) => prev + +current.quantity * (+(current as any).cost_price || +current.cost),
      0
    );
    console.log(total_qty);
    setTotal_qty(total_qty);
    setFormObj({ ...formObj, subTotal_price });
    finalCalculation(subTotal_price);
  }, [selectProducts]);

  useEffect(() => {
    let _disAmount = 0,
      _total = 0;
    _disAmount = formObj?.discount_amount;

    // formObj?.discount_type == 'fixed' ?  : ((formObj?.discount_amount / 100) * formObj?.subTotal_price).toFixed(3)

    if (formObj?.discount_type == 'percent') {
      _disAmount = _disAmount > 100 ? 100 : _disAmount;
      _total = (_disAmount / 100) * formObj?.subTotal_price;
    } else {
      _disAmount = _disAmount > formObj?.subTotal_price ? formObj?.subTotal_price : _disAmount;
      _total = _disAmount;
    }
    setFormObj({ ...formObj, total_discount: _total, discount_amount: _disAmount });
  }, [formObj?.discount_type, formObj?.discount_amount]);

  //expenses
  useEffect(() => {
    let _sum = 0;

    selectedExpends.map((ep) => (_sum += Number(ep.enterd_value * ep.currency_rate)));
    selectedExpendsEdit.map((ep) => (_sum += Number(ep.enterd_value * ep.currency_rate)));
    setTotalExpends(_sum);

    setFormObj({
      ...formObj,
      total_expense: +_sum.toFixed(locationSettings?.location_decimal_places),
    });
    calculationLabels(_sum, formObj?.total_tax);
  }, [selectedExpends, selectedExpendsEdit]);

  useEffect(() => {
    finalCalculation();
  }, [purchaseDetails]);
  useEffect(() => {
    finalCalculation();
  }, [formObj?.total_discount]);
  useEffect(() => {
    finalCalculation();
  }, [formObj?.total_expense]);
  useEffect(() => {
    finalCalculation();
  }, [formObj?.total_tax]);

  useEffect(() => {
    setFormObj({
      ...formObj,
      currency_id: locationSettings?.currency_id,
      currency_code: locationSettings?.currency_code,
    });
  }, [locationSettings]);
  useEffect(() => {
    calculationLabels(formObj?.total_expense, formObj?.total_tax);
  }, [formObj?.currency_rate]);

  useEffect(() => {
    let _tx = 0;
    selectedTaxes.map((ep: any) => (_tx += Number(ep.converted_value)));
    setFormObj({ ...formObj, total_tax: +_tx.toFixed(locationSettings?.location_decimal_places) });
    calculationLabels(formObj?.total_expense, _tx);
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

  /*----*/
  useEffect(() => {
    if (!shopId) return;

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);
  }, [shopId, router.query.slug]);

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
        <DialogTitle id="alert-dialog-title">Remove Product</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you Sure You Want Remove This Item ?
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
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <div className="mb-4">
        <button
          className="btn m-btn btn-primary p-3"
          onClick={() => router.push('/shop/' + shopId + '/purchases')}>
          <FontAwesomeIcon icon={faArrowAltCircleLeft} /> Back To List{' '}
        </button>
      </div>
      {loading ? (
        <Card className="mb-4">
          <Card.Header className="p-3 bg-white">
            <h5>Loading</h5>
          </Card.Header>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Header className="p-3 bg-white">
              <h5>Edit Purchase </h5>
            </Card.Header>
            <Card.Body>
              <div className="form-style2">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group2">
                      <label>
                        Supplier : <span className="text-danger">*</span>
                      </label>
                      <Select
                        isLoading={dataLoading}
                        styles={purchasesSelectStyle}
                        options={suppliers}
                        value={suppliers.filter((sp) => +sp.value == formObj?.supplier_id)}
                        onChange={(itm) => {
                          setFormObj({ ...formObj, supplier_id: itm.value });
                        }}
                      />
                      {errorForm.supplier_id && (
                        <p className="p-1 h6 text-danger ">Select a Supplier</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group2">
                      <label>Reference No :</label>
                      <input
                        type="text"
                        className="form-control p-2"
                        placeholder="Reference No"
                        value={formObj?.ref_no}
                        onChange={(e) => {
                          setFormObj({ ...formObj, ref_no: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group2">
                      <label>Purchase Date :</label>
                      <DatePicker
                        className="form-control p-2"
                        selected={formObj?.date}
                        onChange={(date: Date) => setFormObj({ ...formObj, date: date })}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-3" style={{ display: 'none' }}>
                    <div className="form-group">
                      <label>Document : </label>
                      <input type="file" accept="image/*" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Purchase Status: <span className="text-danger">*</span>
                      </label>
                      <Select
                        styles={purchasesColourStyles}
                        options={purchaseStatus}
                        value={purchaseStatus.filter((f: any) => {
                          return f.value == formObj?.purchaseStatus;
                        })}
                        onChange={(itm) => {
                          setFormObj({ ...formObj, purchaseStatus: itm!.value });
                        }}
                      />
                      {errorForm.purchaseStatus && (
                        <p className="p-1 h6 text-danger ">Select One Item</p>
                      )}
                    </div>
                  </div>
                </div>

                {formObj?.purchaseStatus != 'draft' && formObj?.purchaseStatus != '' && (
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Payment Status: <span className="text-danger">*</span>
                        </label>
                        <Select
                          styles={purchasesColourStyles}
                          options={paymentStatus}
                          value={paymentStatus.filter((f: any) => {
                            return f.value == formObj?.paymentStatus;
                          })}
                          onChange={(itm) => {
                            setFormObj({
                              ...formObj,
                              paymentStatus: itm!.value,
                              paid_amount:
                                itm!.value == 'paid' || itm!.value == 'credit'
                                  ? formObj?.total_price
                                  : 0,
                            });
                          }}
                        />
                        {errorForm.paymentStatus && (
                          <p className="p-1 h6 text-danger ">Select One Item</p>
                        )}
                      </div>
                    </div>
                    {formObj?.paymentStatus == 'partially_paid' && (
                      <div className="col-md-3">
                        <div className="form-group2">
                          <label>Paid Amount :</label>
                          <input
                            type="text"
                            className="form-control p-2"
                            placeholder="Paid Amount"
                            value={formObj?.paid_amount}
                            onChange={(e) => {
                              setFormObj({ ...formObj, paid_amount: +e.target.value });
                            }}
                          />
                          {errorForm.paid && <p className="p-1 h6 text-danger ">Enter A Amount</p>}
                        </div>
                      </div>
                    )}
                    {formObj?.paymentStatus != 'due' && (
                      <div className="col-md-3">
                        <div className="form-group2">
                          <label>Payment Date :</label>
                          <DatePicker
                            className="form-control p-2"
                            selected={formObj?.paymentDate}
                            onChange={(date: Date) => setFormObj({ ...formObj, paymentDate: date })}
                          />
                          {errorForm.paymentDate && (
                            <p className="p-1 h6 text-danger ">Enter Payment Date From Calander</p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="col-md-3">
                      <div className="form-group2">
                        <label>Payment Type :</label>
                        <Select
                          styles={purchasesColourStyles}
                          options={paymentTypes}
                          value={paymentTypes.filter((f: any) => {
                            return f.value == formObj?.paymentType;
                          })}
                          onChange={(itm) => {
                            setFormObj({ ...formObj, paymentType: itm!.value });
                          }}
                        />
                        {errorForm.paymentType && (
                          <p className="p-1 h6 text-danger ">Select One Item</p>
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
                  isLoading={dataLoading}
                  styles={purchasesSelectStyle}
                  options={currencies}
                  value={currencies?.filter((f: any) => {
                    return f.value == formObj?.currency_id;
                  })}
                  onChange={(itm) => {
                    setFormObj({
                      ...formObj,
                      // currency_code: itm!.,
                      // currency_rate: itm!.exchange_rate,
                      // currency_id: itm!.id,
                    });
                  }}
                />
                {errorForm.currency_id && <p className="p-1 h6 text-danger ">Select a Currency</p>}
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
                <p className="p-1 h6 text-danger ">Select One Product at Least</p>
              )}
            </Card.Header>
            <Card.Body>
              <div style={{ height: 300, width: '100%' }}>
                <DataGrid
                  loading={dataLoading}
                  rows={selectProducts}
                  columns={columns}
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
                            + Add Shipping Expends
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
                        <p>items</p>
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
                        <p>Sub Total</p>
                        <p>
                          {Number(formObj?.subTotal_price).toFixed(
                            locationSettings?.location_decimal_places
                          )}{' '}
                          <span style={{ opacity: '0.5' }}> {locationSettings?.currency_code}</span>{' '}
                        </p>
                      </div>
                    </div>
                    <Divider flexItem></Divider>
                    {purchaseDetails?.map((pd, i: number) => {
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
                                {isEditSort && purchaseDetails?.length - 1 != i && (
                                  <Button variant="outlined" onClick={() => sortHandler(i, 'd')}>
                                    <KeyboardArrowDownIcon />
                                  </Button>
                                )}
                              </p>
                            )}
                            <div className="purchase-text">
                              <p>{pd.label}</p>
                              {pd.value == 'discount' && (
                                <div className="d-flex">
                                  <div className="px-3">
                                    <Form.Select
                                      style={{ width: '130px' }}
                                      onChange={(e) => {
                                        setFormObj({ ...formObj, discount_type: e.target.value });
                                      }}>
                                      <option value={'fixed'}>Fixed</option>
                                      <option value={'percent'}>Percent %</option>
                                    </Form.Select>
                                  </div>
                                  <div>
                                    <Form.Control
                                      size="sm"
                                      type="number"
                                      min={0}
                                      value={formObj?.discount_amount}
                                      onChange={(e) => {
                                        setFormObj({
                                          ...formObj,
                                          discount_amount: +e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <p>&nbsp;</p>
                                  <p className="fixed-width">
                                    {formObj?.total_discount.toFixed(
                                      locationSettings?.location_decimal_places
                                    )}{' '}
                                  </p>
                                </div>
                              )}
                              {pd.value == 'expense' && (
                                <p>
                                  {formObj?.total_expense.toFixed(
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
                                            + Add Taxe(s)
                                          </button>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <p className="fixed-width">
                                    {formObj?.total_tax}%(
                                    {((formObj?.total_tax / 100) * formObj?.subTotal_price).toFixed(
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
                        <p>Total</p>
                        <p>
                          {Number(formObj?.total_price).toFixed(
                            locationSettings?.location_decimal_places
                          )}
                          <span style={{ opacity: '0.5', fontSize: '10px' }}>
                            {' '}
                            {locationSettings?.currency_code}
                          </span>
                        </p>
                      </div>
                      <div className="purchase-text">
                        <p>Total Paid</p>
                        <p>
                          {formObj?.paid_amount.toFixed(locationSettings?.location_decimal_places)}
                          <span style={{ opacity: '0.5', fontSize: '10px' }}>
                            {' '}
                            {locationSettings?.currency_code}
                          </span>
                        </p>
                      </div>
                      <div className="purchase-text">
                        <p>Total Remaining</p>
                        <p>
                          {(formObj?.total_price - formObj?.paid_amount).toFixed(
                            locationSettings?.location_decimal_places
                          )}
                          <span style={{ opacity: '0.5', fontSize: '10px' }}>
                            {' '}
                            {locationSettings?.currency_code}
                          </span>
                        </p>
                      </div>
                      {errorForm.morePaid && (
                        <p className="p-1 h6 text-danger ">Error! ,Enter Right Amount</p>
                      )}
                    </div>
                  </div>
                </Grid>
              </Grid>
              <button
                type="button"
                className="btn m-btn btn-primary p-2"
                onClick={handleSubmitEdit}>
                Edit
              </button>
            </Card.Body>
          </Card>
        </>
      )}
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.purchaseId) {
    return {
      notFound: true,
      redirect: '/page403',
    };
  }

  return {
    props: { shopId: query.id, purchaseId: query.purchaseId },
  };
};

export default withAuth(EditPurchase);
