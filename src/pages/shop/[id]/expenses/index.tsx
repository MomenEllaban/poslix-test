import {
  faArrowAltCircleLeft,
  faPaperclip,
  faPenToSquare,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { IExpenseList } from '@models/common-model';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import AddNewExpeness from 'src/components/dashboard/AddNewExpeness';
import AlertDialog from 'src/components/utils/AlertDialog';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import { apiInsertCtr } from 'src/libs/dbUtils';
import ExpensesCategoriesView from 'src/modules/expneses/_view/expneses-categories-view';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import { findAllData } from 'src/services/crud.api';

const Expenses: NextPage = ({ id }: any) => {
  const router = useRouter();
  const shopId = router.query.id;

  const [cate, setCate] = useState<{ id: number; name: string; isNew: boolean }[]>([]);
  const [expensesList, setExpensesList] = useState<IExpenseList[]>([]);
  const [show, setShow] = useState(false);
  const [type, setType] = useState('');
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpense, setIsAddExpense] = useState(false);
  const [permissions, setPermissions] = useState<any>();
  const [key, setKey] = useState('list');
  const { locationSettings } = useUser();

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'expense_category',
      headerName: 'Category',
      flex: 1,
      renderCell: ({ row }) => row?.expense_category?.name,
    },
    {
      field: 'amount',
      headerName: 'amount',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        Number(row.amount).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => row.created_at,
    },
    {
      field: 'path',
      headerName: 'Attached File',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <ButtonGroup className="mb-2 m-buttons-style">
          {
            <Button onClick={() => window.open(row.path, '_blank')}>
              <FontAwesomeIcon icon={faPaperclip} />
            </Button>
          }
        </ButtonGroup>
      ),
    },
    {
      field: 'action',
      headerName: 'Action ',
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <ButtonGroup className="mb-2 m-buttons-style">
          {permissions.hasEdit && (
            <Button
              onClick={() => {
                setSelectId(row.id);
                setIsAddExpense(true);
              }}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
          )}
          {permissions.hasDelete && (
            <Button
              onClick={() => {
                setSelectId(row.id);
                setShow(true);
                setType('expenses');
              }}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </ButtonGroup>
      ),
    },
  ];

  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions')).filter((loc) => loc.id == shopId);
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };

    perms[0].permissions.map((perm) =>
      perm.name.includes('expenses/show')
        ? (getPermissions.hasView = true)
        : perm.name.includes('expenses/add')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('expenses/update')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('expenses/delete')
        ? (getPermissions.hasDelete = true)
        : null
    );

    setPermissions(getPermissions);
  }, []);

  async function initDataPage() {
    if (router.query.id) {
      setIsLoading(true);
      const res = await findAllData(`expenses/${router.query.id}`);
      if (res.data.success) {
        setExpensesList(res.data.result);
      }
      setIsLoading(false);
    }
  }

  const onRowsSelectionHandler = (ids: any) => {};
  const handlebtnAdd = () => {
    setSelectId(0);
    setIsAddExpense(!isAddExpense);
  };

  useEffect(() => {
    initDataPage();
  }, [router.asPath]);

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    initDataPage();
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
  };
  return (
    <AdminLayout shopId={id}>
      <ToastContainer />
      <AlertDialog alertShow={show} alertFun={handleDeleteFuc} id={selectId} url={type}>
        Are you Sure You Want Delete This Item ?
      </AlertDialog>
      <div className="row">
        <Tabs
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k: any) => setKey(k)}
          className="mb-3 p-3">
          <Tab eventKey="list" title="List">
            <Card>
              <Card.Header className="p-3 bg-white">
                <h5>Expense List</h5>
              </Card.Header>
              <Card.Body style={{ minHeight: '650px ' }}>
                {!isLoading && permissions.hasInsert && (
                  <div className="mb-2">
                    <button className="btn btn-primary p-3" onClick={() => handlebtnAdd()}>
                      {isAddExpense ? (
                        <>
                          <FontAwesomeIcon icon={faArrowAltCircleLeft} /> back{' '}
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPlus} /> Add Expense{' '}
                        </>
                      )}
                    </button>
                  </div>
                )}
                {!isAddExpense ? (
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
                    rows={expensesList}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    onSelectionModelChange={(ids: any) => onRowsSelectionHandler(ids)}
                    components={{ Toolbar: CustomToolbar }}
                  />
                ) : (
                  <AddNewExpeness
                    selectId={selectId}
                    setExpensesList={setExpensesList}
                    rows={expensesList}
                    setIsAddExpense={setIsAddExpense}
                    shopId={id}
                    initData={initDataPage}
                  />
                )}
              </Card.Body>
            </Card>
          </Tab>
          <Tab eventKey="category" title="Category">
            <ExpensesCategoriesView />
          </Tab>
        </Tabs>
        {/* end */}
        <div className="col-md-12"></div>
      </div>
    </AdminLayout>
  );
};
export default withAuth(Expenses);
export async function getServerSideProps({ params }) {
  const { id } = params;
  return {
    props: { id },
  };
}
