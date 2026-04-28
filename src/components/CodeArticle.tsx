import { Users, Briefcase, AlertTriangle, Calculator } from 'lucide-react';
import { codeToSlug } from '../lib/seo';

export interface CodeArticleData {
  code: string;
  name: string;
  intro: string;
  whoUsesIt: { persona: string; use: string }[];
  businessExamples: string[];
  commonMistakes: string[];
  taxNotes: string;
  generatedAt?: string;
}

const articleModules = import.meta.glob<{ default: CodeArticleData }>(
  '../data/code-articles/*.json',
  { eager: true },
);

const articlesByCode: Record<string, CodeArticleData> = Object.fromEntries(
  Object.values(articleModules).map((m) => {
    const data = m.default;
    return [data.code, data];
  }),
);

export const getCodeArticle = (code: string): CodeArticleData | undefined =>
  articlesByCode[code];

export const codeArticleKeys = (): string[] =>
  Object.keys(articlesByCode).map((c) => codeToSlug(c));

export default function CodeArticle({ data }: { data: CodeArticleData }) {
  return (
    <article className="bg-white rounded-xl shadow p-6 border border-gray-200 mb-8 space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Co obejmuje kod {data.code}
        </h2>
        <p className="text-gray-700 leading-relaxed">{data.intro}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" aria-hidden="true" />
          Kto używa kodu {data.code}
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.whoUsesIt.map((p) => (
            <div
              key={p.persona}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{p.persona}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{p.use}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" aria-hidden="true" />
          Przykładowe firmy
        </h2>
        <ul className="space-y-2">
          {data.businessExamples.map((ex) => (
            <li
              key={ex}
              className="flex items-start gap-2 text-gray-700"
            >
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>{ex}</span>
            </li>
          ))}
        </ul>
      </section>

      {data.commonMistakes.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
            Częste pomyłki
          </h2>
          <ul className="space-y-2">
            {data.commonMistakes.map((m) => (
              <li
                key={m}
                className="text-gray-700 leading-relaxed pl-4 border-l-2 border-amber-200"
              >
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h2 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" aria-hidden="true" />
          Uwagi podatkowe
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">{data.taxNotes}</p>
      </section>
    </article>
  );
}
