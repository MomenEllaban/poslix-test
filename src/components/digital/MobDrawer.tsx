import { Global } from '@emotion/react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import CartItem from '../../components/digital/CartItem';

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

function MobDrawer({
  toggleDrawer,
  setOpen,
  open,
  setShowCart,
  removeFromCart,
  addItemTocart,
  addByQuantity,
  location,
  cartItems,
  getTotalPrice,
  setRenderedScreen
}) {
  const handleDrawer = (open) => {
    setShowCart((s) => !s);
    setOpen(!open);
    toggleDrawer(!open);
  };

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
          <div className="digital-cart-small-sm">
            <div className="text-white d-flex h-100 align-items-center  ">
              <ShoppingCartIcon />
              <p className="m-0">
                Total: {getTotalPrice().toFixed(location?.location_decimal_places || 2)}{' '}
                {location?.currency_code}
              </p>
            </div>

            <Button className="mobDrawer_btn" onClick={() => handleDrawer(open)}>
              Close Cart
            </Button>
          </div>
        </StyledBox>

        {/* <StyledBox
          sx={{
            px: 2,
            pb: 2,
            height: '100%',
            overflow: 'auto',
          }}
        > */}
        <div className="digital-cart-sm">
          <div className="digital-cart-items-container py-3">
            <h4>YOUR ORDER</h4>
            <div className="digital-cart-items-list">
              {cartItems.length >= 1 ? (
                cartItems.map((item) => (
                  <CartItem
                    location={location}
                    addItemTocart={addItemTocart}
                    item={item}
                    removeFromCart={removeFromCart}
                    key={item.id}
                    id={item.id}
                    image={item.image}
                    name={item.name}
                    price={item.itemTotalPrice}
                    quantity={item.quantity}
                    addByQuantity={addByQuantity}
                  />
                ))
              ) : (
                <p className="empty text-dark">Cart is empty</p>
              )}
            </div>
          </div>
          <div className="digital-cart-checkout">
            <Button className="checkout_btn" variant="contained" color="error" 
                disabled={!cartItems.length}
                onClick={() => setRenderedScreen('checkout')}
            >
              Checkout {getTotalPrice().toFixed(location?.location_decimal_places || 2)}{' '}
              {location?.currency_code}
            </Button>
            {/* <Button color="error">APPLY COUPON</Button> */}
          </div>
        </div>
        {/* <Skeleton variant="rectangular" height="100%" /> */}
        {/* </StyledBox> */}
      </SwipeableDrawer>
    </Root>
  );
}

export default MobDrawer;
