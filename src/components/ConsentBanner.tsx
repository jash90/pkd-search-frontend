import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applyConsent, getStoredConsent } from '../lib/analytics';

// GDPR cookie consent banner driving Google Consent Mode v2.
// SSR-safe: renders nothing until a client effect reads the stored choice.
const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      // Re-apply the saved choice on every load (default is denied in index.html).
      applyConsent(stored === 'granted');
    } else {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const choose = (granted: boolean) => {
    applyConsent(granted);
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      role="dialog"
      aria-live="polite"
      aria-label="Zgoda na pliki cookie"
    >
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm text-gray-700 flex-1 leading-relaxed">
          Używamy plików cookie do analizy ruchu (Google Analytics), aby ulepszać
          wyszukiwarkę. Możesz zaakceptować lub odrzucić analitykę. Szczegóły znajdziesz w{' '}
          <Link to="/polityka-prywatnosci" className="text-blue-600 hover:text-blue-800 font-medium underline">
            polityce prywatności
          </Link>
          .
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => choose(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
          >
            Odrzuć
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Akceptuję
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
