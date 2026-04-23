import { Head } from 'vite-react-ssg';
import { Link } from 'react-router-dom';
import { SITE_URL } from '../lib/seo';
import Footer from './Footer';

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Polityka Prywatności | kodypkd.app</title>
        <meta
          name="description"
          content="Polityka prywatności serwisu kodypkd.app — informacje o przetwarzaniu danych osobowych."
        />
        <link rel="canonical" href={`${SITE_URL}/polityka-prywatnosci`} />
        <meta name="robots" content="noindex, follow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <main className="p-8 flex-1">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 font-medium mb-6 inline-block"
            >
              &larr; Powrót do strony głównej
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-8">Polityka Prywatności</h1>

            <div className="bg-white rounded-lg shadow-md p-8 space-y-6 text-gray-700 leading-relaxed">
              <p className="text-sm text-gray-500">Ostatnia aktualizacja: 1 kwietnia 2026</p>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Administrator danych</h2>
                <p>
                  Administratorem serwisu kodypkd.app jest jego właściciel. W sprawach dotyczących
                  ochrony danych osobowych prosimy o kontakt za pośrednictwem danych podanych na
                  stronie głównej.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Jakie dane zbieramy</h2>
                <p>Serwis kodypkd.app zbiera minimalną ilość danych:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    <strong>Zapytania wyszukiwania</strong> — opisy działalności wpisywane w
                    formularz wyszukiwarki są przesyłane do serwera w celu dopasowania kodów PKD.
                    Nie są one powiązane z tożsamością użytkownika.
                  </li>
                  <li>
                    <strong>Dane techniczne</strong> — adres IP, typ przeglądarki, system
                    operacyjny — zbierane automatycznie przez serwer w celach technicznych i
                    bezpieczeństwa.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Cel przetwarzania danych</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Realizacja usługi wyszukiwania kodów PKD</li>
                  <li>Zapewnienie bezpieczeństwa i prawidłowego działania serwisu</li>
                  <li>Analiza statystyczna ruchu na stronie (dane zanonimizowane)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Podstawa prawna</h2>
                <p>
                  Dane przetwarzane są na podstawie art. 6 ust. 1 lit. f) RODO — prawnie
                  uzasadniony interes administratora polegający na świadczeniu usługi i zapewnieniu
                  jej bezpieczeństwa.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Pliki cookies</h2>
                <p>
                  Serwis wykorzystuje wyłącznie techniczne pliki cookies niezbędne do prawidłowego
                  działania strony (np. przechowywanie stanu sesji). Nie stosujemy cookies
                  marketingowych ani śledzących.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Udostępnianie danych</h2>
                <p>
                  Dane nie są sprzedawane ani udostępniane podmiotom trzecim w celach
                  marketingowych. Mogą być udostępniane dostawcom usług hostingowych (Vercel)
                  wyłącznie w zakresie niezbędnym do świadczenia usługi.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Prawa użytkownika</h2>
                <p>Zgodnie z RODO przysługuje Ci prawo do:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Dostępu do swoich danych</li>
                  <li>Sprostowania danych</li>
                  <li>Usunięcia danych („prawo do bycia zapomnianym")</li>
                  <li>Ograniczenia przetwarzania</li>
                  <li>Przenoszenia danych</li>
                  <li>Wniesienia sprzeciwu wobec przetwarzania</li>
                  <li>Wniesienia skargi do Prezesa UODO</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Okres przechowywania</h2>
                <p>
                  Dane techniczne (logi serwera) przechowywane są przez okres nie dłuższy niż 30
                  dni. Zapytania wyszukiwania nie są trwale zapisywane.
                </p>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;
