import { IUserBusiness } from '@models/auth.types';
import { ILocationSettings, ITailoringExtra } from '@models/common-model';
import { defaultInvoiceDetials } from '@models/data';
import { ICustomResponse } from '@models/global.types';
import { AxiosResponse } from 'axios';
import { setCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import { UserContext } from 'src/context/UserContext';
import { getToken, getUserData } from 'src/libs/loginlib';
import { api } from 'src/utils/app-api';
import { ELocalStorageKeys } from 'src/utils/app-contants';

const initialLocationState = {
  value: 0,
  label: '',
  currency_decimal_places: 0,
  currency_code: '',
  currency_id: 0,
  currency_rate: 1,
  currency_symbol: '',
};

export default function UserProvider({ children }) {
  const [user, setUser] = useState<any>({});

  const [tailoringSizes, setTailoringSizes] = useState([]);
  const [tailoringExtras, setTailoringExtras] = useState<ITailoringExtra[]>();
  const [invoicDetails, setInvoicDetails] = useState<any>(defaultInvoiceDetials);
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>(initialLocationState);

  const userContext = {
    user,
    setUser,
    locationSettings,
    setLocationSettings,
    tailoringSizes,
    setTailoringSizes,
    invoicDetails,
    setInvoicDetails,
    tailoringExtras,
    setTailoringExtras,
  };

  useEffect(() => {
    const user = getUserData();
    console.log('I am in the provider', user);
    if (user) {
      setCookie(ELocalStorageKeys.TOKEN_COOKIE, getToken() ?? '');
      setUser(user);
      getBusiness();
    }
  }, []);

  return <UserContext.Provider value={userContext}>{children}</UserContext.Provider>;
}

async function getBusiness() {
  const { data } = await api.get<any, AxiosResponse<ICustomResponse<IUserBusiness>>, any>(
    '/business'
  );

  const { success, result } = data;
  const { locations } = result;
  localStorage.setItem(ELocalStorageKeys.USER_LOCATIONS, JSON.stringify(locations));
}
