export const permissionsMapping = {
  'products/view': 'hasProducts',
  'purchases/view': 'hasPurchases',
  'transfers/view': 'hasTransfers',
  'expenses/view': 'hasExpenses',
  'customers/view': 'hasCustomers',
  'open/register': 'hasPos',
  'categories/view': 'hasCategories',
  'brands/view': 'hasBrands',
  'taxes/view': 'hasTaxes',
  'appearance/view': 'hasAppearance',
  'pricinggroup/view': 'hasPricingGroups',
  'sales-list/view': 'hasSalesList',
  'quotations-list/view': 'hasQuotations',
};

export const initialPermissions = {
  hasProducts: false,
  hasTailoring: false,
  hasCats: false,
  hasTaxes: false,
  hasPurchases: false,
  hasSalesList: false,
  hasPOS: false,
  hasDiscount: false,
  hasExpenses: false,
  hasOrders: false,
  hasTransfer: false,
  hasSupplier: false,
  hasCustomers: false,
  hasAppearance: false,
  hasAppStore: false,
  hasItemSales: false,
  hasCategorySales: false,
  hasCurrentStock: false,
  hasSupplierSales: false,
  hasRegister: false,
  hasQuotations: false,
};

export const initialTruePermissions = Object.keys(initialPermissions).reduce((acc, key) => {
  acc[key] = true;
  return acc;
}, {} as any);
