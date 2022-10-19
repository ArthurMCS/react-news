import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>spacetraveling</title>
        <link
          type="image/png"
          sizes="32x32"
          rel="icon"
          href="/images/icons8-código-fonte-32.png"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
