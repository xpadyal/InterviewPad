import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  // Component is the active page (e.g. pages/index.js)
  // pageProps are the props preloaded for that page
  return (
    <>
      <Head>
        <title>InterviewPad</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;