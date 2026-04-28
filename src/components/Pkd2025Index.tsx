import { Head } from 'vite-react-ssg';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import tree from '../data/pkd2025-tree.json';
import {
  SITE_URL,
  buildOgImageUrl,
  codeToSlug,
  makeBreadcrumbSchema,
  makeCollectionPageSchema,
} from '../lib/seo';
import Footer from './Footer';

interface Subclass {
  code: string;
  name: string;
}
interface ClassNode {
  code: string;
  name: string;
  subclasses: Subclass[];
}
interface GroupNode {
  code: string;
  name: string;
  classes: ClassNode[];
}
interface DivisionNode {
  code: string;
  name: string;
  groups: GroupNode[];
}
interface SectionNode {
  letter: string;
  name: string;
  divisions: DivisionNode[];
}

const sections = tree as SectionNode[];

const sectionAnchor = (letter: string) => `sekcja-${letter.toLowerCase()}`;

const Pkd2025Index = () => {
  const canonical = `${SITE_URL}/pkd-2025`;
  const totalSubclasses = sections.reduce(
    (acc, s) =>
      acc +
      s.divisions.reduce(
        (a, d) =>
          a + d.groups.reduce((b, g) => b + g.classes.reduce((c, cl) => c + cl.subclasses.length, 0), 0),
        0,
      ),
    0,
  );

  const pageTitle = `Pełna lista PKD 2025 — wszystkie ${totalSubclasses} kodów | kodypkd.app`;
  const pageDescription = `Hierarchiczna lista wszystkich ${totalSubclasses} podklas PKD 2025 — sekcje, działy, grupy, klasy i podklasy. Każdy kod prowadzi do strony z opisem, personami i przykładami firm.`;
  const ogImage = buildOgImageUrl({
    title: `Lista PKD 2025`,
    subtitle: `${totalSubclasses} kodów w jednym miejscu`,
    badge: 'PKD 2025',
  });
  const ogImageAlt = `Pełna lista PKD 2025 — ${totalSubclasses} kodów | kodypkd.app`;

  const breadcrumb = makeBreadcrumbSchema([
    { name: 'Strona główna', url: '/' },
    { name: 'Lista PKD 2025', url: canonical },
  ]);
  const collection = makeCollectionPageSchema({
    url: canonical,
    title: pageTitle,
    description: pageDescription,
    count: totalSubclasses,
  });

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="lista PKD 2025, wszystkie kody PKD, klasyfikacja PKD 2025, sekcje PKD, działy PKD, kody PKD"
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <meta property="og:site_name" content="kodypkd.app" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content="pl_PL" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={ogImageAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={ogImageAlt} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="pl" href={canonical} />
        <link rel="alternate" hrefLang="x-default" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(collection)}</script>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <main className="container mx-auto px-4 py-8 max-w-5xl flex-1 w-full">
          <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumbs">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link to="/" className="hover:text-blue-600">
                  Strona główna
                </Link>
                <span className="px-2">/</span>
              </li>
              <li aria-current="page" className="text-gray-700 font-medium">
                Lista PKD 2025
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-3">
              PKD 2025
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
              Pełna lista kodów PKD 2025
            </h1>
            <p className="text-gray-600">
              {totalSubclasses} podklas Polskiej Klasyfikacji Działalności 2025, pogrupowanych w {sections.length} sekcji
              i {sections.reduce((a, s) => a + s.divisions.length, 0)} działów. Kliknij dowolny kod, żeby zobaczyć opis,
              przykładowe firmy i typowe pomyłki.
            </p>
          </header>

          <nav
            className="bg-white rounded-xl shadow p-5 border border-gray-200 mb-8"
            aria-label="Skróty do sekcji"
          >
            <h2 className="text-base font-semibold text-gray-800 mb-3">Sekcje PKD 2025</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {sections.map((s) => (
                <li key={s.letter}>
                  <a
                    href={`#${sectionAnchor(s.letter)}`}
                    className="flex items-start gap-2 text-sm text-gray-700 hover:text-blue-700 hover:underline"
                  >
                    <span className="font-bold text-blue-600 w-5 flex-shrink-0">{s.letter}</span>
                    <span className="line-clamp-2">{s.name.replace(/^[A-Z, ]+$/, (t) => t.toLowerCase())}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {sections.map((section) => (
            <section
              key={section.letter}
              id={sectionAnchor(section.letter)}
              className="bg-white rounded-xl shadow p-5 sm:p-6 border border-gray-200 mb-6 scroll-mt-20"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                <span className="text-blue-600 mr-2">Sekcja {section.letter}</span>
                <span className="text-gray-800 font-semibold">
                  {section.name.charAt(0) + section.name.slice(1).toLowerCase()}
                </span>
              </h2>

              <div className="mt-4 divide-y divide-gray-100">
                {section.divisions.map((division) => (
                  <div key={division.code} className="py-4 first:pt-0 last:pb-0">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                      <span className="text-gray-500 mr-2">{division.code}</span>
                      {division.name}
                    </h3>

                    <ul className="space-y-3">
                      {division.groups.map((group) => (
                        <li key={group.code}>
                          {group.name && (
                            <p className="text-sm text-gray-500 mb-1">
                              <span className="font-medium text-gray-600 mr-1">{group.code}</span>
                              {group.name}
                            </p>
                          )}
                          <ul className="ml-2 space-y-1">
                            {group.classes.flatMap((cls) =>
                              cls.subclasses.map((sub) => (
                                <li key={sub.code}>
                                  <Link
                                    to={`/kod-pkd/${codeToSlug(sub.code)}`}
                                    className="group flex items-start gap-2 text-sm text-gray-700 hover:text-blue-700 hover:underline"
                                  >
                                    <span className="font-mono text-blue-600 group-hover:text-blue-800 w-20 flex-shrink-0">
                                      {sub.code}
                                    </span>
                                    <span className="flex-1">{sub.name}</span>
                                    <ChevronRight
                                      className="w-4 h-4 text-gray-300 group-hover:text-blue-500 mt-0.5 flex-shrink-0"
                                      aria-hidden="true"
                                    />
                                  </Link>
                                </li>
                              )),
                            )}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Pkd2025Index;
