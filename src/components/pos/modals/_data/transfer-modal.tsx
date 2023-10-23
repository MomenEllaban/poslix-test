import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Button, ButtonGroup } from 'react-bootstrap';

export const transferColumns: GridColDef[] = [
  // { field: "check", headerName: <Checkbox aria-label={"select-all"} onChange={(e: ChangeEvent<HTMLInputElement>)=>{
  //   // if(e.target.checked) setSelectedItems([...selectedItems, row.id])
  //   // else setSelectedItems(selectedItems.filter((id) => {return id !== row.id}))
  // }} />,
  // headerClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}` ,
  // cellClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}`,
  // minWidth: 10, renderCell: ({ row }: Partial<GridRowParams>) => (
  //   <Checkbox aria-label={row.name} onChange={(e: ChangeEvent<HTMLInputElement>)=>{
  //     if(e.target.checked) setSelectedItems([...selectedItems, row.id])
  //     else setSelectedItems(selectedItems.filter((id) => {return id !== row.id}))
  //   }} />
  // ) },
  { field: 'id', headerName: '#', minWidth: 50 },
  { field: 'name', headerName: 'name ', flex: 1 },
  {
    field: 'qty',
    headerName: 'Quantity',
    flex: 0.5,
    renderCell: ({ row }: Partial<GridRowParams>) => (
      <>
        <input
          type="number"
          name="qty"
          className="form-control"
          value={row.qty}
          min={1}
          onChange={(e) => {
            // handelChangeQty(e, row.id);
          }}
        />
      </>
    ),
  },
  {
    field: 'unitPrice',
    headerName: 'Unit Price',
    flex: 1,
    renderCell: ({ row }: Partial<GridRowParams>) => (
      <>
        <input
          disabled
          type="number"
          name="unit-price"
          className="form-control"
          value={row.unitPrice}
        />
      </>
    ),
  },
  {
    field: 'subtotal',
    headerName: 'Subtotal',
    flex: 1,
    renderCell: ({ row }: Partial<GridRowParams>) => (
      <>
        <input
          disabled
          type="number"
          name="subtotal"
          className="form-control"
          value={row.subtotal}
          // onChange={(e) =>
          //   setTransferInfo({
          //     ...transferInfo,
          //     firstName: e.target.value,
          //   })
          // }
        />
      </>
    ),
  },
  {
    field: 'action',
    headerName: 'Action ',
    sortable: false,
    disableExport: true,
    flex: 1,
    renderCell: ({ row }: Partial<GridRowParams>) => (
      <>
        <ButtonGroup className="mb-2 m-buttons-style">
          <Button
          // onClick={() => {
          //   setSelectId(row.id);
          //   setShow(true);
          // }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </ButtonGroup>
      </>
    ),
  },
];

export const transferSelectColourStyles = {
  control: (style: any, state: any) => ({
    ...style,
    borderRadius: '10px',
    background: '#f5f5f5',
    height: '50px',
    outline: state.isFocused ? '2px solid #045c54' : 'none',
    boxShadow: 'none',
    '&:hover': {
      outline: '2px solid #045c54 ',
    },
  }),
  menu: (provided: any, state: any) => ({
    ...provided,
    borderRadius: '10px',
    padding: '10px', // Add padding to create space
    border: '1px solid #c9ced2',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#e6efee' : 'white',
    color: '#2e776f',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: '#e6efee',
      color: '#2e776f',
      borderRadius: '10px',
    },
    margin: '5px 0', // Add margin to create space between options
  }),
};
