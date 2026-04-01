import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import PageTransition from './PageTransition';
import { Helmet } from 'react-helmet-async';
import type { PKDCode } from '../types/pkd';
import { getCached, setCached } from '../lib/cache';

const Samples = () => {
  const { limit: limitParam } = useParams<{ limit?: string }>();
  const limit = limitParam ? parseInt(limitParam) : 10;
  const navigate = useNavigate();

  const [samples, setSamples] = useState<PKDCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `samples-${limit}`;
    const cached = getCached<PKDCode[]>(cacheKey);
    if (cached) {
      setSamples(cached);
      setIsLoading(false);
      return;
    }

    const fetchSamples = async () => {
      setIsLoading(true);

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/samples?limit=${limit}`
        );

        const data = response.data?.data || [];
        setSamples(data);
        setCached(cacheKey, data);
      } catch (error) {
        console.error('Error fetching samples:', error);
        setError('Wystąpił błąd podczas pobierania przykładowych kodów PKD.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSamples();
  }, [limit]);

  useEffect(() => {
    if (limitParam && isNaN(parseInt(limitParam))) {
      navigate('/przyklady', { replace: true });
    }
  }, [limitParam, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02
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

  const limitOptions = [5, 10, 20, 50];

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

  const title = limitParam
    ? `${limitParam} Przykładowych Kodów PKD`
    : 'Przykładowe Kody PKD';

  return (
    <>
      <Helmet>
        <title>{title} | Wyszukiwarka Kodów PKD</title>
        <meta name="description" content={`Przeglądaj ${limitParam || '10'} przykładowych kodów Polskiej Klasyfikacji Działalności (PKD).`} />
        <meta name="keywords" content="PKD, kody PKD, przykłady PKD, polska klasyfikacja działalności, przykładowe kody" />
        <link rel="canonical" href={`https://kodypkd.app/przyklady${limitParam ? `/limit/${limitParam}` : ''}`} />
        <meta property="og:title" content={`${title} | Wyszukiwarka Kodów PKD`} />
        <meta property="og:description" content={`Przeglądaj ${limitParam || '10'} przykładowych kodów Polskiej Klasyfikacji Działalności (PKD).`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://kodypkd.app/przyklady${limitParam ? `/limit/${limitParam}` : ''}`} />
        <meta property="og:locale" content="pl_PL" />
      </Helmet>

      <PageTransition>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {title}
              </h1>
              <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                &larr; Powrót do strony głównej
              </Link>
            </div>

            <div className="mb-4 flex justify-between items-center">
              <span className="text-gray-600">
                Wyświetlanie {samples.length} przykładowych kodów PKD.
              </span>

              <div className="flex space-x-2">
                {limitOptions.map(option => (
                  <Link
                    key={option}
                    to={option === 10 ? '/przyklady' : `/przyklady/limit/${option}`}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      limit === option
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option}
                  </Link>
                ))}
              </div>
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
    </>
  );
};

export default Samples;
