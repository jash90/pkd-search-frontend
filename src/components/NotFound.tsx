import { useEffect } from 'react';
import { Head } from 'vite-react-ssg';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';
import { trackEvent } from '../lib/analytics';

const NotFound = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    trackEvent('404_view', { attempted_path: pathname });
  }, [pathname]);

  return (
    <>
      <Head>
        <title>404 — Strona nie znaleziona | kodypkd.app</title>
        <meta
          name="description"
          content="Strona, której szukasz, nie istnieje. Wróć na stronę główną wyszukiwarki kodów PKD 2025."
        />
        <meta name="robots" content="noindex, follow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <main className="p-8 flex-1">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-7xl sm:text-8xl font-extrabold text-blue-600 tracking-tight">
              404
            </p>
            <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-gray-800">
              Strona nie znaleziona
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Strona, której szukasz, nie istnieje lub została przeniesiona. Sprawdź adres URL lub
              skorzystaj z poniższych skrótów.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-4 text-left">
              <Link
                to="/"
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-200"
              >
                <h2 className="font-semibold text-gray-800">Strona główna</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Wyszukaj kod PKD opisując swoją działalność.
                </p>
              </Link>
              <Link
                to="/pkd-2025"
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-200"
              >
                <h2 className="font-semibold text-gray-800">Lista PKD 2025</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Wszystkie 728 kodów Polskiej Klasyfikacji Działalności.
                </p>
              </Link>
              <Link
                to="/przyklady"
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-200"
              >
                <h2 className="font-semibold text-gray-800">Przykładowe kody</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Najczęściej wybierane kody PKD dla różnych branż.
                </p>
              </Link>
              <Link
                to="/artykuly"
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-200"
              >
                <h2 className="font-semibold text-gray-800">Artykuły o PKD</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Poradniki o wyborze i stosowaniu kodów PKD.
                </p>
              </Link>
            </div>

            <Link
              to="/"
              className="inline-block mt-10 text-blue-600 hover:text-blue-800 font-medium"
            >
              &larr; Powrót do strony głównej
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default NotFound;
