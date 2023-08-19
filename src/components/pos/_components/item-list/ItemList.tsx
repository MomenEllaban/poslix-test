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

const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: '48b7b9',
};

export const ItemList = ({ lang }: any) => {
  const [jobType] = useRecoilState(cartJobType);
  const { products, cats, brands } = useProducts();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(0);
  const [selectedTab, setSelectedTab] = useState('category');
  const [productsItems, SetProductsItems] = useState<IProduct[]>([]);

  const handleTabChange = (value: any) => {
    setSelectedTab(value);
    setIsLoading(false);
  };

  const renderProductsFn = (product: IProduct, idx) => (
    <div className="items-list-pos" key={product.id}>
      <ItemCard product={product} />
    </div>
  );

  const filteredProducts = useMemo(() => {
    if (!productsItems?.length) return [];
    else
      return productsItems?.filter((val: IProduct) => {
        if (selectedTab === 'category') {
          return selectedCat === 0 ? val.category_id !== 0 : val.category_id === selectedCat;
        } else {
          return selectedBrand === 0 ? val.brand_id !== 0 : val.brand_id === selectedBrand;
        }
      });
  }, [productsItems, selectedTab, selectedCat, selectedBrand]);

  useEffect(() => {
    SetProductsItems(products);
    setIsLoading(false);
    console.log('fetching products');
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

        {!productsItems?.length ? (
          <ClipLoader color="48b7b9" loading={true} cssOverride={override} size="150px" />
        ) : (
          <div className="tab-content text-muted">
            <div
              className="tab-pane active products"
              id="nav-border-justified-section"
              role="tabpanel"
              data-simplebar=""
              style={{ height: 'calc(100vh - 200px)' }}>
              <div className="items-list">{filteredProducts.map(renderProductsFn)}</div>
              {/* end row */}
            </div>
          </div>
        )}
      </div>
      {/* end card body */}
    </div>
  );
};
