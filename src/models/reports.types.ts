import { ICurrency, IProduct } from './pos.types';

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
  note: string | null;
  status: EStatus;
}

export enum EStatus {
  Close = 'close',
  Open = 'open',
}

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
  date: Date;
  status: string;
  type: string;
  products: Array<IProduct | null>;
}
