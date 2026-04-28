import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Strona główna', end: true },
  { to: '/pkd-2025', label: 'Lista PKD 2025' },
  { to: '/przyklady', label: 'Przykładowe kody PKD' },
  { to: '/artykuly', label: 'Poradnik PKD' },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'text-blue-700 bg-blue-50'
        : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-md text-base font-medium transition-colors ${
      isActive
        ? 'text-blue-700 bg-blue-50'
        : 'text-gray-800 hover:text-blue-700 hover:bg-gray-50'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <nav className="container mx-auto px-4" aria-label="Nawigacja główna">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg text-blue-700 hover:text-blue-800"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white text-sm">
              PKD
            </span>
            kodypkd.app
          </Link>

          <ul className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={linkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Zamknij menu' : 'Otwórz menu'}
            onClick={() => setIsOpen((v) => !v)}
          >
            {isOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {isOpen && (
          <ul id="mobile-menu" className="md:hidden pb-3 space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={mobileLinkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Header;
