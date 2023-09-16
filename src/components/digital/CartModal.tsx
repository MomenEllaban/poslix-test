import React from 'react'
import { Button } from "react-bootstrap";
import { useState ,useEffect,useContext} from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useDispatch,useSelector } from 'react-redux';
import {addTodigitalCart ,incrementQuantity, decrementQuantity, removeItem} from '../../redux/slices/digitalCartSlice';

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
// const handleCloseFromChild = (e) => {
//   e.stopPropagation();
//   setOpen(false)
// }
const CartModal = ({product,idd,onCloseModal}) => {
  const { id, name, description, price, image } = product;
     const [modalVisible, setModalVisible] = useState(false);
     const [open, setOpen] = useState(false);
     const handleOpen = () => setOpen(true);
     const handleClose = () => setOpen(false);
     const dispatch = useDispatch()
  const {digitalCart} = useSelector((state:any) => state.digitalCart)
     const cartItem = digitalCart.filter((item) => item.id == id);
     const [quantQuenter, setQuantQuenter] = useState(1);
     const [tPrice, setTPrice] = useState(1);

  useEffect(() => {
    setTPrice(quantQuenter*price)
  }, [quantQuenter])
  
 const getItemTotal = (quantQuenter) => {
     let totalQuantity = quantQuenter
     let totalPrice = 0
     cartItem.forEach(item => {
       totalQuantity += item.quantity
       totalPrice += item.price * item.quantity
     })
     return {totalPrice, totalQuantity}
   }
   const [ moadlIsopen, setMoadlIsopen ] = useState(false);
   const addTodigitalCartHandler = () => { 
    setMoadlIsopen(false)
    }
  return (

             <div>   
               <Box sx={style} className="modal_box">
               <div className="modal_body">
                 <div className="modal_img col-6">
                 <img src={image} alt="" />
                 </div>
                 <div className="modal_content col-6">
                 <Typography id="modal-modal-title" variant="h6" component="h2">
                 {name}
                   </Typography>
                   <p>{description}</p>
              </div>
          </div>
          <div className="modal_footer">
            <div className="modal_counter col-2">
              <div className="btn col-4  d-flex justify-content-center" onClick={() => setQuantQuenter(count =>count!==1?count - 1:count=1)} >-</div>
              <div className="col-4 d-flex justify-content-center">{quantQuenter}  
              </div>
              <div className="btn col-4  d-flex justify-content-center"
               onClick={() => setQuantQuenter(count => count + 1)} >+</div>
            </div>
            <div className="order_btn col-9">
             
             <Button onClick={() =>{ 
              dispatch(addTodigitalCart({ id, name, image, price, quantity: quantQuenter })); setMoadlIsopen(false); onCloseModal()}
              
              } >order ${tPrice}</Button>
                  </div>
                  {/* <button onClick={setMoadlIsopen(false)}></button> */}
                </div>
             
           </Box>
          </div>


  )
}

export default CartModal