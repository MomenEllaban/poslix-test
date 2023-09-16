import { faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useBusinessList } from 'src/services/business.service';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import { usePosContext } from '../_context/PosContext';
import { Toastify } from 'src/libs/allToasts';
import { useRouter } from 'next/router';
import { useAppDispatch } from 'src/hooks';
import { setPosRegister } from 'src/redux/slices/pos.slice';
import { createNewData } from 'src/services/crud.api';

export function OpenRegisterView({ setShopId, shopId, setIsLoading }) {
  const router = useRouter();
  const [cusLocs, setCusLocs] = useState([]);
  const [locations, setLocations] = useState([]);
  const { cashHand, setCashHand } = usePosContext();
  const dispatch = useAppDispatch();
  const [currentShopId, setCurrentShopId] = useState(shopId)

  const { isLoading } = useBusinessList({
    onSuccess: (data) => {
      setCusLocs(data?.result.filter((el) => el.locations?.length > 0));
      setLocations(data?.result?.[0]?.locations);
    },
  });

  const handleBussinesChange = (e: any) => {
    const idx = cusLocs?.findIndex((el) => el.id == e.target?.value);
    const locs = idx > -1 ? cusLocs?.[idx].locations : [];
    setLocations(locs);
    setCurrentShopId(locs?.[0]?.location_id);
  };

  const handleLocationChange = (e: any) => {
    setCurrentShopId(e.target?.value);
  };

  async function openRegister() {
    setIsLoading(true);
    const res = await createNewData(`/registration/${currentShopId}/open`, { hand_cash: +cashHand })
    if(res.data.success) {
      Toastify('success', res.data.result.message);
      dispatch(setPosRegister({state: 'open', hand_cash: +cashHand}));
      localStorage.setItem(ELocalStorageKeys.POS_REGISTER_STATE,
        JSON.stringify({state: 'open', hand_cash: +cashHand}));
      router.replace(`/pos/${currentShopId}`);
    } else alert('error..Try Again');
    setIsLoading(false);
  }

  useEffect(() => {
    const locs = getLocalStorage<any[]>(ELocalStorageKeys.CUSTOEMR_LOCATIONS) ?? [];
    setLocations(locs?.[0]?.locations);
  }, []);

  return (
    <form
      className="open-register"
      onSubmit={(e) => {
        e.preventDefault();
        openRegister();
      }}>
      <img className="logo" src="/images/logo1.png" />
      <p>You have Open Register First!</p>
      <div className="col-lg-4 mb-3">
          <label>Bussnies</label>
          <select
            className="form-select"
            disabled={isLoading || !cusLocs?.length}
            defaultValue={0}
            onChange={handleBussinesChange}>
            { cusLocs?.length == 0 ? (
              <option value={0} disabled>
                Loading...
              </option>
            ) : (
              <>
                <option value={0} disabled>
                  Select Bussnies
                </option>
                {cusLocs?.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
        <div className="col-lg-4 mb-3">
          <label>Location</label>
          <select
            disabled={isLoading || !locations?.length}
            defaultValue={0}
            className="form-select"
            onChange={handleLocationChange}>
            {locations?.length == 0 ? (
              <option value={0} disabled>
                Loading...
              </option>
            ) : (
              <>
                <option value={0} disabled>
                  Select Location
                </option>
                {locations?.map((el) => (
                  <option key={el.location_id} value={el.location_id}>
                    {el.location_name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      <div className="col-lg-4 mb-3">
        <input
          type="number"
          name="cash"
          className="form-control"
          placeholder="Cash in hand..."
          onChange={(e) => {
            setCashHand(+e.target?.value);
          }}
        />
      </div>
      <button className="btn btn-primary p-3" type="submit">
        <FontAwesomeIcon icon={faCashRegister} /> Open Register
      </button>
    </form>
  );
}
