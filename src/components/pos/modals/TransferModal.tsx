import { ITransferItem } from '@models/common-model';
import { IProduct } from '@models/pos.types';
import { debounce } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { Controller, SubmitErrorHandler, useFieldArray, useForm } from 'react-hook-form';
import { BiFolderOpen, BiMinusCircle, BiPlusCircle, BiSend } from 'react-icons/bi';
import Select from 'react-select';
import FormField from 'src/components/form/FormField';
import MainModal from 'src/components/modals/MainModal';
import { Toastify } from 'src/libs/allToasts';
import { createNewData, findAllData } from 'src/services/crud.api';
import { transferSelectColourStyles } from './_data/transfer-modal';

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
  const [isLocationsSelected, setIsLocationSelected] = useState(false);
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

  const handleSelectLocations = (e) => {
    e.preventDefault();
    if (isLocationsSelected) {
      setSelectedLocations({
        from: 0,
        to: 0,
      });

      setFromProductsList([]);
      setToProductsList([]);
      setIsLocationSelected(false);
      return;
    }
    if (!selectedLocations.from || !selectedLocations.to)
      return Toastify('error', 'please select proper locations');

    setIsLocationSelected(true);
    // *** //
    getLocationProducts(selectedLocations.from, setFromProductsList);
    getLocationProducts(selectedLocations.to, setToProductsList);
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

  const { control, register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      cart: [
        {
          product_id: 0,
          transferred_product_id: 0,
          qty: 0,
          cost: 0,
          price: 0,
          note: '',
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
  const onError: SubmitErrorHandler<FormValues> = (e) => {
    console.warn(e);
  };

  // useEffect(() => {}, [shopId]);
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
        <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="overflow-hidden p-2">
            <div className="d-flex flex-row gap-3 w-100 align-items-end">
              <div className="d-flex flex-column w-50">
                <p>From</p>
                <Select
                  isDisabled={isLocationsSelected}
                  styles={transferSelectColourStyles}
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
                  isDisabled={isLocationsSelected}
                  styles={transferSelectColourStyles}
                  defaultValue={locations.find((location) => location.value === +shopId)}
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

              <Button
                type="button"
                disabled={!selectedLocations.from || !selectedLocations.to}
                onClick={handleSelectLocations}
                className="d-flex justify-content-center align-items-center flex-row gap-1 flex-grow-0 flex-shrink-0"
                style={{
                  whiteSpace: 'nowrap',
                  height: '50px',
                }}>
                {!isLocationsSelected ? (
                  <span>Select Locations</span>
                ) : (
                  <span>Change Locations</span>
                )}
                <BiFolderOpen />
              </Button>
            </div>
            <div
              style={{
                maxWidth: '100%',
                overflow: 'auto',
                minHeight: '50dvh',
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
                        <Controller
                          name={`cart.${index}.product_id`}
                          control={control}
                          render={({ field }) => (
                            <div className="d-flex flex-column">
                              <span className="fw-semibold fs-6">Select product</span>
                              <Select
                                styles={transferSelectColourStyles}
                                isLoading={isLoading}
                                isSearchable
                                name="product_from"
                                value={fromProductslist.find(
                                  (product) => product.id === field.value
                                )}
                                options={fromProductslist}
                                onChange={(value) => {
                                  field.onChange(value.id);
                                }}
                              />
                            </div>
                          )}
                        />
                      </td>
                      <td>
                        <Controller
                          name={`cart.${index}.transferred_product_id`}
                          control={control}
                          render={({ field }) => (
                            <div className="d-flex flex-column">
                              <span className="fw-semibold fs-6">Select product</span>
                              <Select
                                styles={transferSelectColourStyles}
                                isLoading={isLoading}
                                isSearchable
                                name="product_to"
                                value={toProductslist.find((product) => product.id === field.value)}
                                options={toProductslist}
                                onChange={(value) => {
                                  field.onChange(value.id);
                                }}
                              />
                            </div>
                          )}
                        />
                      </td>
                      <td>
                        <div className="d-flex flex-row gap-3">
                          <FormField
                            name={`cart.${index}.qty`}
                            label="Qty"
                            errors={{}}
                            type="number"
                            min={1}
                            register={register}
                            style={{
                              height: '50px',
                            }}
                          />
                          <FormField
                            type="number"
                            min={0}
                            name={`cart.${index}.cost`}
                            label="Cost"
                            errors={{}}
                            style={{
                              height: '50px',
                            }}
                          />
                          <FormField
                            type="number"
                            min={0}
                            name={`cart.${index}.price`}
                            label="Price"
                            errors={{}}
                            style={{
                              height: '50px',
                            }}
                          />
                          {/* <FormField name={`cart.${index}.note`} label="Note" errors={{}} /> */}
                        </div>
                      </td>
                      <td>
                        <div
                          className="d-flex flex-row gap-3 h-100"
                          style={{ marginTop: '2.5rem' }}>
                          <Button
                            className="d-flex justify-content-center align-items-center"
                            style={{
                              height: '50px',
                              width: '50px',
                            }}
                            onClick={() => append({ ...transferItem })}>
                            <BiPlusCircle />
                          </Button>
                          {index > 0 && (
                            <Button
                              className="d-flex justify-content-center align-items-center"
                              style={{
                                height: '50px',
                                width: '50px',
                              }}
                              onClick={() => remove(index)}>
                              <BiMinusCircle />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="d-flex flex-row w-100 px-2">
              <Button
                type="submit"
                className="ms-auto fs-5 d-flex flex-row gap-3 align-items-center justify-content-center">
                <span>Transfer</span>
                <BiSend />
              </Button>
            </div>
          </div>
        </Form>
      }
    />
  );
};

export default TransferModal;
