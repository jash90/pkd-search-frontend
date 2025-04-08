import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import PageTransition from './PageTransition';

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

const Samples = () => {
  const [searchParams] = useSearchParams();
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
  
  const [samples, setSamples] = useState<PKDCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSamples = async () => {
      setIsLoading(true);
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/samples?limit=50`
        );
        
        setSamples(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching samples:', error);
        setError('Wystąpił błąd podczas pobierania przykładowych kodów PKD.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSamples();
  }, [limit]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-red-50 p-4 rounded-lg text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Przykładowe Kody PKD
            </h1>
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
              &larr; Powrót do strony głównej
            </Link>
          </div>
          
          <div className="mb-4 text-gray-600">
            Wyświetlanie {samples.length} przykładowych kodów PKD.
          </div>
          
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {samples.map((sample) => (
              <motion.div
                key={sample.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                variants={itemVariants}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-lg text-blue-600">
                      {sample.payload.grupaKlasaPodklasa}
                    </span>
                    <h3 className="text-lg font-medium text-gray-800">
                      {sample.payload.nazwaGrupowania}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  {sample.payload.opisDodatkowy}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Samples; 