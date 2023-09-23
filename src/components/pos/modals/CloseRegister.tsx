import {
  faBank,
  faCreditCard,
  faMoneyBillTransfer,
  faMoneyBillWave,
  faMoneyCheck,
  faSackDollar,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useContext, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { UserContext } from 'src/context/UserContext';
import api from 'src/utils/app-api';
import { useProducts } from '../../../context/ProductContext';
import { apiInsertCtr } from '../../../libs/dbUtils';
import { cartJobType } from '../../../recoil/atoms';
import mStyle from '../../../styles/Customermodal.module.css';
import SnakeAlert from '../utils/SnakeAlert';
import { createNewData, findAllData } from 'src/services/crud.api';
import { Toastify } from 'src/libs/allToasts';
import { useAppDispatch } from 'src/hooks';
import { setPosRegister } from 'src/redux/slices/pos.slice';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

const CloseRegister = ({ openDialog, statusDialog, shopId }: any) => {
  const [snakeTitle, setSnakeTitle] = useState('');

  const { products, setProducts, customers, setCustomers } = useProducts();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [handCash, setHandCash] = useState(0);
  const [cash, setCash] = useState(0);
  const [card, setCard] = useState(0);
  const [bank, setBank] = useState(0);
  const [cheque, setCheque] = useState(0);
  const [note, setNote] = useState('');
  const [openSnakeBar, setOpenSnakeBar] = useState(false);
  const [, setJobType] = useRecoilState(cartJobType);

  const { locationSettings } = useContext(UserContext);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    setOpen(false);
    openDialog(false);
  };
  useEffect(() => {
    if (!statusDialog) return;
    setHandCash(+JSON.parse(localStorage.getItem('posRegister')).hand_cash)
    setOpen(statusDialog);
    getCloseData()
  }, [statusDialog]);

  const closeRegisterReq = async () => {
    const res = await createNewData(`registration/${shopId}/close`, {
      hand_cash: handCash,
      note
    })
    if(res.data.success) {
      handleClose();
      setJobType({ req: 101, val: 'closeRegister' });
      Toastify('success', 'successfully done');
      const registerObject = getLocalStorage<{hand_cash: number; state: string}>(ELocalStorageKeys.POS_REGISTER_STATE);
      dispatch(setPosRegister({...registerObject, state: 'close'}));
    } else Toastify('error', 'Something went wrong!');
  }

  const getCloseData = async () => {
    const res = await findAllData(`registration/${shopId}/close`)
    setCash(res.data.result.cash);
    setCard(res.data.result.card);
    setBank(res.data.result.bank);
    setCheque(res.data.result.cheque);
    setIsLoading(false)
  }

  const makeShowSnake = (val: any) => {
    setOpenSnakeBar(val);
  };

  return (
    <>
      <SnakeAlert title={snakeTitle} show={openSnakeBar} fun={makeShowSnake} />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        maxWidth={'xl'}>
        <DialogTitle className={mStyle.bgg} id="scroll-dialog-title">
          <h5 className="modal-title" id="myLargeModalLabel">
            Close Register
          </h5>
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="close-register-box">
                  <div className="close-item">
                      <div className="close-item-inner">
                        <div className="close-item-inner-icon">
                          <FontAwesomeIcon icon={faCreditCard} />
                        </div>
                        <p className="close-item-title">Cash in hand</p>
                        <p className="close-item-title">
                          {Number(handCash).toFixed(3)}{' '}
                          {locationSettings?.currency_code}
                        </p>
                      </div>
                    </div>
                    <div className="close-item">
                      <div className="close-item-inner">
                        <div className="close-item-inner-icon">
                          <FontAwesomeIcon icon={faMoneyBillTransfer} />
                        </div>
                        <p className="close-item-title">Card Payment</p>
                        <p className="close-item-title">
                          {card} {locationSettings?.currency_code}
                        </p>
                      </div>
                    </div>
                    <div className="close-item">
                      <div className="close-item-inner">
                        <div className="close-item-inner-icon">
                          <FontAwesomeIcon icon={faBank} />
                        </div>
                        <p className="close-item-title">Bank Payment</p>
                        <p className="close-item-title">
                          {Number(bank).toFixed(3)} {locationSettings?.currency_code}
                        </p>
                      </div>
                    </div>
                    <div className="close-item">
                      <div className="close-item-inner">
                        <div className="close-item-inner-icon">
                          <FontAwesomeIcon icon={faCreditCard} />
                        </div>
                        <p className="close-item-title">Cash Payment</p>
                        <p className="close-item-title">
                          {Number(cash).toFixed(3)} {locationSettings?.currency_code}
                        </p>
                      </div>
                    </div>
                    <div className="close-item">
                      <div className="close-item-inner">
                        <div className="close-item-inner-icon">
                          <FontAwesomeIcon icon={faMoneyCheck} />
                        </div>
                        <p className="close-item-title">Cheque Payment</p>
                        <p className="close-item-title">
                          {Number(cheque).toFixed(3)} {locationSettings?.currency_code}
                        </p>
                      </div>
                    </div>
                  </div>
                  <hr className="mt-3 mb-3" />
                  <div className="close-register-report">
                    <div className="close-report-items">
                      <div className="report-items-icon">
                        <FontAwesomeIcon icon={faSackDollar} />
                        <div className="report-name">Total Sales</div>
                      </div>
                      <div className="report-items-value">
                        {(cash + cheque + card + bank + handCash).toFixed(3)}{' '}
                        {locationSettings?.currency_code}
                      </div>
                    </div>
                  </div>
                </div>
                <textarea
                  className="form-control close-note mb-4 mt-4"
                  placeholder="Your Note here"
                  rows={6}
                  onChange={(e) => setNote(e.target.value)}>
                  {note}
                </textarea>
                <div className="modal-footer mt-4">
                  <a
                    href="javascript:void(0);"
                    className="btn btn-link link-success fw-medium"
                    onClick={() => handleClose()}>
                    <i className="ri-close-line me-1 align-middle" /> Dismise
                  </a>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      closeRegisterReq();
                    }}>
                    Close Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CloseRegister;
