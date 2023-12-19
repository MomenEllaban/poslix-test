
import Box from '@mui/material/Box';
import styles from './transefer-modals.module.css';
import Modal from '@mui/material/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Autocomplete, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { createNewData, findAllData } from 'src/services/crud.api';
import { Toastify } from 'src/libs/allToasts';
import { useRouter } from 'next/router';
import { Item } from './item';
import { Spinner } from 'react-bootstrap';



export function AddTranseferModal({ getTransefers }) {
    const locations = JSON.parse(localStorage.getItem('locations') || '[]');

    const [isloading, setIsloading] = useState(false);
    const [isProductsLoadingloading, setIsProductsLoadingloading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter()
    // const [locations, setLocations] = useState([]);
    const [from, setFrom] = useState(locations.find(el => el.location_id === +router.query.id));

    const [to, setTo] = useState<any>();
    const [fromProducts, setFromProducts] = useState([]);
    const [toProducts, setToProducts] = useState([]);

    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedproducts] = useState<any[]>([]);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    // ------------------------------------------------------------------------------------------------
    const handleSelectProduct = (e) => {
        const item = e.target.value

        if (item.stock == 0) {
            Toastify('error', 'this item is currently out of stock.');

            return
        }

        setSelectedproducts(prev => ([...prev, { ...item, quantity: 1, itemTotalPrice: +(item.sell_price || item.price) }]))
    }

    // ------------------------------------------------------------------------------------------------
    const getFromProducts = async () => {

        setIsProductsLoadingloading(true)

        try {
            const res = await findAllData(`products/${from.location_id}`);
            setFromProducts(res.data.result.data);

        }
        catch (e) {
            Toastify('error', 'Somthing wrong!!, try agian');
            return;
        }
        setIsProductsLoadingloading(false)

    }
    // ------------------------------------------------------------------------------------------------
    useEffect(() => {
        setSelectedproducts([]);
        setFromProducts([]);
        setToProducts([]);
        setTo('');
        setFrom(locations.find(el => el.location_id === +router.query.id));
    }, [open])

    // ------------------------------------------------------------------------------------------------
    useEffect(() => {
        setSelectedproducts([])
        if (from) {

            getFromProducts()
        }
    }, [from])

    // ------------------------------------------------------------------------------------------------
    const geToProducts = async () => {
        setIsProductsLoadingloading(true)
        try {
            const res = await findAllData(`products/${to?.location_id}`);
            setToProducts(res.data.result.data);


        }
        catch (e) {
            Toastify('error', 'Somthing wrong!!, try agian');
            return;
        }
        setIsProductsLoadingloading(false)

    }




    useEffect(() => {
        setSelectedproducts([])
        if (to) {
            geToProducts()

        }

    }, [to])
    // ------------------------------------------------------------------------------------------------
    const addItemTocart = (item: any) => {
        if (item.stock > selectedProducts.find(p => p.id === item.id).quantity) {

            const updatedItems = selectedProducts.map(cart_item => {
                if (item.id === cart_item.id) {

                    return { ...cart_item, quantity: cart_item.quantity + 1, itemTotalPrice: +(item.sell_price || item.price) * (cart_item.quantity + 1) };
                }
                return cart_item;
            });
            setSelectedproducts(updatedItems);

        } else {
            Toastify('error', `Sorry, You exceeded the maximum stock quantity of ${item.name}`);

        }

    }

    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------
    const removeFromCart = (item: any) => {


        if (selectedProducts.find(p => p.id === item.id).quantity > 1) {

            const updatedItems = selectedProducts.map(cart_item => {
                if (item.id === cart_item.id) {

                    return { ...cart_item, quantity: cart_item.quantity - 1, itemTotalPrice: (item.sell_price || item.price) * (cart_item.quantity - 1) };
                }
                return cart_item;
            });
            setSelectedproducts(updatedItems);
        } else {

            setSelectedproducts(selectedProducts.filter(el => el.id !== item.id))

        }
    }
    // ------------------------------------------------------------------------------------------------
    const addTransefer = async () => {
        if (from.location_id === to.location_id) {
            Toastify('error', 'Transfer to the same location is not allowed.');

            return
        }
        // setIsloading(true)

        const body = {
            "location_id": from.location_id, // "required|numeric",
            "transferred_location_id": to.location_id, // "required|numeric",
            "ref_no": Math.floor(Math.random() * 1000000), // "required|numeric|unique",???????
            "status": "received", // "required|string:in:draft,partially_received,processing,received,cancelled",?????
            "notes": "", // "nullable|string",????
            // for transaction lines
            "cart":
                selectedProducts.map(product => ({
                    "product_id": product.id, //  "required|numeric:exists:products,id",
                    "transferred_product_id": toProducts.find(p=>p.name===product.name).id, //  "required|numeric:exists:products,id",
                    // "variation_id" : 252, //  "nullable|numeric:exists:variations,id",
                    // "transferred_variation_id" : 124, //  "required|numeric:exists:variations,id",
                    "qty": product.quantity, //  "required|numeric",
                    "cost": +product.cost_price, //  "required|numeric",
                    "price":+ product.sell_price, //  "required|numeric",
                    "note": "" //  "nullable|string",
                }))
            ,
            // for expanses
            "currency_id": 1, // => "nullable|numeric|exists:currencies,id",
            // "expense": {
            //     "amount": 12, // => "nullable|numeric",
            //     "category": {
            //         "id": 25 //> "nullable|numeric|exists:expanse,id",
            //     }
            // }
        }
        // console.log(body);
        
        // return

        try {
            const res = await createNewData('transfer', body);
            getTransefers()
            handleClose()
        } catch {
            Toastify('error', 'Somthing wrong!!, try agian');

        }
        setIsloading(false)

    }
    // ------------------------------------------------------------------------------------------------


    return (
        <div>
            <button
                className="btn btn-primary "
                onClick={handleOpen}>
                <FontAwesomeIcon icon={faPlus} /> Add New Transfer{' '}
            </button>
            {/* <Button onClick={handleOpen}>Open modal</Button> */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className={styles.modal_wrapper}>
                    {/* from auto compolete */}
                    <h5 className='p-2'>Add New Transfer{' '}</h5>
                    <div className='d-flex justify-content-between mb-3'>
                        <Autocomplete
                            size='small'
                            isOptionEqualToValue={(option, value) => option.name === value.name}
                            // disablePortal
                            id="From"
                            options={locations}
                            value={from}
                            getOptionLabel={(option) => option?.location_name || ''}
                            onChange={(e, newValue) => {
                                setFrom(newValue)
                            }}
                            sx={{ width: '48%' }}
                            renderInput={(params) =>
                                <TextField
                                inputProps={{
                                  ...params.inputProps,
                                }}
                                fullWidth
                                size="small"
                                id="From"
                                InputProps={{
                                  ...params.InputProps,
                                }}
                                label={'From'}
                              />}
                        />
                        {/* to auto compolete */}
                        <Autocomplete
                            size='small'
                            isOptionEqualToValue={(option, value) => option.name === value.name}

                            // disablePortal
                            id="To"
                            getOptionLabel={(option: any) => option?.location_name || ''}
                            options={locations}
                            value={to}
                            onChange={(e, newValue) => {
                                setTo(newValue)
                            }}
                            sx={{ width: '48%' }}
                            renderInput={(params) =>
                                <TextField
                                inputProps={{
                                  ...params.inputProps,
                                }}
                                fullWidth
                                size="small"
                                id="To"
                                InputProps={{
                                  ...params.InputProps,
                                }}
                                label={"To"}
                              />
                               
                                
                                }
                        />
                    </div>
                    {/* products auto complete */}
                    {/* <Autocomplete
                        disablePortal
                        id="Select Product"
                        getOptionLabel={(option: any) => option?.name || ''}
                        options={fromProducts.filter(fromProduct => {return toProducts.find(toProduct => {return fromProduct.name === toProduct.name})})}
                        value={''}
                        onChange={(e, newValue) => {
                            handleSelectProduct(newValue)
                        }}
                        renderInput={(params) =>
                            <TextField {...params} label="Select Product" />}
                    /> */}
                    <FormControl size='small'
                        sx={{ width: '48%', marginBottom: '8px' }}>
                        <InputLabel id="select-product-label">Select Product</InputLabel>
                        <Select
                            size='small'
                            labelId="select-product-label"
                            id="select-product"
                            value={''}
                            onChange={handleSelectProduct}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {fromProducts
                                .filter((fromProduct) => {
                                    return toProducts.some((toProduct) => fromProduct.name === toProduct.name) && !(selectedProducts.some((selectedProduct) => fromProduct.name === selectedProduct.name))
                                })
                                .map((product) => (
                                    <MenuItem key={product.id} value={product} className='w-100 d-flex justify-content-between'>
                                        {product.name} <span style={{ fontSize: '12px' }}>Stock:{product.stock}</span>
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                    {isProductsLoadingloading && <Spinner style={{ width: '30px', height: '30px' }} />}
                    <div className={styles.products_wrapper}>
                        {selectedProducts?.map(el => {
                            return <Item key={el.id} removeFromCart={removeFromCart} addItemTocart={addItemTocart} item={el} />
                        })}
                    </div>
                    <button
                        disabled={isProductsLoadingloading || isloading || !to?.location_id || !from?.location_id || selectedProducts?.length === 0}
                        className="btn btn-primary my-2"
                        onClick={addTransefer}>{isloading ? <Spinner style={{ width: '20px', height: '20px' }} /> : <FontAwesomeIcon icon={faPlus} />}
                        Send Transfer{' '}
                    </button>
                </Box>
            </Modal>
        </div>
    );
}