import { IUserBusiness } from '@models/auth.types';
import { type ICustomResponse } from '@models/global.types';
import { type AxiosResponse } from 'axios';
import { api } from 'src/utils/app-api';
import useSWR from 'swr';
type TServiceResponse<T> = AxiosResponse<ICustomResponse<T>>;

const services = {
  getBusinesses: () =>
    api.get<any, TServiceResponse<IUserBusiness>, any>('/business').then((data) => data.data),
};

export const useBusinessList = (config) => {
  
  const { data, error, isLoading, mutate } = useSWR('/business', services.getBusinesses, {
    ...config,
  });

  return {
    businessList: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export default services;
