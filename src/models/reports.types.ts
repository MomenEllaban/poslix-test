import { ICurrency, IProduct } from './pos.types';

export enum EStatus {
  Close = 'close',
  Open = 'open',
}
export enum EType {
  Purchase = 'purchase',
}
export enum EPaymentStatus {
  Due = 'due',
  Paid = 'paid',
  PartiallyPaid = 'partially_paid',
}
export enum EPaymentMethod {
  Bank = 'bank',
  Card = 'card',
  Cash = 'cash',
}

export enum ETransactionStatus {
  PartiallyReceived = 'partially_received',
  Received = 'received',
}

export interface IOpenCloseResult {
  total_hand_cash: number;
  total_cash: number;
  total_cheque: number;
  total_bank: number;
  total_cart: number;
  total: number;
  data: IOpenCloseReport[];
}

export interface IOpenCloseReport {
  id: number;
  first_name: string;
  last_name: null;
  hand_cash: string;
  cart: string;
  cash: string;
  cheque: string;
  bank: number;
  date: Date;
  note?: string;
  status: EStatus;
}

/*********************************/
export interface IItemSalesResult {
  cost: number;
  sub_total: number;
  tax: number;
  total: number;
  currency: ICurrency;
  data: IItemSalesReport[];
}

export interface IItemSalesReport {
  order_id: number;
  user_first_name: string;
  user_last_name: string | null;
  contact_first_name: string;
  contact_last_name: string;
  contact_mobile: string;
  qty: number | string;
  price: number | string;
  cost: number | string;
  tax: number | string;
  date: string;
  status: EStatus;
  type: string;
  products: Array<IProduct | null>;
}

/*********************************/
export interface ISalesResult {
  sub_total: number;
  tax: number;
  total: number;
  currency: ICurrency;
  data: ISalesReport[];
}

export interface ISalesReport {
  id: number;
  contact_id: null;
  user_name: string;
  contact_name: string;
  contact_mobile: null;
  sub_total: number;
  payed: number;
  due: number;
  discount: string;
  tax: string;
  date: Date;
  transaction_status: string;
  payment_status: string;
  payment_method: string;
  type: string;
}

/*********************************/
export interface IPurchaseResult {
  sub_total: number;
  tax: number;
  total: number;
  currency: ICurrency;
  data: IPurchaseReport[];
}

export interface IPurchaseReport {
  id: number;
  contact_id: number;
  user_name: string;
  contact_name: string;
  contact_mobile: string;
  sub_total: number;
  payed: number;
  due: number;
  discount: string;
  tax: string;
  date: Date;
  transaction_status: string;
  payment_status: string;
  payment_method: string;
  type: string;
}

export interface IStockReport {
  sku: string;
  product_name: string;
  sub_category: any;
  cost_price: string;
  sell_price: string;
  unit_name: string;
  receive_qty: string;
  sold_qty: string;
  brand_name: string;
  brand_id: number;
  location_name: string;
}
