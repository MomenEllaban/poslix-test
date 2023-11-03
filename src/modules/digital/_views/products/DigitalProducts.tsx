import en from 'en.json';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import MobDrawer from 'src/components/digital/MobDrawer';
import DigitalCart from 'src/components/digital/digital-cart';
import ProductItem from 'src/components/digital/product-item';
import { findAllData } from 'src/services/crud.api';
import { Checkout } from 'src/components/digital/checkout';
import { Toastify } from 'src/libs/allToasts';
import { useDigitalContext } from '../../_context/DigitalContext';

export default function DigitalProducts({ shopId }) {
  const [type, setType] = useState('all');
  const [showCart, setShowCart] = useState(true);
  const [open, setOpen] = React.useState(false);
  const [products, setProducts] = useState<Array<any>>([]);
  const [categories, setCategories] = useState<Array<any>>([]);
  const [brands, setBrands] = useState<Array<any>>([]);
  const [renderedTabs, setRenderedTabs] = useState<string>('categories');
  const [cartItems, setCartItems] = useState<Array<any>>([]);
  const [renderedScreen, setRenderedScreen] = useState<string>('products');
  const [isloading, setIsloading] = useState<boolean>(false);
  const [location, setLocation] = useState<any>();
  const { lang, setLang } = useDigitalContext();
  // ------------------------------------------------------------------------------------------------
  const getTotalPrice = () => {
    let totalPrice = 0;
    cartItems.forEach((item) => {
      totalPrice = totalPrice + item.itemTotalPrice;
    });

    return totalPrice;
  };
  // ------------------------------------------------------------------------------------------------
  const addItemTocart = (item: any) => {
    if (cartItems.find((p) => p.id === item.id)) {
      const updatedItems = cartItems.map((cart_item) => {
        if (item.id === cart_item.id) {
          return {
            ...cart_item,
            quantity: cart_item.quantity + 1,
            itemTotalPrice: +(item.sell_price || item.price) * (cart_item.quantity + 1),
          };
        }
        return cart_item;
      });
      setCartItems(updatedItems);
    } else {
      setCartItems([
        ...cartItems,
        { ...item, quantity: 1, itemTotalPrice: +(item.sell_price || item.price) },
      ]);
    }
  };
  // ------------------------------------------------------------------------------------------------
  const removeFromCart = (item: any) => {
    if (cartItems.find((p) => p.id === item.id).quantity > 1) {
      const updatedItems = cartItems.map((cart_item) => {
        if (item.id === cart_item.id) {
          return {
            ...cart_item,
            quantity: cart_item.quantity - 1,
            itemTotalPrice: (item.sell_price || item.price) * (cart_item.quantity - 1),
          };
        }
        return cart_item;
      });
      setCartItems(updatedItems);
    } else {
      setCartItems(cartItems.filter((el) => el.id !== item.id));
    }
  };
  //-------------------------------------------------------------------------------------------------
  const addByQuantity = (item: any, quantity: number) => {
    const index = cartItems.findIndex((p) => p.id === item.id);
    const cartItms = [...cartItems];
    if (index > -1) {
      cartItms[index].quantity = quantity;
      if (cartItms[index].quantity === 0) {
        setCartItems(cartItms.filter((el) => el.id !== item.id));
      }
      cartItms[index].itemTotalPrice = (cartItms[index].sell_price || cartItms[index].price) * cartItms[index].quantity;   
      setCartItems(cartItms);
    }
  };
  // ------------------------------------------------------------------------------------------------
  let toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  // ------------------------------------------------------------------------------------------------
  const handleDrawer = (open) => {
    setOpen(!open);
    toggleDrawer(!open);

    setShowCart((s) => !s);
  };
  // ------------------------------------------------------------------------------------------------
  const { digitalCart } = useSelector((state: any) => state.digitalCart);
  const getTotal = () => {
    let totalQuantity = 0;
    let totalPrice = 0;
    console.log(digitalCart);
    digitalCart?.forEach((item) => {
      totalQuantity += item.quantity;
      totalPrice += item.price * item.quantity;
    });
    return { totalPrice, totalQuantity };
  };
  // ------------------------------------------------------------------------------------------------
  const matches = useMediaQuery('(max-width:850px)');
  const [value, setValue] = React.useState('0');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  // ----------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------
  const fetchLocation = async () => {
    try {
      const res = await findAllData(`business/locations/${shopId}`);

      setLocation(res.data.result);
    } catch (err) {
      Toastify('error', 'Something went wrong with getting locations, please try again later!');
    }
  };

  // ----------------------------------------------------------------------------------------------
  const fetchProducts = async () => {
    setIsloading(true);
    try {
      const res = await findAllData(`products/${shopId}?all_data=1`);
      setProducts(res.data.result);
    } catch (err) {
      Toastify('error', 'Something went wrong with getting products, please try again later!');
    }
  };
  // ----------------------------------------------------------------------------------------------
  const fetchCategories = async () => {
    try {
      const resCategories = await findAllData(`categories/${shopId}`);
      setCategories(resCategories.data.result);
    } catch (err) {
      Toastify('error', 'Something went wrong with getting categories , please try again later!');
    }
  };
  // ----------------------------------------------------------------------------------------------
  const fetchBrands = async () => {
    try {
      const resBrands = await findAllData(`brands/${shopId}`);
      setBrands(resBrands.data.result);
    } catch (err) {
      Toastify('error', 'Something went wrong with getting brands, please try again later!');
    }
  };

  // ----------------------------------------------------------------------------------------------
  useEffect(() => {
    if (products.length > 0 && brands.length > 0 && categories.length > 0 && isloading)
      setIsloading(false);
  }, [products, categories, brands]);
  // ----------------------------------------------------------------------------------------------

  useEffect(() => {
    fetchLocation();
    fetchBrands();
    fetchProducts();
    fetchCategories();
  }, []);
  return (
    <>
      {renderedScreen === 'products' ? (
        <div style={{ direction: lang == en ? 'ltr' : 'rtl' }}>
          <div className="digital-products-main bg-white">
            <div className="digital-products-header">
              <h1>{lang.digital.digital_product}</h1>
            </div>

            <div className="digital-products-container">
              <div className="digital-products">
                <div className="digital-product-list bg-light">
                  <div
                    style={{ borderRadius: '8px' }}
                    className="toggle-brands-catigories-buttons-wrapper ">
                    <div
                      onClick={() => {
                        setRenderedTabs('categories');
                      }}
                      style={{ borderRadius: '8px', cursor: 'pointer' }}
                      className={`w-50 p-2 text-center  ${
                        renderedTabs === 'categories' ? 'bg-success' : 'bg-light'
                      } ${renderedTabs === 'categories' ? 'text-light' : 'text-success'}`}>
                      {lang.pos.itemList.category}
                    </div>
                    <div
                      onClick={() => {
                        setRenderedTabs('brands');
                      }}
                      style={{ borderRadius: '8px', cursor: 'pointer' }}
                      className={`w-50 p-2 text-center  ${
                        renderedTabs === 'brands' ? 'bg-success' : 'bg-light'
                      } ${renderedTabs === 'brands' ? 'text-light' : 'text-success'}`}>
                      {lang.pos.itemList.brand}
                    </div>
                  </div>
                  <div className="w-100 d-flex justify-content-center bg-light">
                    <Tabs
                      value={value}
                      onChange={handleChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      aria-label="digital-products-filter"
                      sx={{ textTransform: 'none', marginX: 'auto' }}>
                      <Tab
                        className="filter_btn"
                        label="all"
                        value="0"
                        onClick={(e: any) => {
                          setType(e.target.innerText);
                        }}
                      />
                      {(renderedTabs === 'brands' ? brands : categories).map((el, i) => {
                        return (
                          <Tab
                            key={i + 1}
                            className="filter_btn"
                            label={el.name}
                            value={i + 1}
                            onClick={(e: any) => {
                              setType(e.target.innerText);
                            }}
                          />
                        );
                      })}
                    </Tabs>
                  </div>
                  {isloading && (
                    <div className="d-flex justify-content-around w-100">
                      <Spinner animation="grow" />
                    </div>
                  )}
                  {/* categories */}
                  {type === 'all' && renderedTabs === 'categories'
                    ? products.map((product, ind) => (
                        <ProductItem
                          location={location}
                          addItemTocart={addItemTocart}
                          product={product}
                          key={ind}
                        />
                      ))
                    : (products.filter((product) => product.category?.name === type) || []).map(
                        (product) => (
                          <ProductItem
                            location={location}
                            addItemTocart={addItemTocart}
                            product={product}
                            key={product.id}
                          />
                        )
                      )}
                  {/* brands */}
                  {type === 'all' && renderedTabs === 'brands'
                    ? brands?.map((brand, index) => (
                        <div className="w-100" key={index}>
                          {brand.products.map((product, productIndex) => (
                            <div key={productIndex}>
                              {' '}
                              <ProductItem
                                location={location}
                                addItemTocart={addItemTocart}
                                product={product}
                                key={product.id}
                              />
                            </div>
                          ))}
                        </div>
                      ))
                    : (
                        brands.find((brand) => {
                          return brand.name?.trim() === type?.trim();
                        })?.products || []
                      ).map((product) => (
                        <ProductItem
                          location={location}
                          addItemTocart={addItemTocart}
                          product={product}
                          key={product.id}
                        />
                      ))}
                </div>
              </div>
              <DigitalCart
                location={location}
                totalPrice={getTotalPrice()}
                setRenderedScreen={setRenderedScreen}
                removeFromCart={removeFromCart}
                addItemTocart={addItemTocart}
                addByQuantity={addByQuantity}
                cartItems={cartItems}
              />
              {matches ? (
                <div
                  className="digital-cart-small"
                  style={{
                    display: showCart ? 'flex' : 'none',
                    transition: 'all 1.5s ease-in-out',
                    background: getTotal().totalPrice ? '#045c54' : '#909090',
                  }}>
                  <div className="d-flex h-100 align-items-center ">
                    <ShoppingCartIcon />
                    <p className="m-0">Total:{getTotal().totalPrice} OMR</p>
                  </div>
                  <Button className="mobDrawer_btn" onClick={() => handleDrawer(open)}>
                    View Cart
                  </Button>
                </div>
              ) : null}

              {matches ? (
                <MobDrawer
                  location={location}
                  removeFromCart={removeFromCart}
                  addItemTocart={addItemTocart}
                  toggleDrawer={toggleDrawer}
                  setOpen={setOpen}
                  open={open}
                  setShowCart={setShowCart}
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        renderedScreen === 'checkout' && (
          <Checkout
            location={location}
            totalPrice={getTotalPrice()}
            setRenderedScreen={setRenderedScreen}
            addItemTocart={addItemTocart}
            removeFromCart={removeFromCart}
            cartItems={cartItems}
          />
        )
      )}
    </>
  );
}
