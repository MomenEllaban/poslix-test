import { IProduct } from '@models/pos.types';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { MdAllInbox } from 'react-icons/md';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { addToCart, selectCartByLocation } from 'src/redux/slices/cart.slice';
import PackageItemsModal from '../../modals/package-item/PackageItemsModal';
import styles from './ItemCard.module.scss';
import { Toastify } from 'src/libs/allToasts';
// import { useRouter } from 'next/router';
// import { findAllData } from 'src/services/crud.api';
import { useProducts } from 'src/context/ProductContext';

export const ItemCard = ({ groups, customer, product }) => {
  const dispatch = useAppDispatch();
  const { locationSettings } = useUser();
  // const selectCartForLocation = selectCartByLocation(shopId);
  // const cart = useAppSelector(selectCartForLocation);
  const [selectedCustomer, setSelectedCustomer] = useState<any>();

  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [productVariations, setProductVariations] = useState<IProduct['variations']>([]);
  // =-----------------------------------------------------------------------------------------------
  const { customers } = useProducts();
  const [customerPricingGroup, setCustomerPricingGroup] = useState<any>();

  // ------------------------------------------------------------------------------------------------
  //   useEffect(() => {
  //     setSelectedCustomer(customers?.find(el => customer?.label?.includes(el?.mobile)))

  // console.log(customer);
  // console.log(customers?.find(el => customer?.label?.includes(el?.mobile)));

  //   }, [customer])
  // ------------------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------
  useEffect(() => {
    if (customer?.value === 0) {
      setCustomerPricingGroup(undefined);
    } else {
      setCustomerPricingGroup(groups?.find((el) => el.id === customer?.price_groups_id));
    }
  }, [customer, customers]);
  // ------------------------------------------------------------------------------------------------
  // useEffect(() => {

  //   if ( customerPricingGroup?.products) {

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

  const handleAddToCart = () => {
    let groupPrice;
    let cartProduct = { ...product, product_id: product.id };

    if (customerPricingGroup?.products) {
      groupPrice = customerPricingGroup?.products?.find((el) => product.id === el.id);

      if (groupPrice && customer?.id) {
        // console.log(product,'variantWithPricingGroup');

        if (product.type?.includes('variable')) {
          // console.log(groupPrice,'variantWithPricingGroup');

          cartProduct = {
            ...product,
            variations: product?.variations?.map((v) => {
              let variantWithPricingGroup = groupPrice.variants?.find((el) => el.id === v.id);

              return {
                ...v,
                old_price: variantWithPricingGroup.old_price,
                price: variantWithPricingGroup.price,
              };
            }),
          };
        } else {
          cartProduct = {
            ...product,
            old_price: groupPrice.old_price,
            sell_price: groupPrice.price,
            product_id: product.id,
          };
        }
      }
    }

    let test = product.stock > 0 || product.sell_over_stock;
    if (product.type?.includes('variable') && test) {
      setProductVariations(cartProduct.variations);
      setIsOpenDialog(true);
    } else {
      dispatch(addToCart(cartProduct));
    }
  };

  useEffect(() => {
    if (!isOpenDialog) setProductVariations([]);
  }, [isOpenDialog]);

  if (!product) return <div>No product defined</div>;

  return (
    <>
      <button
        onClick={() => {
          if (
            !product.is_service &&
            !product.type?.includes('variable') &&
            !product.type?.includes('package') &&
            !product.sell_over_stock &&
            product.stock == 0
          )
            Toastify('error', 'This product is out of stock');
          else handleAddToCart();
        }}
        className={styles['item-card__container']}
        style={{
          pointerEvents:
            !product.is_service &&
            !product.type?.includes('variable') &&
            !product.type?.includes('package') &&
            !product.sell_over_stock &&
            product.stock == 0
              ? 'none'
              : 'auto',
        }}>
        {product.type === 'variable' && (
          <div className={styles['item-card__container--variable']}>
            <MdAllInbox />
          </div>
        )}

        {!product.is_service &&
          !product.type?.includes('variable') &&
          !product.type?.includes('package') &&
          !product.sell_over_stock &&
          product.stock == 0 && <div className="out-of-stock">Out Of Stock</div>}

        <div className={classNames('product-img')}>
          <div className="img-container">
            <img
              src={product.image?.length > 10 ? product.image : '/images/pos/placeholder.png'}
              alt={product.name}
              className="img-fluid"
            />
          </div>
        </div>
        <h5 className="item-name">{product.name}</h5>
        <div className="item-price">
          {!product.type?.includes('variable')
            ? Number(product.sell_price).toFixed(3) + locationSettings?.currency_code
            : '--'}
        </div>

        <div className="item-icons">
          {!product.is_service && (
            <div className="inner-icon">
              <img src="/images/pos/card/over_sell.png" />
            </div>
          )}
        </div>
      </button>
      <PackageItemsModal
        product={product}
        variations={productVariations ?? []}
        show={isOpenDialog}
        setShow={setIsOpenDialog}
      />
    </>
  );
};
