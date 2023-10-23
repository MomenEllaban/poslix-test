import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Item = ({ addItemTocart, reduceProductQty, item, fromLocation, index ,removeProductFromCart}) => {

    return (<>
        {index === 0 && <div className="cart-item gap-2">
            <div className="order_btn fw-bold text-capitalize col-2">
                name
            </div>
            <div className="order_btn fw-bold text-capitalize col-1">
                stock
            </div>
            <div className="order_btn fw-bold text-capitalize text-center col-2">
                Qyt
            </div>

            <div className="order_btn fw-bold text-capitalize col-2">
                price

            </div>
            <div className="order_btn fw-bold text-capitalize col-2">
                cost

            </div>

            <div className="order_btn fw-bold text-capitalize col-1">
                action

            </div>

        </div>
        }
        <div className="cart-item  gap-3 n">
            <div className="col-2">
                {item.name}
            </div>
            <div className="order_btn col-1">
                {item.stock}
            </div>
            <div className="modal_counter col-2">
                <div className="btn col-4  d-flex justify-content-center" onClick={() => reduceProductQty(item)} >-</div>
                <div className="col-4 d-flex justify-content-center">

                    {item.quantity}
                </div>
                <div className="btn col-4  d-flex justify-content-center" onClick={() => addItemTocart(item)} >+</div>

            </div>

            <div className="order_btn col-2">
                {parseFloat(item.sell_price)?.toFixed(fromLocation?.location_decimal_places || 4)} {fromLocation?.currency_code}

            </div>
            <div className="order_btn col-2">
                {parseFloat(item.cost_price)?.toFixed(fromLocation?.location_decimal_places || 4)} {fromLocation?.currency_code}

            </div>

            <div className="order_btn ps-3 col-1">
            <FontAwesomeIcon icon={faTrash} style={{cursor:'pointer'}} className='text-danger'  onClick={()=>{
                removeProductFromCart(item)
            }}/>
            </div>

        </div>
    </>
    );
}

export { Item };
