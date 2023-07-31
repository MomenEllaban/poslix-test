import { config } from '@fortawesome/fontawesome-svg-core';
import { ILocationSettings, ITailoringExtra } from '@models/common-model';
import { defaultInvoiceDetials } from '@models/data';
import type { AppProps } from 'next/app';
import NextNProgress from 'nextjs-progressbar';
import { useState } from 'react';
import { SSRProvider } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { RecoilRoot } from 'recoil';
import { DarkModeProvider } from 'src/context/DarkModeContext';
import { ProductContext } from '../context/ProductContext';
import { UserContext } from '../context/UserContext';

// CSS
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@styles/_pos_custom.css';
import '@styles/globals.scss';
import '@styles/loyalty.css';
import '../../public/css/products.modules.css';

// You change this configuration value to false so that the Font Awesome core SVG library
// will not try and insert <style> elements into the <head> of the page.
// Next.js blocks this from happening anyway so you might as well not even try.
// See https://fontawesome.com/v6/docs/web/use-with/react/use-with#next-js
config.autoAddCss = false;

const initialLocationState = {
  value: 0,
  label: '',
  currency_decimal_places: 0,
  currency_code: '',
  currency_id: 0,
  currency_rate: 1,
  currency_symbol: '',
};

function MyApp({ Component, pageProps }: AppProps) {
  // In server-side rendered applications, a SSRProvider must wrap the application in order
  // to ensure that the auto-generated ids are consistent between the server and client.
  // https://react-bootstrap.github.io/getting-started/server-side-rendering/
  // eslint-disable-next-line react/jsx-props-no-spreading

  const [cats, setCats] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [user, setUser] = useState<any>({});
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState<any>();
  const [taxGroups, setTaxGroups] = useState<any>([]);
  const [variations, setVariations] = useState<any>();
  const [packageItems, setPackageItems] = useState<any>();
  const [tailoringSizes, setTailoringSizes] = useState([]);
  const [tailoringExtras, setTailoringExtras] = useState<ITailoringExtra[]>();
  const [invoicDetails, setInvoicDetails] = useState<any>(defaultInvoiceDetials);
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>(initialLocationState);

  const userContext = {
    user,
    setUser,
    locationSettings,
    setLocationSettings,
    tailoringSizes,
    setTailoringSizes,
    invoicDetails,
    setInvoicDetails,
    tailoringExtras,
    setTailoringExtras,
  };

  const productContext = {
    products,
    setProducts,
    cats,
    setCats,
    brands,
    setBrands,
    customers,
    setCustomers,
    taxes,
    setTaxes,
    taxGroups,
    setTaxGroups,
    variations,
    setVariations,
    packageItems,
    setPackageItems,
  };

  return (
    <RecoilRoot>
      <SSRProvider>
        <DarkModeProvider>
          <UserContext.Provider value={userContext}>
            <ProductContext.Provider value={productContext}>
              <NextNProgress />
              <Component {...pageProps} />
              <ToastContainer />
            </ProductContext.Provider>
          </UserContext.Provider>
        </DarkModeProvider>
      </SSRProvider>
    </RecoilRoot>
  );
}
export default MyApp;
