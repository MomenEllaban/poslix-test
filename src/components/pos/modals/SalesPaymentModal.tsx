import React, { useState, useContext, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { IHold, IpaymentRow } from '../../../models/common-model';
import { apiInsertCtr } from '../../../libs/dbUtils';
import { cartJobType } from '../../../recoil/atoms';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { paymentTypeData } from '@models/data';
import { ProductContext } from 'src/context/ProductContext';
import { UserContext } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import { updateData } from 'src/services/crud.api';
import { useTranslation } from 'next-i18next';

const SalesPaymentModal = (props: any) => {
  const { locationSettings } = useContext(UserContext);
  const {
    openDialog,
    statusDialog,
    setPaymentModalShow,
    setPaymentModalData,
    userData,
    location,
    holdObj,
    details,
    shopId,
    orderEditDetails,
    selectedHold,
    // to call the parent function to edite
    handlePrint,
    completeHandele,
    t,
    ///
  } = props;
  // with discount feature
  const { tax, __WithDiscountFeature__total, setDiscount, totalDiscount } = props;
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [mustPay, setMustPay] = useState<number>(0);
  const [difference, setDifference] = useState<number>(0);
  const [hasError, setHasError] = useState<{ st: boolean; msg: string }>({
    st: false,
    msg: '',
  });
  const [paymentData, setPaymentData] = useState<any>({});
  const [, setJobType] = useRecoilState(cartJobType);
  const [paymentRows, setPaymentRows] = useState<IpaymentRow[]>([
    { amount: 0, method: 'cash', notes: '' },
  ]);

  const [canPay, setCanPay] = useState<boolean>(true);
  const [orderNote, setOrderNote] = useState<string>('');
  const selectStyle = {
    control: (style: any) => ({
      ...style,
      fontSize: '12px',
      minWidth: '150px',
      maxHeight: '10px',
    }),
    menu: (base: any) => ({ ...base, fontSize: '12px' }),
  };
  const [paymentMethods] = useState(paymentTypeData);
  const { products, setProducts, variations, setVariations } = useContext(ProductContext);
  const [holdItems, setHoldItems] = useState<IHold[]>([]);

  useEffect(() => {
    setPaymentData({ amount: userData.due, payment_type: 'cash' });
    setHasError({ st: false, msg: '' });
    let _mustPay = +Math.abs(
      __WithDiscountFeature__total + details?.totalAmount - details?.subTotal
    ).toFixed(locationSettings?.location_decimal_places);
    setMustPay(_mustPay);
    setPaymentRows([{ amount: _mustPay, method: 'cash', notes: '' }]);

    if (!statusDialog) return;

    setOrderNote(orderEditDetails?.notes != null ? orderEditDetails?.notes : '');
    let _id = 0,
      fabs: any = [];
    holdObj?.orders.map((od: any, i: number) => {
      if (od.type == 'tailoring_package') {
        _id = holdObj.quantity[i].tailoringCutsom?.fabric_id!;
        let index = fabs.findIndex((item: any) => item.product_id == _id);
        if (index !== -1)
          fabs[index].qty +=
            holdObj.quantity[i].tailoringCutsom?.fabric_length! * holdObj.quantity[i].quantity;
        else
          fabs.push({
            product_id: _id,
            qty: holdObj.quantity[i].tailoringCutsom?.fabric_length! * holdObj.quantity[i].quantity,
          });
      }
    });
    holdObj?.orders.map((od: any, i: number) => {
      if (od.type == 'single' && od.is_fabric == 1 && od.sell_over_stock == 0) {
        _id = od.product_id;
        let index = fabs.findIndex((item: any) => item.product_id == _id);
        if (index !== -1) {
          let _sum = fabs[index].qty + holdObj.quantity[i].quantity;
          let _pro: any = products[holdObj.quantity[i].productIndex];
          if (_sum > _pro.total_qty) {
            Toastify('error', 'Over Stock #' + od.name);
            openDialog(false);
          }
        }
      }
    });
    const holdItemsFromStorage = localStorage.getItem('holdItems' + shopId);
    if (holdItemsFromStorage) setHoldItems(JSON.parse(holdItemsFromStorage).reverse());
  }, [statusDialog]);

  function calculation(_rows: IpaymentRow[]) {
    let _sum = 0;
    localStorage.setItem('payment', JSON.stringify(_rows));
    _rows.map((_i: IpaymentRow) => (_sum += Number(_i.amount!)));
    setTotalPaid(+Number(_sum).toFixed(locationSettings?.location_decimal_places));
  }
  const style = { minWidth: '500px' };
  const paymentRowChange = (index: any, evnt: any): void => {
    const _rows: any = [...paymentRows];
    if ('label' in evnt) _rows[index].method = evnt.value;
    else {
      const { name, value } = evnt.target;
      _rows[index][name] = value;
    }
    setPaymentRows(_rows);
    calculation(_rows);
  };
  const handlePayment = () => {
    let isOk = true;
    paymentRows.map((pr) => {
      if (pr.method!.length < 2) {
        isOk = false;
        return;
      }
    });
    if (!isOk) {
      Toastify('error', 'Choose Payment Method First ');
      return;
    }
    completeHandele(paymentRows[0], userData);
    setPaymentModalShow(false);
    // remove comment to call the api
    canPay ? insertPayment() : Toastify('error', 'Wrong Amount!!');
  };

  async function insertPayment() {
    const res = await updateData('sales/complete-payment', userData.id, paymentData);
    if (res.data.success) {
      Toastify('success', 'successfully done');
      setPaymentModalShow(false);
      setPaymentModalData({});
      setJobType({ req: 2, val: orderNote, val2: res.data.result });
      handlePrint();
      if (
        holdItems.length > 0 &&
        selectedHold != undefined &&
        selectedHold.holdId != null &&
        selectedHold.holdId > -1
      ) {
        holdItems.splice(selectedHold.holdId, 1);
        localStorage.setItem('holdItems' + shopId, JSON.stringify(holdItems));
      }
    } else {
      alert('has error, Try Again...');
    }
  }
  return (
    <>
      <ToastContainer />
      <Dialog open={statusDialog} className="poslix-modal" sx={style}>
        <DialogTitle>{t('invoices.payment')}</DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="modal-body">
            <div className="d-flex gap-2 justify-between" style={{ fontSize: 'small' }}>
              <div
                style={{
                  backgroundColor: '#ccc',
                  borderRadius: '5px',
                  paddingInline: '16px',
                  paddingTop: '6px',
                }}>
                <p>
                  {t('invoices.customer_name')}: {userData?.contact_name}
                </p>
              </div>
              <div
                style={{
                  backgroundColor: '#ccc',
                  borderRadius: '5px',
                  paddingInline: '16px',
                  paddingTop: '6px',
                }}>
                <p>
                  {t('invoices.invoice_no')}: {userData.id}
                </p>
                <p>
                  {t('invoices.location')}: {location}
                </p>
              </div>
              <div
                style={{
                  backgroundColor: '#ccc',
                  borderRadius: '5px',
                  paddingInline: '16px',
                  paddingTop: '6px',
                }}>
                <p>
                  {t('invoices.total_amount')}: {userData.sub_total}
                </p>
                <p>
                  {t('invoices.payment_note')}: {userData.note ? userData.note : '...'}
                </p>
              </div>
            </div>
            <div>
              <div className="payment-item">
                <label className="label" htmlFor="abount">
                  {t('quotation_sale_model.order_note')}
                </label>
                <textarea
                  className="form-control"
                  name="order_note"
                  maxLength={80}
                  onChange={(e) => setOrderNote(e.target.value)}
                  value={orderNote}
                />
              </div>
              {paymentRows.map((paymentRow, i: number) => {
                return (
                  <div key={i} className="payment-box">
                    <div className="payment-item">
                      <label className="label" htmlFor="abount">
                        {t('invoices.payment')}
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        name="amount"
                        onChange={(e) => {
                          paymentRowChange(0, e);
                          setPaymentData({ ...paymentData, amount: +e.target.value });
                        }}
                        value={paymentData.amount ? paymentData.amount : userData.totalDue}
                      />
                    </div>

                    <div className="payment-item">
                      <label className="label" htmlFor="abount">
                        {t('invoices.method')}{' '}
                      </label>
                      <Select
                        styles={selectStyle}
                        options={paymentMethods}
                        onChange={(e: any) => {
                          paymentRowChange(i, e);
                          setPaymentData({ ...paymentData, payment_type: e.value });
                        }}
                        value={paymentMethods.find((f) => {
                          return f.value == +paymentRow.method;
                        })}
                      />
                    </div>

                    <div className="payment-item">
                      <label className="label" htmlFor="abount">
                        {t('invoices.pay_note')}
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="notes"
                        onChange={(evnt) => paymentRowChange(i, evnt)}
                        value={paymentRow.notes}
                      />
                    </div>

                    <div className="payment-item">
                      <label className="label" htmlFor="abount">
                        {t('invoices.payed_on')}
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="notes"
                        onChange={(evnt) => paymentRowChange(i, evnt)}
                        value={new Date().toString()}
                        disabled
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="modal-footer">
            <a
              onClick={() => {
                setPaymentModalShow(false);
                setPaymentModalData({});
              }}
              href="#"
              className="btn btn-link link-success fw-medium">
              <i className="ri-close-line me-1 align-middle" /> {t('invoices.close')}
            </a>
            <button
              type="button"
              className={
                'btn btn-label ' + (canPay ? 'btn-primary' : 'btn-danger') + ' right nexttab'
              }
              data-nexttab="pills-finish-tab"
              onClick={() => {
                handlePayment();
              }}>
              <i className="ri-shopping-basket-line label-icon align-middle fs-16 ms-2" />
              {canPay ? t('invoices.complete_order') : 'Amount(s) Wrong!'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SalesPaymentModal;
