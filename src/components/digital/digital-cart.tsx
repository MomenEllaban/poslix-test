import { Button } from "@mui/material"
import  CartItem  from "./CartItem"

import { useDispatch,useSelector } from 'react-redux';
import {addTodigitalCart ,incrementQuantity, decrementQuantity, removeItem} from '../../redux/slices/digitalCartSlice';
const DigitalCart = (props: any) => {
    const {digitalCart} = useSelector((state) => state.digitalCart)
    console.log("first",digitalCart.digitalCart)
    const dispatch = useDispatch()
    const getTotal = () => {
        let totalQuantity = 0
        let totalPrice = 0
        console.log(digitalCart);
        digitalCart?.forEach(item => {
          totalQuantity += item.quantity
          totalPrice += item.price * item.quantity
        })
        return {totalPrice, totalQuantity}
      }
    return (
        <div className="digital-cart">
            <div className="digital-cart-items-container">
                <h4>YOUR ORDER</h4>
                <div className="digital-cart-items-list">
                {digitalCart.length>=1?digitalCart.map((item) => (
                
           
          <CartItem 
          key={item.id}
          id={item.id}
          image={item.image}
          name={item.name}
          price={item.price} 
          quantity={item.quantity}
           />


                 )):<p className="empty text-dark">Cart is empty</p>
                 
                 }

                    
                </div>
            </div>
            <div className="digital-cart-checkout">
                <Button className="checkout_btn" variant="contained" color="error">Checkout {getTotal().totalPrice} OMR</Button>
                <Button >APPLY COUPON</Button>
            </div>
        </div>
    )
}

export default DigitalCart;