import { Button } from "@mui/material"
import  CartItem  from "./CartItem"

import { useDispatch,useSelector } from 'react-redux';
import {addTodigitalCart ,incrementQuantity, decrementQuantity, removeItem} from '../../redux/slices/digitalCartSlice';
const DigitalCart = ({cartItems,addItemTocart,removeFromCart,setRenderedScreen,totalPrice,location}) => {
    const {digitalCart} = useSelector((state:any) => state.digitalCart)
    // const dispatch = useDispatch()
    // const getTotal = () => {
    //     let totalQuantity = 0
    //     let totalPrice = 0
    //     console.log(digitalCart);
    //     digitalCart?.forEach(item => {
    //       totalQuantity += item.quantity
    //       totalPrice += item.price * item.quantity
    //     })
    //     return {totalPrice, totalQuantity}
    //   }
  
    return (
        <div className="digital-cart">
            <div className="digital-cart-items-container">
                <h4>YOUR ORDER</h4>
                <div className="digital-cart-items-list">
                        {cartItems.length>=1?cartItems.map((item) => (
                        
                
                <CartItem 
                location={location}
                key={item.id}
                id={item.id}
                image={item.image}
                name={item.name}
                price={item.itemTotalPrice} 
                quantity={item.quantity}
                addItemTocart={addItemTocart}
                item={item}
                removeFromCart={removeFromCart}
                />


                 )):<p className="empty text-dark">Cart is empty</p>
                 
                 }

                    
                </div>
            </div>
            <div className="digital-cart-checkout">
                <Button disabled={!cartItems.length} className="checkout_btn" variant="contained" color="error" onClick={()=>setRenderedScreen('checkout')}>Checkout {totalPrice.toFixed(location?.location_decimal_places||2)} {location?.currency_code}</Button>
                <Button >APPLY COUPON</Button>
            </div>
        </div>
    )
}

export default DigitalCart;