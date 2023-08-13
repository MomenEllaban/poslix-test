'use client';
import { IUserBusiness } from '@models/auth.types';
import { ILocationSettings, ITailoringExtra } from '@models/common-model';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { UserContext } from 'src/context/UserContext';
import { ROUTES } from 'src/utils/app-routes';

interface BusinessResponse {
  success: boolean;
  result: {
    locations: IUserBusiness[];
  };
}

interface BusinessError {
  error: string;
}

// Initial state for location settings
const initialLocationState: ILocationSettings = {
  value: 0,
  label: '',
  currency_decimal_places: 0,
  currency_code: '',
  currency_id: 0,
  currency_rate: 1,
  currency_symbol: '',
};

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>({});
  const [tailoringSizes, setTailoringSizes] = useState<string[]>([]);
  const [tailoringExtras, setTailoringExtras] = useState<ITailoringExtra[]>([]);
  const [invoicDetails, setInvoicDetails] = useState<any>({});
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>(initialLocationState);
  const router = useRouter();
  // useEffect(() => {
  //   // Load user data and initialize context values
  //   const initializeUserContext = async () => {
  //     try {
  //       const userData = authService.getUserData();
  //       console.log('User data from getUserData:', userData);
  //       if (userData) {
  //         setCookie(ELocalStorageKeys.TOKEN_COOKIE, authService.getToken() ?? '');
  //         setUser(userData);
  //         await getBusiness();
  //       }
  //     } catch (error) {
  //       console.error('Error initializing user context:', error);
  //     }
  //   };

  //   initializeUserContext();
  // }, []);

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
    getSession().then((session) => {
      if (session) {
        setUser(session.user);
        // setCookie(ELocalStorageKeys.TOKEN_COOKIE, authService.getToken() ?? '');
        // getBusiness();
      } else {
        // setUser({});
        // window.location.href = ROUTES.AUTH;
        router.replace(ROUTES.AUTH);
      }
    });
  }, []);

  return (
    <UserContext.Provider value={userContext}>
      {/* Render child components */}
      {children}
    </UserContext.Provider>
  );
}
