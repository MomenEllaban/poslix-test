import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Button } from 'react-bootstrap';
import DeleteIcon from '@mui/icons-material/Delete';
import { ILocationSettings } from '@models/common-model';
import { BiEdit } from 'react-icons/bi';

export const purchasesInitFormObj = {
  id: 0,
  supplier_id: 0,
  location_id: 0,
  currency_id: 0,
  currency_symbol: '',
  currency_code: '',
  currency_rate: 0,
  total_price: 0,
  ref_no: '',
  date: new Date(),
  taxs: 0,
  subTotal_price: 0,
  total_tax: 0,
  total_expense: 0,
  discount_type: 'fixed',
  discount_amount: 0,
  purchaseStatus: '',
  paymentStatus: '',
  paid_amount: 0,
  total_discount: 0,
  paymentType: '',
  paymentDate: new Date(),
  payment_id: 0,
};
export const purchasesInitFormError = {
  morePaid: false,
  paid: false,
  products: false,
  supplier_id: false,
  taxInclu: false,
  paymentStatus: false,
  paymentType: false,
  paymentDate: false,
  purchaseStatus: false,
  currency_id: false,
};

export const purchasesInitPurchaseDetails: { label: string; value: string; priority: number }[] = [
  { label: 'Discount :', value: 'discount', priority: 1 },
  { label: 'Total Expenses :', value: 'expense', priority: 2 },
  { label: 'Taxes :', value: 'taxes', priority: 3 },
];

export const purchasesSelectStyle = {
  control: (style: any) => ({ ...style, color: '#db3333', borderRadius: '10px' }),
};
export const purchasesColourStyles = {
  control: (style: any) => ({ ...style, borderRadius: '10px' }),
};

export const purchasesColumns: ({
  locationSettings,
  formObj,
  onCostClick,
  setSelecetdId,
  setOpenRemoveDialog,
}: {
  locationSettings: ILocationSettings;
  formObj: any;
  onCostClick: any;
  setSelecetdId: any;
  setOpenRemoveDialog: any;
}) => GridColDef[] = ({
  locationSettings,
  formObj,
  onCostClick,
  setSelecetdId,
  setOpenRemoveDialog,
}) => [
  { field: 'name', headerName: 'Product Name', minWidth: 200 },
  {
    field: 'cost',
    headerName: 'Cost',
    colSpan: 1,
    minWidth: 350,
    editable: true,
    type: 'number',
    renderCell: ({ row }: Partial<GridRowParams>) => (
      <>
        <div className="purchase-converted-cost">
          {((formObj?.currency_rate || 1) * row.cost).toFixed(
            locationSettings?.location_decimal_places
          )}{' '}
          <span style={{ opacity: '0.5', fontSize: '10px' }}>{formObj?.currency_code}</span>
        </div>

        {/* {row.cost < row.notifyExpensePrice && (
          <div
            className={row.costType == 1 ? 'purchase-label active-label' : 'purchase-label'}
            id="use-expends"
            onClick={() => onCostClick('useExpnds', row.product_id, row.variation_id)}>
            <span>EXP</span> {row.notifyExpensePrice}
          </div>
        )}
        {row.cost < row.notifyTaxPrice && (
          <div
            className={row.costType == 2 ? 'purchase-label active-label' : 'purchase-label'}
            id="use-tax"
            onClick={() => onCostClick('useTax', row.product_id, row.variation_id)}>
            <span> TX</span> {row.notifyTaxPrice}
          </div>
        )}
        {row.notifyExpensePrice > 0 && row.notifyTaxPrice > 0 && (
          <div
            className={row.costType == 3 ? 'purchase-label active-label' : 'purchase-label'}
            id="use-tax"
            onClick={() => onCostClick('useTotal', row.product_id, row.variation_id)}>
            <span> Total</span> {row.notifyTotalPrice}
          </div>
        )} */}
      </>
    ),
  },
  {
    field: 'price',
    headerName: 'Price',
    minWidth: 150,
    editable: true,
    type: 'number',
    renderCell: ({ row }: Partial<GridRowParams>) => (
      <div>
        {row.price.toFixed(locationSettings?.location_decimal_places)}
      </div>
    ),
  },
  {
    field: 'quantity',
    headerName: 'Qty',
    renderHeader(params) {
      return (
        <div className="d-flex w-100 flex-row gap-3 align-items-center justify-content-center">
          Qty <BiEdit />
        </div>
      );
    },
    minWidth: 150,
    editable: true,
    type: 'number',
  },
  { field: 'vat', headerName: 'VAT %', minWidth: 150, editable: true, type: 'number' },
  {
    field: 'lineTotal',
    headerName: 'Line Total',
    minWidth: 100,
    type: 'number',
    renderCell: ({ row }: Partial<GridRowParams>) => (
      <div>
        {locationSettings?.currency_id == formObj.currency_id
          ? (+(+row.cost * +row.quantity)).toFixed(locationSettings?.location_decimal_places)
          : (+((formObj.currency_rate || +row.quantity) * +row.cost)).toFixed(
              locationSettings?.location_decimal_places
            )}
      </div>
    ),
  },
  {
    field: 'action',
    headerName: 'Action',
    minWidth: 100,
    sortable: false,
    disableExport: true,
    renderCell: ({ row }: Partial<GridRowParams>) => (
      <Button
        variant="outlined"
        onClick={() => {
          setSelecetdId({ product_id: row.product_id, variation_id: row.variation_id });
          setOpenRemoveDialog(true);
        }}>
        <DeleteIcon />
      </Button>
    ),
  },
];
