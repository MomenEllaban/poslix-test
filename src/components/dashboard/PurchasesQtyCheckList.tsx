import { faArrowAltCircleLeft, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DataGrid, GridColDef, GridEditInputCell, GridRowParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import api from 'src/utils/app-api';

const PurchasesQtyCheckList = (props: any) => {
  const { shopId, purchaseId } = props;
  const [transactionLines, setTransactionLines] = useState<any[]>([]);
  const [changed, setChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSlectedIndex] = useState(-1);
  const router = useRouter();
  async function intPageData() {
    const res = await findAllData(`purchase/complete-purchase/${purchaseId}`);
    if (!res.data.success) {
      alert('Failed');
      return;
    }
    const products = res.data.result.products;
    const transactionLine = res.data.result.transactionLines;
    const formatedTransactionLines = [];
    let last_id = 0;
    let variations = [];
    for (const line of transactionLine) {
      const { product_id, qty, qty_received, variation_id } = line;
      const { type, name, id } = products.find((product) => product.id === product_id);
      let current_id = id;
      let current_variations = [];
      let product_name = name;
      if (type === 'variable' && current_id !== last_id) {
        const res = await findAllData(`products/${id}/show`);
        variations = res.data.result.variations;
        current_variations = variations;
      }
      if (type === 'variable' && current_id === last_id) {
        current_variations = variations;
      }
      if (current_variations.length > 0) {
        product_name =
          product_name +
          ': ' +
          current_variations.find((variation) => variation.id === variation_id).name;
      }
      formatedTransactionLines.push({
        id: type === 'variable' ? variation_id : product_id,
        name: product_name,
        qty,
        product_id,
        qty_received,
        variation_id,
        entered_qty: 0,
      });
      last_id = current_id;
    }

    setTransactionLines(formatedTransactionLines);
    setIsLoading(false);
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Product Name',
      minWidth: 250,
      renderCell: ({ row }: Partial<GridRowParams>) => {
        return <p>{row.name}</p>;
      },
    },
    {
      field: 'qty',
      headerName: 'Total Qty',
      minWidth: 150,
      renderCell: ({ row }: Partial<GridRowParams>) => {
        return <>{Number(row.qty).toFixed(2) || '-'}</>;
      },
    },
    {
      field: 'qty_received',
      headerName: 'Qty Received',
      minWidth: 150,
      renderCell: ({ row }: Partial<GridRowParams>) => {
        return (
          <>
            <div>
              {Number(row.qty_received).toFixed(2)}{' '}
              {row.qty - row.qty_received == 0 && <FontAwesomeIcon icon={faCircleCheck} />}
            </div>
          </>
        );
      },
    },
    {
      field: 'entered_qty',
      headerName: 'Enter Qty',
      minWidth: 150,
      type: 'number',
      editable: true,
      renderCell: ({ row }: Partial<GridRowParams>) => {
        return <div>{row.entered_qty}</div>;
      },
    },
  ];

  const onRowsSelectionHandler = (params: any) => {
    const found = transactionLines.findIndex((el) => el.id === params.id);
    if (found > -1) {
      params.value = params.value !== undefined || params.value > 0 ? parseFloat(params.value) : 0;
      var _datas: any = transactionLines;
      if (params.value > _datas[found].qty && _datas[found].qty_received === 0) {
        params.value = _datas[found].qty;
      }
      if (_datas[found].qty_received > 0) {
        console.log(11111111);
        const sum = +_datas[found].qty_received + +params.value;
        console.log(sum);

        if (sum > _datas[found].qty) {
          console.log('before: ', params.value);

          params.value = _datas[found].qty - _datas[found].qty_received;
          console.log('before: ', params.value);
        }
      }
      if (params.value < 0) {
        params.value = 0;
      }

      _datas[found].qty_received = Number(+params.value + +_datas[found].qty_received).toFixed(2);
      _datas[found].entered_qty += +params.value;
      setChanged(true);
      setTransactionLines([..._datas]);
    }
  };

  const updateRecivedQty = () => {
    const products = [];
    for (const line of transactionLines) {
      const { product_id, variation_id, entered_qty } = line;
      if(entered_qty === 0 ){
        continue;
      }
      if(variation_id === 0){
        products.push({
          product_id,
          entered_qty
        })
      }
      if(variation_id > 0){
        const found = products.findIndex(product => product.product_id === product_id);
        if(found > -1){
          products[found].variations.push({
            id: variation_id,
            entered_qty
          })
        }else{
          products.push({
            product_id,
            variations: [{
              id: variation_id,
              entered_qty
            }]
          })
        }
      }
    }
    api
      .put(`/purchase/update-quantity/${purchaseId}`, {
        products
      })
      .then((res) => {
        if (!res.data.success) {
          Toastify('error', 'Has Error ,try Again');
          return;
        }
        Toastify('success', 'Purchase Successfully Updated..');
        props.setIsShowQtyManager(false)
      });
  };
  useEffect(() => {
    const f_index2 = props.purchases.findIndex((itm: any) => {
      return itm.id == purchaseId;
    });
    if (f_index2 > -1) {
      setTransactionLines([]);
      setSlectedIndex(f_index2);
      intPageData();
    } else {
      Toastify('error', 'somthing wrong!!');
      props.setIsShowPayments(false);
    }
  }, []);

  return (
    <>
      {!isLoading ? (
        <div className="page-content-style card">
          <div className="mb-4">
            <button
              className="btn m-btn btn-primary p-3"
              onClick={() => props.setIsShowQtyManager(false)}>
              <FontAwesomeIcon icon={faArrowAltCircleLeft} /> Back To List{' '}
            </button>
          </div>
          <h5>Purchase Quantity Manager List {props.purchases[selectedIndex].status}</h5>
          <hr />
          <div className="quick-suppier-info">
            <div>
              Supplier: {props.purchases[selectedIndex]?.supplier?.name || 'walk-in supplier'}
            </div>
            <div>Status: {props.purchases[selectedIndex].status}</div>
            <div>Total Price: {props.purchases[selectedIndex].total_price}</div>
          </div>
          <hr />
          <DataGrid
            className="datagrid-style"
            sx={{
              height: 300,
              width: '100%',
              '.MuiDataGrid-columnSeparator': {
                display: 'none',
              },
              '&.MuiDataGrid-root': {
                border: 'none',
              },
              '& .done': {
                backgroundColor: '#cefeb6',
                color: '#1a3e72',
              },
            }}
            rows={transactionLines}
            columns={columns}
            getRowClassName={(params) => {
              if (params.row.qty - params.row.qty_received == 0) return 'done';
              return '';
            }}
            columnVisibilityModel={{ cost: false, price: false }}
            pageSize={10}
            isCellEditable={(params) =>
              parseFloat(params.row.qty) != parseFloat(params.row.qty_received)
            }
            rowsPerPageOptions={[10]}
            onCellEditCommit={onRowsSelectionHandler}
          />
          <button
            type="button"
            hidden={transactionLines.length === 0}
            disabled={
              transactionLines[0]?.qty_received == '0.00' ||
              transactionLines[0]?.qty_received === +transactionLines[0]?.qty
            }
            className="btn m-btn btn-primary p-2"
            onClick={updateRecivedQty}>
            Save
          </button>
        </div>
      ) : (
        <div className="d-flex justify-content-around">
          <Spinner animation="grow" />
        </div>
      )}
    </>
  );
};
export default PurchasesQtyCheckList;
