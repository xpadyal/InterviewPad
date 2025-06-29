import '../styles/globals.css';
import Head from 'next/head';
import { AuthProvider } from '../utils/auth';

function MyApp({ Component, pageProps }) {
  // Component is the active page (e.g. pages/index.js)
  // pageProps are the props preloaded for that page
  return (
    <AuthProvider>
      <Head>
        <title>InterviewPad</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;