import { useState } from 'react';
import CartPanel from 'src/components/pos/_components/cart-panel/CartPanel';
import { ItemList } from 'src/components/pos/_components/item-list/ItemList';
import NavMenu from 'src/components/pos/parts/NavMenu';
import { useAppSelector } from 'src/hooks';
import { selectCartByLocation } from 'src/redux/slices/cart.slice';
import MobDrawer from '../../components/pos/_components/MobDrawer';
import { Button, Spinner } from 'react-bootstrap';
import { useMediaQuery } from '@mui/material';

interface ICustomerItem {
  value: string | number;
  label: string;
  isNew: boolean;
}
const initCustomer = {
  value: '1',
  label: 'walk-in customer',
  isNew: false,
};

export default function PosCart({ shopId }) {
  const selectCartForLocation = selectCartByLocation(shopId ?? 0);

  const cart = useAppSelector(selectCartForLocation);

  const [customer, setCustomer] = useState<ICustomerItem>({
    ...initCustomer,
    value: cart?.customer_id ?? 0,
  });

  const [open, setOpen] = useState(false);

  let toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleDrawer = (open) => {
    setOpen(!open);
    toggleDrawer(!open);
  };

  const matches = useMediaQuery('(max-width:900px)');

  return (
    <>
      <NavMenu shopId={shopId} />
      <div className="pos_layout">
        <ItemList customer={customer} shopId={shopId} />

        {/* <OrdersComponent shopId={shopId} lang={lang.pos} direction={lang == ar ? 'rtl' : ''} /> */}
        {matches ? (
          <>
            <div
              className="digital-cart-small"
              style={{
                display: open ? 'none' : 'flex',
                transition: 'all 1.5s ease-in-out',
                background: '#045c54',
              }}>
              <Button className="mobDrawer_btn" onClick={() => handleDrawer(open)}>
                View Cart
              </Button>
            </div>
            <MobDrawer
              customer={customer}
              setCustomer={setCustomer}
              shopId={shopId}
              handleDrawer={handleDrawer}
              open={open}
              toggleDrawer={toggleDrawer}
            />
          </>
        ) : (
          <CartPanel customer={customer} setCustomer={setCustomer} shopId={shopId} />
        )}
      </div>
    </>
  );
}
