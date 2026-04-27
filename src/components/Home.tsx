import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Head } from 'vite-react-ssg';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Database, Zap, CheckCircle, BookOpen } from 'lucide-react';
import type { PKDCode } from '../types/pkd';
import { getCached, setCached } from '../lib/cache';
import { createSlug, SITE_URL, makeFaqSchema, buildOgImageUrl } from '../lib/seo';
import popularQueries from '../data/popular-queries.json';
import { articles } from '../content/articles';
import FAQ from './FAQ';
import Footer from './Footer';

const MOCK_PKD_CODES: PKDCode[] = [
  {
    id: '1',
    version: 1,
    score: 0.95,
    payload: {
      grupaKlasaPodklasa: '62.01.Z',
      nazwaGrupowania: 'Działalność związana z oprogramowaniem',
      opisDodatkowy: 'Obejmuje: tworzenie, rozwój, testowanie i wsparcie oprogramowania',
    },
  },
  {
    id: '2',
    version: 1,
    score: 0.9,
    payload: {
      grupaKlasaPodklasa: '47.91.Z',
      nazwaGrupowania: 'Sprzedaż detaliczna przez Internet',
      opisDodatkowy: 'Obejmuje: prowadzenie sklepów internetowych i platform e-commerce',
    },
  },
  {
    id: '3',
    version: 1,
    score: 0.85,
    payload: {
      grupaKlasaPodklasa: '56.10.A',
      nazwaGrupowania: 'Restauracje i inne stałe placówki gastronomiczne',
      opisDodatkowy: 'Obejmuje: prowadzenie restauracji, kawiarni, barów i innych placówek gastronomicznych',
    },
  },
  {
    id: '4',
    version: 1,
    score: 0.8,
    payload: {
      grupaKlasaPodklasa: '96.02.Z',
      nazwaGrupowania: 'Fryzjerstwo i pozostałe zabiegi kosmetyczne',
      opisDodatkowy: 'Obejmuje: usługi fryzjerskie, kosmetyczne, pielęgnacyjne',
    },
  },
  {
    id: '5',
    version: 1,
    score: 0.75,
    payload: {
      grupaKlasaPodklasa: '74.10.Z',
      nazwaGrupowania: 'Działalność w zakresie specjalistycznego projektowania',
      opisDodatkowy: 'Obejmuje: projektowanie mody, wnętrz, grafiki, tworzenie identyfikacji wizualnej',
    },
  },
];

// Most-searched specific PKD codes. Per-code links resolve to /kod-pkd/<slug>
// where data exists; tiles for codes not yet in codes.json fall back to the
// closest category page.
const POPULAR_CODES: { code: string; label: string; href: string }[] = [
  { code: '56.11.Z', label: 'Restauracje', href: '/kod-pkd/56-11-z' },
  { code: '47.91.Z', label: 'Sprzedaż przez Internet', href: '/kod-pkd/47-91-z' },
  { code: '49.41.Z', label: 'Transport drogowy towarów', href: '/kod-pkd/49-41-z' },
  { code: '62.10.B', label: 'Programowanie', href: '/kod-pkd/62-10-b' },
  { code: '96.21.Z', label: 'Działalność fryzjerska', href: '/kod-pkd/96-21-z' },
  { code: '41.00.A', label: 'Roboty budowlane mieszkalne', href: '/kod-pkd/41-00-a' },
  { code: '68.20.Z', label: 'Wynajem nieruchomości', href: '/kody-pkd/wynajem-nieruchomosci' },
  { code: '85.59.B', label: 'Kursy i szkolenia zawodowe', href: '/kod-pkd/85-59-b' },
];

