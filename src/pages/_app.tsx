import { config } from '@fortawesome/fontawesome-svg-core';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import NextNProgress from 'nextjs-progressbar';
import { SSRProvider } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { RecoilRoot } from 'recoil';
import { ProductProvider, UserProvider } from 'src/components/providers';
import { DarkModeProvider } from 'src/context/DarkModeContext';
import Head from 'next/head';

// CSS
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@styles/_pos_custom.css';
import '@styles/globals.scss';
import '@styles/loyalty.css';
import '../../public/css/products.modules.css';

config.autoAddCss = false;

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <SSRProvider>
        <UserProvider>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Poslix App</title>
          </Head>
          <RecoilRoot>
            <ProductProvider>
              <DarkModeProvider>
                <NextNProgress />
                <Component {...pageProps} />
                <ToastContainer />
              </DarkModeProvider>
            </ProductProvider>
          </RecoilRoot>
        </UserProvider>
      </SSRProvider>
    </SessionProvider>
  );
}
