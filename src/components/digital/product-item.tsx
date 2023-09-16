import { Button } from "react-bootstrap";
import { useState ,useEffect,useContext} from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useDispatch,useSelector } from 'react-redux';
import CartModal from "./CartModal"
import {addTodigitalCart ,incrementQuantity, decrementQuantity, removeItem} from '../../redux/slices/digitalCartSlice';
import { useAppDispatch, useAppSelector } from "src/hooks";

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
const ProductItem = ({product}) => {
    const {id, name, description, price, image , quantity } = product;
    const [modalVisible, setModalVisible] = useState(false);
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
    console.log(event,"event")
    handleOpen()
    setMoadlIsopen(true)
 }
    return (
        <>
{moadlIsopen==true && product.id == myId ? 
        <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
         <CartModal onCloseModal={handleClose} idd={myId} product={product}/>
        </Modal>:null
         }   
  
 
   <div className="digital-product-item" onClick={()=> modalHandler(id)} >
        
       
        <img className="digital-product-image" src={image} alt="" width={'100%'} height={'100%'} />
        {/* </div> */}
        <div className="digital-product-info">
            
            <div className="digital-product-title">
                <h5>{name}</h5>
            </div>
            <div className="digital-product-price">
                <p>
                    <span>$</span>
                    <span>{price}</span>
                </p>
            </div>
            <div className="digital-product-description">
                <p>{description}</p>
            </div>
        </div>
        <div className="digital-product-button">
            <Button variant="">Buy Now</Button>
        </div>
    </div>
    </>
   
    )
};

export default ProductItem;