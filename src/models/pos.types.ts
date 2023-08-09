export interface IPricesJson {
  name: string;
  from: string | number;
  to: string | number;
  price: string | number;
}

export interface ICategory {
  id: number;
  name: string;
  location_id: number;
  short_code: any;
  parent_id: number;
  created_by: number;
  woocommerce_cat_id: any;
  category_type: any;
  description: string;
  slug: any;
  tax_id: any;
  never_tax: number;
  deleted_at: any;
  created_at: any;
  updated_at: any;
  show_in_list: string;
  products_count: number;
  products: IProduct[];
}

export interface IProduct {
  id: number;
  name: string;
  business_id: any;
  location_id: number;
  type: string;
  is_tailoring: number;
  is_service: number | boolean;
  is_fabric: number | boolean;
  subproductname: string;
  unit_id: number;
  brand_id: number;
  category_id: number;
  sub_category_id: any;
  tax: any;
  never_tax: number | boolean;
  alert_quantity: string;
  sku: string;
  barcode_type: string;
  image: string;
  product_description: any;
  created_by: number;
  is_disabled: number;
  sell_price: string | number;
  cost_price: string | number;
  sell_over_stock: string;
  qty_over_sold: string;
  created_at: any;
  updated_at: any;
  is_selling_multi_price: number;
  is_fifo: number;
  status: string;
  stock: number;
  variations: any[];
  packages: IPackage[];
  stocks: any[];
  category: ICategory;
}

export interface IPackage {
  id: number;
  location_id: number;
  parent_id: number;
  tailoring_type_id: number;
  prices_json: IPricesJson[];
  fabric_ids: string;
  product_ids: any;
  created_by: number;
  created_at: any;
}
