import { IUserBusiness } from '@models/auth.types';
import { ILocationSettings, ITailoringExtra } from '@models/common-model';
import { setCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import { UserContext } from 'src/context/UserContext';
import authService from 'src/services/auth.service';
import api from 'src/utils/app-api';
import { ELocalStorageKeys } from 'src/utils/app-contants';

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

  useEffect(() => {
    // Load user data and initialize context values
    const initializeUserContext = async () => {
      try {
        const userData = authService.getUserData();
        console.log('User data from getUserData:', userData);
        if (userData) {
          setCookie(ELocalStorageKeys.TOKEN_COOKIE, authService.getToken() ?? '');
          setUser(userData);
          await getBusiness();
        }
      } catch (error) {
        console.error('Error initializing user context:', error);
      }
    };

    initializeUserContext();
  }, []);

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

  return (
    <UserContext.Provider value={userContext}>
      {/* Render child components */}
      {children}
    </UserContext.Provider>
  );
}

async function getBusiness() {
  console.log('THIS IS INSIDE GET BUSINESS');
  try {
    const { data } = await api.get<BusinessResponse | BusinessError>('/business');

    if ('result' in data && data.result.locations) {
      const { locations } = data.result;
      window.localStorage.setItem(ELocalStorageKeys.USER_LOCATIONS, JSON.stringify(locations));
    } else {
      console.error('Invalid business data response:', data);
    }
  } catch (error) {
    console.error('Error fetching business data:', error);
  }
}
