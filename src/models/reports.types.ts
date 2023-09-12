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
