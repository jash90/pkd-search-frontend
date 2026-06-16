import { useEffect } from 'react';
import { Head } from 'vite-react-ssg';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import ConsentBanner from './ConsentBanner';
import { buildOgImageUrl } from '../lib/seo';
import { trackPageView } from '../lib/analytics';

const OG_IMAGE = buildOgImageUrl();

const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname]);

  // SPA page_view on every route change. Defer one frame so the <Head>-driven
  // document.title has updated before we read it.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = requestAnimationFrame(() => {
      trackPageView(pathname, document.title);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <>
      <Head>
        <meta name="bfcache-restore" content="true" />
        <meta name="back-forward-navigation" content="enable" />
        <meta property="og:site_name" content="kodypkd.app" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="kodypkd.app — wyszukiwarka kodów PKD 2025" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Head>
      <Header />
      <Outlet />
      <ConsentBanner />
    </>
  );
};

export default Layout;
