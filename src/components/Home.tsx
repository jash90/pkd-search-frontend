import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Database, Zap, CheckCircle } from 'lucide-react';

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

const MOCK_PKD_CODES: PKDCode[] = [
  {
    id: "1",
    version: 1,
    score: 0.95,
    payload: {
      grupaKlasaPodklasa: "62.01.Z",
      nazwaGrupowania: "Działalność związana z oprogramowaniem",
      opisDodatkowy: "Obejmuje: tworzenie, rozwój, testowanie i wsparcie oprogramowania"
    }
  },
  {
    id: "2",
    version: 1,
    score: 0.90,
    payload: {
      grupaKlasaPodklasa: "47.91.Z",
      nazwaGrupowania: "Sprzedaż detaliczna przez Internet",
      opisDodatkowy: "Obejmuje: prowadzenie sklepów internetowych i platform e-commerce"
    }
  },
  {
    id: "3",
    version: 1,
    score: 0.85,
    payload: {
      grupaKlasaPodklasa: "56.10.A",
      nazwaGrupowania: "Restauracje i inne stałe placówki gastronomiczne",
      opisDodatkowy: "Obejmuje: prowadzenie restauracji, kawiarni, barów i innych placówek gastronomicznych"
    }
  },
  {
    id: "4",
    version: 1,
    score: 0.80,
    payload: {
      grupaKlasaPodklasa: "96.02.Z",
      nazwaGrupowania: "Fryzjerstwo i pozostałe zabiegi kosmetyczne",
      opisDodatkowy: "Obejmuje: usługi fryzjerskie, kosmetyczne, pielęgnacyjne"
    }
  },
  {
    id: "5",
    version: 1,
    score: 0.75,
    payload: {
      grupaKlasaPodklasa: "74.10.Z",
      nazwaGrupowania: "Działalność w zakresie specjalistycznego projektowania",
      opisDodatkowy: "Obejmuje: projektowanie mody, wnętrz, grafiki, tworzenie identyfikacji wizualnej"
    }
  }
];

const Home = () => {
  const [query, setQuery] = useState('');
  const [samples, setSamples] = useState<PKDCode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Fetch real samples if available, or use mock data
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/samples?limit=10`
        );
        
        if (response.data?.data && response.data.data.length > 0) {
          setSamples(response.data.data);
        } else {
          setSamples(MOCK_PKD_CODES);
        }
      } catch (error) {
        console.error('Using mock data, could not fetch real samples:', error);
        setSamples(MOCK_PKD_CODES);
      }
    };
    
    fetchSamples();
  }, []);

  // Auto-rotate displayed code every 4 seconds
  useEffect(() => {
    if (samples.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % samples.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [samples]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Tworzenie przyjaznego dla SEO URL w języku polskim
    const seoFormattedQuery = query.trim().toLowerCase().replace(/\s+/g, '-');
    navigate(`/szukaj/${encodeURIComponent(seoFormattedQuery)}`);
  };

  const features = [
    {
      icon: <Database className="h-8 w-8 text-blue-500" />,
      title: "Obszerna baza kodów PKD",
      description: "Dostęp do pełnej bazy aktualnych kodów Polskiej Klasyfikacji Działalności."
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-500" />,
      title: "Inteligentne wyszukiwanie",
      description: "Algorytm AI dopasowujący najlepsze kody PKD do opisu Twojej działalności."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-blue-500" />,
      title: "Dokładne dopasowania",
      description: "Precyzyjne wyniki wybranych kodów PKD dla Twojej działalności."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Znajdź idealny kod PKD dla swojej działalności
              </motion.h1>
              <motion.p 
                className="text-xl mb-8 text-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Opisz swoją działalność, a my dopasujemy odpowiednie kody PKD dzięki zaawansowanemu algorytmowi AI.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <form onSubmit={handleSubmit} className="flex w-full max-w-md">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Opisz swoją działalność..."
                    className="flex-1 px-4 py-3 rounded-l-lg border-0 text-gray-800 focus:ring-2 focus:ring-blue-300 outline-none"
                    aria-label="Opis działalności"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-800 text-white rounded-r-lg hover:bg-blue-900 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
                    aria-label="Wyszukaj kody PKD"
                  >
                    <Search className="w-5 h-5" />
                    Szukaj
                  </button>
                </form>
              </motion.div>
            </div>
            
            <div className="md:w-1/2 md:pl-8">
              <div className="bg-white rounded-lg shadow-xl p-6 overflow-hidden relative h-96">
                <AnimatePresence mode="wait">
                  {samples.length > 0 && (
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="h-full flex flex-col"
                    >
                      <div className="mb-4">
                        <span className="font-semibold text-xl text-blue-600">
                          {samples[currentIndex]?.payload.grupaKlasaPodklasa}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800">
                          {samples[currentIndex]?.payload.nazwaGrupowania}
                        </h3>
                      </div>
                      <p className="text-gray-600 flex-1 overflow-hidden text-ellipsis">
                        {samples[currentIndex]?.payload.opisDodatkowy}
                      </p>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex space-x-2">
                          {samples.map((_, idx) => (
                            <span 
                              key={idx} 
                              className={`block h-2 w-2 rounded-full ${idx === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                            />
                          ))}
                        </div>
                        <Link 
                          to="/przyklady" 
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          Zobacz więcej <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Dlaczego warto korzystać z naszej wyszukiwarki
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link 
            to="/przyklady"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-colors"
          >
            Przeglądaj przykładowe kody PKD <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 