const FAQ_ITEMS = [
  {
    question: 'Co to jest kod PKD?',
    answer:
      'Kod PKD (Polska Klasyfikacja Działalności) to pięcioznakowy identyfikator rodzaju działalności gospodarczej, używany w Polsce przy rejestracji firmy w CEIDG lub KRS. Każdy przedsiębiorca wskazuje przynajmniej jeden — tzw. główny — kod opisujący przeważający rodzaj prowadzonej działalności.',
  },
  {
    question: 'Ile kodów PKD mogę mieć?',
    answer:
      'W CEIDG nie ma twardego limitu — poza obowiązkowym kodem głównym możesz dodać dowolną liczbę dodatkowych. W KRS limit wynosi 10 kodów na formularzu. Więcej w artykule „Ile kodów PKD można mieć?".',
  },
  {
    question: 'Jak wybrać odpowiedni kod PKD?',
    answer:
      'Zacznij od precyzyjnego opisu swojej działalności. Następnie użyj naszej wyszukiwarki lub przeszukaj oficjalny wykaz GUS. Pamiętaj, że wybór głównego kodu PKD wpływa na formę opodatkowania (ryczałt, karta podatkowa), VAT i ewentualny obowiązek kasy fiskalnej.',
  },
  {
    question: 'Jak zmienić kod PKD w CEIDG?',
    answer:
      'Zmiana jest bezpłatna i dokonuje się jej online wnioskiem CEIDG-1 (aktualizacja wpisu). Zmiana zwykle wchodzi w życie następnego dnia roboczego. W KRS zmiana wymaga uchwały o zmianie umowy spółki i wpisu sądowego.',
  },
  {
    question: 'Czy kod PKD wpływa na VAT?',
    answer:
      'Pośrednio — sam kod PKD nie decyduje o obowiązku VAT, ale niektóre kody (np. doradztwo, usługi prawnicze, jubilerskie) wykluczają zwolnienie podmiotowe z VAT. Inne — np. usługi finansowe czy edukacyjne — są zwolnione przedmiotowo.',
  },
  {
    question: 'Czym różni się PKD 2025 od PKD 2007?',
    answer:
      'PKD 2025 zastąpiło PKD 2007 z dniem 1 stycznia 2025 roku. Nowa wersja klasyfikacji uwzględnia m.in. platformy cyfrowe, gospodarkę współdzielenia, nowe formy handlu online i usług AI. Firmy istniejące mają okres przejściowy na migrację kodów.',
  },
  {
    question: 'Czy w 2026 roku obowiązuje nowe PKD?',
    answer:
      'Nie. W 2026 roku obowiązuje nadal PKD 2025, wprowadzone 1 stycznia 2025 roku. „PKD 2026" to potoczne określenie, którego używają niektórzy przedsiębiorcy — formalnie taka klasyfikacja nie istnieje. Szczegóły w artykule „PKD 2026 — czy są zmiany?".',
  },
];

