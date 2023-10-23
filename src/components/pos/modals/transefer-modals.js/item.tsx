import React from 'react';

const Item = ({addItemTocart,removeFromCart,item}) => {
    console.log(item);
    
    return (
        <div className="cart-item">
        <div style={{fontSize:'14px'}} className="col-3">
            {item.name}
        </div>
          <div className="order_btn col-3">
          stock:  {item.stock} 
        </div>
        <div className="modal_counter col-3">
        <div className="btn col-4  d-flex justify-content-center" onClick={() => removeFromCart(item)} >-</div>
        <div className="col-4 d-flex justify-content-center">

        {item.quantity}
        </div>
        <div className="btn col-4  d-flex justify-content-center" onClick={() => addItemTocart(item)} >+</div>
       
        </div>
      
        <div className="order_btn col-3">
        {/* {price.toFixed(location?.location_decimal_places||2)} {location?.currency_code} */}
 
        </div>
        
</div>
       
    );
}

export  {Item};
