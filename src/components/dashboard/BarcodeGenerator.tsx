import React from 'react';
import Barcode from 'react-barcode';

const BarcodeGenerator = ({ sku, fontSize = 10 }) => {
  return (
    <div>
      <Barcode value={sku + ''} height={30} width={3} fontSize={fontSize} />
    </div>
  );
};

export default BarcodeGenerator;
