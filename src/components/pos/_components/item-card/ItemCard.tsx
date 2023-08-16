import { IPackItem } from '@models/common-model';
import { IProduct } from '@models/pos.types';
import classNames from 'classnames';
import { useContext, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useProducts } from 'src/context/ProductContext';
import { UserContext } from 'src/context/UserContext';
import { productDetails } from 'src/recoil/atoms';
import { cartState } from 'src/recoil/atoms/cartState';
import PackageItemsModal from '../../modals/PackageItemsModal';
import styles from './ItemCard.module.scss';

export const ItemCard = ({ product }: { product: IProduct }) => {
  const [productInfo, setProducInfo] = useRecoilState(productDetails);
  const [cart, setCart] = useRecoilState(cartState);
  const { packageItems, products, setPackageItems } = useProducts();
  const [packproduct, setPackproduct] = useState([]);
  const [filterdproduct, setFilterdproduct] = useState<IPackItem[]>([]);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const { locationSettings } = useContext(UserContext);

  const handleShowPackageproduct = (packId: number) => {
    var filterd: IPackItem[] = packageItems.filter((pi: IPackItem) => pi.parent_id == packId);
    setFilterdproduct(filterd);
    var onlyIds = filterd.map((itm: any) => {
      return itm.product_id;
    });
    setPackproduct(products.filter((product: IProduct) => onlyIds.includes(product.id)));
    setIsOpenDialog(!isOpenDialog);
  };

  const addToCart = () => {
    const existingProductIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingProductIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingProductIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  return (
    <button
      onClick={() => {
        addToCart();
        setProducInfo({
          product_id: false,
        });
        setTimeout(() => {
          setProducInfo(product);
        }, 100);
      }}
      className={styles['item-card__container']}>
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
      {!product.is_service &&
        !product.type?.includes('variable') &&
        !product.type?.includes('package') &&
        product.stock == 0 &&
        !product.sell_over_stock && <div className="out-of-stock">Out Of Stock</div>}
      <div className="item-icons">
        {!product.is_service && (
          <div className="inner-icon">
            <img src="/images/pos/card/over_sell.png" />
          </div>
        )}
        {product.type == 'variable' && (
          <div className="inner-icon" onClick={() => handleShowPackageproduct(product.id)}>
            <img src="/images/pos/card/packages.png" />
          </div>
        )}
      </div>
      {isOpenDialog && (
        <PackageItemsModal
          filterdproduct={filterdproduct}
          packproduct={packproduct}
          isOpenDialog={isOpenDialog}
          setIsOpenDialog={setIsOpenDialog}
        />
      )}
    </button>
  );
};
