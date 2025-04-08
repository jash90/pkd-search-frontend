import { Search, Loader2 } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';

// Mark axios to avoid unload listeners which prevent bfcache
axios.defaults.headers.common['X-BFCache-Support'] = 'true';

// Create a client-side cache for axios to prevent network requests during bfcache restoration
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

// Create shared abort controller for fetch operations
declare global {
  interface Window {
    _abortController: AbortController | null;
  }
}

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const handleSearch = useCallback(async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Check if we already have this search in our cache
    if (searchCacheRef.current && searchCacheRef.current.query === searchQuery) {
      setResults(searchCacheRef.current.results);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a new AbortController for this request and store it globally
      window._abortController = new AbortController();
      const signal = window._abortController.signal;
      
      const requestUrl = `${import.meta.env.VITE_BASE_URL}/process?serviceDescription=${encodeURIComponent(searchQuery)}`;
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
        query: searchQuery,
        results: searchResults
      };

      // Store in sessionStorage to help with bfcache
      try {
        sessionStorage.setItem('pkd-search-query', searchQuery);
        sessionStorage.setItem('pkd-search-results', JSON.stringify(searchResults));
      } catch {
        // Ignore storage errors
      }

      // Update URL without triggering a page reload
      if (!initialLoadRef.current) {
        const url = new URL(window.location.href);
        const currentParam = url.searchParams.get('serviceDescription');
        
        // Only update history if the param actually changed
        if (currentParam !== searchQuery) {
          url.searchParams.set('serviceDescription', searchQuery);
          window.history.pushState({ query: searchQuery }, '', url.toString());
        }
      } else {
        // If this is initial load from URL, don't push a new state
        const state = { query: searchQuery };
        window.history.replaceState(state, '', window.location.href);
        initialLoadRef.current = false;
      }

      // Clear the flag so we don't do this again
      sessionStorage.removeItem('bfcache-restored');
      return;
    } catch (error) {
      console.error(error);
      setError('Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
      window._abortController = null; // Clear the controller reference
    }
  }, [query]);

  // Handle URL parameters on initial load and check for bfcache restoration
  useEffect(() => {
    // Check sessionStorage first for bfcache restoration
    const bfcacheRestored = sessionStorage.getItem('bfcache-restored');
    const lastServiceDescription = sessionStorage.getItem('last-service-description');
    const cachedResults = sessionStorage.getItem('pkd-search-results');
    
    if (bfcacheRestored === 'true' && lastServiceDescription) {
      // We're being restored from bfcache
      setQuery(lastServiceDescription);
      
      // Try to restore results from sessionStorage
      if (cachedResults) {
        try {
          const parsedResults = JSON.parse(cachedResults);
          setResults(parsedResults);
          
          // Update the cache reference
          searchCacheRef.current = {
            query: lastServiceDescription,
            results: parsedResults
          };
          
          // Clear the flag so we don't do this again
          sessionStorage.removeItem('bfcache-restored');
          return;
        } catch {
          // JSON parse error, proceed with normal initialization
        }
      }
    }
    
    // Normal first-load behavior
    const urlParams = new URLSearchParams(window.location.search);
    const serviceDescription = urlParams.get('serviceDescription');
    
    if (serviceDescription) {
      setQuery(serviceDescription);
      handleSearch(serviceDescription);
    } else {
      initialLoadRef.current = false;
    }
  }, [handleSearch]);

  // Support back/forward cache restoration
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // If page is restored from bfcache
      if (event.persisted) {
        // Restore the state if we have it
        const state = window.history.state;
        if (state && state.query) {
          setQuery(state.query);
          if (searchCacheRef.current && searchCacheRef.current.query === state.query) {
            setResults(searchCacheRef.current.results);
          }
        }
      }
    };

    // Handle popstate (navigation with back/forward buttons)
    const handlePopState = (event: PopStateEvent) => {
      // Don't trigger API calls during bfcache restoration
      if (document.visibilityState === 'hidden') return;
      
      if (event.state && event.state.query) {
        setQuery(event.state.query);
        if (searchCacheRef.current && searchCacheRef.current.query === event.state.query) {
          setResults(searchCacheRef.current.results);
        } else if (event.state.query) {
          // Don't make a fresh API call, rely on our cache
          const urlParams = new URLSearchParams(window.location.search);
          const serviceDescription = urlParams.get('serviceDescription');
          if (serviceDescription && serviceDescription === event.state.query) {
            handleSearch(serviceDescription);
          }
        }
      } else {
        // If no state, clear the results
        setQuery('');
        setResults(null);
      }
    };

    // Add these event listeners as early as possible
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);

    // Disable beforeunload/unload events which can prevent bfcache
    window.addEventListener('beforeunload', e => {
      // Prevent any default actions that might trigger dialog
      e.preventDefault();
      // Required for some older browsers
      e.returnValue = false;
      return false;
    }, { capture: true });

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleSearch]);

  return (
    <>
      <Helmet>
        <title>Wyszukiwarka Kodów PKD | Znajdź odpowiedni kod dla swojej działalności</title>
        <meta name="description" content="Wyszukaj odpowiedni kod PKD dla swojej działalności gospodarczej. Inteligentny system pomoże Ci znaleźć najlepiej dopasowane kody PKD." />
        <meta name="keywords" content="PKD, kody PKD, wyszukiwarka PKD, działalność gospodarcza, klasyfikacja działalności" />
        <meta property="og:title" content="Wyszukiwarka Kodów PKD" />
        <meta property="og:description" content="Wyszukaj odpowiedni kod PKD dla swojej działalności gospodarczej." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.href} />
        {/* Meta tags that help with bfcache */}
        <meta name="bfcache-restore" content="true" />
        <meta name="back-forward-navigation" content="enable" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Wyszukiwarka Kodów PKD
          </h1>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                  <Search className="w-5 h-5" />
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

          {results && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-green-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-green-600">Sugerowany kod PKD</span>
                  <span className="text-sm font-normal text-gray-500">
                    (Trafność: {Math.round(results?.aiSuggestion.score * 100)}%)
                  </span>
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
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Pozostałe pasujące kody
                </h2>
                {results?.pkdCodeData
                  .filter((code) => code.id !== results?.aiSuggestion.id)
                  .map((code) => (
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
                        <span className="text-sm text-gray-500">
                          Trafność: {Math.round(code.score * 100)}%
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {code.payload.opisDodatkowy}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
