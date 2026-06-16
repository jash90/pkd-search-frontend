import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

const track = (label: string, to: string, section: string) =>
  trackEvent('footer_link_click', { label, to, section });

const Footer = () => (
  <footer className="bg-gray-800 text-gray-300 py-10 mt-12">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="text-white font-semibold mb-3">kodypkd.app</h3>
          <p className="text-gray-400">
            Darmowa wyszukiwarka kodów Polskiej Klasyfikacji Działalności z silnikiem AI.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">Wyszukiwarka</h3>
          <ul className="space-y-2">
            <li><Link to="/" onClick={() => track('Strona główna', '/', 'wyszukiwarka')} className="hover:text-white">Strona główna</Link></li>
            <li><Link to="/pkd-2025" onClick={() => track('Lista PKD 2025', '/pkd-2025', 'wyszukiwarka')} className="hover:text-white">Lista PKD 2025 (728 kodów)</Link></li>
            <li><Link to="/przyklady" onClick={() => track('Przykładowe kody PKD', '/przyklady', 'wyszukiwarka')} className="hover:text-white">Przykładowe kody PKD</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">Poradnik PKD</h3>
          <ul className="space-y-2">
            <li><Link to="/artykuly" onClick={() => track('Artykuły o PKD', '/artykuly', 'poradnik')} className="hover:text-white">Artykuły o PKD</Link></li>
            <li><Link to="/artykuly/co-to-jest-kod-pkd" onClick={() => track('Co to jest kod PKD?', '/artykuly/co-to-jest-kod-pkd', 'poradnik')} className="hover:text-white">Co to jest kod PKD?</Link></li>
            <li><Link to="/artykuly/jak-dziala-wyszukiwarka-pkd" onClick={() => track('Jak działa wyszukiwarka AI?', '/artykuly/jak-dziala-wyszukiwarka-pkd', 'poradnik')} className="hover:text-white">Jak działa wyszukiwarka AI?</Link></li>
            <li><Link to="/artykuly/jak-wybrac-kod-pkd-dla-jdg" onClick={() => track('Jak wybrać PKD dla JDG?', '/artykuly/jak-wybrac-kod-pkd-dla-jdg', 'poradnik')} className="hover:text-white">Jak wybrać PKD dla JDG?</Link></li>
            <li><Link to="/artykuly/ile-kodow-pkd-mozna-miec" onClick={() => track('Ile kodów PKD można mieć?', '/artykuly/ile-kodow-pkd-mozna-miec', 'poradnik')} className="hover:text-white">Ile kodów PKD można mieć?</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">Informacje</h3>
          <ul className="space-y-2">
            <li><Link to="/polityka-prywatnosci" onClick={() => track('Polityka prywatności', '/polityka-prywatnosci', 'informacje')} className="hover:text-white">Polityka prywatności</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-xs">
        <p>&copy; {new Date().getFullYear()} kodypkd.app — Wyszukiwarka Kodów PKD. Wszystkie prawa zastrzeżone.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
