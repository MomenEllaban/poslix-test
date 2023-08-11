import { IUserBusiness } from '@models/auth.types';
import { ICurrency } from '@models/business.types';
import { type ICustomResponse } from '@models/global.types';
import { type AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
import api from 'src/utils/app-api';
import { authApi } from 'src/utils/auth-api';
import useSWR, { type SWRConfiguration } from 'swr';
type TServiceResponse<T> = AxiosResponse<ICustomResponse<T>>;

interface ICreateBusinessLocationPayload {
  name: string;
  state: string;
  currency_id: number | string;
  decimal: number;
  business_id: number | string;
}

const businessService = {
  getBusinesses: async () => {
    {
      const session = await getSession();

      return authApi(session)
        .get<any, TServiceResponse<IUserBusiness[]>, any>('/business')
        .then((data) => data.data);
    }
  },
  listBusinessTypes: async () => {
    const session = await getSession();

    return authApi(session)
      .get<any, TServiceResponse<IUserBusiness[]>, any>('/business/types')
      .then((data) => data.data);
  },
  createBusinessLocation: async (payload: ICreateBusinessLocationPayload) => {
    const session = await getSession();
    return authApi(session)
      .post('/business/locations', {
        ...payload,
      })
      .then((data) => data.data);
  },

  listCurrencies: async (params: { [x: string]: any }) => {
    const session = await getSession();

    return authApi(session)
      .get<any, TServiceResponse<ICurrency[]>, any>('/currencies', {
        params,
      })
      .then((data) => data.data);
  },
};

export const useBusinessList = (config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : '/business',
    businessService.getBusinesses,
    {
      ...config,
    }
  );

  return {
    businessList: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useCurrenciesList = (params?: { [x: string]: any }, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : '/currencies',
    () => businessService.listCurrencies(params),
    {
      ...config,
    }
  );

  return {
    currenciesList: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useBusinessTypesList = (config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : '/business/types',
    businessService.listBusinessTypes,
    {
      ...config,
    }
  );

  return {
    businessTypesList: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export default businessService;
