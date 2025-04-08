import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AnimatePresence } from 'framer-motion';
import Home from './components/Home';
import SearchComponent from './components/Search';
import Samples from './components/Samples';
import axios from 'axios';

// Mark axios to avoid unload listeners which prevent bfcache
axios.defaults.headers.common['X-BFCache-Support'] = 'true';

// Create shared abort controller for fetch operations
declare global {
  interface Window {
    _abortController: AbortController | null;
  }
}

// AnimatedRoutes komponent do obsługi animowanych przejść między stronami
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        
        {/* SEO-friendly URL dla wyszukiwania w języku polskim */}
        <Route path="/szukaj/:query" element={<SearchComponent />} />
        
        {/* Przekierowanie ze starego formatu angielskiego na nowy polski */}
        <Route path="/search/:query" element={<SearchFormatRedirect />} />
        <Route path="/search" element={<SearchRedirect />} />
        
        {/* SEO-friendly URL dla przykładowych kodów w języku polskim */}
        <Route path="/przyklady" element={<Samples />} />
        <Route path="/przyklady/limit/:limit" element={<Samples />} />
        
        {/* Przekierowanie ze starego formatu angielskiego na nowy polski */}
        <Route path="/samples" element={<Navigate to="/przyklady" replace />} />
        <Route path="/samples/limit/:limit" element={<SamplesLimitRedirect />} />
        <Route path="/samples/:limit" element={<SamplesRedirect />} />
        
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// Komponent przekierowujący ze starych URL do nowych, zgodnych z SEO
const SearchRedirect = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('serviceDescription');
  
  if (!query) {
    return <Navigate to="/" replace />;
  }
  
  // Tworzenie przyjaznego dla SEO URL w języku polskim
  const seoQuery = encodeURIComponent(query.trim().toLowerCase().replace(/\s+/g, '-'));
  return <Navigate to={`/szukaj/${seoQuery}`} replace />;
};

// Komponent przekierowujący ze starych URL samples do nowych, zgodnych z SEO
const SamplesRedirect = () => {
  const { limit } = useParams();
  
  if (!limit) {
    return <Navigate to="/przyklady" replace />;
  }
  
  return <Navigate to={`/przyklady/limit/${limit}`} replace />;
};

// Dodatkowe komponenty dla przekierowań z odpowiednimi typami
const SearchFormatRedirect = () => {
  const { query } = useParams();
  return <Navigate to={`/szukaj/${query}`} replace />;
};

const SamplesLimitRedirect = () => {
  const { limit } = useParams();
  return <Navigate to={`/przyklady/limit/${limit}`} replace />;
};

function App() {
  return (
    <Router>
      <Helmet>
        <meta name="bfcache-restore" content="true" />
        <meta name="back-forward-navigation" content="enable" />
      </Helmet>
      
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
