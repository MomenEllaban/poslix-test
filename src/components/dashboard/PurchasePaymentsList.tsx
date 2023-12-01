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

import { useTranslation } from 'next-i18next';


const PurchasePaymentsList = (props: any) => {
  const { shopId, purchaseId, purchases } = props;
  const [information, setInformation] = useState<any>({ totalPaid: 0, totalLeft: 0, isPaid: 0 });
  const [orderDetails, setOrderDetails] = useState<any>()
  const [orderPayments, setOrderPayments] = useState<
    { id: number; payment_type: string; amount: number; created_at: string }[]
  >([]);
  const [isAddNew, setIsAddNew] = useState(false);
  const [selectedIndex, setSlectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);

  const { t } = useTranslation();


  async function intPageData() {
    const res = await findAllData(`purchase/${purchaseId}/show`)
    if (res.data.success) {
      setOrderDetails(res.data.result);
      setOrderPayments(res.data.result.payment);
      setIsLoading(false);
    }

  }
  const columns: GridColDef[] = [
    { field: 'payment_type', headerName: t('purchases.Payment_Name'), minWidth: 200 },
    { field: 'amount', headerName: t('purchases.Amount'), minWidth: 100 },
    { field: 'created_at', headerName: t('purchases.Date'), minWidth: 300 },
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
              <FontAwesomeIcon icon={faArrowAltCircleLeft} /> {t("purchases.Back_To_List")}{' '}
            </button>
          </div>
          {/* {JSON.stringify(selectedIndex)} */}
          <h5>{t("purchases.Purchase_Payments_List")}</h5>
          <div className="quick-suppier-info">
            <div>{t("purchases.ID")}: {orderDetails.id}</div>
            <div>{t("purchases.Supplier")}: {orderDetails?.supplier?.name}</div>
            <div>{t("purchases.Status")}: {orderDetails.status}</div>
            <div>{t("purchases.Payment_Status")}: {orderDetails.payment_status}</div>
            <div>{t("purchases.Total_Price")}: {orderDetails.total_price}</div>
            <div>
              {t("purchases.Total_Paid")}: {information.totalPaid}{' '}
              {information.isPaid && <FontAwesomeIcon icon={faCircleCheck} />}
            </div>
            <div>{t("purchases.Total_Left")}: {information.totalLeft}</div>
          </div>
          {!information.isPaid && (
            <div className="mb-4">
              <button
                className="btn m-btn p-3"
                style={{ background: '#5daf34', color: 'white' }}
                onClick={() => setIsAddNew(!isAddNew)}>
                <FontAwesomeIcon icon={!isAddNew ? faPlus : faMinus} />{t("purchases.Add_New_Payment")}
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
