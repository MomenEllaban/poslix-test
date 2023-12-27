import { Global } from '@emotion/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';

import { useAppSelector } from 'src/hooks';
import { selectCartByLocation } from 'src/redux/slices/cart.slice';
import { OrderCalcs } from '../../utils/OrderCalcs';
import CustomerDataSelect from '../CustomerDataSelect';
import CartTable from '../cart-table/CartTable';
import { OrdersFooter } from '../orders-footer/OrdersFooter';
import ProductSearch from '../product-search/ProductSearch';
import styles from '../cart-panel/CartPanel.module.scss';
import { usePosContext } from 'src/modules/pos/_context/PosContext';

const drawerBleeding = 56;

const Root = styled('div')(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.mode === 'light' ? grey[100] : theme.palette.background.default,
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
}));

const Puller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.mode === 'light' ? grey[300] : grey[900],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

const initOrder = {
  isEdit: false,
  name: '',
  total_price: 0,
  orderId: 0,
};

function MobDrawer({ toggleDrawer, handleDrawer, open, shopId, customer, setCustomer }) {
  const { lang: _lang, isRtl } = usePosContext();
  // const dispatch = useAppDispatch()
  const selectCartForLocation = selectCartByLocation(shopId ?? 0);
  const cart = useAppSelector(selectCartForLocation);

  const direction = isRtl ? 'rtl' : 'ltr';
  const lang = _lang?.pos;

  return (
    <Root>
      <CssBaseline />
      <Global
        styles={{
          '.MuiDrawer-root > .MuiPaper-root': {
            height: `calc(100% - ${drawerBleeding}px)`,
            overflow: 'visible',
          },
        }}
      />

      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true,
        }}>
        <StyledBox
          sx={{
            position: 'absolute',
            top: -drawerBleeding,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            visibility: 'visible',
            right: 0,
            left: 0,
          }}>
          <Puller />
          <div className="pos-cart-small-sm">
            <Button className="mobDrawer_btn" onClick={() => handleDrawer(open)}>
              Close Cart
            </Button>
          </div>
        </StyledBox>
        <div className={`${styles.cart__container} ${styles.cart__container_mob}`} style={{ direction }}>
          <CustomerDataSelect
            shopId={shopId}
            isOrderEdit={0}
            setCustomer={setCustomer}
            orderEditDetails={initOrder}
            customer={customer}
          />
          <hr />
          <ProductSearch shopId={shopId} />

          <hr />
          <CartTable customer={customer} shopId={shopId} />
          <hr />

          <OrderCalcs
            shopId={shopId}
            orderEditDetails={initOrder}
            // with discount feature
            __WithDiscountFeature__total={0}
            lang={lang}
          />
          <OrdersFooter
            orderEditDetails={initOrder}
            shopId={shopId}
            details={{
              customerId: customer?.value || undefined,
              totalAmount: cart?.cartSellTotal,
              isReturn: 0,
            }}
            lang={lang}
            orderType={""}
          />
        </div>
      </SwipeableDrawer>
    </Root>
  );
}

export default MobDrawer;
