export interface ISupplier {
  id: number;
  location_id: number;
  name: string;
  email: string;
  phone: string;
  facility_name: string;
  tax_number: string;
  invoice_address: string;
  invoice_City: string;
  invoice_Country: string;
  
  postal_code: number;
  created_at: string;
  updated_at: string;
  transaction: any[];
}
