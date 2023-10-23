import { type ICustomResponse } from '@models/global.types';
import { ISupplier } from '@models/suppliers.types';
import { type AxiosResponse } from 'axios';
import api from 'src/utils/app-api';
import useSWR, { type SWRConfiguration } from 'swr';
type TServiceResponse<T> = AxiosResponse<ICustomResponse<T>>;

const suppliersServices = {
  getSuppliers: async (location_id: string) =>
    api
      .get<any, TServiceResponse<ISupplier[]>, any>(`/suppliers/${location_id}`)
      .then((data) => data.data),
};

export const useSuppliersList = (location_id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/suppliers/${location_id}`,
    () => suppliersServices.getSuppliers(location_id),
    { ...config }
  );

  return {
    suppliersList: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};
