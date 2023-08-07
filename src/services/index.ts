import { IUserBusiness } from '@models/auth.types';
import { ICurrency } from '@models/business.types';
import { type ICustomResponse } from '@models/global.types';
import { type AxiosResponse } from 'axios';
import { api } from 'src/utils/app-api';
import useSWR, { type SWRConfiguration } from 'swr';
type TServiceResponse<T> = AxiosResponse<ICustomResponse<T>>;

const services = {
  getBusinesses: () =>
    api.get<any, TServiceResponse<IUserBusiness[]>, any>('/business').then((data) => data.data),

  getCurrencies: () =>
    api.get<any, TServiceResponse<ICurrency[]>, any>('/currencies').then((data) => data.data),
};

export const useBusinessList = (config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : '/business',
    services.getBusinesses,
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
    services.getCurrencies,
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

export default services;