const Home = () => {
  const [query, setQuery] = useState('');
  const [samples, setSamples] = useState<PKDCode[]>(MOCK_PKD_CODES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const cacheKey = 'samples-10';
    const cached = getCached<PKDCode[]>(cacheKey);
    if (cached) {
      setSamples(cached);
      return;
    }

    const fetchSamples = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/samples?limit=10`);
        if (response.data?.data && response.data.data.length > 0) {
          setSamples(response.data.data);
          setCached(cacheKey, response.data.data);
        }
      } catch {
        // Silent — fall back to MOCK_PKD_CODES already set in state.
      }
    };

    fetchSamples();
  }, []);

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
    const slug = createSlug(query);
    navigate(`/kody-pkd/${slug}`);
  };

  const features = [
    {
      icon: <Database className="h-8 w-8 text-blue-500" />,
      title: 'Obszerna baza kodów PKD',
      description: 'Dostęp do pełnej, aktualnej bazy kodów Polskiej Klasyfikacji Działalności 2025.',
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-500" />,
      title: 'Inteligentne wyszukiwanie',
      description: 'Algorytm AI dopasowujący najlepsze kody PKD do opisu Twojej działalności.',
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-blue-500" />,
      title: 'Dokładne dopasowania',
      description: 'Precyzyjne wyniki z ocenami dopasowania i pełnymi opisami kodów.',
    },
  ];

  const faqSchema = makeFaqSchema(FAQ_ITEMS);

  return (
    <>
      <Head>
        <title>Wyszukiwarka Kodów PKD 2025 | Znajdź kod PKD dla swojej działalności</title>
        <meta
          name="description"
          content="Darmowa wyszukiwarka kodów PKD 2025. Opisz swoją działalność, a inteligentny algorytm AI dopasuje najlepsze kody Polskiej Klasyfikacji Działalności dla CEIDG i KRS."
        />
        <meta
          name="keywords"
          content="PKD, kody PKD, PKD 2025, wyszukiwarka PKD, działalność gospodarcza, klasyfikacja działalności, polska klasyfikacja działalności, CEIDG"
        />
        <meta property="og:title" content="Wyszukiwarka Kodów PKD 2025 | kodypkd.app" />
        <meta
          property="og:description"
          content="Znajdź idealny kod PKD dla swojej działalności gospodarczej dzięki zaawansowanemu algorytmowi AI. Darmowa wyszukiwarka PKD 2025 dla CEIDG i KRS — bez rejestracji."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:locale" content="pl_PL" />
        <meta property="og:site_name" content="kodypkd.app" />
        <meta
          property="og:image"
          content={buildOgImageUrl({
            title: 'Wyszukiwarka Kodów PKD 2025',
            subtitle: 'Opisz działalność po ludzku — AI dobierze odpowiedni kod PKD',
            badge: 'Darmowe',
          })}
        />
        <meta
          name="twitter:image"
          content={buildOgImageUrl({
            title: 'Wyszukiwarka Kodów PKD 2025',
            subtitle: 'Opisz działalność po ludzku — AI dobierze odpowiedni kod PKD',
            badge: 'Darmowe',
          })}
        />
        <link rel="canonical" href={SITE_URL} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <main>
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
                  className="text-xl mb-8 text-blue-50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Opisz swoją działalność, a my dopasujemy odpowiednie kody Polskiej Klasyfikacji
                  Działalności 2025 dzięki zaawansowanemu algorytmowi AI.
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
                          <h2 className="text-xl font-bold text-gray-800">
                            {samples[currentIndex]?.payload.nazwaGrupowania}
                          </h2>
                        </div>
                        <p className="text-gray-600 flex-1 overflow-hidden text-ellipsis">
                          {samples[currentIndex]?.payload.opisDodatkowy}
                        </p>

                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex space-x-2">
                            {samples.map((_, idx) => (
                              <span
                                key={idx}
                                className={`block h-2 w-2 rounded-full ${
                                  idx === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
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

        {/* SEO header band — explicit query variants for stemming */}
        <section className="container mx-auto px-4 pt-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center max-w-3xl mx-auto">
            Kody PKD — wyszukiwarka online (PKD 2025)
          </h2>
        </section>

        {/* What is PKD */}
        <section className="container mx-auto px-4 py-16 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Co to jest kod PKD?</h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-lg">
            <p>
              <strong>Kod PKD</strong> (Polska Klasyfikacja Działalności) to pięcioznakowy
              identyfikator rodzaju działalności gospodarczej, którym posługują się w Polsce
              wszystkie urzędy. Nasza <strong>wyszukiwarka PKD</strong> dopasowuje kody do opisu
              Twojej działalności w języku naturalnym — bez konieczności znajomości urzędowego
              słownictwa. Każdy przedsiębiorca — od jednoosobowej działalności po spółkę akcyjną —
              przy rejestracji w CEIDG lub KRS musi wskazać co najmniej jeden kod PKD opisujący
              rodzaj prowadzonej działalności.
            </p>
            <p>
              Od 1 stycznia 2025 roku obowiązuje <strong>PKD 2025</strong>, które zastąpiło
              poprzednią wersję PKD 2007. Nasza wyszukiwarka operuje na aktualnej klasyfikacji i
              pomaga dopasować kody do Twojej realnej działalności — w tym tych nowo wprowadzonych,
              związanych z gospodarką cyfrową, platformami online i usługami AI.
            </p>
            <p>
              <Link to="/artykuly/co-to-jest-kod-pkd" className="text-blue-600 hover:text-blue-800 font-medium">
                Czytaj więcej w artykule „Co to jest kod PKD" →
              </Link>
            </p>
          </div>
        </section>

        {/* Popular categories */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
              Popularne kategorie działalności
            </h2>
            <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
              Sprawdź kody PKD dla najczęściej wyszukiwanych rodzajów działalności gospodarczej w
              Polsce.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {popularQueries.map((q) => (
                <Link
                  key={q.slug}
                  to={`/kody-pkd/${q.slug}`}
                  className="block px-4 py-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-center font-medium text-gray-700 hover:text-blue-700 transition"
                >
                  {q.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular individual codes */}
        <section className="container mx-auto px-4 py-16 max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
            Najczęściej wyszukiwane kody PKD
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Konkretne kody PKD 2025 wyszukiwane najczęściej przez przedsiębiorców rejestrujących
            firmę w CEIDG.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {POPULAR_CODES.map((c) => (
              <Link
                key={c.code}
                to={c.href}
                className="flex flex-col items-start gap-1 px-4 py-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition"
              >
                <span className="font-semibold text-blue-600">{c.code}</span>
                <span className="text-sm text-gray-700 leading-snug">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
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
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Articles teaser */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Poradnik PKD</h2>
                <p className="text-gray-600">Artykuły, które pomogą Ci świadomie wybrać kody PKD.</p>
              </div>
              <Link
                to="/artykuly"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                Wszystkie artykuły <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {articles.slice(0, 3).map((article) => (
                <Link
                  key={article.slug}
                  to={`/artykuly/${article.slug}`}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition flex flex-col"
                >
                  <BookOpen className="w-6 h-6 text-blue-500 mb-3" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 flex-1">{article.excerpt}</p>
                  <span className="inline-flex items-center gap-1 mt-4 text-blue-600 font-medium text-sm">
                    Czytaj <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQ items={FAQ_ITEMS} />

        {/* CTA */}
        <section className="container mx-auto px-4 pb-16 text-center">
          <Link
            to="/przyklady"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-colors"
          >
            Przeglądaj przykładowe kody PKD <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Home;
