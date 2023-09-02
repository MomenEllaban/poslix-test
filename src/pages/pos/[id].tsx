import { ICustomer, ITax } from '@models/pos.types';
import type { NextPage } from 'next';
import { useCallback, useLayoutEffect, useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import withAuth from 'src/HOCs/withAuth';
import { useProducts } from 'src/context/ProductContext';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import PosCart from 'src/modules/pos/PosCart';
import PosLoader from 'src/modules/pos/_components/PosLoader';
import PosLayout from 'src/modules/pos/_components/layout/pos.layout';
import { OpenRegisterView } from 'src/modules/pos/_views/open-register.view';
import { selectPos, setPosRegister } from 'src/redux/slices/pos.slice';
import { useGetBusinessLocation } from 'src/services/business.service';
import {
  useBrandsList,
  useCategoriesList,
  useCustomersList,
  useProductsList,
  useTaxesList,
} from 'src/services/pos.service';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

interface IRegister {
  state: 'open' | 'close';
  hand_cash: number;
}

const Home: NextPage = ({ shopId: _id }: any) => {
  const pos = useAppSelector(selectPos);
  const dispatch = useAppDispatch();

  const [shopId, setShopId] = useState(_id);
  const [isLoading, setIsLoading] = useState(false);

  const { setLocationSettings } = useUser();
  const { setCats, setBrands, setProducts, setCustomers, setTaxes, setTaxGroups } = useProducts();

  useGetBusinessLocation(shopId, {
    onSuccess(data) {
      setLocationSettings(data?.result ?? {});
    },
  });

  useCustomersList(shopId, {
    onSuccess(data) {
      const _customers = data?.result?.map((el: ICustomer) => ({
        ...el,
        value: el.id,
        label: `${el.first_name} ${el.last_name} | ${el.mobile}`,
        isNew: false,
      }));
      setCustomers(_customers);
    },
  });

  useProductsList(shopId, {
    onSuccess(data) {
      const _products = data?.result?.data;
      setProducts(_products);
    },
  });

  useCategoriesList(shopId, {
    onSuccess(data) {
      const _cats = data?.result;
      setCats(_cats);
    },
  });

  useTaxesList(shopId, {
    onSuccess(data) {
      const _taxes = data?.result?.taxes as ITax;
      setTaxes(_taxes);
      setTaxGroups(data?.result?.tax_group);
    },
  });

  useBrandsList(shopId, {
    onSuccess(data) {
      const _brands = data?.result;
      setBrands(_brands);
    },
  });

  // async function initData() {
  //   const { success, data } = await apiFetchCtr({
  //     fetch: 'pos',
  //     subType: 'getPosInit',
  //     shopId,
  //   });
  //   if (!success) {
  //     Toastify('error', 'error..Try Again');
  //     return;
  //   }

  //   setVariations(data.variations);
  //   setPackageItems(data.packageItems);
  //   setTailoringExtras(data.tailoring_extras);

  //   setTailoringSizes(data.AllSizes);
  //   if (data.invoiceDetails != null && data.invoiceDetails.length > 10)
  //     setInvoicDetails(JSON.parse(data.invoiceDetails));
  //   else {
  //   }
  //   const _locs = JSON.parse(localStorage.getItem('userlocs') || '[]');
  //   if (_locs.toString().length > 10)
  //     setLocationSettings(_locs[_locs.findIndex((loc: any) => loc?.value == shopId)] ?? {});
  //   else Toastify('error', 'errorr location settings');

  //   setIsLoading(false);
  //   if (data.cash.length > 0 && data.cash[0].status == 'open') {
  //     setIsOpenRegister(true);
  //     setIsLoading(false);
  //   }
  // }

  useLayoutEffect(() => {
    const registerObject = getLocalStorage<IRegister>(ELocalStorageKeys.POS_REGISTER_STATE);
    dispatch(setPosRegister(registerObject));
  }, []);

  const StepRender = useCallback(() => {
    if (isLoading) return <PosLoader />;

    if (pos?.register?.state === 'open') return <PosCart shopId={shopId} />;

    return <OpenRegisterView shopId={shopId} setShopId={setShopId} setIsLoading={setIsLoading} />;
  }, [isLoading, pos, shopId, setIsLoading, dispatch]);

  return (
    <PosLayout>
      <StepRender />
    </PosLayout>
  );
};

export default withAuth(Home);

export async function getServerSideProps(context: any) {
  return {
    props: {
      shopId: context.query.id,
      rules: { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true },
    },
  };
}
