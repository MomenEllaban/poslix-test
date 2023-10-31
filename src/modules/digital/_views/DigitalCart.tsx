import { useEffect, useState } from 'react';
import { DigitalNavbar } from 'src/components/digital/digital-navbar';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import DigitalProducts from './products/DigitalProducts';

export default function DigitalCart({ shopId }) {
  return (
    <>
      <DigitalNavbar shopId={shopId} />
      <DigitalProducts shopId={shopId} />
    </>
  );
}
