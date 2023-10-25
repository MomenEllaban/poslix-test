import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import CheckIcon from '@mui/icons-material/Check';
import { findAllData } from 'src/services/crud.api';
import { Toastify } from 'src/libs/allToasts';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Center content horizontally
};

export function ReceiveTransferModal({setProducts, transfer, locations, shopId }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

const handleRecieve=async()=>{
try{
const res = await findAllData(`transfer/received/${transfer?.id}`);


setProducts(prev=>{
  // 
  const data=[...prev]
  const idx = data.findIndex((itm) => itm.id == transfer.id);
  const updatedProduct=data.find((p)=>p.id=== transfer.id)
  
  if (idx != -1) {

data.splice(idx, 1,{...updatedProduct,status:"received"});
  }
  return data
})
handleClose()
}catch(e){
  Toastify('error', 'Somthing wrong!!, try agian');
}
}

  return (
    <div>
      <Button
disabled={transfer.status==='received'||transfer.status==='cancelled'}
        sx={{ width: '25px', height: '100%' }}
        onClick={handleOpen}
      >
        <CheckIcon />
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>
            POSLIX SYSTEM
          </Typography>
          <Typography>
            Are you sure that the transfer was received?
          </Typography>
          <div className='w-100 d-flex justify-content-between mt-2'>
          <Button variant="outlined" onClick={handleClose}>
            Dismiss
          </Button>
          <Button variant="contained" onClick={handleRecieve}>
            Confirm
          </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
