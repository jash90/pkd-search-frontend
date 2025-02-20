import { Search, Loader2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';

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

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/process?serviceDescription=${encodeURIComponent(query)}`
      );

      setResults(response.data?.data as unknown as SearchResponse);
    } catch (error) {
      console.error(error);
      setError('Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

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
                onClick={handleSearch}
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
