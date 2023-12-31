import { ILocationSettings } from '@models/common-model';
import { IPayment, IProduct } from '@models/pos.types';
import { EPaymentStatus } from '@models/reports.types';
import { useRouter } from 'next/router';
import React from 'react';

interface IProductWithPivot extends IProduct {
  product_name?:any;
  product_price?:any;
  product_tax?:any;
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
  invoiceType: 'A4' | 'receipt';
  // invoiceDetails?: {
  //   logo: string;
  //   name: string;
  //   tell: string;

  //   orderNo: string;
  //   txtQty: string;
  //   txtAmount: string;
  //   txtDate?: string;
  //   txtItem: string;
  //   txtTax: string;
  //   txtCustomer?: string;
  //   txtDiscount: string;
  //   txtTotal: string;
  //   footer: string;
  //   txtAmountpaid: string;
  //   txtTotalDue: string;

  //   orderNo2: string;
  //   txtQty2: string;
  //   txtAmount2: string;
  //   txtDate2?: string;
  //   txtItem2: string;
  //   txtTax2: string;
  //   txtCustomer2?: string;
  //   txtTotal2: string;
  //   footer2: string;
  //   txtTotalDue2: string;
  //   txtDiscount2: string;
  //   txtAmountpaid2: string;

  //   is_multi_language: boolean;
  // };
  // tax?:any;
  invoiceDetails?: any;
  customers: { label: string }[];
  customer: { label: string };
  printReceipt: {
    data?:any;
    paid: number | string;
    due: number | string;
    tax: number | string;
    id: number | string;
    total_price: number | string;
    discount_amount: number | string;
    payment: IPayment[];
    products: IProductWithPivot[];
    customerName: string;
    tax_amount: string
  };
  locationSettings: ILocationSettings;
  __WithDiscountFeature__total: number;
}

class InvoiceToPrint extends React.PureComponent<IProps> {

  
  perperdForPrint(tax, prods: IProductWithPivot[]) {
  
    let counter = 0;
    return prods?.map((prod: IProductWithPivot, i: number) => {
      console.log(prod);

      counter++;
      return (
        <tr key={counter}>
          <td>{+prod?.product_qty}</td>
          <td>{prod?.product_name}</td>
          <th></th>
          <td>
            {(+prod?.product_price).toFixed(this.props.locationSettings?.location_decimal_places)}
          </td>
        </tr>
      );
    });
  }
  
  perperdForA4Print(tax,prods) {
    let counter = 0;
    
    return prods?.map((prod: IProductWithPivot, i: number) => {
      console.log(prod);
      console.log(tax);
      
      counter++;

      return (
        <tr key={counter + 'product-a4-item'}>
          <td>{prod.product_name}</td>
          <td>{+prod?.product_qty}</td>
          <td>
            {(+prod?.product_price).toFixed(this.props.locationSettings?.location_decimal_places)}
          </td>
      
              <td colSpan={2}>
            {(+prod?.product_price * +prod?.product_qty).toFixed(
              this.props.locationSettings?.location_decimal_places
            )}
          </td>
        </tr>
      );
    });
  }

