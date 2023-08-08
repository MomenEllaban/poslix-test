import { IUserBusiness } from '@models/auth.types';
import { type ICustomResponse } from '@models/global.types';
import { type AxiosResponse } from 'axios';
import api from 'src/utils/app-api';
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
  getBusinesses: async () =>
    api.get<any, TServiceResponse<IUserBusiness[]>, any>('/business').then((data) => data.data),

  createBusinessLocation: async (payload: ICreateBusinessLocationPayload) =>
    api
      .post('/business/locations', {
        ...payload,
      })
      .then((data) => data.data),
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

export default businessService;
