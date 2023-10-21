
import Box from '@mui/material/Box';
import styles from './transefer-modals.module.css';
import Modal from '@mui/material/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Autocomplete, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { findAllData } from 'src/services/crud.api';
import { Toastify } from 'src/libs/allToasts';
import async from 'react-select/dist/declarations/src/async/index';
import { useRouter } from 'next/router';



export function AddTranseferModal() {
    const locations = JSON.parse(localStorage.getItem('locations') || '[]');

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
    const handleSelectProduct = (product) => {
        setSelectedproducts(prev => ([...prev, product]))
    }

    // ------------------------------------------------------------------------------------------------
    const getFromProducts = async () => {

        try {
            const res = await findAllData(`products/${from.location_id}`);
            setFromProducts(res.data.result.data);

        }
        catch (e) {
            Toastify('error', 'Somthing wrong!!, try agian');
            return;
        }
    }
    // ------------------------------------------------------------------------------------------------
    useEffect(() => {
        if (from) {
            getFromProducts()
        }
    }, [from])
   
    // ------------------------------------------------------------------------------------------------
    const geToProducts = async () => {

        try {
            const res = await findAllData(`products/${to?.location_id}`);
            setToProducts(res.data.result.data);


        }
        catch (e) {
            Toastify('error', 'Somthing wrong!!, try agian');
            return;
        }
    }




    useEffect(() => {
        if (to) {
            
            geToProducts()
          
        }
    }, [to])
    // ------------------------------------------------------------------------------------------------
    return (
        <div>
            <button
                className="btn btn-primary p-3"
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
                    <Autocomplete
                        disablePortal
                        id="From"
                        options={locations}
                        value={from}
                        getOptionLabel={(option) => option?.location_name || ''}
                        onChange={(e, newValue) => {
                            setFrom(newValue)
                        }}
                        renderInput={(params) =>
                            <TextField {...params} label="From" />}
                    />
                    {/* to auto compolete */}
                    <Autocomplete
                        disablePortal
                        id="To"
                        getOptionLabel={(option: any) => option?.location_name || ''}
                        options={locations}
                        value={to}
                        onChange={(e, newValue) => {
                            setTo(newValue)
                        }}
                        renderInput={(params) =>
                            <TextField {...params} label="To" />}
                    />
                    {/* products auto complete */}
                    <Autocomplete
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
                    />
                     <FormControl>
    <InputLabel id="select-product-label">Select Product</InputLabel>
    <Select
      labelId="select-product-label"
      id="select-product"
      value={''}
      onChange={handleSelectProduct}
    >
      <MenuItem value="">
        <em>None</em>
      </MenuItem>
      {fromProducts
        .filter((fromProduct) =>
          toProducts.some((toProduct) => fromProduct.name === toProduct.name)
        )
        .map((product) => (
          <MenuItem key={product.name} value={product.name}>
            {product.name}
          </MenuItem>
        ))}
    </Select>
  </FormControl>
                </Box>
            </Modal>
        </div>
    );
}