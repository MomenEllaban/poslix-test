import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { DigitalProvider } from 'src/modules/digital/_context/DigitalContext';
import DigitalCart from 'src/modules/digital/_views/DigitalCart';

const Products: NextPage = () => {
  const router = useRouter();
  const shopId = router.query.id;
  
  return (
    <DigitalProvider>
      {shopId !== undefined && <DigitalCart shopId={shopId} />}
    </DigitalProvider>
  );
};

export default Products;
