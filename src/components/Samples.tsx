import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Head } from 'vite-react-ssg';
import type { PKDCode } from '../types/pkd';
import { getCached, setCached } from '../lib/cache';
import { SITE_URL, makeBreadcrumbSchema } from '../lib/seo';
import Footer from './Footer';

const FALLBACK_SAMPLES: PKDCode[] = [
  { id: 's1', version: 1, score: 1, payload: { grupaKlasaPodklasa: '62.01.Z', nazwaGrupowania: 'Działalność związana z oprogramowaniem', opisDodatkowy: 'Tworzenie, rozwój, testowanie i wsparcie oprogramowania.' } },
  { id: 's2', version: 1, score: 1, payload: { grupaKlasaPodklasa: '47.91.Z', nazwaGrupowania: 'Sprzedaż detaliczna przez Internet', opisDodatkowy: 'Prowadzenie sklepów internetowych i platform e-commerce.' } },
  { id: 's3', version: 1, score: 1, payload: { grupaKlasaPodklasa: '56.10.A', nazwaGrupowania: 'Restauracje i inne stałe placówki gastronomiczne', opisDodatkowy: 'Restauracje, pizzerie, bary z obsługą kelnerską.' } },
  { id: 's4', version: 1, score: 1, payload: { grupaKlasaPodklasa: '96.02.Z', nazwaGrupowania: 'Fryzjerstwo i pozostałe zabiegi kosmetyczne', opisDodatkowy: 'Salony fryzjerskie, barber shops, gabinety kosmetyczne.' } },
  { id: 's5', version: 1, score: 1, payload: { grupaKlasaPodklasa: '74.10.Z', nazwaGrupowania: 'Działalność w zakresie specjalistycznego projektowania', opisDodatkowy: 'Projektowanie graficzne, wnętrz, mody, identyfikacji wizualnej.' } },
  { id: 's6', version: 1, score: 1, payload: { grupaKlasaPodklasa: '69.20.Z', nazwaGrupowania: 'Działalność rachunkowo-księgowa; doradztwo podatkowe', opisDodatkowy: 'Biura rachunkowe, doradcy podatkowi.' } },
  { id: 's7', version: 1, score: 1, payload: { grupaKlasaPodklasa: '73.11.Z', nazwaGrupowania: 'Działalność agencji reklamowych', opisDodatkowy: 'Planowanie i produkcja kampanii reklamowych, branding, SEO/SEM.' } },
  { id: 's8', version: 1, score: 1, payload: { grupaKlasaPodklasa: '49.41.Z', nazwaGrupowania: 'Transport drogowy towarów', opisDodatkowy: 'Przewóz towarów, spedycja drogowa.' } },
  { id: 's9', version: 1, score: 1, payload: { grupaKlasaPodklasa: '41.20.Z', nazwaGrupowania: 'Roboty budowlane związane ze wznoszeniem budynków', opisDodatkowy: 'Budowa domów i innych obiektów kubaturowych.' } },
  { id: 's10', version: 1, score: 1, payload: { grupaKlasaPodklasa: '74.20.Z', nazwaGrupowania: 'Działalność fotograficzna', opisDodatkowy: 'Fotografia ślubna, portretowa, komercyjna, produktowa.' } },
];

const Samples = () => {
  const { limit: limitParam } = useParams<{ limit?: string }>();
  const limit = limitParam ? parseInt(limitParam) : 10;
  const navigate = useNavigate();

  const [samples, setSamples] = useState<PKDCode[]>(FALLBACK_SAMPLES.slice(0, limit));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `samples-${limit}`;
    const cached = getCached<PKDCode[]>(cacheKey);
    if (cached) {
      setSamples(cached);
      return;
    }

    const fetchSamples = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/samples?limit=${limit}`,
        );
        const data = response.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          setSamples(data);
          setCached(cacheKey, data);
        }
      } catch {
        setError('Nie udało się pobrać aktualnej listy kodów — pokazujemy przykładowe kody PKD.');
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
    visible: { opacity: 1, transition: { staggerChildren: 0.02 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  const limitOptions = [5, 10, 20, 50];

  const pageTitle = limitParam
    ? `${limitParam} Przykładowych Kodów PKD | kodypkd.app`
    : 'Przykładowe Kody PKD | kodypkd.app';

  const canonical = `${SITE_URL}/przyklady${limitParam ? `/limit/${limitParam}` : ''}`;

  const breadcrumb = makeBreadcrumbSchema([
    { name: 'Strona główna', url: '/' },
    { name: 'Przykładowe kody PKD', url: '/przyklady' },
    ...(limitParam ? [{ name: `${limitParam} kodów`, url: canonical }] : []),
  ]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`Przeglądaj ${limitParam || '10'} przykładowych kodów Polskiej Klasyfikacji Działalności (PKD 2025) — główne kategorie, opisy i zakres zastosowania.`}
        />
        <meta
          name="keywords"
          content="PKD, kody PKD, przykłady PKD, polska klasyfikacja działalności, przykładowe kody, PKD 2025"
        />
        <meta property="og:title" content={pageTitle} />
        <meta
          property="og:description"
          content={`Przeglądaj ${limitParam || '10'} przykładowych kodów Polskiej Klasyfikacji Działalności (PKD 2025).`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content="pl_PL" />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <main className="p-8 flex-1">
          <div className="max-w-4xl mx-auto">
            <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumbs">
              <ol className="flex flex-wrap gap-2">
                <li>
                  <Link to="/" className="hover:text-blue-600">Strona główna</Link>
                  <span className="px-2">/</span>
                </li>
                <li aria-current="page" className="text-gray-700 font-medium">Przykładowe kody PKD</li>
              </ol>
            </nav>

            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <h1 className="text-3xl font-bold text-gray-800">
                {limitParam ? `${limitParam} Przykładowych Kodów PKD` : 'Przykładowe Kody PKD'}
              </h1>
              <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                &larr; Powrót do strony głównej
              </Link>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4 flex justify-between items-center flex-wrap gap-3">
              <span className="text-gray-600">
                Wyświetlanie {samples.length} przykładowych kodów PKD.
              </span>
              <div className="flex space-x-2">
                {limitOptions.map((option) => (
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

            {isLoading && samples.length === 0 ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : (
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
                        <h2 className="text-lg font-medium text-gray-800">
                          {sample.payload.nazwaGrupowania}
                        </h2>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{sample.payload.opisDodatkowy}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Samples;
