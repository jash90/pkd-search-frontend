import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';
import type { PKDCode, SearchResponse } from '../types/pkd';
import { getCached, setCached } from '../lib/cache';
import { createSlug, decodeSlug, SITE_URL } from '../lib/seo';

const SearchComponent = () => {
  // Pobierz query z parametru URL
  const { query: seoQuery } = useParams<{ query: string }>();
  const navigate = useNavigate();

  // Dekoduj query do formy czytelnej dla użytkownika
  const searchQuery = seoQuery ? decodeSlug(seoQuery) : '';

  const [query, setQuery] = useState(searchQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update input field when URL param changes
  useEffect(() => {
    if (searchQuery !== query) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

  const fetchSearchResults = useCallback(async (queryText: string) => {
    if (!queryText.trim()) return;

    const requestUrl = `${import.meta.env.VITE_BASE_URL}/process?serviceDescription=${encodeURIComponent(queryText)}`;

    // Check module-level cache
    const cached = getCached<SearchResponse>(requestUrl);
    if (cached) {
      setResults(cached);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Abort previous request, create new controller
      window._abortController?.abort();
      window._abortController = new AbortController();
      const signal = window._abortController.signal;

      const response = await axios.get(requestUrl, { signal });
      const searchResults = response.data?.data as unknown as SearchResponse;
      setResults(searchResults);

      // Cache the search results
      setCached(requestUrl, searchResults);

      // Store in sessionStorage to help with bfcache
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

  // Handle search based on URL parameter changes
  useEffect(() => {
    if (!searchQuery) return;
    fetchSearchResults(searchQuery);
  }, [searchQuery, fetchSearchResults]);

  // Przekieruj na stronę główną, gdy parametr query jest pusty
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  return (
    <>
      <Helmet>
        <title>Wyszukiwarka Kodów PKD | {searchQuery ? `Wyniki dla: ${searchQuery}` : 'Znajdź odpowiedni kod'}</title>
        <meta name="description" content={`Sprawdź kody PKD dla działalności: ${searchQuery || 'wyszukaj swoją działalność gospodarczą'}`} />
        <meta name="keywords" content={`PKD, kody PKD, wyszukiwarka PKD, działalność gospodarcza, klasyfikacja działalności${searchQuery ? `, ${searchQuery}` : ''}`} />
        <meta property="og:title" content={`Kody PKD dla: ${searchQuery || 'Twojej działalności'}`} />
        <meta property="og:description" content={`Wyszukaj odpowiedni kod PKD dla swojej działalności gospodarczej. ${searchQuery ? `Wyniki wyszukiwania dla: ${searchQuery}` : ''}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={searchQuery ? `${SITE_URL}/kody-pkd/${createSlug(searchQuery)}` : `${SITE_URL}/`} />
        <meta property="og:locale" content="pl_PL" />
        <link rel="canonical" href={searchQuery ? `${SITE_URL}/kody-pkd/${createSlug(searchQuery)}` : `${SITE_URL}/`} />
      </Helmet>

      <PageTransition>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              {searchQuery ? `Kody PKD dla: ${searchQuery}` : 'Wyszukiwarka Kodów PKD'}
            </h1>

            <div className="flex justify-between items-center mb-6">
              <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                &larr; Powrót do strony głównej
              </Link>
            </div>

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
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <SearchIcon className="w-5 h-5" />
                  )}
                  Szukaj
                </button>
              </div>
            </div>

            {error && (
              <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 text-red-700 rounded-lg" role="alert">
                {error}
              </div>
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
                      <span className="text-green-600">Sugerowany kod PKD</span>
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
                  <h2 className="text-xl font-semibold text-gray-800">
                    Pozostałe pasujące kody
                  </h2>

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
                                <h3 className="font-medium text-gray-800">
                                  {code.payload.nazwaGrupowania}
                                </h3>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm">
                              {code.payload.opisDodatkowy}
                            </p>
                          </div>
                        ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default SearchComponent;
