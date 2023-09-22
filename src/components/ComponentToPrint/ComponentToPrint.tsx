import React, { useEffect, useState } from 'react'
import { useReactToPrint } from 'react-to-print';

const ComponentToPrint = ({ printRef, printData }) => {
  const [printType, setPrintType] = useState<string>()

  class PrintInvoice extends React.PureComponent {
    render() {
      return printType === 'receipt' ? (
        <div className="bill">
          <div className="brand-logo">
            <img src={printData.logo} />
          </div>
          <br />
          <div className="brand-name">{printData.name}</div>
          <div className="shop-details">{printData.tell}</div>
          <br />
          <div className="bill-details">
            <div className="flex justify-between">
              <div>
                {printData.txtCustomer}{' '}
                {printData.isMultiLang && printData.txtCustomer2}
              </div>
              <div>{printData.customer.label}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {printData.orderNo} {printData.isMultiLang && printData.orderNo2}
              </div>
              <div>{orderId}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {printData.txtDate} {printData.isMultiLang && printData.txtDate2}
              </div>
              <div>{new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr className="header">
                <th>
                  {printData.txtQty}
                  <br />
                  {printData.isMultiLang && printData.txtQty2}
                </th>
                <th>
                  {printData.txtItem}
                  <br />
                  {printData.isMultiLang && printData.txtItem2}
                </th>
                <th></th>
                <th>
                  {printData.txtAmount}
                  <br />
                  {printData.isMultiLang && printData.txtAmount2}
                </th>
              </tr>
              {perperdForPrint()}
              <tr className="net-amount">
                <td></td>
                <td>
                  {printData.txtTax} {printData.isMultiLang && printData.txtTax2}
                </td>
                <td></td>
                <td>
                  {(totalAmount - subTotal).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td>
                  {printData.txtDiscount}{' '}
                  {printData.isMultiLang && printData.txtDiscount2}
                </td>
                <td></td>
                <td>{totalDiscount.toFixed(locationSettings?.location_decimal_places)}</td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {printData.txtTotal} {printData.isMultiLang && printData.txtTotal2}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(__WithDiscountFeature__total + (totalAmount - subTotal)).toFixed(
                    locationSettings?.location_decimal_places
                  )}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {printData.txtAmountpaid}{' '}
                  {printData.isMultiLang && printData.txtAmountpaid2}
                </td>
                <td></td>
                <td className="txt-bold">
                  {amount && Number(totalPaid).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {printData.txtTotalDue}{' '}
                  {printData.isMultiLang && printData.txtTotalDue2}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(
                    __WithDiscountFeature__total + (totalAmount - subTotal) - (amount && totalPaid)
                  ) > 0
                    ? Number(
                        __WithDiscountFeature__total +
                          +(totalAmount - subTotal) -
                          (amount && totalPaid)
                      ).toFixed(locationSettings?.location_decimal_places)
                    : 0}
                </td>
              </tr>
            </thead>
          </table>
          <p className="recipt-footer">
            {printData.footer}
            {printData.isMultiLang && printData.footer2}
          </p>
          <p className="recipt-footer">{orderNote}</p>
          <br />
        </div>
      ) : (
        <div className="appear-body-item a4">
          <div className="bill2">
            <div className="brand-logo">
              <img src={printData.logo} />
              <div className="invoice-print">
                INVOICE
                <div>
                  <table className="GeneratedTable">
                    <tbody>
                      <tr>
                        <td className="td_bg">INVOICE NUMBER </td>
                        <td>
                          <div>
                            {printData.orderNo}{' '}
                            {printData.isMultiLang && printData.orderNo2}
                          </div>
                          <div>{orderId}</div>
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
                <div>{printData.name}</div>
                <div>info@poslix.com</div>
                <div>{printData.tell}</div>
                <div>Office 21-22, Building 532, Mazoon St. Muscat, Oman</div>
                <div>VAT Number: OM1100270001</div>
              </div>
              <div className="right_up_of_table">
                <div>Billed To</div>
                <div>{customer.label}</div>
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
                    {printData.txtQty}
                    <br />
                    {printData.isMultiLang && printData.txtQty2}
                  </th>
                  <th>Unit Price</th>
                  {/* <th> {printData.txtItem}<br />{printData.isMultiLang && printData.txtItem2}</th> */}
                  <th>Tax</th>
                  <th>
                    {' '}
                    {printData.txtAmount}
                    <br />
                    {printData.isMultiLang && printData.txtAmount2}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* <td>{printData.txtTax} {printData.isMultiLang && printData.txtTax2}</td> */}
                  <td colSpan={4} className="txt_bold_invoice">
                    Sub Total
                  </td>
                  <td>
                    {Number(__WithDiscountFeature__total + (totalAmount - subTotal)).toFixed(
                      locationSettings?.location_decimal_places
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="txt_bold_invoice">
                    Total
                  </td>
                  <td className="txt_bold_invoice">
                    {Number(__WithDiscountFeature__total + (totalAmount - subTotal)).toFixed(
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
                        (totalAmount - subTotal) -
                        (amount && totalPaid)
                    ) > 0
                      ? Number(
                          __WithDiscountFeature__total +
                            +(totalAmount - subTotal) -
                            (amount && totalPaid)
                        ).toFixed(locationSettings?.location_decimal_places)
                      : 0}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="recipt-footer">
              {printData.footer}
              {printData.isMultiLang && printData.footer2}
            </p>
            {/* <p className="recipt-footer">{formObj.notes}</p> */}
            <br />
          </div>
        </div>
      );
    }
  }

  useEffect(() => {
    localStorage.getItem('printType')
      ? setPrintType(localStorage.getItem('printType'))
      : setPrintType('receipt')
  })
  return (
    <div style={{ display: 'none' }}>
      <PrintInvoice ref={printRef} />
    </div>
  )
}

export default ComponentToPrint