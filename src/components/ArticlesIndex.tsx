import { Head } from 'vite-react-ssg';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Footer from './Footer';
import { articles } from '../content/articles';
import { SITE_URL, makeBreadcrumbSchema } from '../lib/seo';

const formatPolishDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
};

const ArticlesIndex = () => {
  const canonical = `${SITE_URL}/artykuly`;

  const breadcrumb = makeBreadcrumbSchema([
    { name: 'Strona główna', url: '/' },
    { name: 'Artykuły', url: '/artykuly' },
  ]);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Poradnik PKD — artykuły o kodach PKD',
    url: canonical,
    description:
      'Praktyczne artykuły o Polskiej Klasyfikacji Działalności (PKD) — jak wybrać kod, ile kodów można mieć, jak zmienić PKD w CEIDG.',
    inLanguage: 'pl-PL',
    hasPart: articles.map((a) => ({
      '@type': 'Article',
      headline: a.title,
      url: `${SITE_URL}/artykuly/${a.slug}`,
      datePublished: a.publishedAt,
      dateModified: a.updatedAt,
    })),
  };

  return (
    <>
      <Head>
        <title>Poradnik PKD — artykuły o kodach PKD | kodypkd.app</title>
        <meta
          name="description"
          content="Poradnik Polskiej Klasyfikacji Działalności (PKD) — artykuły o wyborze kodu, limitach, zmianach w CEIDG i wpływie PKD na podatki i VAT."
        />
        <meta name="keywords" content="poradnik pkd, artykuły pkd, co to jest pkd, jak wybrać pkd, ile kodów pkd" />
        <meta property="og:title" content="Poradnik PKD — artykuły o kodach PKD" />
        <meta
          property="og:description"
          content="Praktyczne artykuły o PKD dla przedsiębiorców i osób zakładających działalność w Polsce."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content="pl_PL" />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <main className="container mx-auto px-4 py-12 max-w-5xl">
          <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumbs">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link to="/" className="hover:text-blue-600">Strona główna</Link>
                <span className="px-2">/</span>
              </li>
              <li aria-current="page" className="text-gray-700 font-medium">Artykuły</li>
            </ol>
          </nav>

          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Poradnik PKD
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Praktyczne artykuły o Polskiej Klasyfikacji Działalności (PKD). Dowiedz się, jak
              wybrać właściwy kod PKD, ile kodów warto mieć i jak zmieniać klasyfikację w CEIDG
              lub KRS.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                to={`/artykuly/${article.slug}`}
                className="bg-white rounded-xl shadow border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition flex flex-col"
              >
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    {formatPolishDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    {article.readingMinutes} min
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 leading-snug">
                  {article.title}
                </h2>
                <p className="text-gray-600 text-sm flex-1">{article.excerpt}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-blue-600 font-medium text-sm">
                  Czytaj artykuł <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ArticlesIndex;
