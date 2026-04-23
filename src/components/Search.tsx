import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Head } from 'vite-react-ssg';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { PKDCode, SearchResponse } from '../types/pkd';
import { getCached, setCached } from '../lib/cache';
import { createSlug, decodeSlug, SITE_URL, makeBreadcrumbSchema } from '../lib/seo';
import popularQueries from '../data/popular-queries.json';
import Footer from './Footer';

interface CuratedCode {
  code: string;
  name: string;
  descr: string;
}

interface PopularQuery {
  slug: string;
  label: string;
  description: string;
  curatedCodes: CuratedCode[];
}

const POPULAR_BY_SLUG = Object.fromEntries(
  (popularQueries as PopularQuery[]).map((q) => [q.slug, q]),
);

const SearchComponent = () => {
  const { query: seoQuery } = useParams<{ query: string }>();
  const navigate = useNavigate();

  // Prefer the curated label for popular slugs (keeps "E-commerce", "IT" readable
  // instead of the blunt decodeSlug("e-commerce") -> "e commerce").
  const popularLabelBySlug = useMemo(() => {
    const map: Record<string, string> = {};
    for (const q of popularQueries as PopularQuery[]) map[q.slug] = q.label;
    return map;
  }, []);
  const searchQuery = seoQuery
    ? popularLabelBySlug[seoQuery] ?? decodeSlug(seoQuery)
    : '';

  const [query, setQuery] = useState(searchQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const popularEntry = useMemo(() => {
    return seoQuery ? POPULAR_BY_SLUG[seoQuery] : undefined;
  }, [seoQuery]);

  useEffect(() => {
    if (searchQuery !== query) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

  const fetchSearchResults = useCallback(async (queryText: string) => {
    if (!queryText.trim()) return;

    const requestUrl = `${import.meta.env.VITE_BASE_URL}/process?serviceDescription=${encodeURIComponent(queryText)}`;

    const cached = getCached<SearchResponse>(requestUrl);
    if (cached) {
      setResults(cached);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      window._abortController?.abort();
      window._abortController = new AbortController();
      const signal = window._abortController.signal;

      const response = await axios.get(requestUrl, { signal });
      const searchResults = response.data?.data as unknown as SearchResponse;
      setResults(searchResults);
      setCached(requestUrl, searchResults);

      try {
        sessionStorage.setItem('pkd-search-query', queryText);
        sessionStorage.setItem('pkd-search-results', JSON.stringify(searchResults));
      } catch {
        // Ignore storage errors
      }
    } catch (err) {
      if (axios.isCancel(err) || (err instanceof DOMException && err.name === 'AbortError')) {
        return;
      }
      console.error(err);
      setError('Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
      window._abortController = null;
    }
  }, []);

  useEffect(() => {
    if (!searchQuery) return;
    fetchSearchResults(searchQuery);
  }, [searchQuery, fetchSearchResults]);

  useEffect(() => {
    if (seoQuery === '') {
      navigate('/', { replace: true });
    }
  }, [seoQuery, navigate]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) {
      navigate('/', { replace: true });
      return;
    }
    const slug = createSlug(query);
    navigate(`/kody-pkd/${slug}`, { replace: false });
  }, [query, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
  };

  const canonical = searchQuery
    ? `${SITE_URL}/kody-pkd/${createSlug(searchQuery)}`
    : `${SITE_URL}/`;

  const breadcrumb = makeBreadcrumbSchema([
    { name: 'Strona główna', url: '/' },
    { name: 'Wyszukiwarka PKD', url: '/' },
    { name: searchQuery ? `Kody PKD dla: ${searchQuery}` : 'Wyszukiwanie', url: canonical },
  ]);

  const pageTitle = searchQuery
    ? `Kody PKD dla: ${searchQuery} | Wyszukiwarka Kodów PKD`
    : 'Wyszukiwarka Kodów PKD';

  const pageDescription = popularEntry
    ? popularEntry.description
    : searchQuery
      ? `Sprawdź kody PKD dla działalności: ${searchQuery}. Lista dopasowanych kodów Polskiej Klasyfikacji Działalności z opisami.`
      : 'Wyszukaj odpowiedni kod PKD dla swojej działalności gospodarczej w wyszukiwarce opartej o AI.';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content={`PKD, kody PKD, wyszukiwarka PKD, działalność gospodarcza${searchQuery ? `, ${searchQuery}, PKD dla ${searchQuery}` : ''}`}
        />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content="pl_PL" />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <main className="container mx-auto px-4 py-8 flex-1 w-full">
          <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumbs">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link to="/" className="hover:text-blue-600">Strona główna</Link>
                <span className="px-2">/</span>
              </li>
              <li aria-current="page" className="text-gray-700 font-medium">
                {searchQuery ? `Kody PKD dla: ${searchQuery}` : 'Wyszukiwarka'}
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
            {searchQuery ? `Kody PKD dla: ${searchQuery}` : 'Wyszukiwarka Kodów PKD'}
          </h1>

          {popularEntry && (
            <p className="text-center text-gray-600 max-w-3xl mx-auto mb-6">
              {popularEntry.description}
            </p>
          )}

          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Opisz swoją działalność..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  aria-label="Opis działalności"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
                aria-label="Wyszukaj kody PKD"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5" />}
                Szukaj
              </button>
            </div>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 text-red-700 rounded-lg" role="alert">
              {error}
            </div>
          )}

          {popularEntry && (
            <section className="max-w-4xl mx-auto mb-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Polecane kody PKD dla działalności „{popularEntry.label}"
              </h2>
              <div className="space-y-3">
                {popularEntry.curatedCodes.map((c) => (
                  <div
                    key={c.code}
                    className="bg-white rounded-lg shadow p-4 border border-gray-200"
                  >
                    <span className="font-semibold text-blue-600">{c.code}</span>
                    <h3 className="font-medium text-gray-800">{c.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{c.descr}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Lista poniżej to wynik dopasowania AI na podstawie Twojego zapytania. Dodaj własny
                opis działalności, aby otrzymać precyzyjne podpowiedzi.
              </p>
            </section>
          )}

          {isLoading && !results && (
            <div className="flex justify-center my-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}

          {results && (
            <div className="max-w-4xl mx-auto space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`suggestion-${searchQuery}`}
                  className="bg-white rounded-lg shadow-lg p-6 border border-green-200 relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    <span className="text-green-600">Sugerowany kod PKD (AI)</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold text-lg text-blue-600">
                        {results?.aiSuggestion.payload.grupaKlasaPodklasa}
                      </span>
                      <h3 className="text-lg font-medium text-gray-800">
                        {results?.aiSuggestion.payload.nazwaGrupowania}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {results?.aiSuggestion.payload.opisDodatkowy}
                    </p>
                  </div>
                  {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Pozostałe pasujące kody</h2>
                <AnimatePresence mode="sync">
                  <motion.div
                    key={`list-${searchQuery}`}
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {results?.pkdCodeData
                      .filter((code: PKDCode) => code.id !== results?.aiSuggestion.id)
                      .map((code: PKDCode) => (
                        <div
                          key={code.id}
                          className="bg-white rounded-lg shadow p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-semibold text-blue-600">
                                {code.payload.grupaKlasaPodklasa}
                              </span>
                              <h3 className="font-medium text-gray-800">{code.payload.nazwaGrupowania}</h3>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">{code.payload.opisDodatkowy}</p>
                        </div>
                      ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* About-this-search block — static SEO content visible even without AI results */}
          <section className="max-w-3xl mx-auto mt-12 text-gray-700 leading-relaxed">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Jak korzystać z wyszukiwarki PKD?
            </h2>
            <p className="mb-3">
              Opis Twojej działalności jest tłumaczony na kody Polskiej Klasyfikacji Działalności
              (PKD 2025) przez silnik AI. Im precyzyjniejsze zdanie wpiszesz, tym trafniejszy
              zestaw kodów otrzymasz. Wynik zawiera najlepsze dopasowanie oraz kilka pobocznych
              kodów, które warto rozważyć jako dodatkowe.
            </p>
            <p className="mb-3">
              Po wybraniu kodu: sprawdź czy nie wymaga koncesji, kasy fiskalnej od pierwszej
              sprzedaży lub nie wyklucza zwolnienia z VAT. Więcej w artykule{' '}
              <Link to="/artykuly/jak-wybrac-kod-pkd-dla-jdg" className="text-blue-600 hover:text-blue-800 font-medium">
                Jak wybrać kod PKD dla JDG
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                to="/przyklady"
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Przykładowe kody PKD
              </Link>
              <Link
                to="/artykuly"
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Poradnik PKD
              </Link>
              <Link
                to="/"
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Strona główna
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default SearchComponent;
