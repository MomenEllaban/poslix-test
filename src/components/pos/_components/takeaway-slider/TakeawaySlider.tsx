import { Fragment, useEffect, useState } from 'react';
import { useAppDispatch } from 'src/hooks';
import { usePosContext } from 'src/modules/pos/_context/PosContext';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGifts, faUtensils } from '@fortawesome/free-solid-svg-icons';


export default function TakeawaySlider({ onOrderTypeChange, orderType }) {
    const dispatch = useAppDispatch();
    const { lang: _lang } = usePosContext();
    const lang = _lang?.pos;

    const handleSwitchChange = () => {
        const newOrderType = orderType === 'dine-in' ? 'take-away' : 'dine-in';
        onOrderTypeChange(newOrderType);
        };
  
    const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
      margin: 1,
      padding: 0,
      transform: 'translateX(6px)',
      '&.Mui-checked': {
        color: '#fff',
        transform: 'translateX(22px)',
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor:'#aab4be',
        },
      },
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: '#025c53',
      width: 32,
      height: 32,
      '&::before': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      },
    },
    '& .MuiSwitch-track': {
      opacity: 1,
      backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      borderRadius: 20 / 2,
    },
  }));

  return (
    <Fragment>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
        <Typography>
            Dine-in
            <FontAwesomeIcon 
                style={{ marginLeft: '5px', marginRight: '5px', color: '#012723' }}
                icon={faUtensils}
            />    
        </Typography>
        <FormControlLabel
        control={
            <MaterialUISwitch sx={{ m: 1 }} 
            checked={orderType === 'take-away'}
            onChange={handleSwitchChange} />}
        label=""
        />
        <Typography>
            Take-away
            <FontAwesomeIcon 
                style={{ marginLeft: '5px', marginRight: '5px', color: '#012723' }}
                icon={faGifts}
            />
        </Typography>
        </Stack>
    </Fragment>
  );

}