  render() {
    const {
      // tax,
      invoiceType,
      invoiceDetails,
      printReceipt,
      customers,
      customer,
      locationSettings,
      __WithDiscountFeature__total,
    } = this.props;
   
    console.log(printReceipt);
    

    if (invoiceType === 'A4') {
      return (
        <div className="appear-body-item a4">
          <div className="bill2">
            <div className="brand-logo">
              <img
                src={invoiceDetails?.en?.logo}
                style={{ width: '35%', height: 'auto', objectFit: 'contain' }}
              />
              <div className="invoice-print">
                INVOICE
                <div>
                  <table className="GeneratedTable">
                    <tbody>
                      <tr>
                        <td className="td_bg">
                          {invoiceDetails?.en?.orderNo}
                          <br />
                          {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.orderNo}
                        </td>
                        <td>{printReceipt?.id}</td>
                      </tr>
                      <tr>
                        <td className="td_bg">
                          {invoiceDetails?.en?.txtDate}
                          <br />
                          {invoiceDetails?.is_multi_language && invoiceDetails?.ar?.txtDate}
                        </td>
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
                <div>{invoiceDetails?.en?.name}</div>
                <div>{invoiceDetails?.en?.email}</div>
                <div>{invoiceDetails?.en?.tell}</div>
                <div>{invoiceDetails?.en?.address}</div>
                <div>VAT Number: {invoiceDetails?.en?.vatNumber}</div>
              </div>
              <div className="right_up_of_table">
                <div>Billed To</div>
                <div>
                  {invoiceDetails?.en?.txtCustomer}{' '}
                  {invoiceDetails?.is_multi_language && invoiceDetails?.ar?.txtCustomer}
                </div>
                <div>{printReceipt?.customerName}</div>
              </div>
            </div>
            <br />

            <br />
            <table className="GeneratedTable2">
              <thead>
                <tr>
                  <th>
                    {invoiceDetails?.en?.txtItem} <br />
                    {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtItem}
                  </th>
                  <th>
                    {invoiceDetails?.en?.txtQty}
                    <br />
                    {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtQty}
                  </th>
                  <th>Unit Price</th>
                    <th colSpan={2}>
                    {' '}
                    {invoiceDetails?.en?.txtAmount}
                    <br />
                    {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtAmount}
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.perperdForA4Print(printReceipt?.tax_amount,printReceipt?.data[0]?.products)}
                <tr>
                  {/* <td>{invoiceDetails?.txtTax} {invoiceDetails?.en?.is_multi_language && invoiceDetails?.txtTax}</td> */}
                  <td colSpan={4} className="txt_bold_invoice">
                    Tax Amount 
                    {" "}
                    {invoiceDetails?.en?.is_multi_language && 'قيمة الضريبة'}
                  </td>
                  <td className="txt_bold_invoice">
                    {Number(printReceipt?.tax_amount).toFixed(locationSettings?.location_decimal_places)}
                  </td>
                </tr>
                <tr>
                  {/* <td>{invoiceDetails?.txtTax} {invoiceDetails?.en?.is_multi_language && invoiceDetails?.txtTax}</td> */}
                  <td colSpan={4} className="txt_bold_invoice">
                    Total Paid 
                    {" "}
                    {invoiceDetails?.en?.is_multi_language && 'إجمالى المدفوعات'}
                  </td>
                  <td className="txt_bold_invoice">
                    {Number(printReceipt?.paid).toFixed(locationSettings?.location_decimal_places)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="txt_bold_invoice">
                    {invoiceDetails?.en?.txtTotal}{' '}
                    {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtTotal}
                  </td>
                  <td className="txt_bold_invoice">
                    {Number(+printReceipt?.total_price - +printReceipt?.discount_amount).toFixed(
                      locationSettings?.location_decimal_places
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="txt_bold_invoice">
                    Total Due {invoiceDetails?.en?.is_multi_language && 'المتبقى'}
                  </td>
                  <td className="txt_bold_invoice">
                    {Number(printReceipt?.due) < 0
                      ? 0
                      : Number(printReceipt?.due).toFixed(
                          locationSettings?.location_decimal_places
                        )}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="recipt-footer">
              {invoiceDetails?.en?.footer}
              <br />
              {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.footer}
            </p>
            {/* <p className="recipt-footer">{formObj.notes}</p> */}
            <br />
          </div>
        </div>
      );
    }
    if (invoiceType === 'receipt') {
      return (
        <div className="bill">
          <div className="brand-logo">
            <img src={invoiceDetails?.en?.logo} />
          </div>
          <br />
          <div className="brand-name">{invoiceDetails?.en?.name}</div>
          <div className="shop-details">{invoiceDetails?.en?.tell}</div>
          <br />
          <div className="bill-details">
            <div className="flex justify-between">
              <div>
                {invoiceDetails?.en?.txtCustomer}{' '}
                {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtCustomer}
              </div>
              <div>{printReceipt?.customerName}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoiceDetails?.en?.orderNo}{' '}
                {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.orderNo}
              </div>
              <div>{printReceipt?.id}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoiceDetails?.en?.txtDate}{' '}
                {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtDate}
              </div>
              <div>{new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr className="header">
                <th>
                  {invoiceDetails?.en?.txtQty}
                  <br />
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtQty}
                </th>
                <th>
                  {invoiceDetails?.en?.txtItem}
                  <br />
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtItem}
                </th>
                <th></th>
                <th>
                  {invoiceDetails?.en?.txtAmount}
                  <br />
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtAmount}
                </th>
              </tr>
              {this.perperdForPrint(printReceipt?.tax_amount,printReceipt?.data[0]?.products)}
              <tr style={{ borderTop: '2px', height: '2px' }}></tr>
              <tr></tr>
              <tr className="net-amount">
                <td></td>
                <td>
                  {invoiceDetails?.en?.txtTax}{' '}
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtTax}
                </td>
                <td></td>
                <td>
                  {(+printReceipt?.tax_amount).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td>
                  {/* {invoiceDetails?.txtDiscount}
                {invoiceDetails?.en?.is_multi_language && invoiceDetails?.txtDiscount2} */}
                  {'Discount'} {invoiceDetails?.en?.is_multi_language && 'التخفيضات'}
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
                  {invoiceDetails?.en?.txtTotal}{' '}
                  {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.txtTotal}
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
                  {/* {invoiceDetails?.txtAmountpaid}{' '}
                {invoiceDetails?.en?.is_multi_language && invoiceDetails?.txtAmountpaid2} */}
                  Total Paid {invoiceDetails?.en?.is_multi_language && 'إجمالى المدفوعات'}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(printReceipt?.paid).toFixed(
                    this.props.locationSettings?.location_decimal_places
                  )}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {/* {invoiceDetails?.txtTotalDue}{' '}
                {invoiceDetails?.en?.is_multi_language && invoiceDetails?.txtTotalDue2} */}
                  Total Due {invoiceDetails?.en?.is_multi_language && 'المتبقى'}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(printReceipt?.due) < 0
                    ? 0
                    : Number(printReceipt?.due).toFixed(
                        this.props.locationSettings?.location_decimal_places
                      )}
                </td>
              </tr>
            </thead>
          </table>
          <p className="recipt-footer">
            {invoiceDetails?.en?.footer}
            <br />
            {invoiceDetails?.en?.is_multi_language && invoiceDetails?.ar?.footer}
          </p>
          {/* <p className="recipt-footer">{orderNote}</p> */}
          <br />
        </div>
      );
    }
  }
}
export default InvoiceToPrint;
