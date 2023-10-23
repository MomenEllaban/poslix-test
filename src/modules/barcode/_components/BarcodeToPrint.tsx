import { IProduct } from '@models/pos.types';
import React from 'react';
import { Table } from 'react-bootstrap';
import BarcodeGenerator from 'src/components/dashboard/BarcodeGenerator';
import { useUser } from 'src/context/UserContext';

interface IProductSelect extends IProduct {
  value: number;
  label: string;
  quantity: number;
}
const BarcodeItems = ({ selectedProducts, options }) => {
  const { locationSettings } = useUser();

  return (
    <div>
      {selectedProducts.map((sp: IProductSelect) => {
        const _repeated = [];
        for (let i = 0; i < sp.quantity; i++) {
          _repeated.push(
            <div
              key={`${sp.sku}-product-barcode`}
              className="d-flex p-5 flex-column justify-content-center align-items-center">
              <div className="flex flex-column border">
                {options.businessName && (
                  <h6 style={{ fontSize: '16px' }}>{locationSettings.location_name}</h6>
                )}

                {options.name && <h6 style={{ fontSize: '16px' }}>{sp.name}</h6>}
                {options.price && (
                  <h6 style={{ fontSize: '16px' }}>
                    {' '}
                    {(+sp.sell_price).toFixed(locationSettings?.location_decimal_places)}{' '}
                    {locationSettings?.currency_code}
                  </h6>
                )}
                {options.category && <h6 style={{ fontSize: '16px' }}>{sp?.category?.name}</h6>}
              </div>
              <div style={{ textAlign: 'center' }}>
                <BarcodeGenerator sku={sp.sku} fontSize={16} />
              </div>
            </div>
          );
        }
        return _repeated;
      })}
    </div>
  );
};

export default class BarcodeToPrint extends React.PureComponent<{
  options: any;
  selected: IProductSelect[];
}> {
  render() {
    const { options, selected } = this.props;
    return <BarcodeItems options={options} selectedProducts={selected} />;
  }
}
