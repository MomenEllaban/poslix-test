import { faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ITransferItem } from '@models/common-model';
import { debounce } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { DataGrid, GridColDef, GridRowParams, GridSelectionModel } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup, Table } from 'react-bootstrap';
import Select from 'react-select';
import MainModal from 'src/components/modals/MainModal';
import { Toastify } from 'src/libs/allToasts';
import { createNewData, findAllData } from 'src/services/crud.api';
import { ProductContext } from '../../../context/ProductContext';
import { IProduct } from '@models/pos.types';
import FormField from 'src/components/form/FormField';
import { BiPlusCircle } from 'react-icons/bi';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';

interface IProductTransfer {
  product_id: number;
  transferred_product_id: number;
  variation_id?: number;
  transferred_variation_id?: number;
  qty: number;
  cost: number;
  price: number;
  note?: string;
}

type FormValues = {
  cart: IProductTransfer[];
};

const colourStyles = {
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

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

const transferItem = {
  product_id: 0, //  "required|numeric:exists:products,id",
  transferred_product_id: 0, //  "required|numeric:exists:products,id",
  variation_id: null, //  "nullable|numeric:exists:variations,id",
  transferred_variation_id: null, //  "required|numeric:exists:variations,id",
  qty: 0, //  "required|numeric",
  cost: 0, //  "required|numeric",
  price: 0, //  "required|numeric",
  note: '', //  "nullable|string",
};

const TransferModal = (props: any) => {
  const { openDialog, statusDialog, userdata, showType, shopId } = props;

  const [fromProductslist, setFromProductsList] = useState<any[]>([]);
  const [toProductslist, setToProductsList] = useState<any[]>([]);
  const [transferProducts, setTransferProducts] = useState<any[]>([]);
  const [selectedLocations, setSelectedLocations] = useState({ from: 0, to: 0 });

  const [products, setProducts] = useState<
    {
      id: number;
      name: string;
      qty?: number;
      unitPrice?: number;
      subtotal?: number;
    }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [moreInfo, setMoreInfo] = useState(false);
  const [transferInfo, setTransferInfo] = useState<ITransferItem>({
    id: 0,
    date: '',
    refNo: 0,
    status: 'Draft',
    locationFrom: 0,
    locationTo: 0,
    charges: 0,
    notes: '',
    products: [],
  });

  const { customers, setCustomers } = useContext(ProductContext);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  // JSON.parse(localStorage.getItem('locations') || '[]')
  const [locations, setLocations] = useState<{ value: number; label: string }[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [openSnakeBar, setOpenSnakeBar] = useState(false);
  const handleClose = () => {
    setOpen(false);
    // openDialog(transferInfo);
  };
  useEffect(() => {
    if (!statusDialog) return;
    // setTransferInfo(transferTemplte);
    setOpen(statusDialog);
    if (userdata !== undefined && showType != 'add' && statusDialog) {
    }
    // getCustomerInfo(userdata.value);
    var _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    setLocations(
      _locs.map((loc) => {
        return { ...loc, label: loc.location_name, value: loc.location_id };
      })
    );
  }, [statusDialog]);

  useEffect(() => {
    initDataPage();
  }, [router.asPath]);

  // async function insertCustomerInfo() {
  //   const { success, msg, code, newdata } = await apiInsertCtr({
  //     type: "customer",
  //     subType: "addCustomer",
  //     shopId,
  //     data: transferInfo,
  //   });
  //   if (success) {
  //     setCustomers([...customers, newdata]);
  //     handleClose();
  //     Toastify("success", "Successfully Created");
  //   } else if (code == 100) Toastify("error", msg);
  //   else Toastify("error", "Has Error, Try Again...");
  // }
  // async function getCustomerInfo(theId: any) {
  //   setIsLoading(true);
  //   setTransferInfo(transferTemplte);
  //   var result = await apiFetchCtr({
  //     fetch: "customer",
  //     subType: "getCustomerInfo",
  //     theId,
  //     shopId,
  //   });
  //   if (result.success) {
  //     console.log(result?.newdata[0]);
  //     const selCustomer = result?.newdata[0];
  //     setTransferInfo({
  //       ...transferInfo,
  //       id: theId,
  //       mobile: selCustomer.mobile,
  //       firstName: selCustomer.first_name,
  //       lastName: selCustomer.last_name,
  //       city: selCustomer.city,
  //       state: selCustomer.state,
  //       addr1: selCustomer.addr1,
  //       addr2: selCustomer.addr2,
  //       zipCode: selCustomer.zip_code,
  //       country: selCustomer.country,
  //       shipAddr: selCustomer.shipping_address,
  //     });
  //     setIsLoading(false);
  //     console.log(result.newdata[0].mobile);
  //   } else {
  //     Toastify("error", "has error, Try Again...");
  //   }
  // }

  // async function editCustomerInfo() {
  //   var result = await apiUpdateCtr({
  //     type: "customer",
  //     subType: "editCustomerInfo",
  //     shopId,
  //     data: transferInfo,
  //   });
  //   if (result.success) {
  //     const cinx = customers.findIndex(
  //       (customer) => customer.value === transferInfo.id
  //     );
  //     if (cinx > -1) {
  //       const upCustomer = [...customers];
  //       upCustomer[cinx] = {
  //         ...upCustomer[cinx],
  //         value: transferInfo.id,
  //         label:
  //           transferInfo.firstName +
  //           " " +
  //           transferInfo.lastName +
  //           " | " +
  //           transferInfo.mobile,
  //         mobile: result.newdata.mobile,
  //       };
  //       setCustomers(upCustomer);
  //     }
  //     handleClose();
  //     Toastify("success", "Successfully Edited");
  //   } else Toastify("error", "has error, Try Again...");
  // }
  const makeShowSnake = (val: any) => {
    setOpenSnakeBar(val);
  };

  async function initDataPage() {
    if (router.isReady) {
      transferInfo.locationFrom = Number(router.query.id);
      transferInfo.locationTo = Number(router.query.id);
      const res = await findAllData(`products/${router.query.id}?all_data=1`);
      if (!res.data.success) {
        Toastify('error', 'Somthing wrong!!, try agian');
        return;
      }
      const products = res.data.result.map((product: IProduct) => {
        console.log(product);
      });

      // setProducts(products);
      // setFilteredProducts(products);
      setIsLoading(false);
    }
  }

  const getLocationProducts = async (location_id, setState) => {
    const res = await findAllData(`products/${location_id}?all_data=1`);
    if (!res.data.success) {
      Toastify('error', 'Somthing wrong!!, try agian');
      return;
    }
    const products = res.data.result.map((product: IProduct) => ({
      ...product,
      label: product.name,
      value: product.id,
    }));
    setState(products);
  };

  useEffect(() => {
    getLocationProducts(selectedLocations.from, setFromProductsList);
  }, [selectedLocations.from]);

  useEffect(() => {
    getLocationProducts(selectedLocations.to, setToProductsList);
  }, [selectedLocations.to]);

  const handelChangeQty = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const value = event.target.value;
    let prods = [...products];
    let idx = prods.findIndex((ele) => ele.id == id);
    prods[idx].qty = +value;
    prods[idx].subtotal = +value * prods[idx].unitPrice;
    setProducts(prods);
    if (transferInfo.products.some((prod) => prod.id === id)) {
      const newProducts = transferInfo.products.map((prod) => {
        if (prod.id === id) {
          console.log({ ...prod, qty: +value });
          return { ...prod, qty: +value };
        } else return { ...prod };
      });
      setTransferInfo({
        ...transferInfo,
        products: [...newProducts],
      });
    }
  };
  const columns: GridColDef[] = [
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
              handelChangeQty(e, row.id);
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

  const handleSearch = (event) => {
    debounceSearchTerm(event.target.value);
  };
  // Debounce user input with lodash debounce function
  const debounceSearchTerm = debounce((value) => {
    setSearchTerm(value);
  }, 500);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filteredList = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filteredList);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const onRowsSelectionHandler = (ele: any) => {
    const idx = products.findIndex((e) => e.id == ele);
    setTransferInfo({
      ...transferInfo,
      products: [
        ...transferInfo.products,
        {
          id: products[idx].id,
          name: products[idx].name,
          qty: products[idx].qty,
          sell: products[idx].unitPrice,
          totalPrice: products[idx].subtotal,
        },
      ],
    });
  };

  const handleTransfer = async () => {
    const data = {
      location_id: transferInfo.locationTo,
      transferred_location_id: transferInfo.locationFrom,
      ref_no: transferInfo.refNo,
      status: transferInfo.status,
      notes: transferInfo.notes,
      cart: transferInfo.products.map((prod) => {
        return {
          product_id: prod.id,
          qty: prod.qty,
          cost: prod.sell,
          price: prod.totalPrice,
          note: '',
        };
      }),
    };
    let res;
    console.log(data);
    if (showType === 'add') {
      res = await createNewData('transfer', data);
    } else {
      // res = await updateData('transfer', )
    }
    if (res.data.success) setOpen(false);
  };

  const { control, register } = useForm<FormValues>({
    defaultValues: {
      cart: [
        {
          product_id: 0,
          transferred_product_id: 0,
          qty: 0,
        },
      ],
    },
    mode: 'onBlur',
  });
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control,
    name: 'cart',
  });
  const onSubmit = (data: FormValues) => console.log(data);

  //! check if from and to is the same locations
  return (
    <MainModal
      size="xl"
      fullScreen="sm-down"
      scrollabe
      show={open}
      setShow={setOpen}
      title={showType + ' stock transfer'}
      body={
        <div className="overflow-hidden">
          <div className="d-flex flex-row gap-3 w-100">
            <div className="d-flex flex-column w-50">
              <p>From</p>
              <Select
                styles={colourStyles}
                value={locations.find((location) => location.value === selectedLocations.from)}
                isLoading={isLoading}
                isSearchable
                name="location_from"
                onChange={({ value, label }) => {
                  setSelectedLocations((prev) => ({
                    ...prev,
                    from: value,
                  }));
                }}
                options={locations}
              />
            </div>
            <div className="d-flex flex-column w-50">
              <p>To</p>
              <Select
                styles={colourStyles}
                value={locations.find((location) => location.value === selectedLocations.to)}
                isLoading={isLoading}
                isSearchable
                name="location_to"
                onChange={({ value, label }) => {
                  setSelectedLocations((prev) => ({
                    ...prev,
                    to: value,
                  }));
                }}
                options={locations}
              />
            </div>
          </div>
          <div
            style={{
              maxWidth: '100%',
              overflow: 'auto',
            }}>
            <Table
              style={{
                tableLayout: 'fixed',
                overflowX: 'auto',
              }}>
              <thead>
                <tr>
                  <th style={{ width: '15rem' }}>From</th>
                  <th style={{ width: '15rem' }}>To</th>
                  <th style={{ width: '14rem' }}>Details</th>
                  <th style={{ width: '10rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id}>
                    <td>
                      <Select
                        styles={colourStyles}
                        isLoading={isLoading}
                        isSearchable
                        name="product_from"
                        options={fromProductslist}
                      />
                    </td>
                    <td>
                      <Select
                        styles={colourStyles}
                        isLoading={isLoading}
                        isSearchable
                        name="product_to"
                        options={toProductslist}
                      />
                    </td>
                    <td>
                      <div className="d-flex flex-row gap-3">
                        <FormField
                          name={`cart.${index}.qty`}
                          label="Qty"
                          errors={{}}
                          register={register}
                        />
                        <FormField name={`cart.${index}.cost`} label="Cost" errors={{}} />
                        <FormField name={`cart.${index}.price`} label="Price" errors={{}} />
                        <FormField name={`cart.${index}.note`} label="Note" errors={{}} />
                      </div>
                    </td>
                    <td>
                      <Button
                        className="h-100"
                        onClick={() =>
                          append({
                            product_id: 0,
                            transferred_product_id: 0,
                            qty: 0,
                          })
                        }>
                        <BiPlusCircle />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      }
    />
  );
  return (
    <>
      <Dialog open={open} className="poslix-modal" onClose={handleClose} maxWidth={'xl'}>
        <DialogTitle className="poslix-modal-title text-primary">
          {showType + ' stock transfer'}
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                margin: '20px',
              }}>
              <CircularProgress />
            </Box>
          ) : (
            <div className="poslix-modal">
              <div className="modal-content">
                <div className="modal-body">
                  <fieldset disabled={showType == 'show' ? true : false}>
                    <div className="row">
                      <div className="col-lg-4 mb-3">
                        <label>Date</label>
                        <input
                          type="datetime-local"
                          name="date"
                          className="form-control"
                          value={transferInfo.date}
                          onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-4 mb-3">
                        <label>Refrence No</label>
                        <input
                          type="number"
                          name="refrence-no"
                          className="form-control"
                          placeholder="Transactions"
                          min={1}
                          value={transferInfo.refNo}
                          onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              refNo: +e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-4 mb-3">
                        <label>Status</label>
                        <select
                          className="form-select"
                          defaultValue={transferInfo.status}
                          onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              status: e.target.value,
                            })
                          }>
                          <option value={'Draft'}>Draft</option>
                          <option value={'Processing'}>Processing</option>
                          <option value={'Received'}>Received</option>
                        </select>
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label>Location from</label>
                        <select
                          className="form-select"
                          onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              locationFrom: +e.target.value,
                            })
                          }>
                          {locations.map((el, i) => {
                            return (
                              <option key={el.value} value={el.value}>
                                {el.label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label>Location to</label>
                        <select
                          className="form-select"
                          onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              locationTo: +e.target.value,
                            })
                          }>
                          {locations.map((el, i) => {
                            return (
                              <option key={el.value} value={el.value}>
                                {el.label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="col-lg-8 input-group mb-3">
                        <span className="input-group-text" id="basic-addon1">
                          <FontAwesomeIcon icon={faSearch} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search"
                          onChange={handleSearch}
                        />
                      </div>
                      <div style={{ height: 350, width: '100%' }}>
                        <DataGrid
                          // checkboxSelection
                          className="datagrid-style"
                          sx={{
                            '.MuiDataGrid-columnSeparator': {
                              display: 'none',
                            },
                            '&.MuiDataGrid-root': {
                              border: 'none',
                            },
                          }}
                          checkboxSelection
                          hideFooter
                          disableSelectionOnClick
                          // rows={searchTerm.length > 0 ? filteredProducts : []}
                          rows={filteredProducts}
                          columns={columns}
                          // pageSize={10}
                          // rowsPerPageOptions={[10]}

                          onSelectionModelChange={(ids: GridSelectionModel) => {
                            console.log(ids);
                            let lastId = [...ids].pop();

                            onRowsSelectionHandler(lastId);
                            // console.log('idddddddddd', ids);
                          }}
                          // onCellClick={handleCellClick}
                          // components={{ Toolbar: CustomToolbar }}
                        />
                      </div>

                      <div className="col-lg-6 mb-3">
                        <label>Shipping Charges: </label>
                        <input
                          type="number"
                          name="charge"
                          className="form-control"
                          value={transferInfo.charges}
                          onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              charges: +e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label htmlFor="notes" className="form-label">
                          Example textarea
                        </label>
                        <textarea
                          className="form-control"
                          id="notes"
                          rows={3}
                          value={transferInfo.notes}
                          onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              notes: e.target.value,
                            })
                          }></textarea>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div className="modal-footer">
                  <a className="btn btn-link link-success fw-medium" onClick={() => handleClose()}>
                    <i className="ri-close-line me-1 align-middle" /> Close
                  </a>
                  {showType != 'show' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      // onClick={() => {
                      //   console.log(transferInfo);
                      //   if (showType == "edit") editCustomerInfo();
                      //   else insertCustomerInfo();
                      // }}
                      onClick={handleTransfer}>
                      {showType} Transfer
                    </button>
                  )}
                </div>
              </div>
              {/* /.modal-content */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransferModal;
