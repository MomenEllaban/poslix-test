import {
  faArrowAltCircleLeft,
  faCircleCheck,
  faMinus,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import AddNewPayment from './AddNewPayment';

const PurchasePaymentsList = (props: any) => {
  const { shopId, purchaseId, purchases } = props;
  const [information, setInformation] = useState<any>({ totalPaid: 0, totalLeft: 0, isPaid: 0 });
  const [orderPayments, setOrderPayments] = useState<
    { id: number; payment_type: string; amount: number; created_at: string }[]
  >([]);
  const [isAddNew, setIsAddNew] = useState(false);
  const [selectedIndex, setSlectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  async function intPageData() {
    const res = await findAllData(`purchase/${purchaseId}/show`)
    if (res.data.success) {
      setOrderPayments(res.data.result.payment);
      setIsLoading(false);
    }

  }
  const columns: GridColDef[] = [
    { field: 'payment_type', headerName: 'Payment Name', minWidth: 200 },
    { field: 'amount', headerName: 'Amount', minWidth: 100 },
    { field: 'created_at', headerName: 'Date', minWidth: 300 },
  ];
  var errors = [];
  useEffect(() => {
    if (selectedIndex == -1) return;
    var _totalPaid = 0;
    orderPayments?.map((itm) => (_totalPaid += parseFloat(itm.amount.toString())));

    setInformation({
      ...information,
      totalPaid: +Number(_totalPaid).toFixed(3),
      totalLeft: +Number(props.purchases[selectedIndex].total_price - _totalPaid).toFixed(3),
      isPaid: Math.floor(props.purchases[selectedIndex].total_price - _totalPaid) == 0,
    });
  }, [orderPayments]);
  useEffect(() => {
    const f_index2 = props.purchases.findIndex((itm: any) => {
      return itm.id == purchaseId;
    });
    if (f_index2 > -1) {
      setOrderPayments([]);
      setSlectedIndex(f_index2);
      setIsLoading(true);
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
              onClick={() => props.setIsShowPayments(false)}>
              <FontAwesomeIcon icon={faArrowAltCircleLeft} /> Back To List{' '}
            </button>
          </div>
          {/* {JSON.stringify(selectedIndex)} */}
          <h5>Purchase Payments List</h5>
          <div className="quick-suppier-info">
            <div>ID: {props.purchases[selectedIndex].id}</div>
            <div>Supplier: {props.purchases[selectedIndex].supplier}</div>
            <div>Status: {props.purchases[selectedIndex].status}</div>
            <div>Payment Status: {props.purchases[selectedIndex].payment_status}</div>
            <div>Total Price: {props.purchases[selectedIndex].total_price}</div>
            <div>
              Total Paid: {information.totalPaid}{' '}
              {information.isPaid && <FontAwesomeIcon icon={faCircleCheck} />}
            </div>
            <div>Total Left: {information.totalLeft}</div>
          </div>
          {!information.isPaid && (
            <div className="mb-4">
              <button
                className="btn m-btn p-3"
                style={{ background: '#5daf34', color: 'white' }}
                onClick={() => setIsAddNew(!isAddNew)}>
                <FontAwesomeIcon icon={!isAddNew ? faPlus : faMinus} /> Add New Payment
              </button>
            </div>
          )}
          {isAddNew && (
            <AddNewPayment
              purchases={purchases}
              orderPayments={orderPayments}
              setOrderPayments={setOrderPayments}
              selectedIndex={selectedIndex}
              shopId={shopId}
              purchaseId={purchaseId}
              totalLeft={information.totalLeft}
              setIsAddNew={setIsAddNew}
            />
          )}
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
            rows={orderPayments}
            columns={columns}
            getRowClassName={(params) => {
              if (params.row.qty - params.row.qty_received == 0) return 'done';
              return '';
            }}
            pageSize={10}
            isCellEditable={(params) =>
              parseFloat(params.row.qty) != parseFloat(params.row.qty_received)
            }
            rowsPerPageOptions={[10]}
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
export default PurchasePaymentsList;
