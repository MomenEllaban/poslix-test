import { Button } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useDispatch, useSelector } from 'react-redux';
import CartModal from './CartModal';
import {
  addTodigitalCart,
  incrementQuantity,
  decrementQuantity,
  removeItem,
} from '../../redux/slices/digitalCartSlice';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import ProductVariablesModal from './product-variables-modal';
import place_holder from '../../../public/images/pos/placeholder.png';
import Image from 'next/image';
import { useDigitalContext } from 'src/modules/digital/_context/DigitalContext';
const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 1,
};
const ProductItem = ({ product, addItemTocart, location }) => {
  const { name, sell_price, image } = product;
  const { lang, setLang } = useDigitalContext();
  const [openVariablesModal, setOpenVariablesModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [moadlIsopen, setMoadlIsopen] = useState(false);
  const handleClose = () => {
    setOpen(false);
    setMoadlIsopen(false);
  };

  useEffect(() => {
    return () => {
      handleClose();
    };
  }, []);

  return (
    <>
      {/* {moadlIsopen==true && product.id == myId ? 
        <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
         <CartModal onCloseModal={handleClose} idd={myId} product={product}/>
        </Modal>:null
         }    */}

      <div className="digital-product-item ">
        <img
          className="digital-product-image"
          src={image === 'n' || !image ? place_holder.src : image}
          alt=""
          width={'100%'}
          height={'100%'}
        />

        {/* <img className="digital-product-image" src={(image==='n'||!image)?place_holder:image} alt="" width={'100%'} height={'100%'} /> */}
        {/* </div> */}
        <div className="digital-product-info d-flex w-100 justify-content-between">
          <div className="digital-product-title">
            <h5>{name}</h5>
          </div>
          <div className="digital-product-price">
            <p>
              <span>{parseFloat(sell_price).toFixed(location?.location_decimal_places)}</span>{' '}
              <span>{location?.currency_code}</span>
              {/* <span>{sell_price?+sell_price?.toFixed(location?.location_decimal_places||2):0}</span> */}
            </p>
          </div>
          {/* <div className="digital-product-description">
                <p>{description}</p>
            </div> */}
        </div>
        <div className="digital-product-button">
          <Button
            variant=""
            onClick={(e) => {
              if (product.type === 'variable') {
                setOpenVariablesModal(true);
                return;
              }

              addItemTocart(product);
            }}>
            {lang.digital.order_now}
          </Button>
        </div>
        <ProductVariablesModal
          location={location}
          addItemTocart={addItemTocart}
          product={product}
          open={openVariablesModal}
          setOpen={setOpenVariablesModal}
        />
      </div>
    </>
  );
};

export default ProductItem;
