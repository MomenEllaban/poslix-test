
import styles from './transefer.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Autocomplete, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { createNewData, findAllData } from 'src/services/crud.api';
import { Toastify } from 'src/libs/allToasts';
import { useRouter } from 'next/router';
import { Item } from './item';
import { Spinner } from 'react-bootstrap';
import { VariantsProductModal } from './variants-product-modal';
let locations
const AddTranseferComponent = () => {

    const [isloading, setIsloading] = useState(false);
    const [isProductsLoadingloading, setIsProductsLoadingloading] = useState(false);
    const router = useRouter()
    const [from, setFrom] = useState<any>();
    const [referanceNumber, setReferanceNumber] = useState<any>('');

    const [to, setTo] = useState<any>();
    const [fromProducts, setFromProducts] = useState([]);
    const [toProducts, setToProducts] = useState([]);
    const [status, setStatus] = useState('received');
    const [selectedProducts, setSelectedproducts] = useState<any[]>([]);
    const [selectedVariantProduct, setSelectedVariantProduct] = useState();

    // ------------------------------------------------------------------------------------------------
    const handleSelectProduct = (item) => {
        if (item.type === "variable") {
            setSelectedVariantProduct(item)
            return
        }

        if (item?.stock == 0) {
            Toastify('error', 'this item is currently out of stock.');

            return
        }

        setSelectedproducts(prev => ([...prev, { ...item, quantity: 1, itemTotalPrice: +(item.sell_price || item.price) }]))
    }

    // ------------------------------------------------------------------------------------------------
    const getFromProducts = async () => {

        setIsProductsLoadingloading(true)

        try {
            const res = await findAllData(`products/${from?.location_id}`);
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

        if (router.query.id) {
            locations = JSON.parse(localStorage.getItem('locations') || '[]');
            setFrom(locations?.find((el: any) => el.location_id == +router.query.id));

        }
    }, [router.query.id])

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

        if (selectedProducts.find(p => p.id === item.id)) {
            // ---
            if (item.stock > selectedProducts.find(p => p.id === item.id)?.quantity) {

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
            // ---
        } else {

            setSelectedproducts([...selectedProducts, { ...item, quantity: 1, itemTotalPrice: +(item.sell_price || item.price) }])

        }
    }

    // ------------------------------------------------------------------------------------------------
    const removeProductFromCart = (item) => {
        setSelectedproducts(prev => prev.filter(el => el.id !== item.id));
    }
    // ------------------------------------------------------------------------------------------------
    const reduceProductQty = (item: any) => {


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
        if (from?.location_id === to.location_id) {
            Toastify('error', 'Transfer to the same location is not allowed.');

            return
        }
        // setIsloading(true)

        const body = {
            "location_id": from?.location_id, // "required|numeric",
            "transferred_location_id": to.location_id, // "required|numeric",
            "ref_no": referanceNumber, // "required|numeric|unique",???????
            "status": status, // "required|string:in:draft,partially_received,processing,received,cancelled",?????
            "notes": "", // "nullable|string",????
            // for transaction lines
            "cart":
                selectedProducts.map(product => ({
                    "product_id": product.id, //  "required|numeric:exists:products,id",
                    "transferred_product_id": toProducts.find(p => p.name === product.name).id, //  "required|numeric:exists:products,id",
                    // "variation_id" : 252, //  "nullable|numeric:exists:variations,id",
                    // "transferred_variation_id" : 124, //  "required|numeric:exists:variations,id",
                    "qty": product.quantity, //  "required|numeric",
                    "cost": +product.cost_price, //  "required|numeric",
                    "price": + product.sell_price, //  "required|numeric",
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
            router.push(`/shop/${router.query.id}/transfers`);
        } catch {
            Toastify('error', 'Somthing wrong!!, try agian');

        }
        setIsloading(false)

    }
    // ------------------------------------------------------------------------------------------------

    // ------------------------------------------------------------------------------------------------
    return (
        <div>

            <div className={styles.add_transefer_wrapper}>
                {/* from auto compolete */}
                <h5 className='p-2'>Add New Transfer{' '}</h5>
                <div className='d-flex gap-3 mb-3 flex-wrap'>
                    <Autocomplete
                        size='small'
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                        // disablePortal
                        id="From"
                        options={locations || []}
                        value={from || ''}
                        getOptionLabel={(option) => option?.location_name || ''}
                        onChange={(e, newValue) => {
                            setFrom(newValue)
                        }}
                        sx={{ width: '30%' }}
                        renderInput={(params) =>
                            <TextField
                                {...params} label="From" />}
                    />
                    {/* to auto compolete */}
                    <Autocomplete
                        size='small'
                        isOptionEqualToValue={(option, value) => option.name === value.name}

                        // disablePortal
                        id="To"
                        getOptionLabel={(option: any) => option?.location_name || ''}
                        options={locations || []}
                        value={to || ''}
                        onChange={(e, newValue) => {
                            setTo(newValue)
                        }}
                        sx={{ width: '30%' }}
                        renderInput={(params) =>
                            <TextField
                                {...params} label="To" />}
                    />
                    {/* referance texfeild*/}
                    <TextField sx={{ width: '30%' }} id="ref no" label="Referance Number" placeholder="Reference Number" variant='outlined' size='small' value={referanceNumber} onChange={(e) => {
                        setReferanceNumber(e.target.value)
                    }} />
                    {/* products auto complete */}
                    <Autocomplete
                        size='small'
                        isOptionEqualToValue={(option, value) => (true)}
                        disablePortal
                        id="Select Product"
                        getOptionLabel={(option: any) => option?.name || ''}
                        options={fromProducts
                            .filter((fromProduct) => {
                                return toProducts.some((toProduct) => fromProduct.name === toProduct.name) && !(selectedProducts.some((selectedProduct) => fromProduct.name === selectedProduct.name))
                            }) || []}
                        value={''}
                        onChange={(e, newValue) => {
                            if (!newValue) return
                            (document?.activeElement as HTMLElement)?.blur();
                            handleSelectProduct(newValue)
                        }}
                        sx={{ width: '61.5%' }}
                        renderInput={(params) =>
                            <TextField  {...params} label="Select Product" />}
                    />




                    {/* status select start */}
                    <FormControl size='small'
                        sx={{ width: '30%', marginBottom: '8px' }}>
                        <InputLabel id="select-product-label">Select Product Status</InputLabel>
                        <Select
                            size='small'
                            labelId="select-product-label"
                            id="select-product"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value)
                            }}
                        >
                            <MenuItem value="received">
                                Received
                            </MenuItem>

                            <MenuItem value="partially_received">
                                Partially Received
                            </MenuItem>
                            <MenuItem value="processing">
                                Processing
                            </MenuItem>
                            <MenuItem value="cancelled">
                                Cancelled
                            </MenuItem>

                        </Select>
                    </FormControl>
                    {/*  */}

                    {isProductsLoadingloading && <Spinner style={{ width: '30px', height: '30px' }} />}


                </div>
                <div className={styles.products_wrapper}>
                    {selectedProducts?.map((el, i) => {
                        return <Item removeProductFromCart={removeProductFromCart} index={i} fromLocation={from} key={el.id} reduceProductQty={reduceProductQty} addItemTocart={addItemTocart} item={el} />
                    })}
                </div>
                {selectedVariantProduct && <VariantsProductModal
                    product={selectedVariantProduct} setProduct={setSelectedVariantProduct}
                    addItemTocart={addItemTocart} location={{}} />}
                {/* submit button */}
                <button
                    disabled={!referanceNumber || isProductsLoadingloading || isloading || !to?.location_id || !from?.location_id || selectedProducts?.length === 0}
                    className="btn btn-primary my-2"
                    onClick={addTransefer}>{isloading ? <Spinner style={{ width: '20px', height: '20px' }} /> : <FontAwesomeIcon icon={faPlus} />}
                    Send Transfer{' '}
                </button>
            </div>

        </div>
    );
}

export { AddTranseferComponent };
