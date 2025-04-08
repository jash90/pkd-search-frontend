import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

// Use the same axios setup and cache from App.tsx
const axiosCache = new Map();

interface PKDCode {
  id: string;
  version: number;
  score: number;
  payload: {
    grupaKlasaPodklasa: string;
    nazwaGrupowania: string;
    opisDodatkowy: string;
  };
}

interface SearchResponse {
  aiSuggestion: PKDCode;
  pkdCodeData: PKDCode[];
}

// Cache instance to store search results
interface SearchCache {
  query: string;
  results: SearchResponse | null;
}

// Funkcje pomocnicze do formatowania URL
const createSeoUrl = (text: string): string => {
  return text.trim().toLowerCase().replace(/\s+/g, '-');
};

const decodeSeoUrl = (text: string): string => {
  return decodeURIComponent(text).replace(/-/g, ' ');
};

const SearchComponent = () => {
  // Pobierz query z parametru URL
  const { query: seoQuery } = useParams<{ query: string }>();
  const navigate = useNavigate();
  
  // Dekoduj query do formy czytelnej dla użytkownika
  const searchQuery = seoQuery ? decodeSeoUrl(seoQuery) : '';
  
  const [query, setQuery] = useState(searchQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previousQuery, setPreviousQuery] = useState('');
  const searchCacheRef = useRef<SearchCache | null>(null);
  const initialLoadRef = useRef(true);

  // Create a custom axios instance with interceptors to handle caching
  const axiosInstance = useRef(axios.create());
  
  // Initialize axios interceptors only once
  useEffect(() => {
    // Request interceptor to check cache
    axiosInstance.current.interceptors.request.use(config => {
      const url = config.url || '';
      if (config.method?.toLowerCase() === 'get' && axiosCache.has(url)) {
        // Return cached response if available
        return Promise.reject({
          __AXIOS_CACHE_HIT__: true,
          cachedData: axiosCache.get(url)
        });
      }
      return config;
    });
    
    // Response interceptor to cache responses
    axiosInstance.current.interceptors.response.use(
      response => {
        const url = response.config.url || '';
        if (response.config.method?.toLowerCase() === 'get') {
          axiosCache.set(url, response.data);
        }
        return response;
      }
    );
  }, []);

  // Update input field when URL param changes
  useEffect(() => {
    if (searchQuery !== query) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);
  
  // Handle search based on URL parameter changes
  useEffect(() => {
    // Skip initial empty searches
    if (!searchQuery || (initialLoadRef.current && !searchQuery)) {
      initialLoadRef.current = false;
      return;
    }
    
    // Skip if same query (prevents double searches)
    if (searchQuery === previousQuery && !initialLoadRef.current) {
      return;
    }
    
    setPreviousQuery(searchQuery);
    fetchSearchResults(searchQuery);
    
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
    }
  }, [searchQuery]);

  // Przekieruj na stronę główną, gdy parametr query jest pusty
  useEffect(() => {
    if (seoQuery === '') {
      navigate('/', { replace: true });
    }
  }, [seoQuery, navigate]);

  const fetchSearchResults = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Check if we already have this search in our cache
    if (searchCacheRef.current && searchCacheRef.current.query === queryText) {
      setResults(searchCacheRef.current.results);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Create a new AbortController for this request and store it globally
      if (window._abortController) {
        window._abortController = new AbortController();
      }
      const signal = window._abortController ? window._abortController.signal : undefined;
      
      const requestUrl = `${import.meta.env.VITE_BASE_URL}/process?serviceDescription=${encodeURIComponent(queryText)}`;
      let responseData;
      
      try {
        const response = await axiosInstance.current.get(requestUrl, { signal });
        responseData = response.data;
      } catch (err: unknown) {
        // Check if this is our cache hit error
        if (err && typeof err === 'object' && '__AXIOS_CACHE_HIT__' in err) {
          const cacheHit = err as { __AXIOS_CACHE_HIT__: boolean; cachedData: unknown };
          responseData = cacheHit.cachedData;
        } else if (err && typeof err === 'object' && 'name' in err && (err as Error).name === 'AbortError') {
          // Request was aborted - typically during page navigation
          console.log('Request aborted during navigation');
          return; // Just bail out - this prevents race conditions
        } else {
          throw err; // Re-throw if it's a real error
        }
      }

      const searchResults = responseData?.data as unknown as SearchResponse;
      setResults(searchResults);
      
      // Cache the search results
      searchCacheRef.current = {
        query: queryText,
        results: searchResults
      };

      // Store in sessionStorage to help with bfcache
      try {
        sessionStorage.setItem('pkd-search-query', queryText);
        sessionStorage.setItem('pkd-search-results', JSON.stringify(searchResults));
      } catch {
        // Ignore storage errors
      }
    } catch (error) {
      console.error(error);
      setError('Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
      if (window._abortController) {
        window._abortController = null; // Clear the controller reference
      }
    }
  };

  const handleSearch = useCallback(() => {
    // Jeśli query jest puste, przekieruj na stronę główną
    if (!query.trim()) {
      navigate('/', { replace: true });
      return;
    }
    
    // Utwórz przyjazny dla SEO URL i przekieruj
    const seoFormattedQuery = createSeoUrl(query);
    navigate(`/search/${encodeURIComponent(seoFormattedQuery)}`, { replace: false });
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
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
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
        <link rel="canonical" href={window.location.origin + (searchQuery ? `/search/${encodeURIComponent(createSeoUrl(searchQuery))}` : '')} />
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
                  
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={`list-${searchQuery}`}
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {results?.pkdCodeData
                        .filter((code) => code.id !== results?.aiSuggestion.id)
                        .map((code) => (
                          <motion.div
                            key={code.id}
                            className="bg-white rounded-lg shadow p-4 border border-gray-200"
                            variants={itemVariants}
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
                          </motion.div>
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