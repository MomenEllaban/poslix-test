import { faCheck, faEye, faPenToSquare, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { ICustomer } from '@models/pos.types';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Tab, Tabs } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import QRCode from 'react-qr-code';
import { ToastContainer } from 'react-toastify';
import OrdersTable from 'src/components/dashboard/OrdersTable';
import SalesListTable from 'src/components/dashboard/SalesListTable';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import CustomerProfileView from 'src/modules/customers/_views/customer-profile-view';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import { findAllData } from 'src/services/crud.api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

ChartJS.register(ArcElement, Tooltip, Legend);

const customerTemplate: Partial<ICustomer> = {
  id: 0,
  first_name: '',
  last_name: '',
  mobile: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  country: '',
  zip_code: '',
  shipping_address: '',
};

const Customer: NextPage = ({ shopId, rules, customerId }: any) => {
  const router = useRouter();
  const { locationSettings, setLocationSettings } = useUser();

  const [key, setKey] = useState('profile');
  const [sales, setSales] = useState<any>([]);
  const [isOrder, setIsOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState(customerTemplate);

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'customer_name', headerName: 'Customer Name', flex: 1 },
    { field: 'sale_date', headerName: 'Quotation Date', flex: 1 },
    {
      flex: 1,field: 'status',headerName: 'Status',
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (+(+row.total_price - +row.amount) === 0) {
          return <div className="sty_Accepted">Accepted</div>;
        }
        if (+(+row.total_price - +row.amount) === +row.total_price) {
          return <div className="sty_Cancled">Canceled</div>;
        }
        return <div className="sty_Waiting">Waiting</div>;
      },
    },
    {
      flex: 1,
      field: 'action',
      headerName: 'Action ',
      filterable: false,
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <ButtonGroup className="mb-2 m-buttons-style">
          <Button onClick={() => {}}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
          {rules.hasDelete && (
            <Button onClick={() => {}}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
          <Button onClick={() => {}}>
            <FontAwesomeIcon icon={faEye} />
          </Button>
          <Button onClick={() => {}}>
            <FontAwesomeIcon icon={faCheck} />
          </Button>
          <Button onClick={() => {}}>
            <FontAwesomeIcon icon={faXmark} />
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  // init sales data
  async function initDataPage() {
    if (router.query.customerId) {
      setIsLoading(true);
      
      const res = await findAllData(`customers/${router.query.customerId}/show`);
      if (res.data.success) {
        setSales({ data: res.data.result?.sales });
        const selCustomer = res.data.result?.profile;
        console.log(sales,"hooooooooooooooooooooooo")
        setCustomerInfo({ ...customerTemplate, ...selCustomer });
      } else {
        Toastify('error', 'has error, Try Again...');
      }
      setIsLoading(false);
    }
  }

  useEffect(() => {
    initDataPage();
    const order = localStorage.getItem('orders');
    if (order !== null) {
      setIsOrder(JSON.parse(order));
    }
  }, [router.asPath]);

  useEffect(() => {
    if (!shopId) return;

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations?.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);

    initDataPage();
  }, [shopId]);

  return (
    <AdminLayout shopId={shopId}>
      <ToastContainer />

      {!isLoading ? (
        <Tabs
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3">
          <Tab eventKey="profile" title="Profile">
            <CustomerProfileView customer={customerInfo} />
          </Tab>
          <Tab eventKey="Quotations" title="Quotations">
            <div className="page-content-style card">
              <h5>Quotations List</h5>
              <DataGrid
                className="datagrid-style"
                sx={{
                  '.MuiDataGrid-columnSeparator': {
                    display: 'none',
                  },
                  '&.MuiDataGrid-root': {
                    border: 'none',
                  },
                }}
                rows={sales}
                columns={columns}
                initialState={{
                  columns: { columnVisibilityModel: { mobile: false } },
                }}
                pageSize={10}
                rowsPerPageOptions={[10]}
                components={{ Toolbar: CustomToolbar }}
              />
            </div>
          </Tab>
          <Tab eventKey="Sales" title="Sales">
            <SalesListTable
              shopId={router.query.id}
              customerId={router.query.id}
              rules={{ hasDelete: true }}
              salesList={sales}
            />
          </Tab>
          {isOrder && (
            <Tab eventKey="Orders" title="Orders">
              <OrdersTable shopId={shopId} rules={rules} />
            </Tab>
          )}
          <Tab eventKey="loyaltycard" title="Loyalty card">
            <div className="card">
              <div className="card-body">
                <section className="punchcard-wrapper">
                  <header>
                    <p>BUY 9 SERVICES WITH US AND GET THE 10TH FREE!</p>
                  </header>

                  <figure className="punchcard">
                    <div className="punches" aria-labelledby="punchcard-summary">
                      <span className="punch punched" title="Punched"></span>
                      <span className="punch punched" title="Punched"></span>
                      <span className="punch punched" title="Punched"></span>
                      <span className="punch not-punched" title="Not Punched"></span>
                      <span className="punch not-punched" title="Not Punched"></span>
                      <span className="punch not-punched" title="Not Punched"></span>
                      <span className="punch not-punched" title="Not Punched"></span>
                      <span className="punch not-punched" title="Not Punched"></span>
                      <span className="punch not-punched" title="Not Punched"></span>
                      <span className="punch not-punched" title="Not Punched"></span>
                      <span className="punch not-punched" title="Not Punched"></span>
                      <span className="punch not-punched" title="Not Punched"></span>
                    </div>
                    <figcaption id="punchcard-summary">3 punched out of 12 total</figcaption>
                  </figure>

                  <footer>
                    <p>
                      Buy 11 calls, get the 12<sup>th</sup> free!
                    </p>
                  </footer>
                </section>
                <div className="text-center">
                  <QRCode value="Hey from Poslix" />
                </div>
              </div>
            </div>
          </Tab>
        </Tabs>
      ) : (
        <div className="d-flex justify-content-around">
          <Spinner animation="grow" />
        </div>
      )}
    </AdminLayout>
  );
};

export default Customer;
