
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { ProductItem } from './product-item';
import { useEffect } from 'react';

const style = {
  position: 'absolute' as 'absolute',
  top: '30%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 900,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  outLine: 'none',
  border: 'none',
  borderRadius: '8px',
  display: 'flex',
  flexWrap: 'wrap',
  maxHeight: '70vh',
  overflowY: 'auto !important'
};

export function VariantsProductModal({ setProduct, product, addItemTocart, location }) {

  useEffect(() => {

   

  }, [])
  // ------------------------------------------------------------------------------------------------
  return (
    <div>
      <Modal
        open={true}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        onClose={()=>setProduct()}
      >
        <Box sx={style} className={'gap-3'}>
          {product.variations?.map((product: any, i: any) => <ProductItem location={location} addItemTocart={addItemTocart} product={{ ...product, sell_price: product.price }} key={i} />)}
        </Box>
      </Modal>
    </div>
  );
}
