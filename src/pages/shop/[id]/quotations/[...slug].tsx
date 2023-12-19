import type { NextPage } from 'next';
import Select from 'react-select';
import { useRouter } from 'next/router';
import { AdminLayout } from '@layout';
import { Card } from 'react-bootstrap';
import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import Form from 'react-bootstrap/Form';
import 'react-datepicker/dist/react-datepicker.css';
import { ILocationSettings, IPurchaseExpndes, IpurchaseProductItem } from 'src/models/common-model';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
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
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import {
  purchaseStatusDataAdd,
  paymentStatusData,
  paymentTypeData,
  quotationStatusDataAdd,
} from '../../../../models/data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-regular-svg-icons';
import VariationModal from 'src/components/pos/modals/VariationModal';
import { cartJobType } from 'src/recoil/atoms';
import { useRecoilState } from 'recoil';
import { ToastContainer } from 'react-toastify';
import { Toastify } from 'src/libs/allToasts';
import { createNewData, findAllData, updateData } from 'src/services/crud.api';
import { useTaxesList } from 'src/services/pos.service';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
const AddQuotations: NextPage = (props: any) => {
  const { id, slug } = props;
  const { t } = useTranslation();
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

  const [formObj, setFormObj] = useState<any>({
    id: 0,
    customer_id: 0,
    location_id: 0,
    currency_id: 0,
    currency_symbol: '',
    currency_code: '',
    currency_rate: 0,
    total_price: 0,
    ref_no: '',
    date: new Date(),
    taxs: 0,
    subTotal_price: 0,
    total_tax: 0,
    total_expense: 0,
    discount_type: 'fixed',
    discount_amount: 0,
    status: '',
    paymentStatus: '',
    paid_amount: 0,
    total_discount: 0,
    paymentType: '',
    paymentDate: new Date(),
    payment_id: 0,
  });

  const [errorForm, setErrorForm] = useState({
    morePaid: false,
    paid: false,
    products: false,
    customer_id: false,
    taxInclu: false,
    paymentStatus: false,
    paymentType: false,
    paymentDate: false,
    status: false,
  });
  const selectStyle = {
    control: (style: any) => ({ ...style, color: '#db3333', borderRadius: '10px' }),
  };
  const [suppliers, setSuppliers] = useState<{ value: number; label: string }[]>([]);
  const [purchaseDetails, setPurchaseDetails] = useState<
    { label: string; value: string; priority: number }[]
  >([
    { label: 'Discount :', value: 'discount', priority: 1 },
    { label: 'Taxes :', value: 'taxes', priority: 3 },
  ]);
  const [currencies, setCurrencies] = useState<
    { value: number; label: string; symbol: string; exchange_rate: number; code: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isEditSort, setIsEditSort] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [vatInColumn, setVatInColumn] = useState(false);
  const [isOpenVariationDialog, setIsOpenVariationDialog] = useState(false);
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<{
    product_id: number;
    product_name: string;
    is_service: number;
  }>({ product_id: 0, product_name: '', is_service: 0 });
  const [quotationStatus, setQuotationStatus] = useState<{ value: string; label: string }[]>();
  const [purchaseStatus, setPurchaseStatus] =
    useState<{ value: string; label: string }[]>(quotationStatusDataAdd);
  const [paymentTypes, setPaymentTypes] =
    useState<{ value: number; label: string }[]>(paymentTypeData);
  // const [paymentStatus, setPaymentStatus] =
  //   useState<{ value: string; label: string }[]>(paymentStatusData);
  const [products, setProducts] = useState<{ value: number; label: string }[]>([]);
  const [selectProducts, setSelectProducts] = useState<IpurchaseProductItem[]>([]);
  const [allVariations, setAllVariations] = useState([]);
  const [total_qty, setTotal_qty] = useState(0);
  const [expends, setExpenses] = useState<{ label: ''; value: 0 }[]>([]);
  const [selectedExpends, setSelectedExpends] = useState<IPurchaseExpndes[]>([]);
  const [selectedExpendsEdit, setSelectedExpendsEdit] = useState<IPurchaseExpndes[]>([]);
  const [selectedTaxes, setSelectedTaxes] = useState<IPurchaseExpndes[]>([]);
  const [expenseCounter, setExpenseCounter] = useState(0);
  const [totalExpends, setTotalExpends] = useState(0);
  const [selecetdId, setSelecetdId] = useState({ product_id: 0, variation_id: 0 });
  const [jobType] = useRecoilState(cartJobType);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const router = useRouter();
  const shopId = router.query.id as string;
  const [tax, setTax] = useState<{ tax: number; type: string }>({ tax: 0, type: '' });
  const { taxesList } = useTaxesList(shopId);
  console.log(tax);

  useEffect(() => {
    if (taxesList?.taxes?.length > 0) {
      // setTaxList(taxesList?.taxes);
      const _tax: any = taxesList?.taxes?.filter((tax: any) => tax?.is_primary);
      const _taxGroup: any = taxesList?.taxes?.filter(
        (tax: any) => tax?.is_tax_group && tax?.is_primary
      );
      let finalTax;
      if (_taxGroup.length > 0) {
        finalTax = _taxGroup[0].tax_group.reduce((total, tax) => total + (tax.amount || 0), 0);
      } else {
        finalTax = _tax[0]?.amount ?? 0;
      }
      console.log(finalTax);
      setTax({ tax: finalTax, type: 'percentage' });
    }
  }, [taxesList]);
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

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('quotation.product_name'), minWidth: 200 },
    {
      field: 'cost',
      headerName: t('quotation.cost'),
      colSpan: 1,
      minWidth: 350,
      editable: true,
      type: 'number',
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <div>{row.cost}</div>
          {locationSettings?.currency_id != formObj.currency_id && (
            <div className="purchase-converted-cost">
              {(formObj.currency_rate * row.cost).toFixed(
                locationSettings?.location_decimal_places
              )}{' '}
              <span style={{ opacity: '0.5', fontSize: '10px' }}>
                {' '}
                {locationSettings?.currency_code}
              </span>
            </div>
          )}
          {row.cost < row.notifyExpensePrice && (
            <div
              className={row.costType == 1 ? 'purchase-label active-label' : 'purchase-label'}
              id="use-expends"
              onClick={() => onCostClick('useExpnds', row.product_id, row.variation_id)}>
              <span>EXP</span> {row.notifyExpensePrice}
            </div>
          )}
          {row.cost < row.notifyTaxPrice && (
            <div
              className={row.costType == 2 ? 'purchase-label active-label' : 'purchase-label'}
              id="use-tax"
              onClick={() => onCostClick('useTax', row.product_id, row.variation_id)}>
              <span> TX</span> {row.notifyTaxPrice}
            </div>
          )}
          {row.notifyExpensePrice > 0 && row.notifyTaxPrice > 0 && (
            <div
              className={row.costType == 3 ? 'purchase-label active-label' : 'purchase-label'}
              id="use-tax"
              onClick={() => onCostClick('useTotal', row.product_id, row.variation_id)}>
              <span> Total</span> {row.notifyTotalPrice}
            </div>
          )}
        </>
      ),
    },
    {
      field: 'price',
      headerName: t('quotation.price'),
      minWidth: 150,
      editable: true,
      type: 'number',
    },
    {
      field: 'quantity',
      headerName: t('quotation_sale_model.qty'),
      minWidth: 150,
      editable: true,
      type: 'number',
    },
    { field: 'vat', headerName: 'VAT %', minWidth: 150, editable: true, type: 'number' },
    {
      field: 'lineTotal',
      headerName: t('quotation.line_total'),
      minWidth: 100,
      type: 'number',
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <div>
            {locationSettings?.currency_id == formObj.currency_id
              ? Number(row.price * row.quantity).toFixed(locationSettings?.location_decimal_places)
              : (formObj.currency_rate * row.price).toFixed(
                  locationSettings?.location_decimal_places
                )}
          </div>
        </>
      ),
    },
    {
      field: 'action',
      headerName: t('quotation.action'),
      minWidth: 100,
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <Button
            variant="outlined"
            onClick={() => {
              setSelecetdId({ product_id: row.product_id, variation_id: row.variation_id });
              setOpenRemoveDialog(true);
            }}>
            <DeleteIcon />
          </Button>
        </>
      ),
    },
  ];

  const colourStyles = { control: (style: any) => ({ ...style, borderRadius: '10px' }) };
  var formObjRef = useRef<any>();
  formObjRef.current = formObj;

  const formatProductsOptions = (products: any) => (
    <div>
      <div>({Number(products.sell_price).toFixed(3)})</div>
      <div style={{ opacity: '0.8' }}>
        <span>{products.name}</span>
      </div>
    </div>
  );

  async function initDataPage(id = '0') {
    if (id != '0') setIsEdit(true);
    if (router.isReady) {
      const res = await findAllData(`products/${router.query.id}?all_data=1`);
      const resPurchases = await findAllData(`purchase/${router.query.id}`);
      const resExpenses = await findAllData(`expenses/${router.query.id}`);
      const resCustomers = await findAllData(`customers/${router.query.id}`);
      const resCurrencies = await findAllData(`currencies`);
      if (res.data.success) {
        setProducts(
          res.data.result.map((prod) => {
            return { ...prod, label: prod.name, value: prod.id };
          })
        );
        setSuppliers(
          resCustomers.data.result.map((customer) => {
            return {
              ...customer,
              label: customer.first_name + ' ' + customer.last_name,
              value: customer.id,
            };
          })
        );
        setCurrencies(
          resCurrencies.data.result.map((curr) => {
            return { ...curr, label: curr.currency, value: curr.id };
          })
        );
        setExpenses(resExpenses.data.result);
        setAllVariations(res.data.result.allVariations);
        if (res.data.result.length > 0) {
          if (res.data.result?.selected_lines?.length > 0) {
            var _rows: any = [],
              cop = 0;
            res.data.result.selected_lines.map((sp: any) => {
              cop++;
              _rows.push({
                id:
                  +Number(sp.product_id) +
                  Math.floor(Math.random() * 7990) +
                  cop +
                  Math.floor(Math.random() * 1200),
                product_id: sp.product_id,
                variation_id: sp.variation_id,
                name: sp.name,
                quantity: Number(sp.quantity).toFixed(locationSettings?.location_decimal_places),
                price: Number(sp.price).toFixed(locationSettings?.location_decimal_places),
                cost: Number(sp.cost).toFixed(locationSettings?.location_decimal_places),
                lineTotal: (parseFloat(sp.cost) * parseFloat(sp.quantity)).toFixed(
                  locationSettings?.location_decimal_places
                ),
                taxAmount: 0,
                costType: sp.cost_type,
                trans_id: sp.trans_id,
              });
            });
            setSelectProducts([..._rows]);
          }
        }
        setLoading(false);
      } else {
        Toastify('error', 'error in loading..');
        return;
      }
    }
  }

  useEffect(() => {
    const currentQuot = localStorage.getItem('currentQuotation')
      ? JSON.parse(localStorage.getItem('currentQuotation') || '[]')
      : null;
    if (currentQuot && slug[0] === 'edit') {
      setFormObj({ ...formObj, ...currentQuot });
      setSelectProducts([
        ...currentQuot?.quotation_list_lines.map((li) => {
          return {
            ...li.quotation_line_product,
            price: li?.quotation_line_product?.sell_price,
            cost: li.quotation_line_product.cost_price,
            quantity: 1,
          };
        }),
      ]);
    }
  }, [suppliers]);

  async function insertPurchase() {
    const quotationData = {
      location_id: +router.query.id,
      status: formObj.status,
      customer_id: formObj.customer_id,
      discount_type: formObj.discount_type,
      discount_amount: formObj.discount_amount,
      notes: '',
      cart: selectProducts.map((prod) => {
        if (prod.variation_id !== 0) {
          return {
            product_id: prod.product_id,
            variation_id: prod.id,
            qty: prod.quantity,
            note: '',
          };
        }
        return { product_id: prod.id, qty: prod.quantity, note: '' };
      }),
      tax_type: tax.type,
      tax_amount: tax.tax,
      payment: [
        {
          payment_id: formObj.paymentType,
          amount: formObj.paid_amount,
          note: '',
        },
      ],
    };
    const res = await createNewData('quotations-list', quotationData);
    if (!res.data.success) {
      alert('Has Error ,try Again');
      return;
    }
    Toastify('success', 'Quotation Successfully Created..');
    router.push('/shop/' + router.query.id + '/quotations');
  }
  async function editPurchase() {
    const quotationData = {
      customer_id: formObj.customer_id,
      status: formObj.status,
      paymentStatus: formObj.paymentStatus,
      paymentDate: formObj.paymentDate,
      paymentType: formObj.paymentType,
      location_id: router.query.id,
      quotationsLines: selectProducts.map((prod, i) => {
        return {
          id: formObj?.quotation_list_lines[0]?.id,
          product_id: prod.id,
          qty: prod.quantity,
        };
      }),
    };
    const res = await updateData('quotations-list', formObj.id, quotationData);
    if (!res.data.success) {
      alert('Has Error ,try Again');
      return;
    }
    Toastify('success', 'Quotation Successfully Updated..');
    router.push('/shop/' + router.query.id + '/quotations');
  }
  var errors = [];
  useEffect(() => {
    var _locs = JSON.parse(localStorage.getItem('locations'));
    setLocationSettings(
      _locs[
        _locs.findIndex((loc: any) => {
          return loc.location_id == id;
        })
      ]
    );

    initDataPage(slug[0] === 'edit' ? '1' : '0');
  }, [router.asPath]);

  function getPriority(type: string, subTotal: number): number {
    switch (type) {
      case 'discount':
        return subTotal - formObj.total_discount;
      case 'expense':
        return subTotal + formObj.total_expense;
      case 'taxes':
        return (tax.tax / 100) * subTotal + subTotal;
    }
    return 0;
  }
  function finalCalculation(subTotal = 0) {
    subTotal = subTotal > 0 ? subTotal : formObj.subTotal_price;
    let _total = subTotal;
    if (_total <= 0) return;
    purchaseDetails.map((dp) => (_total = getPriority(dp.value, _total)));

    setFormObj({
      ...formObj,
      total_price: _total,
      subTotal_price: subTotal,
      paid_amount:
        formObj.paymentStatus == 'paid' || formObj.paymentStatus == 'credit'
          ? _total
          : formObj.paid_amount,
    });
  }
  useEffect(() => {
    var _prices = 0,
      _qty = 0;
    selectProducts.map((p: IpurchaseProductItem) => {
      _qty += Number(p.quantity);
      _prices += Number(p.lineTotal);
    });

    setTotal_qty(_qty);
    setFormObj({ ...formObj, subTotal_price: _prices });
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
    setFormObj({ ...formObj, total_discount: _total, discount_amount: _disAmount });
  }, [formObj.discount_type, formObj.discount_amount]);

  //expenses
  useEffect(() => {
    var _sum = 0;
    selectedExpends.map((ep) => (_sum += Number(ep.enterd_value * ep.currency_rate)));
    selectedExpendsEdit.map((ep) => (_sum += Number(ep.enterd_value * ep.currency_rate)));
    setTotalExpends(_sum);

    setFormObj({
      ...formObj,
      total_expense: +_sum.toFixed(locationSettings?.location_decimal_places),
    });
    calculationLabels(_sum, tax.tax);
  }, [selectedExpends, selectedExpendsEdit]);

  useEffect(() => {
    finalCalculation();
  }, [purchaseDetails, tax, formObj.total_expense, formObj.total_discount]);
  useEffect(() => {
    setFormObj({
      ...formObj,
      currency_id: locationSettings?.currency_id,
      currency_code: locationSettings?.currency_code,
    });
  }, [locationSettings]);
  useEffect(() => {
    calculationLabels(formObj.total_expense, tax.tax);
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
  useEffect(() => {
    var _tx = 0;
    selectedTaxes.map((ep: any) => (_tx += Number(ep.converted_value)));
    setFormObj({ ...formObj, total_tax: +_tx.toFixed(locationSettings?.location_decimal_places) });
    calculationLabels(formObj.total_expense, _tx);
  }, [selectedTaxes]);
  useEffect(() => {
    if (jobType.req == 4) {
      allVariations.map((varItm: any, index: number) => {
        if (varItm.id == jobType.val) {
          const found = selectProducts.some((el) => el.variation_id == varItm.variation_id);
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
  console.log(selectProducts);

  //product add / update
  const addToProductQuotations = (e: any) => {
    if (e.type == 'variable') {
      setSelectedProductForVariation({
        ...e,
        product_id: e.product_id,
        is_service: 0,
        product_name: e.name,
      });
      setAllVariations(e.variations);
      setIsOpenVariationDialog(true);
      return;
    }
    const found = selectProducts.some((el) => el.id === e.id);
    if (!found) {
      setSelectProducts([
        ...selectProducts,
        {
          id: e.id,
          product_id: e.product_id,
          variation_id: 0,
          name: e.name,
          quantity: 1,
          price: e.sell_price,
          cost: e.cost_price,
          lineTotal: e.sell_price,
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
      _datas[found][params.field] = params.value;
      if (params.field == 'cost' || params.field == 'quantity')
        _datas[found].lineTotal =
          locationSettings?.currency_id == formObj.currency_id
            ? Number(_datas[found].price * _datas[found].quantity).toFixed(
                locationSettings?.location_decimal_places
              )
            : Number(_datas[found].price * formObj.currency_rate * _datas[found].quantity).toFixed(
                locationSettings?.location_decimal_places
              );

      setSelectProducts([..._datas]);
      calculationLabels(formObj.total_expense, tax.tax);
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

  return (
    <>
      <AdminLayout shopId={id}>
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
          <DialogTitle id="alert-dialog-title">{t('alert_dialog.remove_product')}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {t('alert_dialog.delete_msg')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRemoveDialog(false)}>{t('alert_dialog.cancle')}</Button>
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
              {t('alert_dialog.yes')}
            </Button>
          </DialogActions>
        </Dialog>
        <div className="mb-4">
          <button
            className="btn m-btn btn-primary p-3"
            onClick={() => router.push('/shop/' + id + '/quotations')}>
            <FontAwesomeIcon icon={faArrowAltCircleLeft} /> {t('quotation.back_to_list')}{' '}
          </button>
        </div>
        {loading ? (
          <Card className="mb-4">
            <Card.Header className="p-3 bg-white">
              <h5>{t('quotation.loading')}</h5>
            </Card.Header>
          </Card>
        ) : (
          <>
            <Card className="mb-4">
              <Card.Header className="p-3 bg-white">
                <h5>{isEdit ? 'Edit Quotation ' : 'Add Quotation'}</h5>
              </Card.Header>
              <Card.Body>
                <div className="form-style2">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group2">
                        <label>
                          {t('quotation.customer_name')} : <span className="text-danger">*</span>
                        </label>
                        <Select
                          styles={selectStyle}
                          options={suppliers}
                          value={
                            formObj
                              ? suppliers.filter((sp) => sp.value == formObj.customer_id)
                              : null
                          }
                          onChange={(itm) => {
                            setFormObj({ ...formObj, customer_id: itm!.value });
                          }}
                        />
                        {errorForm.customer_id && (
                          <p className="p-1 h6 text-danger ">{t('quotation.select_customer')}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group2">
                        <label>{t('quotation.reference_no')} :</label>
                        <input
                          type="text"
                          className="form-control p-2"
                          placeholder={t('quotation.reference_no')}
                          value={formObj.ref_no}
                          onChange={(e) => {
                            setFormObj({ ...formObj, ref_no: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group2">
                        <label>{t('quotation.quotation_date')} :</label>
                        <DatePicker
                          className="form-control p-2"
                          selected={formObj.date}
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
                          {t('quotation.quotation_status')}: <span className="text-danger">*</span>
                        </label>
                        <Select
                          styles={colourStyles}
                          options={purchaseStatus}
                          value={purchaseStatus.filter((f: any) => {
                            return f.value == formObj.status;
                          })}
                          onChange={(itm) => {
                            setFormObj({ ...formObj, status: itm!.value });
                          }}
                        />
                        {errorForm.status && (
                          <p className="p-1 h6 text-danger ">{t('quotation.select_one_item')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
            <div className="row">
              <div className="col-md-3">
                <div className="form-group">
                  <Select
                    styles={selectStyle}
                    options={currencies}
                    value={currencies.filter((f: any) => {
                      return f.value == (formObj.currency_id || locationSettings.currency_id);
                    })}
                    onChange={(itm) => {
                      setFormObj({
                        ...formObj,
                        currency_code: itm!.code,
                        currency_rate: itm!.exchange_rate,
                        currency_id: itm!.value,
                      });
                    }}
                  />
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
                  formatOptionLabel={formatProductsOptions}
                  styles={colourStyles}
                  options={products}
                  onChange={(e) => addToProductQuotations(e)}
                />
                {errorForm.products && (
                  <p className="p-1 h6 text-danger ">{t('quotation.select_product')}</p>
                )}
              </Card.Header>
              <Card.Body>
                <div style={{ height: 300, width: '100%' }}>
                  <DataGrid
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
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group2">
                      <label>{t('quotation.paid_amount')} :</label>
                      <input
                        type="number"
                        className="form-control p-2"
                        placeholder="Paid Amount"
                        value={formObj.paid_amount}
                        onChange={(e) => {
                          setFormObj({ ...formObj, paid_amount: +e.target.value });
                        }}
                      />
                      {errorForm.paid && <p className="p-1 h6 text-danger ">Enter A Amount</p>}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group2">
                      <label>{t('quotation.payment_type')} :</label>
                      <Select
                        styles={colourStyles}
                        options={paymentTypes}
                        value={paymentTypes.filter((f: any) => {
                          return f.value == formObj.paymentType;
                        })}
                        onChange={(itm) => {
                          setFormObj({ ...formObj, paymentType: itm!.value });
                        }}
                      />
                      {errorForm.paymentType && (
                        <p className="p-1 h6 text-danger ">{t('quotation.select_one_item')}</p>
                      )}
                    </div>
                  </div>
                </div>
                <Grid container spacing={2} className="mt-3 d-flex justify-content-start">
                  <Grid item xs={6}>
                    <div className="purchase-items">
                      <Divider flexItem></Divider>
                      {purchaseDetails.map((pd: any, i: number) => {
                        return (
                          <>
                            <div key={i} className="purchase-item">
                              <div className="purchase-text">
                                {pd.value == 'discount' && (
                                  <>
                                    <p>{t(`quotation.discount`)}</p>
                                    <div className="d-flex">
                                      <div className="px-3">
                                        <Form.Select
                                          style={{ width: '130px' }}
                                          onChange={(e) => {
                                            setFormObj({
                                              ...formObj,
                                              discount_type: e.target.value,
                                            });
                                          }}>
                                          <option value={'fixed'}>{t('quotation.fixed')}</option>
                                          <option value={'percent'}>
                                            {t('quotation.percent')}
                                          </option>
                                        </Form.Select>
                                      </div>
                                      <div>
                                        <Form.Control
                                          size="sm"
                                          type="number"
                                          min={0}
                                          value={formObj.discount_amount}
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
                                        {formObj.total_discount.toFixed(
                                          locationSettings?.location_decimal_places
                                        )}{' '}
                                      </p>
                                    </div>
                                  </>
                                )}
                                {/* {pd.value == 'expense' && (
                                  <p>
                                    {formObj.total_expense.toFixed(
                                      locationSettings?.location_decimal_places
                                    )}
                                  </p>
                                )} */}
                                {pd.value == 'taxes' && !vatInColumn && (
                                  <>
                                    <p>{t(`quotation.taxes`)}</p>
                                    <div>
                                      <p className="fixed-width">
                                        {tax.tax}%(
                                        {((tax.tax / 100) * formObj.subTotal_price).toFixed(
                                          locationSettings?.location_decimal_places
                                        )}
                                        )
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <Divider flexItem></Divider>
                          </>
                        );
                      })}
                      <div className="purchase-item">
                        {/* {isEditSort && <p className="puchase-arrow" style={{ width: '100px' }}></p>} */}
                        <div className="purchase-text">
                          <p>{t('quotation.total')}</p>
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
                          <p>{t('quotation.total_paid')}</p>
                          <p>
                            {formObj.paid_amount.toFixed(locationSettings?.location_decimal_places)}
                            <span style={{ opacity: '0.5', fontSize: '10px' }}>
                              {' '}
                              {locationSettings?.currency_code}
                            </span>
                          </p>
                        </div>
                        <div className="purchase-text">
                          <p>{t('quotation.total_remaining')}</p>
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
                          <p className="p-1 h6 text-danger ">Error! ,Enter Right Amount</p>
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
                    if (formObj.customer_id == 0) errors.push('error');
                    if (selectProducts.length == 0) errors.push('error');
                    if (formObj.status.length <= 2) errors.push('error');
                    // if (formObj.status != 'draft') {
                    //   // if (formObj.paymentStatus.length <= 2) errors.push('error');
                    //   // if ((formObj.paymentDate + '').length <= 2) errors.push('error2');
                    //   // if (formObj.paymentType.length <= 2) errors.push('error');
                    // }
                    // if (formObj.paymentStatus == 'partially_paid' && formObj.paid_amount < 0.5)
                    // errors.push('error');

                    setErrorForm({
                      ...errorForm,
                      customer_id: formObj.customer_id == 0,
                      status: formObj.status.length <= 2,
                      // paymentDate: (formObj.paymentDate + '').length <= 2,
                      // paymentStatus: formObj.paymentStatus.length <= 2,
                      paymentType: formObj.paymentType.length <= 2,
                      products: selectProducts.length == 0,
                      // paid: formObj.paymentStatus == 'partially_paid' && formObj.paid_amount < 0.5,
                      // morePaid: formObj.paid_amount > formObj.total_price,
                    });

                    if (errors.length == 0) {
                      if (isEdit) editPurchase();
                      else insertPurchase();
                    } else Toastify('error', 'Enter Requires Field');
                  }}>
                  {isEdit ? t('quotation.edit') : t('quotation.save')}
                </button>
              </Card.Body>
            </Card>
          </>
        )}
      </AdminLayout>
    </>
  );
};
export default AddQuotations;
export async function getServerSideProps({ params, locale }) {
  const { id, slug } = params;
  return {
    props: { id, slug, ...(await serverSideTranslations(locale)) },
  };
}
