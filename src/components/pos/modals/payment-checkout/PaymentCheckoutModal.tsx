'use client';
import { DevTool } from '@hookform/devtools';
import { paymentTypeData } from '@models/data';
import classNames from 'classnames';
import { update } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, InputGroup, Stack } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useFieldArray, useForm } from 'react-hook-form';
import { MdDelete, MdOutlineShoppingCartCheckout } from 'react-icons/md';
import { useReactToPrint } from 'react-to-print';
import FormField from 'src/components/form/FormField';
import SelectField from 'src/components/form/SelectField';
import MainModal from 'src/components/modals/MainModal';
import { useProducts } from 'src/context/ProductContext';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { clearCart, selectCartByLocation } from 'src/redux/slices/cart.slice';
import api from 'src/utils/app-api';

export default function PaymentCheckoutModal({
  show,
  setShow,
  shopId,
  invoiceType,
  invoiceDetails,
}) {
  const dispatch = useAppDispatch();
  const { locationSettings, tailoringSizes, tailoringExtras } = useUser();
  const componentRef = React.useRef(null);
  const [customer, setCustomer] = useState<{
    value: string;
    label: string;
    isNew: boolean;
  }>({ value: '1', label: 'walk-in customer', isNew: false });
  const [printReceipt, setPrintReceipt] = useState<any>();
  const [print, setPrint] = useState<boolean>(false);
  const [__WithDiscountFeature__total, set__WithDiscountFeature__total] = useState<number>(0);

  const [remaining, setRemaining] = useState<number>(0);

  const [lastEdited, setLastEdited] = useState<number>(0);

  const [paidAmount, setPaidAmount] = useState<{
    [x: string]: number;
  }>({
    '0': 0,
  });
  const selectCartForLocation = selectCartByLocation(shopId);
  const cart = useAppSelector(selectCartForLocation); // current location order
  const { customers } = useProducts();
  const currentCustomer = customers?.filter((c) => c.value === cart?.customer_id) ?? [];

  const totalDiscount =
    cart?.cartDiscountType === 'percentage'
      ? (+(cart?.cartDiscount ?? 0) / 100) * +(cart?.cartSellTotal ?? 0)
      : +(cart?.cartDiscount ?? 0);

  const totalTax =
    cart?.cartTaxType === 'percentage'
      ? (+(cart?.cartTax ?? 0) / 100) * +(cart?.cartSellTotal ?? 0)
      : +(cart?.cartTax ?? 0);

  const totalNoTax = +(cart?.cartSellTotal ?? 0) + +(cart?.shipping ?? 0);
  const totalAmount = totalNoTax + totalTax - totalDiscount;

  useEffect(() => {
    setValue(`payment.0.amount`, totalAmount.toString());
    setPaidAmount({ '0': totalAmount });
  }, [totalAmount]);

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

  const onSubmit = (data) => {
    const checkoutData = {
      notes: data?.notes,
      payment: data?.payment,
      location_id: shopId,
      customer_id: cart?.customer_id,
      disount_type: cart?.cartDiscountType,
      discount_amount: cart?.cartDiscount,
      tax_type: cart?.cartTaxType,
      tax_amount: cart?.cartTax,

      related_invoice_id: cart.orderId > 0 ? cart.orderId : null,
      cart: cart?.cartItems.map((product) => ({
        product_id: product?.product_id,
        qty: product?.quantity,
        note: data?.notes,
      })),
    };
    api
      .post('/checkout', checkoutData)
      .then((res) => {
        console.log(res.data);
        console.log(res.data.result.payment);
        setPrintReceipt(res.data.result);
        setPrint(true);
        setShow(false);
      })
      .then(() => {
        dispatch(clearCart({ location_id: shopId }));
      });
  };

  const paidSum = useMemo(() => {
    return Object.values(paidAmount).reduce((acc, curr) => acc + curr, 0);
  }, [paidAmount]);

  useEffect(() => {
    if (printReceipt && print) handlePrint();
  }, [printReceipt]);

  class ComponentToPrint extends React.PureComponent {
    render() {
      return invoiceType === 'receipt' ? (
        <div className="bill" style={{ width: '100%' }}>
          <div className="brand-logo">
            <img src={invoiceDetails.logo} />
          </div>
          <br />
          <div className="brand-name">{invoiceDetails.name}</div>
          <div className="shop-details">{invoiceDetails.tell}</div>
          <br />
          <div className="bill-details">
            <div className="flex justify-between">
              <div>
                {invoiceDetails.txtCustomer}{' '}
                {invoiceDetails.isMultiLang && invoiceDetails.txtCustomer2}
              </div>
              <div>{currentCustomer.length > 0 ? currentCustomer[0].label : customer.label}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoiceDetails.orderNo} {invoiceDetails.isMultiLang && invoiceDetails.orderNo2}
              </div>
              <div>{printReceipt?.id}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoiceDetails.txtDate} {invoiceDetails.isMultiLang && invoiceDetails.txtDate2}
              </div>
              <div>{new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr className="header">
                <th>
                  {invoiceDetails.txtQty}
                  <br />
                  {invoiceDetails.isMultiLang && invoiceDetails.txtQty2}
                </th>
                <th>
                  {invoiceDetails.txtItem}
                  <br />
                  {invoiceDetails.isMultiLang && invoiceDetails.txtItem2}
                </th>
                <th></th>
                <th>
                  {invoiceDetails.txtAmount}
                  <br />
                  {invoiceDetails.isMultiLang && invoiceDetails.txtAmount2}
                </th>
              </tr>
              {perperdForPrint(printReceipt?.products)}
              <tr className="net-amount">
                <td></td>
                <td>
                  {invoiceDetails.txtTax} {invoiceDetails.isMultiLang && invoiceDetails.txtTax2}
                </td>
                <td></td>
                <td>
                  {(
                    (+printReceipt?.total_price * +printReceipt?.products[0].pivot.tax_amount) /
                    100
                  ).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td>
                  {invoiceDetails.txtDiscount}
                  {'Discount'}
                  {invoiceDetails.isMultiLang && invoiceDetails.txtDiscount2}
                </td>
                <td></td>
                <td>
                  {(+printReceipt?.discount_amount).toFixed(
                    locationSettings?.location_decimal_places
                  )}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {invoiceDetails.txtTotal} {invoiceDetails.isMultiLang && invoiceDetails.txtTotal2}
                </td>
                <td></td>
                <td className="txt-bold">
                  {/* {Number(__WithDiscountFeature__total + (totalAmount - printReceipt.totalPrice)).toFixed(
                    locationSettings?.location_decimal_places
                  )} */}
                  {Number(+printReceipt?.total_price - +printReceipt?.discount_amount).toFixed(
                    locationSettings?.location_decimal_places
                  )}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {invoiceDetails.txtAmountpaid}{' '}
                  {invoiceDetails.isMultiLang && invoiceDetails.txtAmountpaid2}
                </td>
                <td></td>
                <td className="txt-bold">
                  {/* {printReceipt.payment[0].amount && Number(totalPaid).toFixed(locationSettings?.location_decimal_places)} */}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {invoiceDetails.txtTotalDue}{' '}
                  {invoiceDetails.isMultiLang && invoiceDetails.txtTotalDue2}
                </td>
                <td></td>
                {/* <td className="txt-bold">
                  {Number(
                    __WithDiscountFeature__total + (totalAmount - subTotal) - (amount && totalPaid)
                  ) > 0
                    ? Number(
                        __WithDiscountFeature__total +
                          +(totalAmount - subTotal) -
                          (amount && totalPaid)
                      ).toFixed(locationSettings?.location_decimal_places)
                    : 0}
                </td> */}
              </tr>
            </thead>
          </table>
          <p className="recipt-footer">
            {invoiceDetails.footer}
            {invoiceDetails.isMultiLang && invoiceDetails.footer2}
          </p>
          {/* <p className="recipt-footer">{orderNote}</p> */}
          <br />
        </div>
      ) : (
        <div className="appear-body-item a4">
          <div className="bill2">
            <div className="brand-logo">
              <img src={invoiceDetails.logo} />
              <div className="invoice-print">
                INVOICE
                <div>
                  <table className="GeneratedTable">
                    <tbody>
                      <tr>
                        <td className="td_bg">INVOICE NUMBER </td>
                        <td>
                          <div>
                            {invoiceDetails.orderNo}{' '}
                            {invoiceDetails.isMultiLang && invoiceDetails.orderNo2}
                          </div>
                          <div>{printReceipt?.id}</div>
                        </td>
                      </tr>
                      <tr>
                        <td className="td_bg">INVOICE DATE </td>
                        <td>{new Date().toISOString().slice(0, 10)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <br />
            <div className="up_of_table flex justify-between">
              <div className="left_up_of_table">
                <div>Billed From</div>
                <div>{invoiceDetails.name}</div>
                <div>info@poslix.com</div>
                <div>{invoiceDetails.tell}</div>
                <div>Office 21-22, Building 532, Mazoon St. Muscat, Oman</div>
                <div>VAT Number: OM1100270001</div>
              </div>
              <div className="right_up_of_table">
                <div>Billed To</div>
                <div>{currentCustomer.length > 0 ? currentCustomer[0].label : customer.label}</div>
                {/* <span>Billed To</span> */}
              </div>
            </div>
            <br />

            <table className="GeneratedTable2">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>
                    {' '}
                    {invoiceDetails.txtQty}
                    <br />
                    {invoiceDetails.isMultiLang && invoiceDetails.txtQty2}
                  </th>
                  <th>Unit Price</th>
                  {/* <th> {invoiceDetails.txtItem}<br />{invoiceDetails.isMultiLang && invoiceDetails.txtItem2}</th> */}
                  <th>Tax</th>
                  <th>
                    {' '}
                    {invoiceDetails.txtAmount}
                    <br />
                    {invoiceDetails.isMultiLang && invoiceDetails.txtAmount2}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* <td>{invoiceDetails.txtTax} {invoiceDetails.isMultiLang && invoiceDetails.txtTax2}</td> */}
                  <td colSpan={4} className="txt_bold_invoice">
                    Sub Total
                  </td>
                  <td>
                    {Number(__WithDiscountFeature__total + +printReceipt?.total_price).toFixed(
                      locationSettings?.location_decimal_places
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="txt_bold_invoice">
                    Total
                  </td>
                  <td className="txt_bold_invoice">
                    {Number(__WithDiscountFeature__total + +printReceipt?.total_price).toFixed(
                      locationSettings?.location_decimal_places
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="txt_bold_invoice">
                    Total Due
                  </td>
                  <td className="txt_bold_invoice">
                    {Number(
                      __WithDiscountFeature__total +
                        +printReceipt?.total_price -
                        +printReceipt?.payment[0].amount
                    ) > 0
                      ? Number(
                          __WithDiscountFeature__total +
                            +printReceipt?.total_price -
                            printReceipt?.payment[0].amount
                        ).toFixed(locationSettings?.location_decimal_places)
                      : 0}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="recipt-footer">
              {invoiceDetails.footer}
              {invoiceDetails.isMultiLang && invoiceDetails.footer2}
            </p>
            {/* <p className="recipt-footer">{formObj.notes}</p> */}
            <br />
          </div>
        </div>
      );
    }
  }

  const perperdForPrint = (prods) => {
    let counter = 0;
    return prods?.map((prod: any, i: number) => {
      counter++;
      return (
        <tr key={counter}>
          <td>{parseInt(prod.pivot.qty)}</td>
          <td>{prod.name}</td>
          <th></th>
          <td>{Number(prod.sell_price).toFixed(locationSettings?.location_decimal_places)}</td>
        </tr>
      );
    });
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => setPrint(false),
  });

  return (
    <div>
      <div style={{ display: 'none' }}>
        <ComponentToPrint ref={componentRef} />
      </div>
      <MainModal
        title="Payment"
        show={show}
        setShow={setShow}
        body={
          <Container fluid>
            <Stack>
              <Row>
                <h5 className="fw-bold">
                  <span style={{ width: '6rem', display: 'inline-block' }}>Amount: </span>
                  <span>
                    {totalNoTax?.toFixed(locationSettings?.location_decimal_places) ?? ''}{' '}
                  </span>
                  <span>{locationSettings?.currency_name ?? ''}</span>
                </h5>
                <h6 className="fw-normal">
                  <span style={{ width: '6rem', display: 'inline-block' }}>Taxes: </span>+{' '}
                  <span>{totalTax?.toFixed(locationSettings?.location_decimal_places) ?? ''} </span>
                  <span>{locationSettings?.currency_name ?? ''}</span>
                </h6>
                <h6 className="fw-normal">
                  <span style={{ width: '6rem', display: 'inline-block' }}>Discount:</span>-{' '}
                  <span>
                    {totalDiscount?.toFixed(locationSettings?.location_decimal_places) ?? ''}{' '}
                  </span>
                  <span>{locationSettings?.currency_name ?? ''}</span>
                </h6>
                <h6 className="fw-semibold">
                  <span style={{ width: '6rem', display: 'inline-block' }}>Total: </span>
                  <span>
                    {totalAmount?.toFixed(locationSettings?.location_decimal_places) ?? ''}{' '}
                  </span>
                  <span>{locationSettings?.currency_name ?? ''}</span>
                </h6>
              </Row>
            </Stack>
            <Form
              noValidate
              hidden={cart?.cartItems?.length === 0 || !locationSettings?.currency_name}
              onSubmit={handleSubmit(onSubmit)}
              id="hook-form">
              <Row>
                <Col>
                  <FormField
                    textArea
                    type="text"
                    name="notes"
                    placeholder="Enter your notes"
                    register={register}
                    label="Order Notes"
                    errors={errors}
                  />
                </Col>
              </Row>
              {fields.map((field, idx) => (
                <div className="d-flex flex-row gap-2" key={field.id}>
                  <Col xs={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold fs-6">Amount</Form.Label>
                      <InputGroup className="mb-3">
                        <Form.Control
                          autoFocus={lastEdited === idx}
                          autoComplete="off"
                          placeholder="enter amount"
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
                      label="Method"
                      errors={errors}
                    />
                  </Col>
                  <Col xs={idx > 0 ? 3 : null}>
                    <FormField
                      type="text"
                      name={`payment.${idx}.note`}
                      placeholder="your notes"
                      register={register}
                      label="Pay. Note"
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
                        Remove <MdDelete />
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
                    Add Payment Row
                  </Button>
                </Col>
              </Row>
            </Form>
            <Row className="p-1 mt-1 mb-1 rounded-2 bg-primary">
              <Col xs={3} className="d-flex flex-column">
                <p className="fw-semibold fs-6" style={{ height: '3rem' }}>
                  Total Payable
                </p>

                <span className="fw-semibold fs-6">
                  {totalAmount?.toFixed(locationSettings?.location_decimal_places) ?? ''}
                </span>
              </Col>

              <Col xs={3}>
                {' '}
                <p className="fw-semibold fs-6" style={{ height: '3rem' }}>
                  Total Paying
                </p>
                <span className="fw-semibold fs-6">
                  {paidSum?.toFixed(locationSettings?.location_decimal_places) ?? ''}
                </span>
              </Col>
              <Col xs={3}>
                {' '}
                <p className="fw-semibold fs-6" style={{ height: '3rem' }}>
                  Change Return{' '}
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
                  Balance{' '}
                </p>
                <span className="fw-semibold fs-6">
                  {Math.max(totalAmount - paidSum, 0)?.toFixed(
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
                cart?.cartItems?.length === 0 || !locationSettings?.currency_name
                  ? 'hidden'
                  : 'flex',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            {totalAmount * 100 - paidSum * 100 > 0 && (
              <span className="text-danger">
                {Math.abs(totalAmount - paidSum)?.toFixed(
                  locationSettings?.location_decimal_places
                )}{' '}
                {totalAmount - paidSum > 0 ? 'remaining' : 'exceeded'}
              </span>
            )}

            <Button
              type="submit"
              form="hook-form"
              className={classNames(
                'btn btn-label d-flex flex-row align-items-center gap-3',
                'btn-primary',
                ' right nexttab'
              )}>
              <span>Complete Order</span>
              <MdOutlineShoppingCartCheckout />
            </Button>
          </div>
        }
      />
      {/* <DevTool control={control} /> set up the dev tool */}
    </div>
  );
}
