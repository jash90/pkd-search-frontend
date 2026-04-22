import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '../lib/seo';

interface FAQProps {
  items: FaqItem[];
  heading?: string;
}

const FAQ = ({ items, heading = 'Najczęściej zadawane pytania' }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="container mx-auto px-4 py-16 max-w-4xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">{heading}</h2>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex justify-between items-center gap-4 px-5 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50"
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-gray-600 leading-relaxed whitespace-pre-line">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;
