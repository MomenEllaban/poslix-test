import { Button } from "react-bootstrap";
import { useState ,useEffect,useContext} from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useDispatch,useSelector } from 'react-redux';
import CartModal from "./CartModal"
import {addTodigitalCart ,incrementQuantity, decrementQuantity, removeItem} from '../../redux/slices/digitalCartSlice';
import { useAppDispatch, useAppSelector } from "src/hooks";
import ProductVariablesModal from "./product-variables-modal";

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 1
};
const 

ProductItem = ({product,addItemTocart,location}) => {
    const {id, name, description, sell_price, image , quantity } = product;
    
    const [openVariablesModal, setOpenVariablesModal] = useState(false);
    const [open, setOpen] = useState(false);
    const [myId, setMyId] = useState(id);
    const [ moadlIsopen, setMoadlIsopen ] = useState(false);
    const handleOpen = () => {setOpen(true)};
    const handleClose = () => {setOpen(false) ;setMoadlIsopen(false)};

    const dispatch = useAppDispatch()
    const cart = useAppSelector((state) => state.cart)
    useEffect(() => {
      
    
      return () => {
          handleClose()
      }
    }, [])
    
const modalHandler = (event) => { 
    setMyId(event)
    handleOpen()
    setMoadlIsopen(true)
 }
 
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
  
 
   <div className="digital-product-item "  >
        
       
        {image&&<img className="digital-product-image" src={image} alt="" width={'100%'} height={'100%'} />}
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
            <Button variant="" onClick={(e)=>{
                if(product.type==='variable'){
                    setOpenVariablesModal(true)
                    return
                }
                
                addItemTocart(product)
            }}>Buy Now</Button>
        </div>
        <ProductVariablesModal location={location} addItemTocart={addItemTocart} product={product} open={openVariablesModal} setOpen={setOpenVariablesModal}/>
    </div>
    </>
   
    )
};

export default ProductItem;