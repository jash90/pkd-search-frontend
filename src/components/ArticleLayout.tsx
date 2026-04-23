import { Suspense } from 'react';
import { Head } from 'vite-react-ssg';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Footer from './Footer';
import type { ArticleEntry } from '../content/articles';
import { SITE_URL, makeArticleSchema, makeBreadcrumbSchema, buildOgImageUrl } from '../lib/seo';
import { articles } from '../content/articles';

interface ArticleLayoutProps {
  article: ArticleEntry;
}

const formatPolishDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
};

const ArticleLayout = ({ article }: ArticleLayoutProps) => {
  const canonical = `${SITE_URL}/artykuly/${article.slug}`;
  const Component = article.Component;

  const breadcrumb = makeBreadcrumbSchema([
    { name: 'Strona główna', url: '/' },
    { name: 'Artykuły', url: '/artykuly' },
    { name: article.title, url: `/artykuly/${article.slug}` },
  ]);

  const articleSchema = makeArticleSchema(article);

  const ogImage = buildOgImageUrl({
    title: article.title,
    subtitle: article.excerpt || article.description,
    badge: 'Poradnik PKD',
  });

  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <Head>
        <title>{article.title} | Poradnik PKD | kodypkd.app</title>
        <meta name="description" content={article.description} />
        <meta name="keywords" content={article.keywords.join(', ')} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content="pl_PL" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:image" content={ogImage} />
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:modified_time" content={article.updatedAt} />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <main className="container mx-auto px-4 py-10 max-w-3xl">
          <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumbs">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link to="/" className="hover:text-blue-600">Strona główna</Link>
                <span className="px-2">/</span>
              </li>
              <li>
                <Link to="/artykuly" className="hover:text-blue-600">Artykuły</Link>
                <span className="px-2">/</span>
              </li>
              <li aria-current="page" className="text-gray-700 font-medium">{article.title}</li>
            </ol>
          </nav>

          <Link
            to="/artykuly"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Wszystkie artykuły
          </Link>

          <article className="bg-white rounded-xl shadow-md p-8 md:p-10">
            <header className="mb-8 border-b border-gray-100 pb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">{article.excerpt}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  {formatPolishDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  {article.readingMinutes} min czytania
                </span>
              </div>
            </header>

            <div className="prose prose-blue max-w-none article-content text-gray-800 leading-relaxed">
              <Suspense fallback={<div className="text-gray-500">Ładowanie treści artykułu…</div>}>
                <Component />
              </Suspense>
            </div>
          </article>

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-5">Zobacz też</h2>
              <div className="grid md:grid-cols-3 gap-5">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/artykuly/${r.slug}`}
                    className="bg-white rounded-lg shadow border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{r.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{r.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ArticleLayout;
