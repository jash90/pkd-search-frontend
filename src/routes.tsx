import type { RouteRecord } from 'vite-react-ssg';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import SearchComponent from './components/Search';
import CodePage from './components/CodePage';
import Samples from './components/Samples';
import PrivacyPolicy from './components/PrivacyPolicy';
import ArticlesIndex from './components/ArticlesIndex';
import ArticleRoute from './components/ArticleRoute';
import Pkd2025Index from './components/Pkd2025Index';
import popularQueries from './data/popular-queries.json';
import codes from './data/codes.json';
import { articles } from './content/articles';
import { codeToSlug, createSlug } from './lib/seo';

const SAMPLE_LIMITS = [5, 10, 20, 50];

const SearchRedirect = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('serviceDescription');
  if (!query) return <Navigate to="/" replace />;
  return <Navigate to={`/kody-pkd/${createSlug(query)}`} replace />;
};

const SzukajRedirect = () => {
  const { query } = useParams();
  return <Navigate to={`/kody-pkd/${query}`} replace />;
};

const SearchFormatRedirect = () => {
  const { query } = useParams();
  return <Navigate to={`/kody-pkd/${query}`} replace />;
};

const SamplesRedirect = () => {
  const { limit } = useParams();
  if (!limit) return <Navigate to="/przyklady" replace />;
  return <Navigate to={`/przyklady/limit/${limit}`} replace />;
};

const SamplesLimitRedirect = () => {
  const { limit } = useParams();
  return <Navigate to={`/przyklady/limit/${limit}`} replace />;
};

const CatchAllRedirect = () => <Navigate to="/" replace />;

export const routes: RouteRecord[] = [
  {
    path: '/',
    Component: Layout,
    entry: 'src/components/Layout.tsx',
    children: [
      {
        index: true,
        Component: Home,
        entry: 'src/components/Home.tsx',
      },
      {
        path: 'przyklady',
        Component: Samples,
        entry: 'src/components/Samples.tsx',
      },
      {
        path: 'przyklady/limit/:limit',
        Component: Samples,
        entry: 'src/components/Samples.tsx',
        getStaticPaths: () => SAMPLE_LIMITS.map((n) => `/przyklady/limit/${n}`),
      },
      {
        path: 'polityka-prywatnosci',
        Component: PrivacyPolicy,
        entry: 'src/components/PrivacyPolicy.tsx',
      },
      {
        path: 'artykuly',
        Component: ArticlesIndex,
        entry: 'src/components/ArticlesIndex.tsx',
      },
      {
        path: 'artykuly/:slug',
        Component: ArticleRoute,
        entry: 'src/components/ArticleRoute.tsx',
        getStaticPaths: () => articles.map((a) => `/artykuly/${a.slug}`),
      },
      {
        path: 'pkd-2025',
        Component: Pkd2025Index,
        entry: 'src/components/Pkd2025Index.tsx',
      },
      {
        path: 'kody-pkd/:query',
        Component: SearchComponent,
        entry: 'src/components/Search.tsx',
        getStaticPaths: () => popularQueries.map((q) => `/kody-pkd/${q.slug}`),
      },
      {
        path: 'kod-pkd/:codeSlug',
        Component: CodePage,
        entry: 'src/components/CodePage.tsx',
        getStaticPaths: () => codes.map((c) => `/kod-pkd/${codeToSlug(c.code)}`),
      },
      // Legacy redirect routes — rendered client-side only.
      // Server-side 301s live in public/.htaccess and public/web.config.
      { path: 'szukaj/:query', Component: SzukajRedirect },
      { path: 'search/:query', Component: SearchFormatRedirect },
      { path: 'search', Component: SearchRedirect },
      { path: 'samples', Component: () => <Navigate to="/przyklady" replace /> },
      { path: 'samples/limit/:limit', Component: SamplesLimitRedirect },
      { path: 'samples/:limit', Component: SamplesRedirect },
      { path: '*', Component: CatchAllRedirect },
    ],
  },
];

export default routes;
