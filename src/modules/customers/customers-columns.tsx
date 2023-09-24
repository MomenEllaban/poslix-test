import { faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Button, ButtonGroup } from 'react-bootstrap';

const customersColumns: ({
  id,
  permissions,
  setCustomer,
  setShowType,
  setShow,
  setSelectId,
  router,
  setCustomerIsModal,
}) => GridColDef[] = ({
  id,
  permissions,
  setCustomer,
  setShowType,
  setShow,
  setSelectId,
  router,
  setCustomerIsModal,
}) => [
  { field: 'id', headerName: '#', minWidth: 50 },
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    renderCell: ({ row }) => (
      <p>
        {row.first_name} {row.last_name}
      </p>
    ),
  },
  { field: 'mobile', headerName: 'Mobile', flex: 1 },
  {
    field: 'action',
    headerName: 'Action ',
    sortable: false,
    disableExport: true,
    flex: 1,
    renderCell: ({ row }: Partial<GridRowParams>) => (
      <>
        <ButtonGroup className="mb-2 m-buttons-style">
          {permissions?.hasEdit && (
            <Button
              onClick={(event) => {
                // router.push('/shop/' + shopId + '/customers/edit/' + row.id)
                event.stopPropagation();
                setCustomer({
                  value: row.id,
                  label: row.first_name + ' ' + row.last_name,
                  isNew: false,
                });
                setShowType('edit');
                setCustomerIsModal(true);
              }}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
          )}
          {permissions?.hasDelete && (
            <Button
              onClick={(event) => {
                event.stopPropagation();
                setSelectId(row.id);
                setShow(true);
              }}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
          <Button
            onClick={() => {
              router.push('/shop/' + id + '/customers/' + row.id);
            }}>
            <FontAwesomeIcon icon={faEye} />
          </Button>
        </ButtonGroup>
      </>
    ),
  },
];

export default customersColumns;
