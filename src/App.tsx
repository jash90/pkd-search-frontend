import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
      <Routes location={location} key={location.pathname + location.search}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchComponent />} />
        <Route path="/samples" element={<Samples />} />
        <Route path="/samples/:limit" element={<Samples />} />
        <Route path="/*" element={<SearchComponent />} />
      </Routes>
    </AnimatePresence>
  );
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
