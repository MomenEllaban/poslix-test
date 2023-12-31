import React, { useEffect, useState } from 'react'
import { useReactToPrint } from 'react-to-print';

const ComponentToPrint = ({ printRef, printData }) => {
  const [printType, setPrintType] = useState<string>()
  // const printA4 = React.useRef(null);

  // class PrintInvoice extends React.PureComponent {
  //   render() {
  //     return printType === 'receipt' ? (
  //       <div className="bill">
  //         <div className="brand-logo">
  //           <img src={invoicDetails.logo} />
  //         </div>
  //         <br />
  //         <div className="brand-name">{invoicDetails.name}</div>
  //         <div className="shop-details">{invoicDetails.tell}</div>
  //         <br />
  //         <div className="bill-details">
  //           <div className="flex justify-between">
  //             <div>
  //               {invoicDetails.txtCustomer}{' '}
  //               {invoicDetails.isMultiLang && invoicDetails.txtCustomer2}
  //             </div>
  //             <div>{customer.label}</div>
  //           </div>
  //           <div className="flex justify-between">
  //             <div>
  //               {invoicDetails.orderNo} {invoicDetails.isMultiLang && invoicDetails.orderNo2}
  //             </div>
  //             <div>{orderId}</div>
  //           </div>
  //           <div className="flex justify-between">
  //             <div>
  //               {invoicDetails.txtDate} {invoicDetails.isMultiLang && invoicDetails.txtDate2}
  //             </div>
  //             <div>{new Date().toISOString().slice(0, 10)}</div>
  //           </div>
  //         </div>
  //         <table className="table">
  //           <thead>
  //             <tr className="header">
  //               <th>
  //                 {invoicDetails.txtQty}
  //                 <br />
  //                 {invoicDetails.isMultiLang && invoicDetails.txtQty2}
  //               </th>
  //               <th>
  //                 {invoicDetails.txtItem}
  //                 <br />
  //                 {invoicDetails.isMultiLang && invoicDetails.txtItem2}
  //               </th>
  //               <th></th>
  //               <th>
  //                 {invoicDetails.txtAmount}
  //                 <br />
  //                 {invoicDetails.isMultiLang && invoicDetails.txtAmount2}
  //               </th>
  //             </tr>
  //             {perperdForPrint()}
  //             <tr className="net-amount">
  //               <td></td>
  //               <td>
  //                 {invoicDetails.txtTax} {invoicDetails.isMultiLang && invoicDetails.txtTax2}
  //               </td>
  //               <td></td>
  //               <td>
  //                 {(totalAmount - subTotal).toFixed(locationSettings?.location_decimal_places)}
  //               </td>
  //             </tr>
  //             <tr className="net-amount">
  //               <td></td>
  //               <td>
  //                 {invoicDetails.txtDiscount}{' '}
  //                 {invoicDetails.isMultiLang && invoicDetails.txtDiscount2}
  //               </td>
  //               <td></td>
  //               <td>{totalDiscount.toFixed(locationSettings?.location_decimal_places)}</td>
  //             </tr>
  //             <tr className="net-amount">
  //               <td></td>
  //               <td className="txt-bold">
  //                 {invoicDetails.txtTotal} {invoicDetails.isMultiLang && invoicDetails.txtTotal2}
  //               </td>
  //               <td></td>
  //               <td className="txt-bold">
  //                 {Number(__WithDiscountFeature__total + (totalAmount - subTotal)).toFixed(
  //                   locationSettings?.location_decimal_places
  //                 )}
  //               </td>
  //             </tr>
  //             <tr className="net-amount">
  //               <td></td>
  //               <td className="txt-bold">
  //                 {invoicDetails.txtAmountpaid}{' '}
  //                 {invoicDetails.isMultiLang && invoicDetails.txtAmountpaid2}
  //               </td>
  //               <td></td>
  //               <td className="txt-bold">
  //                 {amount && Number(totalPaid).toFixed(locationSettings?.location_decimal_places)}
  //               </td>
  //             </tr>
  //             <tr className="net-amount">
  //               <td></td>
  //               <td className="txt-bold">
  //                 {invoicDetails.txtTotalDue}{' '}
  //                 {invoicDetails.isMultiLang && invoicDetails.txtTotalDue2}
  //               </td>
  //               <td></td>
  //               <td className="txt-bold">
  //                 {Number(
  //                   __WithDiscountFeature__total + (totalAmount - subTotal) - (amount && totalPaid)
  //                 ) > 0
  //                   ? Number(
  //                       __WithDiscountFeature__total +
  //                         +(totalAmount - subTotal) -
  //                         (amount && totalPaid)
  //                     ).toFixed(locationSettings?.location_decimal_places)
  //                   : 0}
  //               </td>
  //             </tr>
  //           </thead>
  //         </table>
  //         <p className="recipt-footer">
  //           {invoicDetails.footer}
  //           {invoicDetails.isMultiLang && invoicDetails.footer2}
  //         </p>
  //         <p className="recipt-footer">{orderNote}</p>
  //         <br />
  //       </div>
  //     ) : (
  //       <div className="appear-body-item a4">
  //         <div className="bill2">
  //           <div className="brand-logo">
  //             <img src={invoicDetails.logo} />
  //             <div className="invoice-print">
  //               INVOICE
  //               <div>
  //                 <table className="GeneratedTable">
  //                   <tbody>
  //                     <tr>
  //                       <td className="td_bg">INVOICE NUMBER </td>
  //                       <td>
  //                         <div>
  //                           {invoicDetails.orderNo}{' '}
  //                           {invoicDetails.isMultiLang && invoicDetails.orderNo2}
  //                         </div>
  //                         <div>{orderId}</div>
  //                       </td>
  //                     </tr>
  //                     <tr>
  //                       <td className="td_bg">INVOICE DATE </td>
  //                       <td>{new Date().toISOString().slice(0, 10)}</td>
  //                     </tr>
  //                   </tbody>
  //                 </table>
  //               </div>
  //             </div>
  //           </div>
  //           <br />
  //           <div className="up_of_table flex justify-between">
  //             <div className="left_up_of_table">
  //               <div>Billed From</div>
  //               <div>{invoicDetails.name}</div>
  //               <div>info@poslix.com</div>
  //               <div>{invoicDetails.tell}</div>
  //               <div>Office 21-22, Building 532, Mazoon St. Muscat, Oman</div>
  //               <div>VAT Number: OM1100270001</div>
  //             </div>
  //             <div className="right_up_of_table">
  //               <div>Billed To</div>
  //               <div>{customer.label}</div>
  //               {/* <span>Billed To</span> */}
  //             </div>
  //           </div>
  //           <br />

  //           <table className="GeneratedTable2">
  //             <thead>
  //               <tr>
  //                 <th>Description</th>
  //                 <th>
  //                   {' '}
  //                   {invoicDetails.txtQty}
  //                   <br />
  //                   {invoicDetails.isMultiLang && invoicDetails.txtQty2}
  //                 </th>
  //                 <th>Unit Price</th>
  //                 {/* <th> {invoicDetails.txtItem}<br />{invoicDetails.isMultiLang && invoicDetails.txtItem2}</th> */}
  //                 <th>Tax</th>
  //                 <th>
  //                   {' '}
  //                   {invoicDetails.txtAmount}
  //                   <br />
  //                   {invoicDetails.isMultiLang && invoicDetails.txtAmount2}
  //                 </th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               <tr>
  //                 {/* <td>{invoicDetails.txtTax} {invoicDetails.isMultiLang && invoicDetails.txtTax2}</td> */}
  //                 <td colSpan={4} className="txt_bold_invoice">
  //                   Sub Total
  //                 </td>
  //                 <td>
  //                   {Number(__WithDiscountFeature__total + (totalAmount - subTotal)).toFixed(
  //                     locationSettings?.location_decimal_places
  //                   )}
  //                 </td>
  //               </tr>
  //               <tr>
  //                 <td colSpan={4} className="txt_bold_invoice">
  //                   Total
  //                 </td>
  //                 <td className="txt_bold_invoice">
  //                   {Number(__WithDiscountFeature__total + (totalAmount - subTotal)).toFixed(
  //                     locationSettings?.location_decimal_places
  //                   )}
  //                 </td>
  //               </tr>
  //               <tr>
  //                 <td colSpan={4} className="txt_bold_invoice">
  //                   Total Due
  //                 </td>
  //                 <td className="txt_bold_invoice">
  //                   {Number(
  //                     __WithDiscountFeature__total +
  //                       (totalAmount - subTotal) -
  //                       (amount && totalPaid)
  //                   ) > 0
  //                     ? Number(
  //                         __WithDiscountFeature__total +
  //                           +(totalAmount - subTotal) -
  //                           (amount && totalPaid)
  //                       ).toFixed(locationSettings?.location_decimal_places)
  //                     : 0}
  //                 </td>
  //               </tr>
  //             </tbody>
  //           </table>
  //           <p className="recipt-footer">
  //             {invoicDetails.footer}
  //             {invoicDetails.isMultiLang && invoicDetails.footer2}
  //           </p>
  //           {/* <p className="recipt-footer">{formObj.notes}</p> */}
  //           <br />
  //         </div>
  //       </div>
  //     );
  //   }
  // }

  useEffect(() => {
    localStorage.getItem('printType')
      ? setPrintType(localStorage.getItem('printType'))
      : setPrintType('receipt')
  })
  return (
    <div style={{ display: 'none' }}>
      {/* <PrintInvoice ref={printRef} /> */}
    </div>
  )
}

export default ComponentToPrint