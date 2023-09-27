import React from 'react';
import BarcodeGenerator from 'src/components/dashboard/BarcodeGenerator';
import { useUser } from 'src/context/UserContext';

const BarcodeItems = ({ selectedProducts, options }) => {
  const { locationSettings } = useUser();

  return (
    <div>
      {selectedProducts.map((sp) => {
        const items = [];
        for (let i = 0; i < sp.quantity; i++) {
          items.push(
            <div key={`${sp.sku}-${i}`} style={{ height: '120px' }}>
              {options.businessName && (
                <h6 style={{ textAlign: 'center', fontSize: '20px' }}>
                  {locationSettings.location_name}
                </h6>
              )}
              {options.name && <h6 style={{ textAlign: 'center', fontSize: '20px' }}>{sp.name}</h6>}
              {options.price && (
                <h6 style={{ textAlign: 'center', fontSize: '20px' }}>
                  {Number(sp.price).toFixed(locationSettings?.location_decimal_places)}{' '}
                  {locationSettings?.currency_code}
                </h6>
              )}
              {options.category && (
                <h6 style={{ textAlign: 'center', fontSize: '20px' }}>{sp.category}</h6>
              )}
              <div style={{ textAlign: 'center' }}>
                <BarcodeGenerator sku={sp.sku} />
              </div>
            </div>
          );
        }
        return items;
      })}
    </div>
  );
};

export default class BarcodeToPrint extends React.PureComponent<{
  options: any;
  selected: any[];
}> {
  render() {
    const { options, selected } = this.props;
    return <BarcodeItems options={options} selectedProducts={selected} />;
  }
}
