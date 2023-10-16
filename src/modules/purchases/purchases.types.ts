export interface IPurchasePayload {
  location_id: number; // required|numeric
  status: 'draft' | 'partially_received' | 'processing' | 'received' | 'cancelled'; // required|string:in:draft,partially_received,processing,received,cancelled
  payment_status: 'credit' | 'partially_paid' | 'paid' | 'due'; // required|string:in:credit,partially_paid,paid,due
  discount_type: 'fixed' | 'percentage' | null; // nullable|string:in:fixed,percentage
  discount_amount: number | null; // nullable|numeric
  notes: string | null; // nullable|string
  supplier_id: number; // required|numeric|exists:suppliers,id

  // for taxes
  tax_amount?: number | null; // nullable|numeric
  label?: string | null; // required_if:tax_amount,!=,null|string
  value?: number | null; // required_if:tax_amount,!=,null|numeric
  currency_code?: string | null; // required_if:tax_amount,!=,null|string
  currency_id?: number | null; // required_if:tax_amount,!=,null|numeric
  currency_rate?: number | null; // required_if:tax_amount,!=,null|numeric
  converted_value?: number | null; // required_if:tax_amount,!=,null|numeric
  enterd_value?: number | null; // required_if:tax_amount,!=,null|numeric
  isNew?: boolean | null; // required_if:tax_amount,!=,null|boolean

  // for transaction lines
  cart: {
    product_id: number; // required|numeric:exists:products,id
    variation_id?: number | null; // nullable|numeric:exists:variations,id
    qty: number; // required|numeric
    cost: number; // required|numeric
    price: number; // required|numeric
    note?: string | null; // nullable|string
  }[];

  // for payment
  payment_type: 'cash' | 'card' | 'cheque' | 'bank'; // required|string:in:cash,card,cheque,bank

  // for expenses
  expense?: {
    amount?: number | null; // nullable|numeric
    category?: {
      id?: number | null; // nullable|numeric|exists:expanse,id
    };
  };
}
