import { IProduct } from '@models/pos.types';
import { CSSProperties, useEffect, useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import { useRecoilState } from 'recoil';
import { cartJobType } from 'src/recoil/atoms';
import { useProducts } from '../../../../context/ProductContext';
import BrandSwiper from '../brand-slider/BrandSlider';
import { TabPanel } from '../tab-panel/TabPanel';
import { ItemCard } from '../../utils/ItemCard';
import classNames from 'classnames';
import styles from './ItemList.module.scss';

export const ItemList: any = (props: any) => {
  const { lang } = props;

  const [selectedTab, setSelectedTab] = useState('category');
  const [isLoading, setIsLoading] = useState(true);
  const { products, cats, brands } = useProducts();
  const [selectedCat, setSelectedCat] = useState(0);
  const [productsItems, SetProductsItems] = useState<IProduct[]>([]);
  const [selectedBrand, setSelectedBrand] = useState(0);
  const [jobType] = useRecoilState(cartJobType);

  const override: CSSProperties = {
    display: 'block',
    margin: '0 auto',
    borderColor: '48b7b9',
  };
  const handleTabChange = (value: any) => {
    setSelectedTab(value);
    setIsLoading(false);
  };
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
          dataItems={{ cats: cats, brands: brands }}
        />

        {isLoading ? (
          <ClipLoader color="48b7b9" loading={isLoading} cssOverride={override} size="150" />
        ) : (
          <div className="tab-content text-muted">
            <div
              className="tab-pane active products"
              id="nav-border-justified-section"
              role="tabpanel"
              data-simplebar=""
              style={{ height: 'calc(100vh - 200px)' }}>
              <div className="items-list">
                {!!productsItems?.length &&
                  productsItems
                    .filter((val: IProduct) => {
                      if (selectedTab === 'category') {
                        return selectedCat === 0
                          ? val.category_id !== 0
                          : val.category_id === selectedCat;
                      } else {
                        return selectedBrand === 0
                          ? val.brand_id !== 0
                          : val.brand_id === selectedBrand;
                      }
                    })
                    .map((prod: IProduct, idx) => (
                      <div className="items-list-pos" key={idx}>
                        <ItemCard items={prod} />
                      </div>
                    ))}
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
