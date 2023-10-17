import { faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import { usePosContext } from '../_context/PosContext';
import { Toastify } from 'src/libs/allToasts';
import { useRouter } from 'next/router';
import { useAppDispatch } from 'src/hooks';
import { setPosRegister } from 'src/redux/slices/pos.slice';
import { createNewData, findAllData } from 'src/services/crud.api';

export function OpenRegisterView({ setShopId, shopId: _shopId }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const shopId = router.query.id ?? 0;
  const [businesses, setBusinesses] = useState([]);
  const [locations, setLocations] = useState([]);
  const { cashHand, setCashHand } = usePosContext();
  const dispatch = useAppDispatch();
  const [currentShopId, setCurrentShopId] = useState(shopId);

  const getBusinesses = async () => {
    setIsLoading(true);
    const res = await findAllData('/business');
    setBusinesses(res.data.result.filter((el) => el.locations?.length > 0));
    setIsLoading(false);
  };

  const handleBussinesChange = (e: any) => {
    setIsLoading(true);
    const idx = businesses?.findIndex((el) => el.id == e.target?.value);
    const locs = idx > -1 ? businesses?.[idx].locations : [];
    setLocations(locs);
    setCurrentShopId(locs?.[0]?.location_id);
    setIsLoading(false);
  };

  const handleLocationChange = (e: any) => {
    setCurrentShopId(e.target?.value);
  };

  async function openRegister() {
    setIsLoading(true);
    const res = await createNewData(`/registration/${currentShopId}/open`, {
      hand_cash: +cashHand,
    });
    if (res.data.success) {
      Toastify('success', res.data.result.message);
      dispatch(setPosRegister({ status: 'open', hand_cash: +cashHand }));
      localStorage.setItem(
        ELocalStorageKeys.POS_REGISTER_STATE,
        JSON.stringify({ status: 'open', hand_cash: +cashHand })
      );
      router.replace(`/pos/${currentShopId}`).then(() => router.reload());
    } else alert('error..Try Again');
    setIsLoading(false);
  }

  useEffect(() => {
    setCurrentShopId(router.query.id);
  }, [router.asPath]);

  useEffect(() => {
    const locs = getLocalStorage<any[]>(ELocalStorageKeys.CUSTOEMR_LOCATIONS) ?? [];
    setLocations(locs?.[0]?.locations);
    getBusinesses();
  }, []);

  return (
    <form
      className="open-register"
      onSubmit={(e) => {
        e.preventDefault();
        openRegister();
      }}>
      <img className="logo" src="/images/logo1.png" />
      <div className="text-center">
        <p className='mb-0'>You have to open the Register first!</p>
        <small>Please select a location or continue with the current one.</small>
      </div>
      <div className="col-lg-4 mb-3">
        <label>Bussnies</label>
        <select
          className="form-select"
          disabled={isLoading || !businesses?.length}
          defaultValue={0}
          onChange={handleBussinesChange}>
          {businesses?.length == 0 ? (
            <option value={0} disabled>
              Loading...
            </option>
          ) : (
            <>
              <option value={0} disabled>
                Select Bussnies
              </option>
              {businesses?.map((el) => (
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
