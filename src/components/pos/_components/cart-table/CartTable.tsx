import { ChangeEvent, useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import {
  addToCart,
  changeWithSpesificAmount,
  decreaseItemQuantity,
  removeFromCart,
  selectCartByLocation,
  setCart,
} from 'src/redux/slices/cart.slice';
import styles from './CartTable.module.scss';
import { MdDeleteForever } from 'react-icons/md';
import { BsDashLg, BsPlusLg } from 'react-icons/bs';
import { usePosContext } from 'src/modules/pos/_context/PosContext';
import { ILocationSettings } from '@models/common-model';
import { TextField } from '@mui/material';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import { useRouter } from 'next/router';
import { useProducts } from 'src/context/ProductContext';
import { custom } from 'joi';

export default function CartTable({ customer, shopId }) {
  const { lang: _lang } = usePosContext();
  const { customers } = useProducts();
  const lang = _lang?.pos;
  const [groups, setGroups] = useState<any>([])
  const [customerPricingGroup, setCustomerPricingGroup] = useState<any>()

  const [selectedCustomer, setSelectedCustomer] = useState<any>()
  const router = useRouter()
  const selectCartForLocation = selectCartByLocation(shopId);
  const cart = useAppSelector(selectCartForLocation);

  const dispatch = useAppDispatch();

  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    // @ts-ignore
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });

  useEffect(() => {
    const cart = localStorage.getItem('cart');
    if (cart) dispatch(setCart(JSON.parse(cart)));
    var _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
        _locs.findIndex((loc: any) => {
          return loc.location_id == shopId;
        })
        ]
      );
  }, []);
  // ------------------------------------------------------------------------------------------------
  const getpricingGroups = async () => {
    try {

      const res = await findAllData(`pricing-group/${router.query.id}&all_data=1`);
      setGroups(res.data?.result?.data);

    } catch (e) {
      Toastify('error', 'Something went wrong')
    }
  }
  // ------------------------------------------------------------------------------------------------
  // useEffect(() => {
  //   console.log('akkk');
  //   dispatch(setCart(undefined))
  //   localStorage.removeItem('cart');
  //   }, [customers])
  // ------------------------------------------------------------------------------------------------
  // useEffect(() => {
  //   setSelectedCustomer(customers?.find(el => customer?.label?.includes(el?.mobile)))


  // }, [customer])
  // ------------------------------------------------------------------------------------------------
  // useEffect(() => {

  //   setCustomerPricingGroup(groups?.find(el => el.id === selectedCustomer?.price_groups_id))
  // }, [selectedCustomer])
  // ------------------------------------------------------------------------------------------------
  // useEffect(() => {

  //   if (cart?.cartItems && customerPricingGroup?.products) {

  //     let cartWithPricingData = cart?.cartItems.map(itm => {


  //       const groupPrice = customerPricingGroup?.products?.find((el: any) => el.id === itm.id)

  //       if (groupPrice) {

  //         return {
  //           ...itm,
  //           old_price: groupPrice.old_price,
  //           sell_price: groupPrice.price
  //         }
  //       }
  //       return itm

  //     })

  //     setCartWithPricing(cartWithPricingData)
  //   } else {
  //     setCartWithPricing(undefined);
  //   }
  // }, [cart?.cartItems, customerPricingGroup])
  // ------------------------------------------------------------------------------------------------

  return (
    <div className={styles['table__container']}>
      <Table striped hover>
        <thead>
          <tr>
            <th>#</th>
            <th>{lang?.cartComponent?.product}</th>
            <th>{lang?.cartComponent?.quantity}</th>
            <th> {lang?.cartComponent?.amount}</th>
            <th></th>
          </tr>
        </thead>

        <tbody className={styles['table-body']}>
          {!cart?.cartItems?.length && (
            <tr>
              <td colSpan={5} className="text-center">
                {lang.cartComponent.add}
              </td>
            </tr>
          )}
          {( cart?.cartItems)?.map((product:any, idx) => (
            <tr key={product.id}>
              <td>{idx + 1}</td>
              <td>{product.name || product.product_name}</td>
              <td>
                <span className={styles['qty-col']}>
                  <Button
                    size="sm"
                    variant="outline-info"
                    // className={styles['cart-quantity-btn']}
                    onClick={() => dispatch(decreaseItemQuantity(product))}>
                    <BsDashLg size={13} />
                  </Button>
                  <TextField
                    id="product-qty"
                    className={styles['qty']}
                    variant="outlined"
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      min: 1,
                      value: product.quantity,
                      style: {
                        textAlign: 'center',
                        height: '0',
                        paddingLeft: "0",
                        paddingRight: "0",
                      }
                    }}
                    onInput={(e: ChangeEvent<HTMLInputElement>) => {
                      const newQty = +e.target.value === 0 ? 1 : +e.target.value;
                      if ((product.stock < newQty) && (+product.sell_over_stock === 0) && (+product.is_service === 0)) {
                        Toastify('error', 'Out of stock!')
                        return
                      }
                      const value = {
                        product,
                        newQty
                      }
                      dispatch(changeWithSpesificAmount(value))
                    }}
                    sx={{
                      minWidth: '5px',
                    }}
                  />
                  {/* <span className={styles['qty']}>{product.quantity}</span> */}
                  <Button
                    size="sm"
                    variant="outline-info"
                    // className={styles['cart-quantity-btn']}
                    onClick={() => {
                      const newQty = product.quantity + 1
                      if ((product.stock < newQty) && (+product.sell_over_stock === 0) && (+product.is_service === 0)) {
                        Toastify('error', 'Out of stock!')
                        return
                      }
                      dispatch(addToCart(product));
                    }}>
                    <BsPlusLg size={13} />
                  </Button>
                </span>
              </td>
              <td>
                {product?.old_price ?
                  <>
                    <span style={{ textDecoration: 'line-through' }} className='text-danger me-2'>{
                      (+product?.old_price)?.toFixed(
                        locationSettings?.location_decimal_places
                      )
                    } </span>
                    <span > {(+product?.sell_price || +product.product_price)?.toFixed(
                      locationSettings?.location_decimal_places
                    )}</span>

                  </>
                  : <span>{


                    (+product?.sell_price || +product.product_price)?.toFixed(
                      locationSettings?.location_decimal_places
                    )
                  } </span>
                }

              </td>
              <td className={styles['delete-col']}>
                <Button
                  size="sm"
                  variant="outline-danger"
                  // className={styles['cart-delete-btn']}
                  onClick={() => dispatch(removeFromCart(product))}>
                  <MdDeleteForever size={15} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
