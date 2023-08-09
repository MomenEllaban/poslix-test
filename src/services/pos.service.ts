import { type AxiosResponse } from 'axios';
import { type ICustomResponse } from '@models/global.types';
import { ICategory, IProduct } from '@models/pos.types';
import api from 'src/utils/app-api';
import useSWR, { type SWRConfiguration } from 'swr';
type TServiceResponse<T> = AxiosResponse<ICustomResponse<T>>;

interface ICreateCategoryPayload extends Partial<ICategory> {
  name: string;
  description: string;
}

interface IUpdateCategoryPayload extends Partial<ICategory> {}

interface ICreateProductPayload extends Partial<IProduct> {
  name: string;
  category_id: number;
  location_id: number;
  type: 'single' | 'variable' | 'package' | 'tailoring_package';
  is_service: boolean | number;
  is_fabric: boolean | number;
  unit_id: number;
  never_tax: boolean | number;
  sku: string;
  barcode_type: 'C128' | 'C39' | 'C93' | 'EAN8' | 'EAN13' | 'UPCA' | 'UPCE';
  sell_price: number | string;
  cost_price: number | string;
}

interface IUpdateProductPayload extends Partial<IProduct> {}

const posSetvice = {
  getCategories: async () =>
    api.get<any, TServiceResponse<ICategory[]>, any>('/categories').then((data) => data.data),
  getCategory: async (id: string) =>
    api.get<any, TServiceResponse<ICategory>, any>(`/categories/${id}`).then((data) => data.data),
  createCategory: async (payload: ICreateCategoryPayload) =>
    api.post('/categories', payload).then((data) => data.data),
  updateCategory: async (id: string, payload: IUpdateCategoryPayload) =>
    api.put(`/categories/${id}`, payload).then((data) => data.data),
  deleteCategory: async (id: string) => api.delete(`/categories/${id}`).then((data) => data.data),

  getProducts: async () =>
    api.get<any, TServiceResponse<IProduct[]>, any>('/products').then((data) => data.data),
  getProduct: async (id: string) =>
    api.get<any, TServiceResponse<IProduct>, any>(`/products/${id}`).then((data) => data.data),
  createProduct: async (payload: ICreateProductPayload) =>
    api.post('/products', payload).then((data) => data.data),
  updateProduct: async (id: string, payload: IUpdateProductPayload) =>
    api.put(`/products/${id}`, payload).then((data) => data.data),
  deleteProduct: async (id: string) => api.delete(`/products/${id}`).then((data) => data.data),
  transferProduct: async (id: string) =>
    api
      .get<any, TServiceResponse<IProduct>, any>(`/products/${id}/transfer`)
      .then((data) => data.data),
};

export const useCategories = (config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : '/categories',
    posSetvice.getCategories,
    {
      ...config,
    }
  );

  return {
    categories: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useGetCategory = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/categories/${id}`,
    () => posSetvice.getCategory(id),
    {
      ...config,
    }
  );

  return {
    category: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useProducts = (config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : '/products',
    posSetvice.getProducts,
    {
      ...config,
    }
  );
  return {
    products: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useGetProduct = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/products/${id}`,
    () => posSetvice.getProduct(id),
    {
      ...config,
    }
  );
  return {
    product: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useTransferProduct = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/products/${id}/transfer`,
    () => posSetvice.transferProduct(id),
    {
      ...config,
    }
  );
  return {
    product: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export default posSetvice;
