import styles from './digital.module.css'
import { findAllData } from 'src/services/crud.api';
import { Toastify } from 'src/libs/allToasts';
import { useEffect, useState } from 'react';
import LanguageIcon from '@mui/icons-material/Language';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonIcon from '@mui/icons-material/Person';

export const DigitalNavbar=({appearance})=>{

    return(<div className={styles.navbar_wrapper}>
        {/* right part */}
<div style={{    padding: '.5rem'
}}>
<img alt='' src={appearance?.en?.logo} className={styles.logo}/>
</div>
{/* middle part */}
<div className='d-none d-md-flex align-items-center'>
    <LightModeIcon sx={{cursor:'pointer'}}/>
    <span className='mx-2 d-flex align-items-center' style={{cursor:'pointer'}}>
    العربيه
    <LanguageIcon sx={{marginX:'.5rem'}}/>

    </span>
</div>
{/* left part */}
<div>
    <PersonIcon sx={{cursor:'pointer'}} className='mx-4'/>
    <SettingsOutlinedIcon sx={{cursor:'pointer'}}/>
</div>

    </div>)
}