'use client';
import { paymentTypeData } from '@models/data';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, InputGroup, Stack, Spinner } from 'react-bootstrap';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useFieldArray, useForm } from 'react-hook-form';
import { MdDelete, MdOutlineShoppingCartCheckout } from 'react-icons/md';
import { useReactToPrint } from 'react-to-print';
import FormField from 'src/components/form/FormField';
import SelectField from 'src/components/form/SelectField';
import MainModal from 'src/components/modals/MainModal';
// import { useProducts } from 'src/context/ProductContext';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch, useAppSelector } from 'src/hooks';
// import { usePosContext } from 'src/modules/pos/_context/PosContext';
// import { clearCart, selectCartByLocation } from 'src/redux/slices/cart.slice';
import api from 'src/utils/app-api';
// import InvoiceToPrint from './InvoiceToPrint';
// import { useRouter } from 'next/router';

import { useDigitalContext } from 'src/modules/digital/_context/DigitalContext';
import { Toastify } from 'src/libs/allToasts';

export default function PaymentCheckoutModal({
  show,
  setShow,
  shopId,
  invoiceType,
  invoiceDetails,
  cartItems,
  cartData,
  setCartItems,
setRenderedScreen
}) {
  const { lang, setLang } = useDigitalContext();

  const dispatch = useAppDispatch();
  const { locationSettings, tailoringSizes, tailoringExtras } = useUser();
  const componentRef = React.useRef(null);
  // const [customer, setCustomer] = useState<{
  //   value: number | string;
  //   label: string;
  //   isNew: boolean;
  // }>({ value: 0, label: 'walk-in customer', isNew: false });
  const [printReceipt, setPrintReceipt] = useState<any>();
  const [print, setPrint] = useState<boolean>(false);
  const [__WithDiscountFeature__total, set__WithDiscountFeature__total] = useState<number>(0);
  const [isPending, setIsPending] = useState(false);

  // const [remaining, setRemaining] = useState<number>(0);
  const [cart, setCart] = useState({
    location_id: 0,
    cartItems: [],
    cartSellTotal: 0,
    cartCostTotal: 0,
    cartDiscount: 0,
    cartTax: 0,
    cartTaxType: 'fixed',
    cartDiscountType: 'fixed',
    shipping: 0,
    lastTotal: 0,
    lastDue: 0,
  });

  const [lastEdited, setLastEdited] = useState<number>(0);

  const [paidAmount, setPaidAmount] = useState<{ [x: string]: number }>({ '0': 0 });
  // const selectCartForLocation = selectCartByLocation(shopId);
  // const cart = useAppSelector(selectCartForLocation); // current location order
  // const { customers } = useProducts();
  // const currentCustomer = customers?.filter((c) => c.value === cart?.customer_id) ?? [];

  const totalDiscount =
    cart?.cartDiscountType === 'percentage'
      ? (+(cart?.cartDiscount ?? 0) / 100) * +(cart?.cartSellTotal ?? 0)
      : +(cart?.cartDiscount ?? 0);

  const totalTax =
    cart?.cartTaxType === 'percentage'
      ? (+(cart?.cartTax ?? 0) / 100) * +(cart?.cartSellTotal ?? 0)
      : +(cart?.cartTax ?? 0);

  const totalNoTax = +(cart?.cartSellTotal ?? 0) + +(cart?.shipping ?? 0);

  const totalAmount =
    totalNoTax + totalTax - totalDiscount - +cart?.lastTotal || 0 + +cart?.lastDue || 0;

  const [calcTotal, setCalcTotal] = useState<any>(totalAmount);

  
  useEffect(() => {
    if (!show) {
      return;
    }
    let cartSellTotal = 0;
    let cartCostTotal = 0;
    cartItems.forEach((item) => {
      cartSellTotal += +item.itemTotalPrice;
      cartCostTotal += +item?.cost_price ? item?.cost_price : item.cost;
    });
    setCart((prev) => ({
      ...prev,
      cartSellTotal: +cartSellTotal,
      cartCostTotal: +cartCostTotal,
    }));
  }, [cartItems, show]);

  useEffect(() => {
    reset({ payment: [] });
    append({
      payment_id: '1',
      amount: '',
      note: '',
    });
    setValue(`payment.0.amount`, totalAmount.toString());
    setPaidAmount({ '0': totalAmount });
    setCalcTotal(totalAmount);
  }, [totalAmount]);

  // useEffect(() => {
  //   if (cart?.orderId) {
  //     const newTotal = Number(
  //       (totalNoTax + totalTax - totalDiscount - +cart.lastTotal + +cart.lastDue).toFixed(
  //         locationSettings?.location_decimal_places
  //       )
  //     );
  //     setValue(`payment.0.amount`, newTotal.toString());
  //     setPaidAmount({ '0': newTotal });
  //     setCalcTotal(newTotal);
  //   }
  // }, [cart?.orderId]);

  const paymentTypes = useMemo(
    () =>
      paymentTypeData().map((item, idx) => ({
        ...item,
        value: (idx + 1).toString(),
      })),
    []
  );

  const {
    register,
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      notes: '',
      payment: [
        {
          payment_id: '1',
          amount: totalAmount?.toString() ?? '0',
          note: '',
        },
      ],
    },
  });
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'payment', // unique name for your Field Array
  });
  const [sentData, setSentData] = useState<any>();
  const onSubmit = (data) => {
    setIsPending(true);
    const checkoutData = {
      notes: data?.notes,
      payment: data?.payment,
      location_id: shopId,
      customer_id: undefined,
      disount_type: cart?.cartDiscountType,
      discount_amount: cart?.cartDiscount,
      tax_type: cart?.cartTaxType,
      tax_amount: cart?.cartTax,
      related_invoice_id: null,
      cart: cartData.map((product) => ({
        product_id: product?.product_id,
        variation_id: product?.variation_id,
        qty: product?.quantity,
        note: data?.notes,
      })),
    };

    setSentData(checkoutData);
    api
      .post('/checkout', checkoutData)
      .then((res) => {
        // setPrintReceipt({
        //   ...res.data.result.sales,
        //   ...res.data.result.data,
        //   due: res.data.result.sales.due,
        //   paid: res.data.result.sales.payed,
        //   tax: res.data.result.sales.tax,
        //   customerName: res.data.result.sales.data[0].contact_name,
        // });
        // setPrint(true);
        if(res.status === 200){
          Toastify('success', 'The product has been purchased Success');
          setShow(false);
          setPaidAmount({ '0': 0 });
          setCartItems([])
         
        }
      })
      .catch((error) => {
        console.log(error);
        const {response:{data}}= error
        Toastify('error',data?.error?.message);

      })
      .finally(() => {
        setIsPending(false);
        setShow(false);

      });
  };

  const paidSum = useMemo(() => {
    return Object.values(paidAmount).reduce((acc, curr) => acc + curr, 0);
  }, [paidAmount]);

  useEffect(() => {
    if (printReceipt && print) handlePrint();
  }, [printReceipt]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => setPrint(false),
  });

  return (
    <div>
      {/* <div style={{ display: 'none' }}>
        <InvoiceToPrint
        // tax={cart?.cartTax}
          ref={componentRef}
          customer={customer}
          invoiceType={invoiceType}
          printReceipt={printReceipt}
          customers={currentCustomer}
          invoiceDetails={invoiceDetails}
          locationSettings={locationSettings}
          __WithDiscountFeature__total={__WithDiscountFeature__total}
        />
      </div> */}
      <MainModal
        title={lang?.paymentCheckoutModal?.payment}
        show={show}
        setShow={setShow}
        body={
          <Container fluid>
            <Stack>
              <Row>
                <h5 className="fw-bold">
                  <span style={{ width: '6rem', display: 'inline-block' }}>
                    {lang?.paymentCheckoutModal?.amount}:{' '}
                  </span>
                  <span>
                    {totalNoTax?.toFixed(locationSettings?.location_decimal_places) ?? ''}{' '}
                  </span>
                  <span>{locationSettings?.currency_code ?? ''}</span>
                </h5>
                <h6 className="fw-normal">
                  <span style={{ width: '6rem', display: 'inline-block' }}>
                    {lang?.paymentCheckoutModal?.taxes}:{' '}
                  </span>
                  +{' '}
                  <span>{totalTax?.toFixed(locationSettings?.location_decimal_places) ?? ''} </span>
                  <span>{locationSettings?.currency_code ?? ''}</span>
                </h6>
                <h6 className="fw-normal">
                  <span style={{ width: '6rem', display: 'inline-block' }}>
                    {lang?.paymentCheckoutModal?.discount}:
                  </span>
                  -{' '}
                  <span>
                    {totalDiscount?.toFixed(locationSettings?.location_decimal_places) ?? ''}{' '}
                  </span>
                  <span>{locationSettings?.currency_code ?? ''}</span>
                </h6>

                <h6 className="fw-semibold">
                  <span style={{ width: '6rem', display: 'inline-block' }}>
                    {lang?.paymentCheckoutModal?.total}:{' '}
                  </span>
                  <span>
                    {totalAmount.toFixed(locationSettings?.location_decimal_places) ?? ''}{' '}
                  </span>
                  <span>{locationSettings?.currency_code ?? ''}</span>
                </h6>
              </Row>
            </Stack>
            <Form
              noValidate
              hidden={cartData?.length === 0}
              onSubmit={handleSubmit(onSubmit)}
              id="hook-form">
              <Row>
                <Col>
                  <FormField
                    textArea
                    type="text"
                    name="notes"
                    placeholder={lang?.paymentCheckoutModal?.enterNotes}
                    register={register}
                    label={lang?.paymentCheckoutModal?.orderNotes}
                    errors={errors}
                  />
                </Col>
              </Row>
              {fields.map((field, idx) => (
                <div className="d-flex flex-row gap-2" key={field.id}>
                  <Col xs={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold fs-6">
                        {lang?.paymentCheckoutModal?.amount}
                      </Form.Label>
                      <InputGroup className="mb-3">
                        <Form.Control
                          autoFocus={lastEdited === idx}
                          autoComplete="off"
                          placeholder={lang?.paymentCheckoutModal?.enterAmount}
                          type="number"
                          name={`payment.${idx}.amount`}
                          min={0}
                          max={totalAmount ?? 0}
                          {...register(`payment.${idx}.amount`)}
                          value={paidAmount[idx] ?? 0}
                          onChange={(e) => {
                            setLastEdited(idx);
                            setValue(`payment.${idx}.amount`, e.target.value);
                            setPaidAmount((prev) => ({
                              ...prev,
                              [idx]: +e.target.value,
                            }));
                          }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={3}>
                    <SelectField
                      name={`payment.${idx}.payment_id`}
                      options={paymentTypes}
                      register={register}
                      label={lang?.paymentCheckoutModal?.method}
                      errors={errors}
                    />
                  </Col>
                  <Col xs={idx > 0 ? 3 : null}>
                    <FormField
                      type="text"
                      name={`payment.${idx}.note`}
                      placeholder={lang?.paymentCheckoutModal?.enterPayNote}
                      register={register}
                      label={lang?.paymentCheckoutModal?.payNote}
                      errors={errors}
                    />
                  </Col>
                  {idx > 0 && (
                    <Col className="mt-auto mb-3">
                      <Button
                        className="h-60 w-100 mt-auto align-items-center gap-1 d-flex flex-row"
                        onClick={() => {
                          remove(idx);
                          setPaidAmount((prev) => {
                            const { [idx]: _, ...rest } = prev;
                            return rest;
                          });
                        }}>
                        {lang?.paymentCheckoutModal?.remove} <MdDelete />
                      </Button>
                    </Col>
                  )}
                </div>
              ))}
              <Row>
                <Col>
                  <Button
                    // disabled={totalAmount >= paidAmount ? 'true' : 'false'}
                    onClick={() =>
                      append({
                        payment_id: '1',
                        amount: '',
                        note: '',
                      })
                    }>
                    {lang?.paymentCheckoutModal?.addPaymentRow}
                  </Button>
                </Col>
              </Row>
            </Form>
            <Row className="p-1 mt-1 mb-1 rounded-2 bg-primary">
              <Col xs={3} className="d-flex flex-column">
                <p className="fw-semibold fs-6" style={{ height: '3rem' }}>
                  {lang?.paymentCheckoutModal?.totalPayable}
                </p>

                <span className="fw-semibold fs-6">
                  {calcTotal?.toFixed(locationSettings?.location_decimal_places) ?? ''}
                </span>
              </Col>

              <Col xs={3}>
                {' '}
                <p className="fw-semibold fs-6" style={{ height: '3rem' }}>
                  {lang?.paymentCheckoutModal?.totalPaying}
                </p>
                <span className="fw-semibold fs-6">
                  {paidSum?.toFixed(locationSettings?.location_decimal_places) ?? ''}
                </span>
              </Col>
              <Col xs={3}>
                {' '}
                <p className="fw-semibold fs-6" style={{ height: '3rem' }}>
                  {lang?.paymentCheckoutModal?.changeReturn}{' '}
                </p>
                <span className="fw-semibold fs-6">
                  {Math.max(paidSum - totalAmount, 0)?.toFixed(
                    locationSettings?.location_decimal_places
                  ) ?? ''}
                </span>
              </Col>
              <Col xs={3}>
                {' '}
                <p className="fw-semibold fs-6" style={{ height: '3rem' }}>
                  {lang?.paymentCheckoutModal?.balance}{' '}
                </p>
                <span className="fw-semibold fs-6">
                  {Math.max(calcTotal - paidSum, 0)?.toFixed(
                    locationSettings?.location_decimal_places
                  ) ?? ''}
                </span>
              </Col>
            </Row>
          </Container>
        }
        footer={
          <div
            style={{
              display:
                cartData?.length === 0 || !locationSettings?.currency_code ? 'hidden' : 'flex',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            {totalAmount * 100 - paidSum * 100 > 0 && (
              <span className="text-danger">
                {Math.abs(totalAmount - paidSum)?.toFixed(
                  locationSettings?.location_decimal_places
                )}{' '}
                {calcTotal - paidSum > 0 ? 'remaining' : 'exceeded'}
              </span>
            )}

            <Button
              disabled={isPending}
              type="submit"
              form="hook-form"
              className={classNames(
                'btn btn-label d-flex flex-row align-items-center gap-3',
                'btn-primary',
                ' right nexttab'
              )}>
              {isPending ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                <span>{lang?.paymentCheckoutModal?.completeOrder}</span>
              )}
              <MdOutlineShoppingCartCheckout />
            </Button>
          </div>
        }
      />
      {/* <DevTool control={control} /> set up the dev tool */}
    </div>
  );
}
