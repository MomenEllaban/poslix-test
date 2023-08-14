import { faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ar from 'ar.json';
import en from 'en.json';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import 'remixicon/fonts/remixicon.css';
import withAuth from 'src/HOCs/withAuth';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import { apiFetchCtr, apiInsertCtr } from 'src/libs/dbUtils';
import { OrdersComponent } from '../../../components/pos/CartComponent';
import { ItemList } from '../../../components/pos/ItemList';
import NavMenu from '../../../components/pos/parts/NavMenu';
import { useProducts } from '../../../context/ProductContext';
import { cartJobType } from '../../../recoil/atoms';

function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="layout-wrapper">
      <div className="vertical-overlay" />
      <div className="main-content">{children}</div>
    </div>
  );
}

const Home: NextPage = (props: any) => {
  const router = useRouter();
  const [shopId, setShopId] = useState(props.shopId);

  // const [isOpenRegister, setIsOpenRegister] = useState(false);
  const [isOpenRegister, setIsOpenRegister] = useState(true);

  const [jobType] = useRecoilState(cartJobType);
  const {
    setCats,
    setBrands,
    setProducts,
    setCustomers,
    setTaxes,
    setTaxGroups,
    setVariations,
    setPackageItems,
  } = useProducts();

  const { setLocationSettings, setTailoringSizes, setInvoicDetails, setTailoringExtras } =
    useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [cashHand, setCashHand] = useState(0);
  const [lang, setLang] = useState(en);
  const [cusLocs, setCusLocs] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    var locs = JSON.parse(localStorage.getItem('cusLocs') ?? '[]');
    // console.log(locs);

    setCusLocs(locs);
    setLocations(locs?.[0]?.locations);
    if (jobType.req == 101) setIsOpenRegister(false);
    else if (jobType.req == 102) initData();
  }, [jobType]);

  async function initData() {
    const { success, data } = await apiFetchCtr({
      fetch: 'pos',
      subType: 'getPosInit',
      shopId,
    });
    if (!success) {
      Toastify('error', 'error..Try Again');
      return;
    }
    setCats(data.cats);
    setTaxes(data.taxes);
    setBrands(data.brands);
    setTaxGroups(data.tax_group);
    setProducts(data.stockedProducts);
    setVariations(data.variations);
    setPackageItems(data.packageItems);
    setTailoringExtras(data.tailoring_extras);
    setCustomers([{ value: '1', label: 'walk-in customer', isNew: false }, ...data.customers]);
    setTailoringSizes(data.AllSizes);
    if (data.invoiceDetails != null && data.invoiceDetails.length > 10)
      setInvoicDetails(JSON.parse(data.invoiceDetails));
    else {
    }
    var _locs = JSON.parse(localStorage.getItem('userlocs') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc?.value == shopId;
          })
        ] ?? {}
      );
    else Toastify('error', 'errorr location settings');

    setIsLoading(false);
    if (data.cash.length > 0 && data.cash[0].status == 'open') {
      setIsOpenRegister(true);
      setIsLoading(false);
    }
  }
  async function openRegister() {
    const { success } = await apiInsertCtr({
      type: 'customer',
      subType: 'opens',
      cashHand,
      shopId,
    });
    if (!success) {
      alert('error..Try Again');
      return;
    }
    localStorage.setItem('hand_in_cash', cashHand.toString());
    router.replace(`/pos/${shopId}`);
    initData();
    setIsOpenRegister(true);
    setIsLoading(false);
  }
  useEffect(() => {
    // initData();
  }, []);

  const handleBussinesChange = (e: any) => {
    let idx = cusLocs.findIndex((el) => el.bus_id == e.target?.value);
    let locs = cusLocs[idx].locations;
    setLocations(locs);
    setShopId(locs?.[0]?.loc_id);
  };

  const handelLocationChange = (e: any) => {
    setShopId(e.target?.value);
  };

  if (isLoading)
    return (
      <PosLayout>
        <div className="pos-loading">
          <div>
            <div className="snippet" data-title="dot-flashing">
              <div className="stage">
                <div className="dot-flashing"></div>
              </div>
            </div>
          </div>
        </div>
      </PosLayout>
    );

  if (isOpenRegister)
    return (
      <PosLayout>
        <div className="pos-flex">
          <NavMenu shopId={shopId} lang={lang} setLang={setLang} />
          <OrdersComponent shopId={shopId} lang={lang.pos} direction={lang == ar ? 'rtl' : ''} />
          <ItemList lang={lang.pos.itemList} />
        </div>
      </PosLayout>
    );

  return (
    <PosLayout>
      <div className="pos-flex">
        <div className="open-register">
          <img className="logo" src="/images/logo1.png" />
          <p>You have Open Register First!</p>

          {/* mohamed elsayed reg */}
          <div className="col-lg-4 mb-3">
            <label>Bussnies</label>
            <select className="form-select" onChange={handleBussinesChange}>
              {cusLocs?.map((el) => (
                <option key={el.bus_id} value={el.bus_id}>
                  {el.bus_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-4 mb-3">
            <label>Location</label>
            <select className="form-select" onChange={handelLocationChange}>
              {locations?.map((el) => (
                <option key={el.loc_id} value={el.loc_id}>
                  {el.loc_name}
                </option>
              ))}
            </select>
          </div>
          {/* ------------------ */}

          <input
            type="number"
            name="cemail"
            className="form-control"
            placeholder="Cash in hand..."
            onChange={(e) => {
              setCashHand(+e.target?.value);
            }}
          />
          <button className="btn btn-primary p-3" onClick={() => openRegister()}>
            <FontAwesomeIcon icon={faCashRegister} /> Open Register{' '}
          </button>
        </div>
      </div>
    </PosLayout>
  );
};

export default withAuth(Home);

export async function getServerSideProps(context: any) {
  return {
    props: {
      shopId: context.query.id,
      rules: { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true },
    },
  };
}
