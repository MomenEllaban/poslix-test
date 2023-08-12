import { type AxiosResponse } from 'axios';
import { type ICustomResponse } from '@models/global.types';
import {
  ICategory,
  IProduct,
  ICustomer,
  IPackageType,
  IUnits,
  IBrand,
  ITaxes,
  ITax,
  ICurrency,
  IPurchase,
  IPayment,
  IExpenseCategory,
  IExpense,
} from '@models/pos.types';
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
  Etype: 'single' | 'variable' | 'package' | 'tailoring_package';
  is_service: boolean | 0 | 1;
  is_fabric: boolean | 0 | 1;
  unit_id: number;
  never_tax: boolean | 0 | 1;
  sku: string;
  Ebarcode_type: 'C128' | 'C39' | 'C93' | 'EAN8' | 'EAN13' | 'UPCA' | 'UPCE';
  sell_price: number | string;
  cost_price: number | string;
}

interface IUpdateProductPayload extends Partial<IProduct> {}

interface ICreateCustomerPayload extends Partial<ICustomer> {
  first_name: string;
  mobile: number | string;
}

interface ISearch {
  search: string;
}

interface IUpdateCustomerPayload extends Partial<ICustomer> {}

interface IGetPackageType extends Partial<IPackageType> {}

interface ICreateBrandPayload extends Partial<IBrand> {
  name: string;
}

interface IUpdateBrandPayload extends Partial<IBrand> {}

interface ICreateTaxPayload extends Partial<ITax> {
  name: string;
  amount: number;
  Etype: 'percentage' | 'fixed';
  is_primary: boolean | 0 | 1;
  Etax_type: 'primary' | 'group' | 'excise' | 'service';
}

interface IUpdateTaxPayload extends Partial<ITax> {}

interface IUpdatePaymentPayload extends Partial<IPayment> {}

interface ICreatePurchasePayload extends Partial<IPurchase> {
  location_id: number;
  Estatus: 'draft' | 'processing' | 'received' | 'partially_received' | 'cancelled';
  Epayment_status: 'paid' | 'credit' | 'partially_paid' | 'due';
  Epayment_type: 'cash' | 'card' | 'cheque' | 'bank';
}

interface IUpdatePurchasePayload extends Partial<IPurchase> {}

interface IGetCloseRegisteration {
  cash: number;
  card: number;
  cheque: number;
  bank: number;
}

interface ICreateExpensePayload extends Partial<IExpense> {
  name: string;
  amount: number | string;
  category: number;
}

interface IUpdateExpensePayload extends Partial<IExpense> {}

