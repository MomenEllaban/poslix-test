import { ILocationSettings } from '@models/common-model';
import { IPayment, IProduct } from '@models/pos.types';
import { EPaymentStatus } from '@models/reports.types';
import React from 'react';

interface IProductWithPivot extends IProduct {
  pivot: {
    id: number;

    cost: string;
    discount_amount?: string;
    price: string;
    product_id: number;
    qty: string;
    qty_returned: string;
    status: EPaymentStatus;
    // tailoring_custom: null;
    // tailoring_txt: null;
    tax_amount: string;
    transaction_id: number;
    variation_id: number;
  };
}
interface IProps {
  invoiceType: 'A4' | 'reciept';
  invoiceDetails: {
    logo: string;
    name: string;
    tell: string;

    orderNo: string;
    txtQty: string;
    txtAmount: string;
    txtDate?: string;
    txtItem: string;
    txtTax: string;
    txtCustomer?: string;
    txtDiscount: string;
    txtTotal: string;
    footer: string;
    txtAmountpaid: string;
    txtTotalDue: string;

    orderNo2: string;
    txtQty2: string;
    txtAmount2: string;
    txtDate2?: string;
    txtItem2: string;
    txtTax2: string;
    txtCustomer2?: string;
    txtTotal2: string;
    footer2: string;
    txtTotalDue2: string;
    txtDiscount2: string;
    txtAmountpaid2: string;

    isMultiLang: boolean;
  };
  customers: { label: string }[];
  customer: { label: string };
  printReceipt: {
    paid: number | string;
    due: number | string;
    tax: number | string;
    id: number | string;
    total_price: number | string;
    discount_amount: number | string;
    payment: IPayment[];
    products: IProductWithPivot[];
  };
  locationSettings: ILocationSettings;
  __WithDiscountFeature__total: number;
}

class InvoiceToPrint extends React.PureComponent<IProps> {
  perperdForPrint(prods: IProductWithPivot[]) {
    let counter = 0;
    return prods?.map((prod: IProductWithPivot, i: number) => {
      counter++;
      return (
        <tr key={counter}>
          <td>{+prod?.pivot?.qty}</td>
          <td>{prod.name}</td>
          <th></th>
          <td>
            {(+prod.sell_price).toFixed(this.props.locationSettings?.location_decimal_places)}
          </td>
        </tr>
      );
    });
  }
  perperdForA4Print(prods: IProductWithPivot[]) {
    let counter = 0;
    return prods?.map((prod: IProductWithPivot, i: number) => {
      counter++;

      return (
        <tr key={counter + 'product-a4-item'}>
          <td>{prod.name}</td>
          <td>{+prod?.pivot?.qty}</td>
          <td>
            {(+prod?.pivot?.price).toFixed(this.props.locationSettings?.location_decimal_places)}
          </td>
          <td>
            {(+prod?.pivot?.tax_amount || 0).toFixed(
              this.props.locationSettings?.location_decimal_places
            )}
          </td>
          <td>
            {(+prod?.pivot?.price * +prod?.pivot?.qty).toFixed(
              this.props.locationSettings?.location_decimal_places
            )}
          </td>
        </tr>
      );
    });
  }

  render() {
    const {
      invoiceType,
      invoiceDetails,
      printReceipt,
      customers,
      customer,
      locationSettings,
      __WithDiscountFeature__total,
    } = this.props;

    if (invoiceType === 'A4')
      return (
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
                <div>{customers.length > 0 ? customers[0].label : customer.label}</div>
                {/* <span>Billed To</span> */}
              </div>
            </div>
            <br />

            <br />
            <table className="GeneratedTable2">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>
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
                {this.perperdForA4Print(printReceipt?.products)}
                <tr>
                  {/* <td>{invoiceDetails.txtTax} {invoiceDetails.isMultiLang && invoiceDetails.txtTax2}</td> */}
                  <td colSpan={4} className="txt_bold_invoice">
                    Sub Total
                  </td>
                  <td>
                    {Number(+printReceipt?.total_price - +printReceipt?.discount_amount).toFixed(
                      locationSettings?.location_decimal_places
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="txt_bold_invoice">
                    Total
                  </td>
                  <td className="txt_bold_invoice">
                    {Number(+printReceipt?.total_price - +printReceipt?.discount_amount).toFixed(
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
                        (+printReceipt?.total_price - +printReceipt?.discount_amount) -
                        +printReceipt?.payment[0].amount
                    ) > 0
                      ? Number(
                          __WithDiscountFeature__total +
                            (+printReceipt?.total_price - +printReceipt?.discount_amount) -
                            +printReceipt?.payment[0].amount
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

    // ------------------ //
    return (
      <div className="bill">
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
            <div>{customers.length > 0 ? customers[0].label : customer.label}</div>
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
            {this.perperdForPrint(printReceipt?.products)}
            <tr className="net-amount">
              <td></td>
              <td>
                {invoiceDetails.txtTax} {invoiceDetails.isMultiLang && invoiceDetails.txtTax2}
              </td>
              <td></td>
              <td>
                {((+printReceipt?.total_price * +printReceipt?.tax) / 100).toFixed(
                  locationSettings?.location_decimal_places
                )}
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
                {/* {invoiceDetails.txtAmountpaid}{' '}
                {invoiceDetails.isMultiLang && invoiceDetails.txtAmountpaid2} */}
                Total Paid
              </td>
              <td></td>
              <td className="txt-bold">
                {printReceipt?.paid}
              </td>
            </tr>
            <tr className="net-amount">
              <td></td>
              <td className="txt-bold">
                {/* {invoiceDetails.txtTotalDue}{' '}
                {invoiceDetails.isMultiLang && invoiceDetails.txtTotalDue2} */}
                Total Due
              </td>
              <td></td>
              <td className="txt-bold">
                {printReceipt?.due}
              </td>
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
    );
  }
}
export default InvoiceToPrint;
