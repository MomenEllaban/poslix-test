import type { NextPage } from 'next';
import withAuth from 'src/HOCs/withAuth';
import { faClock, faClockRotateLeft, faEye, faHashtag, faPenToSquare, faPlus, faTrash, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import ExtraModal from '../../../../components/pos/modals/ExtraModal';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';


const KDS: NextPage = (props: any) => {
    const { t } = useTranslation();
    const { shopId, rules } = props;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [locationID, setLocationID] = useState(shopId);

  
    const [ordersList,setOrdersList] = useState<
              {
                id: string;
                type: string;
                time: string;
                rows: {
                  id: string;
                  item: string;
                  count: number;
                }[];
              }[]
            >([]);

    const columns: GridColDef[] = [
      {
        field: 'item',
        headerName: 'item',
        width: 150,
        editable: true,
      },
      {
        field: 'count',
        headerName: 'count',
        width: 150,
        editable: true,
      },
    ];
  
  async function initDataPage() {
    if (router.query.id) {
      try{
      const res = await findAllData(`orders-approved/`);
      if (res.data.status == 404) {
        Toastify('error', 'not found');
        return false ;
      }
      if (res.data.status !== 200) {
        Toastify('error', 'Somthing wrong!!, try agian');

        return false ;
      }
      setOrdersList(res.data.result);
      }catch(e){
        setOrdersList([])
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    initDataPage();
    setLocationID(router.query.id)
  }, [router.asPath]);
  
  const onRowsSelectionHandler = (ids: any) => {};
  const handleCompleteOrder = () => {};

  
  useEffect(() => {
    initDataPage();
    setLocationID(router.query.id)
  }, [router.asPath]);

  const OrderBox = ({order}:{
    order: {
      id:string,
      type:string,
      time: string,
      rows:{
        id: string,
        item: string,
        count: number,
      }[],
    }
  }) => {
    return (
      <>
        <Grid item xs={6}>
          <Card style={{ padding: '0 !important' }} sx={{ minWidth: 275 }}>
            <CardContent 
              style={{
                padding: '3px',
              }}
            >
              <CardContent style={{ display: 'flex', alignItems: 'center', padding:'0'}}>
              {/* First CardContent - Top Left */}
                <CardContent style={{ display: 'flex', alignItems: 'center', marginRight:'auto' }}>
                  <FontAwesomeIcon style={{ marginRight: '5px' }} icon={faClock} />
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {order.time}
                  </Typography>
                </CardContent>
                {/* Colored Card - Sized to Content */}
              <Card
                style={{
                  display: 'inline-block',
                  alignItems: 'center',
                  backgroundColor: 'yellowgreen',
                  borderRadius:'15px',
                  margin: 'auto',
                }}
                >
                <CardContent
                  style={{
                    display: 'flex',
                    backgroundColor: 'yellowgreen',  
                    padding: '10px',
                    margin: 'auto',
                  }}
                >
                  <FontAwesomeIcon style={{ marginRight: '5px' }} icon={faUtensils}/>
                  <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
                    {order.type}
                  </Typography>
                </CardContent>
              </Card>
              {/* Third CardContent - Top Right */}
                <CardContent style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                  <FontAwesomeIcon style={{ marginRight: '5px' }} icon={faHashtag} />
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {order.id}
                  </Typography>
                </CardContent>
              </CardContent>
              {/* DataGrid and other content */}
              <div style={{ width: '100%', height: 200 }}>
                <DataGrid
                  style={{
                    border:'none',
                  }}
                  rows={order.rows}
                  columns={columns} 
                  checkboxSelection 
                  hideFooter
                />
              </div>
            </CardContent>
            <CardActions className="justify-content-center text-center m-auto">
              <Button 
                size="sm"
                onClick={handleCompleteOrder}
              >
                Complete
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </>
    );
  };

    return (
        <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        
        {!isLoading && (
          <div className="mb-2">
            <h1>Orders</h1>
          </div>
        )}
        {!isLoading ? (
          <>
            <Box sx={{ width: '100%' }}>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {/* test item */}
              <OrderBox 
              order = {{
                id: '12837648',
                type: 'Dine-in',
                time:'12:22:21',
                rows:[
                  {id:'1', item:'burger', count: 12},
                  {id:'2', item:'pizza', count: 2},
                  {id:'3', item:'fries', count: 5},
                ]
              }}
              />
              {/* actual orders */}
              {
                ordersList.map((order) => (
                  <OrderBox key={order.id} order={order} />
                ))
              }
            </Grid>
            </Box>

          </>
        ) : (
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        )}
      </AdminLayout>
      
    </>
    );
}
export default withAuth(KDS);

export async function getServerSideProps({ params, locale }) {
  const { id } = params;
  return {
    props: { id, ...(await serverSideTranslations(locale)) },
  };
}