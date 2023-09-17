import { ILocationSettings } from '@models/common-model';
import React from 'react';

class SalesReportToPrint extends React.PureComponent<{
  selectRow: Record<any, any>;
  lines: Array<any>;
  locationSettings: ILocationSettings;
  invoicDetails: any;
}> {
  render() {
    const { selectRow, invoicDetails, lines, locationSettings } = this.props;
    if (!selectRow) return;
    return (
      <div className="bill">
        <div className="brand-logo">
          <img src={invoicDetails.logo} />
        </div>
        <br />
        <div className="brand-name">{invoicDetails.name}</div>
        <div className="shop-details">{invoicDetails.tell}</div>
        <br />
        <div className="bill-details">
          <div className="flex justify-between">
            <div>
              {invoicDetails.txtCustomer} {invoicDetails.isMultiLang && invoicDetails.txtCustomer2}
            </div>
            <div>{selectRow.customer_name}</div>
          </div>
          <div className="flex justify-between">
            <div>
              {invoicDetails.orderNo} {invoicDetails.isMultiLang && invoicDetails.orderNo2}
            </div>
            <div>{selectRow.id}</div>
          </div>
          <div className="flex justify-between">
            <div>
              {invoicDetails.txtDate} {invoicDetails.isMultiLang && invoicDetails.txtDate2}
            </div>
            <div>{new Date().toISOString().slice(0, 10)}</div>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr className="header">
              <th>
                {invoicDetails.txtQty}
                <br />
                {invoicDetails.isMultiLang && invoicDetails.txtQty2}
              </th>
              <th>
                {invoicDetails.txtItem}
                <br />
                {invoicDetails.isMultiLang && invoicDetails.txtItem2}
              </th>
              <th></th>
              <th>
                {invoicDetails.txtAmount}
                <br />
                {invoicDetails.isMultiLang && invoicDetails.txtAmount2}
              </th>
            </tr>
            {lines &&
              lines.map((line: any, index: number) => {
                return (
                  <tr key={index}>
                    <td>{Number(line.qty)}</td>
                    <td>{line.name}</td>
                    <td></td>
                    <td>{line.price}</td>
                  </tr>
                );
              })}
            <tr className="net-amount">
              <td></td>
              <td>
                {invoicDetails.txtTax} {invoicDetails.isMultiLang && invoicDetails.txtTax2}
              </td>
              <td></td>
              {/* <td>{(selectRow.total_price).toFixed(locationSettings?.location_decimal_places)}</td> */}
            </tr>
            <tr className="net-amount">
              <td></td>
              <td className="txt-bold">
                {invoicDetails.txtTotal} {invoicDetails.isMultiLang && invoicDetails.txtTotal2}
              </td>
              <td></td>
              <td className="txt-bold">
                {Number(selectRow.total_price).toFixed(locationSettings?.location_decimal_places)}
              </td>
            </tr>
          </thead>
        </table>
        <p className="recipt-footer">
          {invoicDetails.footer}
          {invoicDetails.isMultiLang && invoicDetails.footer2}
        </p>
        <p className="recipt-footer">{selectRow.notes}</p>
        <br />
      </div>
    );
  }
}
export default SalesReportToPrint;
