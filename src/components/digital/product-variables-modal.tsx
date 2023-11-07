import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import ProductItem from './product-item';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute' as 'absolute',
  top: '10%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 900,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  outLine:'none',
  border:'none',
  borderRadius:'8px',
  display:'flex',
  justifyContent: 'start',
  flexWrap:'wrap',
  maxHeight:'70vh',
  overflowY:'auto !important',
  gap:'.5rem'
};

export default function ProductVariablesModal({open, setOpen,product,addItemTocart,location}) {
  
  // const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
        <div className='w-100 d-flex justify-content-end'><CloseIcon sx={{cursor:'pointer'}}  onClick={handleClose}/></div>

        {product?.variations?.map((product,i)=> <ProductItem location={location} addItemTocart={addItemTocart} product={{...product,sell_price:product.price}} key={i} />)}
        </Box>
      </Modal>
    </div>
  );
}
