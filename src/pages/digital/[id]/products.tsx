import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { NextPage } from 'next';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import MobDrawer from 'src/components/digital/MobDrawer';
import DigitalCart from 'src/components/digital/digital-cart';
import ProductItem from 'src/components/digital/product-item';

const Products: NextPage = (props: any) => {
  const [type, setType] = useState('all');
  const [showCart, setShowCart] = useState(true);
    const [open, setOpen] = React.useState(false);
  let toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  const handleDrawer = (open) => {
    setOpen(!open);
    toggleDrawer(!open)

      setShowCart((s)=>!s)
  };
  const {digitalCart} = useSelector((state:any) => state.digitalCart)
  const getTotal = () => {
      let totalQuantity = 0
      let totalPrice = 0
      console.log(digitalCart);
      digitalCart?.forEach(item => {
        totalQuantity += item.quantity
        totalPrice += item.price * item.quantity
      })
      return {totalPrice, totalQuantity}
    }
 
  const matches = useMediaQuery('(max-width:850px)');
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const products = [
    {
      id: 0,
      name: 'Margherita',
      description:
        'سبرنج رول بالخضروات، اصابع دجاج محشوه بالجبن، كرة البطاطا الطازجه محشوه بلحم الانجوس، ساندويش بطاطس عمان بخلطة كوزي vegetable spring rolls, chicken finger with cheese, Fresh potato ball with Angus meat & Omani Chips Sandwich by Cozy way',
      type: 'cozy',
      ingredients: ['tomato sauce', 'mozzarella'],
      spicy: false,
      vegetarian: true,
      price: 17.0,
      image: 'https://i.imgur.com/8B8YLOo.jpg',
    },
    {
      id: 1,
      name: 'Pepperoni',
      description:
        'سبرنج رول بالخضروات، اصابع دجاج محشوه بالجبن، كرة البطاطا الطازجه محشوه بلحم الانجوس، ساندويش بطاطس عمان بخلطة كوزي vegetable spring rolls, chicken finger with cheese, Fresh potato ball with Angus meat & Omani Chips Sandwich by Cozy way',
      type: 'cozy',
      ingredients: ['tomato sauce', 'mozzarella', 'double pepperoni'],
      spicy: false,
      vegetarian: false,
      price: 20.0,
      image: 'https://i.imgur.com/OHHctnf.jpg',
    },
    {
      id: 2,
      name: 'Rome',
      description:
        'سبرنج رول بالخضروات، اصابع دجاج محشوه بالجبن، كرة البطاطا الطازجه محشوه بلحم الانجوس، ساندويش بطاطس عمان بخلطة كوزي vegetable spring rolls, chicken finger with cheese, Fresh potato ball with Angus meat & Omani Chips Sandwich by Cozy way',
      type: 'cozy',
      ingredients: ['tomato sauce', 'mozzarella', 'ham', 'mushrooms', 'beef cubes'],
      spicy: false,
      vegetarian: false,
      price: 25.75,
      image: 'https://i.imgur.com/3ZTwCfz.png',
    },
    {
      id: 3,
      name: 'American Spicy',
      description:
        'سبرنج رول بالخضروات، اصابع دجاج محشوه بالجبن، كرة البطاطا الطازجه محشوه بلحم الانجوس، ساندويش بطاطس عمان بخلطة كوزي vegetable spring rolls, chicken finger with cheese, Fresh potato ball with Angus meat & Omani Chips Sandwich by Cozy way',
      type: 'hamo',
      ingredients: [
        'tomato sauce',
        'mozzarella',
        'pepperoni',
        'tomatoes',
        'green pepper',
        'red onion',
        'jalapenos',
        'Samourai sauce',
      ],
      spicy: true,
      vegetarian: false,
      price: 30.25,
      image: 'https://i.imgur.com/dyoOLCO.png',
    },
    {
      id: 4,
      name: 'Quattro Stagioni',
      description:
        'سبرنج رول بالخضروات، اصابع دجاج محشوه بالجبن، كرة البطاطا الطازجه محشوه بلحم الانجوس، ساندويش بطاطس عمان بخلطة كوزي vegetable spring rolls, chicken finger with cheese, Fresh potato ball with Angus meat & Omani Chips Sandwich by Cozy way',
      type: 'hamo',
      ingredients: ['tomato sauce', 'mozzarella', 'ham', 'pepperoni', 'mushrooms', 'green pepper'],
      spicy: false,
      vegetarian: false,
      price: 27.25,
      image: 'https://i.imgur.com/wOEuXuV.jpg',
    },
    {
      id: 5,
      name: 'Pork & Feta',
      description: 'Cheesecake with berries topping',
      type: 'ozy',
      ingredients: ['tomato sauce', 'mozzarella', 'feta cheese', 'ham', 'pork cubes', 'red onion'],
      spicy: false,
      vegetarian: false,
      price: 27.25,
      image: 'https://i.imgur.com/48Zw4K3.png',
    },
    {
      id: 6,
      name: 'Quattro Formaggi',
      description: 'Cheesecake with berries topping',
      type: 'ozy',

      ingredients: ['mozzarella', 'cheddar cheese', 'emmentaler', 'blue cheese', 'oregano'],
      spicy: false,
      vegetarian: true,
      price: 35.15,
      image: 'https://i.imgur.com/MDrTvkI.jpg',
    },
    {
      id: 7,
      name: 'Carnivora',
      description: 'Cheesecake with berries topping',
      type: 'ozy',

      ingredients: [
        'tomato sauce',
        'mozzarella',
        'chicken breast',
        'beef cubes',
        'pepperoni',
        'bacon',
      ],
      spicy: false,
      vegetarian: false,
      price: 27.25,
      image: 'https://i.imgur.com/0vPtSSO.png',
    },
    {
      id: 8,
      name: 'Louisiana Chicken',
      description: 'Cheesecake with berries topping',
      type: 'ozy',

      ingredients: [
        'marinated chicken',
        'TABASCO spicy sauce',
        'red pepper sauce',
        'blue cheese',
        'green pepper',
        'red onion',
      ],
      spicy: true,
      vegetarian: false,
      price: 20.0,
      image: 'https://i.imgur.com/lZtwJgy.png',
    },
    {
      id: 9,
      name: 'Honey Mustard Chicken',
      description: 'Cheesecake with berries topping',
      type: 'Pasta',

      ingredients: [
        'tomato sauce',
        'mozzarella',
        'marinated chicken in Honey Mustard sauce',
        'cheddar cheese',
        'red onion',
      ],
      spicy: false,
      vegetarian: false,
      price: 19.8,
      image: 'https://i.imgur.com/SoZu61g.png',
    },
    {
      id: 10,
      name: 'Hawaiian',
      description: 'Cheesecake with berries topping',
      type: 'Pasta',
      ingredients: [
        'mozzarella',
        'sweet chilli sauce',
        'pepperoni',
        'pineapple',
        'jalapenos',
        'red onion',
      ],
      spicy: true,
      vegetarian: false,
      price: 27.25,
      image: 'https://i.imgur.com/mqTgvgl.png',
    },
    {
      id: 11,
      name: 'Classic',
      description: 'Cheesecake with berries topping',
      type: 'Pasta',
      ingredients: ['tomato sauce', 'mozzarella', 'ham', 'mushrooms', 'olives'],
      spicy: false,
      vegetarian: false,
      price: 27.25,
      image: 'https://i.imgur.com/k6IGrUd.png',
    },
    {
      id: 12,
      name: 'Pastrami',
      description: 'Cheesecake with berries topping',
      type: 'Pasta',
      ingredients: [
        'tomato sauce',
        'mozzarella',
        'pastrami',
        'salty cheese',
        'baked green pepper',
        'red onion',
      ],
      spicy: false,
      vegetarian: false,
      price: 27.25,
      image: 'https://i.imgur.com/yOe5RtC.png',
    },
    {
      id: 13,
      name: 'Hot Pastrami',
      description: 'Cheesecake with berries topping',
      type: 'Pasta',
      ingredients: [
        'Honey Mustard sauce',
        'mozzarella',
        'pastrami',
        'sausages',
        'chilli pepper',
        'red onion',
      ],
      spicy: true,
      vegetarian: false,
      price: 27.25,
      image: 'https://i.imgur.com/ipMA5LP.png',
    },
    {
      id: 14,
      name: 'Country',
      description: 'Cheesecake with berries topping',
      type: 'Chicken',
      ingredients: ['tomato sauce', 'mozzarella', 'bacon', 'corn', 'onion', 'mushrooms'],
      spicy: false,
      vegetarian: false,
      price: 27.25,
      image: 'https://i.imgur.com/E67Xf8Y.png',
    },
    {
      id: 15,
      name: 'Hot Cheese',
      description: 'Cheesecake with berries topping',
      type: 'Chicken',
      ingredients: [
        'tomato sauce',
        'mozzarella',
        'cheddar cheese',
        'salty cheese',
        'tomatoes',
        'chilli pepper',
        'oregano',
      ],
      spicy: true,
      vegetarian: true,
      price: 27.25,
      image: 'https://i.imgur.com/v4sa2cA.png',
    },
    {
      id: 16,
      name: 'Ocean',
      description: 'Cheesecake with berries topping',
      type: 'Chicken',
      ingredients: ['tomato sauce', 'mozzarella', 'tuna', 'corn', 'onion', 'olives'],
      spicy: false,
      vegetarian: false,
      price: 30,
      image: 'https://i.imgur.com/w5IQ2rX.png',
    },
    {
      id: 17,
      name: 'BBQ',
      description: 'Cheesecake with berries topping',
      type: 'Chicken',
      ingredients: [
        'tomato sauce',
        'mozzarella',
        'BBQ sauce',
        'onion',
        'corn',
        'bacon',
        'mushrooms',
        'sausages',
      ],
      spicy: false,
      vegetarian: false,
      price: 28.5,
      image: 'https://i.imgur.com/znqS9KD.png',
    },
    {
      id: 18,
      name: 'Mexicana',
      description: 'Cheesecake with berries topping',
      type: 'Chicken',
      ingredients: [
        'tomato sauce',
        'mozzarella',
        'salsa sauce',
        'pepperoni',
        'corn',
        'onion',
        'jalapenos',
        'tortilla chips',
      ],
      spicy: true,
      vegetarian: false,
      price: 28.5,
      image: 'https://i.imgur.com/cYpO8RT.png',
    },
  ];

  return (
    <div className="digital-products-main">
      <div className="digital-products-header">
        <h1>Digital Products</h1>
      </div>
      <div className="digital-products-container">
        <div className="digital-products">
          <div className="margin:0 auto w-100 justify-content-center d-flex">
          <Box  sx={{ maxWidth: { xs: '100%', sm: 500,md:600,lg:700 }, bgcolor: 'background.paper' }}>
      <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="digital-products-filter"
                sx={{ textTransform: 'none' }}
      >
        <Tab className='filter_btn' label="all" value="1" onClick={(e:any) => {setType(e.target.innerText)}} /> 
        <Tab className='filter_btn' label="Chicken" value="2" onClick={(e:any) => {setType(e.target.innerText)}} /> 
        <Tab className='filter_btn' label="ozy" value="3" onClick={(e:any) => {setType(e.target.innerText)}} /> 
        <Tab className='filter_btn' label="cozy" value="4" onClick={(e:any) => {setType(e.target.innerText)}} /> 
        <Tab className='filter_btn' label="Pasta" value="5" onClick={(e:any) => {setType(e.target.innerText)}} /> 
     
      </Tabs>
    </Box>
          </div>

      
          <div className="digital-product-list">
            {type === 'all'
              ? products.map((product, ind) => <ProductItem product={product} key={ind} />)
              : products
                  .filter((product) => product.type == type)
                  .map((product, ind) => (
                    <ProductItem product={product}  key={product.id} />
                  ))}
          </div>
        </div>
        <DigitalCart />
        {matches?
          <div className="digital-cart-small" 
            style={{ display: showCart ? 'flex' : 'none', transition: "all 1.5s ease-in-out" ,background: getTotal().totalPrice ? '#045c54' : '#909090',}}>
 <div className='d-flex h-100 align-items-center '>
 <ShoppingCartIcon/>
   <p className='m-0'>
   Total:{getTotal().totalPrice} OMR
  </p>


 </div>
 <Button className='mobDrawer_btn' onClick={()=>handleDrawer(open)}>View Cart</Button>

 </div>:null

        }
       
          
        { matches?
          <MobDrawer toggleDrawer={toggleDrawer} setOpen={setOpen} open={open} setShowCart={setShowCart} />
:null
        }
      </div>
    </div>
  );
};

export default Products;
