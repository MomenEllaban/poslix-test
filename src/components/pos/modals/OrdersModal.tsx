import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { useTranslation } from 'next-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClock, faUtensils } from '@fortawesome/free-solid-svg-icons';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';


import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { useRouter } from 'next/router';


function createData(
  id: string,
  type: string,
  time: string,
  status: string,
  price: number,
  items:{
    id:string,
    name: string,
    count:number,
    price:number,
  }[]
) {
  return {
    id,
    type,
    time,
    status,
    price,
    items,
  };
}


function Row(props: { row: ReturnType<typeof createData> }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.id}
        </TableCell>
        <TableCell component="th" scope="row">
          <div style={{display: 'inline-block', backgroundColor: 'yellowgreen', borderRadius: '15px', padding: '10px' }}>
            <CardContent style={{ display: 'flex', padding: '0px' }}>
              <FontAwesomeIcon style={{ marginRight: '5px' }} icon={faUtensils} />
              <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
                {row.type}
              </Typography>
            </CardContent>
          </div>
        </TableCell>
        <TableCell align="left">{row.time}</TableCell>
        <TableCell align="left">{row.status == 'pending' ?
                      <FontAwesomeIcon style={{ marginRight: '5px', color: 'orange'}} icon={faClock} />
                      :
                      <FontAwesomeIcon style={{ marginRight: '5px', color: 'green' }} icon={faCheck} />
                      }{row.status}</TableCell>
        <TableCell align="left">{row.price}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Paper elevation={1} style={{ padding: '20px', textAlign: 'center', maxHeight: '200px', overflowY: 'auto' }}>
                {/* <Typography variant="h6" gutterBottom component="div">
                  Items
                </Typography> */}
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell align="left">Count</TableCell>
                      <TableCell align="left">Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.items.map((itemsRow) => (
                      <TableRow key={itemsRow.id}>
                        <TableCell component="th" scope="row">{itemsRow.id}</TableCell>
                        <TableCell>{itemsRow.name}</TableCell>
                        <TableCell align="left">{itemsRow.count}</TableCell>
                        <TableCell align="left">{itemsRow.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// dummy data 
const rows = [
  createData('1', 'Dine-in', "00:00:00", "pending", 4.0,[{
    id:'1',
    name:'something',
    count:0,
    price:0
  }]),
  createData('1', 'Dine-in', "00:00:00", "completed", 4.0,[{
    id:'1',
    name:'something',
    count:0,
    price:0
  },
  {
    id:'2',
    name:'something',
    count:0,
    price:0
  },
  {
    id:'3',
    name:'something',
    count:0,
    price:0
  }]),
];

const OrdersModal = (props: any) => {
  const { t } = useTranslation();
  const { openDialog, statusDialog, category, showType, shopId,selectId,extrasList } = props;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // actual data
  const [ordersList,setOrdersList] = useState<
    {
      id: string;
      type: string;
      time: string;
      status:string;
      price:number;
      items: {
        id: string;
        name: string;
        count: number;
        price:number;
      }[];
    }[]
  >([]);    

  //submit logic
  const onSubmit = async (data: any) => {
    setIsLoading(true);
  };

  const handleSubmit = () => {};

  const onError = (errors: any, e: any) => console.log(errors, e);

  const handleClose = () => {
    setOpen(false);
    openDialog(false);
  };

  useEffect(() => {
    if (!statusDialog) return;
    setOpen(statusDialog);

  }, [statusDialog]);


      useEffect(() => {
    if (!statusDialog) return;
    setOpen(statusDialog);  
  }, [statusDialog]);
  
  
  

  if (isLoading)
    return (
      <Modal show={open} onHide={handleClose}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          Orders List
          
        </Modal.Header>
        <Modal.Body>
          <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
            <CircularProgress />
          </Box>
        </Modal.Body>
      </Modal>
    );
  return (
    <Modal show={open} onHide={handleClose} size="lg">
      <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
        Orders List
      </Modal.Header>
      <Modal.Body style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }} >
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>ID</TableCell>
                <TableCell align="left">Type</TableCell>
                <TableCell align="left">Time</TableCell>
                <TableCell align="left">Status</TableCell>
                <TableCell align="left">Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <Row key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
      </Modal.Body>
      <Modal.Footer>
        {showType != 'show' && (
          <Button type="submit" className="text-capitalize" onClick={() => {handleClose()}}>
            Done
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default OrdersModal;
