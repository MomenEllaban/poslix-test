import { faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useBusinessList } from 'src/services/business.service';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import PosLayout from '../_components/layout/pos.layout';

export function OpenRegisterView({ setShopId, setCashHand, openRegister }) {
  const [cusLocs, setCusLocs] = useState([]);
  const [locations, setLocations] = useState([]);

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
    setShopId(locs?.[0]?.location_id);
  };

  const handleLocationChange = (e: any) => {
    setShopId(e.target?.value);
  };

  useEffect(() => {
    const locs = getLocalStorage<any[]>(ELocalStorageKeys.CUSTOEMR_LOCATIONS) ?? [];
    setLocations(locs?.[0]?.locations);
  }, []);

  return (
    <PosLayout>
      <form
        className="open-register"
        onSubmit={(e) => {
          e.preventDefault();
          openRegister();
        }}>
        <img className="logo" src="/images/logo1.png" />
        <p>You have Open Register First!</p>
        {/*//! why */}
        {/* mohamed elsayed reg */}
        {/* <div className="col-lg-4 mb-3">
          <label>Bussnies</label>

          <select
            className="form-select"
            disabled={isLoading || !cusLocs?.length}
            defaultValue={0}
            onChange={handleBussinesChange}>
            {isLoading || !cusLocs?.length ? (
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
        </div> */}
        {/* 
        <div className="col-lg-4 mb-3">
          <label>Location</label>
          <select
            disabled={isLoading || !locations?.length}
            defaultValue={0}
            className="form-select"
            onChange={handleLocationChange}>
            {isLoading || !locations?.length ? (
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
        </div> */}
        {/* ------------------ */}
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
    </PosLayout>
  );
}
