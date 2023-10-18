import { AdminLayout } from '@layout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import useMediaQuery from '@mui/material/useMediaQuery';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import MobDrawer from 'src/components/digital/MobDrawer';
import DigitalCart from 'src/components/digital/digital-cart';
import ProductItem from 'src/components/digital/product-item';
import { findAllData } from 'src/services/crud.api';
import { Checkout } from 'src/components/digital/checkout';
import { Toastify } from 'src/libs/allToasts';
import category from '../category';

const Products: NextPage = () => {
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

  // ------------------------------------------------------------------------------------------------
  const getTotalPrice=()=>{
    let totalPrice=0
    cartItems.forEach((item)=>{
        totalPrice=totalPrice+item.itemTotalPrice
    })
    
return totalPrice
}
  // ------------------------------------------------------------------------------------------------
  const addItemTocart=(item:any)=>{
    console.log(item);

if(cartItems.find(p => p.id === item.id)){
  
    const updatedItems = cartItems.map(cart_item => {
      if (item.id === cart_item.id) {
        
        return { ...cart_item, quantity: cart_item.quantity+1 ,itemTotalPrice:+(item.sell_price||item.price)*(cart_item.quantity+1) };
      }
      return cart_item;
    });
    setCartItems(updatedItems);
}else{  

setCartItems([...cartItems,{...item,quantity:1,itemTotalPrice:+(item.sell_price||item.price)}])

  }  }
  // ------------------------------------------------------------------------------------------------
  const removeFromCart=(item:any)=>{
   
    
    if(cartItems.find(p => p.id === item.id).quantity>1){
      
        const updatedItems = cartItems.map(cart_item => {
          if (item.id === cart_item.id) {
            
            return { ...cart_item, quantity: cart_item.quantity-1,itemTotalPrice:(item.sell_price||item.price)*(cart_item.quantity-1) };
          }
          return cart_item;
        });
        setCartItems(updatedItems);
    }else{  
    
    setCartItems(cartItems.filter(el=>el.id!==item.id))
    
      }  }
  // ------------------------------------------------------------------------------------------------
  const router = useRouter()
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
  const fetchProducts = async () => {
    setIsloading(true)
    try {
      const res = await findAllData(`products/${router.query.id}?all_data=1`);
      setProducts(res.data.result);
    } catch (err) {
      Toastify('error', 'Something went wrong with getting products, please try again later!');
    }
  }
  // ----------------------------------------------------------------------------------------------
  const fetchCategories= async () => {
    try {
      const resCategories = await findAllData(`categories/${router.query.id}`);
      setCategories(resCategories.data.result)
    } catch (err) {
      Toastify('error', 'Something went wrong with getting categories , please try again later!');

    }
  }
  // ----------------------------------------------------------------------------------------------
  const fetchBrands = async () => {
    try {
      const resBrands = await findAllData(`brands/${router.query.id}`);
      setBrands(resBrands.data.result)
    } catch (err) {
      Toastify('error', 'Something went wrong with getting brands, please try again later!');

    }
  }
    // ----------------------------------------------------------------------------------------------
    useEffect(() => {
     if(products.length>0&&brands.length>0&&categories.length>0&&isloading) setIsloading(false)
      
    },[products,categories,brands])
    // ----------------------------------------------------------------------------------------------

  useEffect(() => {
   if(router.query.id){
    fetchBrands()
    fetchProducts()
    fetchCategories()
}
  }, [router.query.id])
  return (  <>  {renderedScreen==='products'?<AdminLayout>
      <div className="digital-products-main bg-white">
        <div className="digital-products-header">
          <h1>Digital Products</h1>
        </div>
        <div className='w-50  d-flex justify-content-center mx-auto bg-muted'>
          <div onClick={() => {
            setRenderedTabs("categories")
          }} style={{ borderRadius: '8px', cursor: 'pointer' }} className={`w-50 p-2 text-center  ${renderedTabs === 'categories' ? 'bg-success':'bg-light'} ${renderedTabs === 'categories' ? 'text-light' : 'text-success'}`}>Categories</div>
          <div onClick={() => {
            setRenderedTabs("brands")
          }} style={{ borderRadius: '8px', cursor: 'pointer' }} className={`w-50 p-2 text-center  ${renderedTabs === 'brands' ? 'bg-success':'bg-light'} ${renderedTabs === 'brands' ? 'text-light' : 'text-success'}`}>Brands</div>
        </div>
        <div className="digital-products-container">
          <div className="digital-products">
            <div className="margin:0 auto w-100 justify-content-center d-flex">
              <Box
                sx={{
                  maxWidth: { xs: '100%', sm: 500, md: 600, lg: 700 },
                  bgcolor: 'background.paper',
                }}>

                <Tabs
                  value={value}
                  onChange={handleChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="digital-products-filter"
                  sx={{ textTransform: 'none' }}>
                  <Tab
                    className="filter_btn"
                    label="all"
                    value='0'
                    onClick={(e: any) => {
                      setType(e.target.innerText);
                    }}
                  />
                  {(renderedTabs === 'brands' ? brands : categories).map((el, i) => {
                    return <Tab
                      key={i + 1}
                      className="filter_btn"
                      label={el.name}
                      value={i + 1}
                      onClick={(e: any) => {
                        setType(e.target.innerText);
                      }}
                    />
                  })}

                </Tabs>
              </Box>
            </div>
            <div className="digital-product-list">
           
              {isloading&&  <div className="d-flex justify-content-around w-100">
            <Spinner animation="grow" />
          </div>}
              {type === 'all'
                ? products.map((product, ind) => <ProductItem addItemTocart={addItemTocart} product={product} key={ind} />)
                :(renderedTabs==='categories'? products
                  .filter((product) => product.category.name === type):brands.find(brand=>{
                    
                   return brand.name?.trim()===type?.trim()})?.products||[])
                  .map((product) => <ProductItem addItemTocart={addItemTocart} product={product} key={product.id} />)}
                  {

                  }
            </div>
          </div>
          <DigitalCart totalPrice={getTotalPrice()}  setRenderedScreen={setRenderedScreen} removeFromCart={removeFromCart} addItemTocart={addItemTocart} cartItems={cartItems} />
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
    </AdminLayout>:renderedScreen==='checkout'&&
    <Checkout totalPrice={getTotalPrice()} setRenderedScreen={setRenderedScreen}
     addItemTocart={addItemTocart} removeFromCart={removeFromCart} 
     cartItems={cartItems}/>}</>
  );
};

export default Products;
