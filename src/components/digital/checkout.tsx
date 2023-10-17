import { TextField } from '@mui/material'
import styles from './digital.module.css'
import { Button } from 'react-bootstrap'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CartItem from './CartItem';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const Checkout = ({ cartItems, removeFromCart, addItemTocart, setRenderedScreen ,totalPrice}) => {

    return (<>
        <div style={{ background: '#ebebeb' }} className='w-100 d-flex justify-content-center'>
            <div style={{ background: '#fff', width: 'calc(90% - 40px)' }} ><span style={{ cursor: 'pointer' }} onClick={() => { setRenderedScreen('products') }}><ArrowBackIcon /> Back</span></div>
        </div>

        <div className={styles.checkout_wrapper}>
            <div className={styles.checkout_container}>

                <div className={styles.checkout_left_side_container}>
                    <div className={styles.checkout_user_info_container}>
                        <form className={styles.user_info_form}>
                            <div className='w-100'>Your Info</div>
                            <TextField id="standard-basic" label="Full Name" variant="standard" style={{ width: '45%' }} />
                            <TextField id="standard-basic" label="Email Address" variant="standard" style={{ width: '45%' }} />
                            <TextField id="standard-basic" label="Phone Number" variant="standard" style={{ width: '45%' }} />
                        </form>

                    </div>
                    <div className={styles.checkout_user_info_container}>
                        <form className={`mt-2 ${styles.user_info_form}`}>
                            <div className='w-100'>Order Note</div>
                            <TextField id="standard-basic" label="Order Note" variant="standard" style={{ width: '45%' }} />
                        </form>

                    </div>
                    <div className={styles.checkout_user_info_container}>
                        <form className={`mt-2 ${styles.user_info_form}`}>

                            <div className="digital-cart-checkout w-100 ">
                                <Button className="checkout_btn" variant="contained" color="error" >Checkout 000 OMR</Button>
                                <Button >APPLY COUPON</Button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className={styles.checkout_right_side_container}>
                    <div className={styles.checkout_user_info_container}>


                    </div>
                    <div className={styles.checkout_items_container}>
                        <div style={{ fontWeight: 'bold' }}>Your Order</div>

                        {cartItems?.length >= 1 ? cartItems.map((item) => (

                            <CartItem
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
                        )) : <p className="empty text-dark">Cart is empty</p>

                        }

                    </div>


                    <div onClick={() => { setRenderedScreen('products') }} className={`mt-2 ${styles.checkout_add_items_container}`}>
                        <MenuBookIcon sx={{ marginX: "4px" }} /> Add More Items
                    </div>


                    <div className={`mt-2 ${styles.order_Summary_container}`}>
                        <div className='fw-bold'>Order Summary</div>
                        <div className={styles.order_Summary_pricing_wrapper}>
                            <div className={'w-50 '}>Total Amount</div>
                            <div className={'w-50  text-end'}>{totalPrice}</div>
                            {/* <hr/> */}
                            <div className={'w-50 '}>Sub Total</div>
                            <div className={'w-50 text-end'}>{totalPrice}</div>
                            <div className={'w-50'}>VAT(0.00%)</div>
                            <div className={'w-50 text-end'}>0%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}

export { Checkout }