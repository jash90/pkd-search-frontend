import { useEffect } from 'react';
import { Head } from 'vite-react-ssg';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll on route change so pages don't open mid-scroll from the previous route.
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname]);

  return (
    <>
      <Head>
        <meta name="bfcache-restore" content="true" />
        <meta name="back-forward-navigation" content="enable" />
      </Head>
      <Header />
      <Outlet />
    </>
  );
};

export default Layout;
