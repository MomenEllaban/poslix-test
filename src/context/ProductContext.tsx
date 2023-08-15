import { createContext, useContext } from 'react';
import { IreadyGroupTax } from '../models/common-model';
import { ITax } from '@models/pos.types';
export const ProductContext = createContext({
  products: { products: [], products_multi: [] },
  setProducts: (products: any) => {},
  cats: [],
  setCats: (cats: any) => {},
  brands: [],
  setBrands: (cats: any) => {},
  customers: [],
  setCustomers: (customers: any) => {},
  taxes: [] as ITax[],
  setTaxes: (taxes: any) => {},
  taxGroups: [],
  setTaxGroups: (taxGroups: any) => {},
  variations: { variations: [], variations_multi: [] },
  setVariations: (variations: any) => {},
  packageItems: [],
  setPackageItems: (packageItems: any) => {},
});

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductsContext must be used within a ProductsContextProvider');
  }
  return context;
};