const posSetvice = {
  getCategories: async (locId: string) =>
    api
      .get<any, TServiceResponse<ICategory[]>, any>(`/categories/${locId}`)
      .then((data) => data.data),
  getCategory: async (id: string) =>
    api
      .get<any, TServiceResponse<ICategory>, any>(`/categories/${id}/show`)
      .then((data) => data.data),
  createCategory: async (locId: string, payload: ICreateCategoryPayload) =>
    api.post(`/categories/${locId}`, payload).then((data) => data.data),
  updateCategory: async (id: string, payload: IUpdateCategoryPayload) =>
    api.put(`/categories/${id}`, payload).then((data) => data.data),
  deleteCategory: async (id: string) => api.delete(`/categories/${id}`).then((data) => data.data),

  getProducts: async (locId: string) =>
    api.get<any, TServiceResponse<IProduct[]>, any>(`/products/${locId}`).then((data) => data.data),
  getProduct: async (id: string) =>
    api.get<any, TServiceResponse<IProduct>, any>(`/products/${id}/show`).then((data) => data.data),
  getPackageTypes: async (locId: string) =>
    api
      .get<any, TServiceResponse<IGetPackageType>, any>(`/package-type/${locId}`)
      .then((data) => data.data),
  createProduct: async (payload: ICreateProductPayload) =>
    api.post('/products', payload).then((data) => data.data),
  updateProduct: async (id: string, payload: IUpdateProductPayload) =>
    api.put(`/products/${id}`, payload).then((data) => data.data),
  updateStatus: async (id: string, payload: { status: 'active' | 'inactive' }) =>
    api.put(`/products/${id}/status`, payload).then((data) => data.data),
  deleteProduct: async (id: string) => api.delete(`/products/${id}`).then((data) => data.data),
  transfer: async (id: string) =>
    api
      .get<any, TServiceResponse<IProduct>, any>(`/products/${id}/transfer`)
      .then((data) => data.data),
  import: async (locId: string) => api.post(`/products/${locId}/import`).then((data) => data.data),
  // search: async (locId: string, payload: ISearch) =>
  //   api
  //     .get<any, TServiceResponse<IProduct>, any>(`/products/search/${locId}`, payload)
  //     .then((data) => data.data),

  getCustomers: async (locId: string) =>
    api
      .get<any, TServiceResponse<ICustomer[]>, any>(`/customers/${locId}`)
      .then((data) => data.data),
  getCustomer: async (id: string) =>
    api
      .get<any, TServiceResponse<ICustomer>, any>(`/customers/${id}/show`)
      .then((data) => data.data),
  createCustomer: async (locId: string, payload: ICreateCustomerPayload) =>
    api.post(`/customers/${locId}`, payload).then((data) => data.data),
  updateCustomer: async (id: string, payload: IUpdateCustomerPayload) =>
    api.put(`/customers/${id}`, payload).then((data) => data.data),
  deleteCustomer: async (id: string) => api.delete(`/customers/${id}`).then((data) => data.data),

  getUnits: async () =>
    api.get<any, TServiceResponse<IUnits>, any>(`/units`).then((data) => data.data),

  getBrands: async (locId: string) =>
    api.get<any, TServiceResponse<IBrand[]>, any>(`/brands/${locId}`).then((data) => data.data),
  getBrand: async (id: string) =>
    api.get<any, TServiceResponse<IBrand>, any>(`/brands/${id}/show`).then((data) => data.data),
  createBrand: async (locId: string, payload: ICreateBrandPayload) =>
    api.post(`/brands/${locId}`, payload).then((data) => data.data),
  updateBrand: async (id: string, payload: IUpdateBrandPayload) =>
    api.put(`/brands/${id}`, payload).then((data) => data.data),
  deleteBrand: async (id: string) => api.delete(`/brands/${id}`).then((data) => data.data),

  getTaxes: async (locId: string) =>
    api.get<any, TServiceResponse<ITaxes>, any>(`/taxes/${locId}`).then((data) => data.data),
  getTax: async (id: string) =>
    api
      .get<any, TServiceResponse<{ tax: ITax }>, any>(`/taxes/${id}/show`)
      .then((data) => data.data),
  createTax: async (locId: string, payload: ICreateTaxPayload) =>
    api.post(`/taxes/${locId}`, payload).then((data) => data.data),
  updateTax: async (id: string, payload: IUpdateTaxPayload) =>
    api.put(`/taxes/${id}`, payload).then((data) => data.data),
  deleteTax: async (id: string) => api.delete(`/taxes/${id}`).then((data) => data.data),

  getCurrencies: async () =>
    api.get<any, TServiceResponse<ICurrency[]>, any>(`/currencies`).then((data) => data.data),

  getPurchases: async (locId: string) =>
    api
      .get<any, TServiceResponse<IPurchase[]>, any>(`/purchase/${locId}`)
      .then((data) => data.data),
  getPurchase: async (id: string) =>
    api
      .get<any, TServiceResponse<IPurchase>, any>(`/purchase/${id}/show`)
      .then((data) => data.data),
  createPurchase: async (locId: string, payload: ICreatePurchasePayload) =>
    api.post(`/purchase/${locId}`, payload).then((data) => data.data),
  updatePurchase: async (id: string, payload: IUpdatePurchasePayload) =>
    api.put(`/purchase/${id}`, payload).then((data) => data.data),
  deletePurchase: async (id: string) => api.delete(`/purchase/${id}`).then((data) => data.data),
  updatePayment: async (id: string, payload: IUpdatePaymentPayload) =>
    api.put(`/purchase/${id}/payment`, payload).then((data) => data.data),

  closeRegisteration: async (locId: string, payload: { hand_cash?: number; note: string }) =>
    api.post(`/registeration/${locId}/close`).then((data) => data.data),
  openRegisteration: async (
    locId: string,
    payload?: {
      hand_cash?: number;
    }
  ) => api.post(`/registeration/${locId}/open`).then((data) => data.data),
  getCloseRegisteration: async (locId: string) =>
    api
      .get<any, TServiceResponse<IGetCloseRegisteration>, any>(`/registeration/${locId}/close`)
      .then((data) => data.data),

  getExpenseCategories: async (locId: string) =>
    api
      .get<any, TServiceResponse<IExpenseCategory[]>, any>(`/expenses-categories/${locId}`)
      .then((data) => data.data),
  getExpenseCategory: async (id: string) =>
    api
      .get<any, TServiceResponse<IExpenseCategory>, any>(`/expenses-categories/${id}/show`)
      .then((data) => data.data),
  createExpenseCategory: async (locId: string, payload: { name: string }) =>
    api.post(`/expenses-categories/${locId}`, payload).then((data) => data.data),
  updateExpenseCategory: async (id: string, payload: { name: string }) =>
    api.put(`/expenses-categories/${id}`, payload).then((data) => data.data),
  deleteExpenseCategory: async (id: string) =>
    api.delete(`/expenses-categories/${id}`).then((data) => data.data),

  getExpenses: async (locId: string) =>
    api.get<any, TServiceResponse<IExpense[]>, any>(`/expenses/${locId}`).then((data) => data.data),
  getExpense: async (id: string) =>
    api.get<any, TServiceResponse<IExpense>, any>(`/expenses/${id}/show`).then((data) => data.data),
  createExpense: async (locId: string, payload: ICreateExpensePayload) =>
    api.post(`/expenses/${locId}`, payload).then((data) => data.data),
  updateExpense: async (id: string, payload: IUpdateExpensePayload) =>
    api.put(`/expenses/${id}`, payload).then((data) => data.data),
  deleteExpense: async (id: string) => api.delete(`/expenses/${id}`).then((data) => data.data),
};

