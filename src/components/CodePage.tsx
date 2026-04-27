import { useMemo } from 'react';
import { Head } from 'vite-react-ssg';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import codesData from '../data/codes.json';
import {
  SITE_URL,
  buildOgImageUrl,
  codeToSlug,
  makeBreadcrumbSchema,
} from '../lib/seo';
import Footer from './Footer';

interface RelatedCategory {
  slug: string;
  label: string;
}

interface RelatedCode {
  code: string;
  name: string;
}

interface CodeEntry {
  code: string;
  name: string;
  descr: string;
  relatedCategories: RelatedCategory[];
  relatedCodes: RelatedCode[];
}

const CODES_BY_SLUG: Record<string, CodeEntry> = Object.fromEntries(
  (codesData as CodeEntry[]).map((c) => [codeToSlug(c.code), c]),
);

const CodePage = () => {
  const { codeSlug } = useParams<{ codeSlug: string }>();
  const entry = useMemo(() => (codeSlug ? CODES_BY_SLUG[codeSlug] : undefined), [codeSlug]);

  if (!entry) {
    return <Navigate to="/" replace />;
  }

  const canonical = `${SITE_URL}/kod-pkd/${codeToSlug(entry.code)}`;
  const pageTitle = `Kod PKD ${entry.code} — ${entry.name} | kodypkd.app`;
  const pageDescription = `Kod PKD ${entry.code}: ${entry.name}. Sprawdź pełny opis, podobne kody PKD 2025 i kategorie działalności, w których ten kod jest wybierany najczęściej.`;

  const breadcrumb = makeBreadcrumbSchema([
    { name: 'Strona główna', url: '/' },
    { name: 'Kody PKD', url: '/' },
    { name: `Kod ${entry.code}`, url: canonical },
  ]);

  const ogImage = buildOgImageUrl({
    title: `PKD ${entry.code}`,
    subtitle: entry.name,
    badge: 'Kod PKD 2025',
  });

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content={`${entry.code}, PKD ${entry.code}, kod PKD ${entry.code}, ${entry.name}, PKD 2025`}
        />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content="pl_PL" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <main className="container mx-auto px-4 py-8 max-w-3xl flex-1 w-full">
          <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumbs">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link to="/" className="hover:text-blue-600">
                  Strona główna
                </Link>
                <span className="px-2">/</span>
              </li>
              <li aria-current="page" className="text-gray-700 font-medium">
                Kod PKD {entry.code}
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-3">
              PKD 2025
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
              {entry.code} — {entry.name}
            </h1>
            <p className="text-gray-600">
              Pięcioznakowy kod Polskiej Klasyfikacji Działalności (PKD 2025) używany w CEIDG i KRS
              przy rejestracji oraz aktualizacji wpisu firmy.
            </p>
          </header>

          <article className="bg-white rounded-xl shadow p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Opis kodu {entry.code}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{entry.descr}</p>
          </article>

          {entry.relatedCategories.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Kategorie, w których wybierany jest kod {entry.code}
              </h2>
              <div className="flex flex-wrap gap-2">
                {entry.relatedCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/kody-pkd/${cat.slug}`}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-sm font-medium transition"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {entry.relatedCodes.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Podobne kody PKD</h2>
              <div className="space-y-3">
                {entry.relatedCodes.map((rc) => (
                  <Link
                    key={rc.code}
                    to={`/kod-pkd/${codeToSlug(rc.code)}`}
                    className="flex items-start gap-3 bg-white rounded-lg shadow-sm hover:shadow border border-gray-200 hover:border-blue-300 p-4 transition"
                  >
                    <span className="font-semibold text-blue-600 flex-shrink-0 w-20">{rc.code}</span>
                    <span className="text-gray-700 flex-1">{rc.name}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Nie wiesz, czy {entry.code} pasuje do Twojej działalności?
            </h2>
            <p className="text-gray-700 mb-4">
              Opisz, czym się zajmujesz, a wyszukiwarka AI dopasuje kody PKD 2025 do Twojej
              rzeczywistej działalności — z opisami i ocenami trafności.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Wyszukaj kod PKD <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CodePage;
