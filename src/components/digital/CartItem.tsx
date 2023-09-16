import { useDispatch } from 'react-redux'
import {addTodigitalCart ,incrementQuantity, decrementQuantity, removeItem} from '../../redux/slices/digitalCartSlice';

const  CartItem  = ({id, image, name, price, quantity=0}) =>  {
  const dispatch = useDispatch()

  return (
     <div className="cart-item">
         <div className="col-6">
          {name}
         </div>
         <div className="modal_counter col-3">
         <div className="btn col-4  d-flex justify-content-center" onClick={() => dispatch(decrementQuantity(id))} >-</div>
         <div className="col-4 d-flex justify-content-center">

         {quantity}
         </div>
         <div className="btn col-4  d-flex justify-content-center" onClick={() => dispatch(incrementQuantity(id))} >+</div>
        
         </div>
       
         <div className="order_btn col-3">
         {price}OMR
  
         </div>
         
 </div>
      
  )
}

export default CartItem