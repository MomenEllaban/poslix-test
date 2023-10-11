import { ICustomer, ITax } from '@models/pos.types';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import withAuth from 'src/HOCs/withAuth';
import { useProducts } from 'src/context/ProductContext';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { Toastify } from 'src/libs/allToasts';
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
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

interface IRegister {
  state: 'open' | 'close';
  hand_cash: number;
}

const Home: NextPage = ({ shopId: _id }: any) => {
  const { setCats, setBrands, setProducts, setCustomers, setTaxes, setTaxGroups } = useProducts();
  const { setLocationSettings } = useUser();
  const pos = useAppSelector(selectPos);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [shopId, setShopId] = useState(_id);
  const [isLoading, setIsLoading] = useState(false);

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

  //   setIsLoading(false);
  //   if (data.cash.length > 0 && data.cash[0].status == 'open') {
  //     setIsOpenRegister(true);
  //     setIsLoading(false);
  //   }
  // }

  const StepRender = useCallback(() => {
    if (isLoading) return <PosLoader />;
    if (pos?.register?.status === 'open') return <PosCart shopId={shopId} />;
    return <OpenRegisterView shopId={shopId} setShopId={setShopId} />;
  }, [isLoading, pos, shopId, setIsLoading, dispatch]);

  // useLayoutEffect(() => {
  // const registerObject = getLocalStorage<IRegister>(ELocalStorageKeys.POS_REGISTER_STATE);
  //   dispatch(setPosRegister(registerObject));
  // }, []);

  const handleCheckRegister = () => {
    setIsLoading(true);
    api
      .get(`reports/latest-register/${shopId}?all_data=1`)
      .then(({ data }) => {
        return data.result.data[0];
      })
      .then((registerObject) => {
        const checkPos: any = getLocalStorage<{ hand_cash: number; state: string }>(
          ELocalStorageKeys.POS_REGISTER_STATE
        );
        if (checkPos?.status === 'open' || checkPos?.register?.status === 'open')
          registerObject.status = 'open';
        dispatch(setPosRegister(registerObject));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions')).filter(
      (loc) => loc.id == router.query.id
    );
    console.log(perms);
    if (!perms[0]?.permissions?.length) {
      Toastify('error', "You don't have access to this page!");
      router.replace(`/shop/${_id}/`);
    } else handleCheckRegister();
  }, [_id]);

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
