import { IProduct } from '@models/pos.types';
import classNames from 'classnames';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import { useRecoilState } from 'recoil';
import { cartJobType } from 'src/recoil/atoms';
import { useProducts } from '../../../../context/ProductContext';
import BrandSwiper from '../brand-slider/BrandSlider';
import { ItemCard } from '../item-card/ItemCard';
import { TabPanel } from '../tab-panel/TabPanel';
import styles from './ItemList.module.scss';
import { useBrandsList, useCategoriesList } from 'src/services/pos.service';
import { usePosContext } from 'src/modules/pos/_context/PosContext';
import { findAllData } from 'src/services/crud.api';
import { Toastify } from 'src/libs/allToasts';
import { useRouter } from 'next/router';

const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: '48b7b9',
};

export const ItemList = ({ customer,shopId }: any) => {
  const { lang: _lang } = usePosContext();
  const lang = _lang?.pos.itemList;

  const [jobType] = useRecoilState(cartJobType);
  const { products } = useProducts();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(0);
  const [selectedTab, setSelectedTab] = useState('category');
  const [productsItems, SetProductsItems] = useState<IProduct[]>([]);

  const { categoriesList, isLoading: isCategoriesLoading } = useCategoriesList(shopId);
  const { brandsList, isLoading: isBrandsLoading } = useBrandsList(shopId);
  const [groups, setGroups] = useState<any>([])
  const router = useRouter()

    // =-----------------------------------------------------------------------------------------------

  const getpricingGroups = async () => {
    try {
  
      const res = await findAllData(`pricing-group/${router.query.id}&all_data=1`);
      setGroups(res.data?.result?.data);
  
    } catch (e) {
      Toastify('error', 'Something went wrong')
    }
  }
    // ------------------------------------------------------------------------------------------------
    useEffect(() => {
      getpricingGroups()
      
    }, [])
    // ------------------------------------------------------------------------------------------------
  
  const handleTabChange = (value: any) => {
    setSelectedTab(value);
    setIsLoading(false);
  };

  const renderProductsFn = (product: IProduct, idx) => (
    <div className="items-list-pos" key={product.id}>
      <ItemCard groups={groups} customer={customer} product={product} />
    </div>
  );

  const filteredProducts = useMemo(() => {
    if (selectedTab === 'category') {
      const _selectedCat = categoriesList.find((val) => val.id === selectedCat);

      if (_selectedCat) return _selectedCat.products || [];
      return categoriesList.map((item) => item.products).flat();
    } else {
      const _selectedBrand = brandsList.find((val) => val.id === selectedBrand);

      if (_selectedBrand) return _selectedBrand.products || [];
      return brandsList.map((item) => item.products).flat();
    }
  }, [selectedTab, selectedCat, selectedBrand, categoriesList, brandsList]);

  useEffect(() => {
    SetProductsItems(products);
    setIsLoading(false);
  }, [products]);
  

  useEffect(() => {
    if (jobType.req == 102) setIsLoading(true);
  }, [jobType]);

  return (
    <div className="card" style={{ width: '60%' }}>
      <div className={classNames('card-body', styles['item-list__container'])}>
        <TabPanel lang={lang} activeTab={selectedTab} onTabChange={handleTabChange} />
        {/* Swiper   */}
        <BrandSwiper
          onTabChange={selectedTab}
          onCatChange={(value: any) => {
            if (selectedTab == 'category') setSelectedCat(value);
            else setSelectedBrand(value);

            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false); //! whyyyyyyy
            }, 100);
          }}
          dataItems={{ cats: categoriesList, brands: brandsList }}
        />

        {isCategoriesLoading || isBrandsLoading ? (
          <ClipLoader color="48b7b9" loading={true} cssOverride={override} size="150px" />
        ) : (
          <div className="tab-content text-muted">
            <div
              className="tab-pane active products"
              id="nav-border-justified-section"
              role="tabpanel"
              data-simplebar=""
              style={{ height: 'calc(100vh - 200px)' }}>
              <div className="items-list">
                {filteredProducts?.length ? (
                  filteredProducts?.map(renderProductsFn)
                ) : (
                  <p
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#48b7b9',
                    }}>
                    No products ...
                  </p>
                )}
              </div>
              {/* end row */}
            </div>
          </div>
        )}
      </div>
      {/* end card body */}
    </div>
  );
};
