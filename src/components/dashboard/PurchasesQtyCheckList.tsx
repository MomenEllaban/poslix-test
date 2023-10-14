import { faArrowAltCircleLeft, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';

const PurchasesQtyCheckList = (props: any) => {
  const { shopId, purchaseId } = props;
  const [orderLines, setOrderLines] = useState<any[]>([]);
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSlectedIndex] = useState(-1);
  async function intPageData() {
    const res = await findAllData(`purchase/${purchaseId}/show`)
    if (!res.data.success) {
      alert("Failed");
      return;
    }
    setProducts(res.data.result.products)
    setIsLoading(false);
    setOrderLines(res.data.result.stocks);
  }

  const columns: GridColDef[] = [
    {
      field: 'name', headerName: 'Product Name', minWidth: 250,
      renderCell: ({ row }: Partial<GridRowParams>) => {

        const product = products?.find(product => +product.id === +row.product_id)

        return <p>{product?.name}</p>
      },
    },
    { field: 'cost', headerName: 'Cost', minWidth: 150 },
    { field: 'price', headerName: 'Price', minWidth: 150 },
    {
      field: 'qty',
      headerName: 'Total Qty',
      minWidth: 150,
      renderCell: ({ row }: Partial<GridRowParams>) => <>{Number(row.qty_received).toFixed(2) || "-"}</>,
    },
    {
      field: 'qty_received',
      headerName: 'Qty Received',
      minWidth: 150,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <div>
            {Number(row.qty_received).toFixed(2)}{' '}
            {row.qty - row.qty_received == 0 && <FontAwesomeIcon icon={faCircleCheck} />}
          </div>
        </>
      ),
    },
    // {
    //   field: 'qty_entered',
    //   headerName: 'Enter Qty',
    //   minWidth: 150,
    //   type: 'number',
    //   editable: true,
    // },
  ];
  const onRowsSelectionHandler = (params: any) => {
    const found = orderLines.findIndex((el) => el.id === params.id);
    if (found > -1) {
      params.value = parseFloat(params.value) > 0 ? parseFloat(params.value) : 0;
      var _datas: any = orderLines;
      _datas[found][params.field] =
        params.value > _datas[found].qty_left
          ? Number(_datas[found].qty_left).toFixed(2)
          : Number(params.value).toFixed(2);
      setOrderLines([..._datas]);
    }
  };
  useEffect(() => {
    const f_index2 = props.purchases.findIndex((itm: any) => {
      return itm.id == purchaseId;
    });
    if (f_index2 > -1) {
      setOrderLines([]);
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
            <div>Supplier: {props.purchases[selectedIndex]?.supplier?.name || "walk-in supplier"}</div>
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
            rows={orderLines}
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