export const useCategories = (locId: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/categories/${locId}`,
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
    config?.suspense ? null : `/categories/${id}/show`,
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

export const useProducts = (locId: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/products/${locId}`,
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
    config?.suspense ? null : `/products/${id}/show`,
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

export const usePackageTypes = (locId: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/package-type/${locId}`,
    posSetvice.getPackageTypes,
    {
      ...config,
    }
  );
  return {
    packageTypes: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useTransfer = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/products/${id}/transfer`,
    () => posSetvice.transfer(id),
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

// export const useSearch = (locId: string, config?: SWRConfiguration) => {
//   const { data, error, isLoading, mutate } = useSWR(
//     config?.suspense ? null : `/products/search/${locId}`,
//     () => posSetvice.search(locId),
//     {
//       ...config,
//     }
//   );
//   return {
//     product: data?.result ?? [],
//     isLoading,
//     error,
//     refetch: mutate,
//   };
// };

export const useCustomers = (locId: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/customers/${locId}`,
    posSetvice.getCustomers,
    {
      ...config,
    }
  );
  return {
    customers: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useGetCustomer = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/customers/${id}/show`,
    () => posSetvice.getCustomer(id),
    {
      ...config,
    }
  );
  return {
    customer: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useUnits = (config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/units`,
    posSetvice.getUnits,
    {
      ...config,
    }
  );
  return {
    units: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useBrands = (locId: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/brands/${locId}`,
    () => posSetvice.getBrands(locId),
    {
      ...config,
    }
  );
  return {
    brands: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useGetBrand = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/brands/${id}/show`,
    () => posSetvice.getBrand(id),
    {
      ...config,
    }
  );
  return {
    brand: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useTaxes = (locId: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/taxes/${locId}`,
    () => posSetvice.getTaxes(locId),
    {
      ...config,
    }
  );
  return {
    taxes: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useGetTax = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/taxes/${id}/show`,
    () => posSetvice.getTax(id),
    {
      ...config,
    }
  );
  return {
    tax: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useCurrencies = (config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/currency`,
    posSetvice.getCurrencies,
    {
      ...config,
    }
  );
  return {
    currencies: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const usePurchases = (locId: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/purchase/${locId}`,
    () => posSetvice.getPurchases(locId),
    {
      ...config,
    }
  );
  return {
    purchases: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useGetPurchase = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/purchase/${id}/show`,
    () => posSetvice.getPurchase(id),
    {
      ...config,
    }
  );
  return {
    purchase: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useGetCloseRegisteration = (locId: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/registeration/${locId}/close`,
    () => posSetvice.getCloseRegisteration(locId),
    {
      ...config,
    }
  );
  return {
    closeRegisteration: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useExpenseCategories = (locId: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/expenses-categories/${locId}`,
    () => posSetvice.getExpenseCategories(locId),
    {
      ...config,
    }
  );
  return {
    expenseCategories: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useGetExpenseCategory = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/expenses-categories/${id}/show`,
    () => posSetvice.getExpenseCategory(id),
    {
      ...config,
    }
  );
  return {
    expenseCategory: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useExpenses = (locId: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/expenses/${locId}`,
    () => posSetvice.getExpenses(locId),
    {
      ...config,
    }
  );
  return {
    expenses: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useGetExpense = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/expenses/${id}/show`,
    () => posSetvice.getExpense(id),
    {
      ...config,
    }
  );
  return {
    expense: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export default posSetvice;
