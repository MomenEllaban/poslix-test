import { config } from '@fortawesome/fontawesome-svg-core';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import NextNProgress from 'nextjs-progressbar';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { RecoilRoot } from 'recoil';
import { ProductProvider, UserProvider } from 'src/components/providers';
import { DarkModeProvider } from 'src/context/DarkModeContext';
import { store } from 'src/redux/store';
import { SWRConfig } from 'swr';

//
import { appWithTranslation } from 'next-i18next';
import nextI18NextConfig from '../../next-i18next.config.js';

// CSS
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@styles/_pos_custom.css';
import '@styles/globals.scss';
import '@styles/loyalty.css';
import '../../public/css/products.modules.css';

config.autoAddCss = false;

const swrConfigObject = {
  revalidateIfStale: false,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};

const MyApp = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Poslix App</title>
      </Head>

      <Provider store={store}>
        <UserProvider>
          <RecoilRoot>
            <ProductProvider>
              <DarkModeProvider>
                <NextNProgress />
                <SWRConfig value={swrConfigObject}>
                  <Component {...pageProps} />
                </SWRConfig>
                <ToastContainer />
              </DarkModeProvider>
            </ProductProvider>
          </RecoilRoot>
        </UserProvider>
      </Provider>
    </SessionProvider>
  );
};

export default appWithTranslation(MyApp, nextI18NextConfig);
