import { useState } from 'react';
import { ArrowLeft, HelpCircle, Triangle } from 'lucide-react';
import { nineQuestions, triangleGuide } from '../data/lifeGuide';

function GuideShell({ title, subtitle, onBack, children }) {
  return (
    <div className="min-h-screen ink-paper px-4 md:px-8 py-10 md:py-14 font-serif text-[color:var(--ink)]">
      <div className="w-full max-w-5xl mx-auto">
        <div className="scroll-stage max-w-none anim-unfurl">
          <div className="scroll-rod" aria-hidden="true" />
          <div className="scroll-body !px-4 md:!px-10 !py-8 md:!py-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 border-b border-[color:var(--ink)]/20 pb-6">
              <div>
                <p className="text-xs font-bold tracking-[0.35em] text-[color:var(--ink-soft)] mb-2">
                  {subtitle}
                </p>
                <h1 className="brand-mark text-4xl md:text-6xl">{title}</h1>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-5 py-3 border border-[color:var(--ink)]/30 font-bold hover:border-[color:var(--cinnabar)] hover:text-[color:var(--cinnabar)] transition-colors"
              >
                <ArrowLeft size={18} />
                返回解析
              </button>
            </div>
            {children}
          </div>
          <div className="scroll-rod" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export function TriangleGuidePage({ onBack, onOpenNine }) {
  const g = triangleGuide;
  return (
    <GuideShell title={g.title} subtitle="TRIANGLE GUIDE" onBack={onBack}>
      <p className="text-[color:var(--ink-soft)] font-medium leading-relaxed mb-10 max-w-3xl">
        {g.intro}
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-black tracking-widest mb-6 flex items-center gap-3">
          <Triangle size={22} className="text-[color:var(--cinnabar)]" />
          三角形內
        </h2>
        <div className="space-y-5">
          {g.inside.map((item) => (
            <article
              key={item.label}
              className="border border-[color:var(--ink)]/15 p-6"
            >
              <h3 className="font-black tracking-widest text-lg mb-3 text-[color:var(--cinnabar)]">
                {item.label}
              </h3>
              <p className="font-medium leading-relaxed text-[color:var(--ink-soft)] mb-3">
                {item.meaning}
              </p>
              <p className="text-sm font-bold leading-relaxed">
                提醒：{item.tip}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-black tracking-widest mb-6">三角形外</h2>
        <div className="space-y-5">
          {g.outside.map((item) => (
            <article
              key={item.label}
              className="border border-[color:var(--ink)]/15 p-6"
            >
              <h3 className="font-black tracking-widest text-lg mb-3">
                {item.label}
              </h3>
              <p className="font-medium leading-relaxed text-[color:var(--ink-soft)] mb-3">
                {item.meaning}
              </p>
              <p className="text-sm font-bold leading-relaxed">
                提醒：{item.tip}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border border-[color:var(--ink)]/20 p-8 mb-10">
        <h2 className="text-xl font-black tracking-widest mb-5">解讀注意</h2>
        <ul className="space-y-3">
          {g.notes.map((n) => (
            <li key={n} className="font-bold text-[color:var(--ink-soft)] leading-relaxed">
              · {n}
            </li>
          ))}
        </ul>
      </section>

      {onOpenNine && (
        <div className="text-center">
          <button
            type="button"
            onClick={onOpenNine}
            className="btn-cinnabar inline-flex items-center gap-2 px-8 py-4 font-black"
          >
            <HelpCircle size={18} />
            接著看九問解密
          </button>
        </div>
      )}
    </GuideShell>
  );
}

export function NineQuestionsPage({ onBack, onOpenTriangle }) {
  const g = nineQuestions;
  const [open, setOpen] = useState(0);

  return (
    <GuideShell title={g.title} subtitle="NINE QUESTIONS" onBack={onBack}>
      <p className="text-[color:var(--ink-soft)] font-medium leading-relaxed mb-10 max-w-3xl">
        {g.intro}
      </p>

      <div className="space-y-4 mb-12">
        {g.questions.map((item, idx) => {
          const active = open === idx;
          return (
            <article
              key={item.q}
              className="border border-[color:var(--ink)]/15 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(active ? -1 : idx)}
                className="w-full text-left px-6 py-5 flex items-start gap-4 hover:bg-[rgba(22,20,15,0.03)] transition-colors"
              >
                <span className="font-brush text-3xl text-[color:var(--cinnabar)] leading-none shrink-0">
                  {idx + 1}
                </span>
                <span className="font-black tracking-wide text-lg pt-1">
                  {item.q}
                </span>
              </button>
              {active && (
                <div className="px-6 pb-6 pt-0 space-y-4 border-t border-[color:var(--ink)]/10">
                  <div>
                    <div className="text-xs font-bold tracking-[0.28em] text-[color:var(--ink-soft)] mb-2">
                      為什麼重要
                    </div>
                    <p className="font-medium leading-relaxed text-[color:var(--ink-soft)]">
                      {item.why}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-[0.28em] text-[color:var(--ink-soft)] mb-2">
                      怎麼做
                    </div>
                    <p className="font-bold leading-relaxed">{item.how}</p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {onOpenTriangle && (
        <div className="text-center">
          <button
            type="button"
            onClick={onOpenTriangle}
            className="inline-flex items-center gap-2 px-8 py-4 border border-[color:var(--ink)] font-black hover:border-[color:var(--cinnabar)] hover:text-[color:var(--cinnabar)] transition-colors"
          >
            <Triangle size={18} />
            回到三角形內外
          </button>
        </div>
      )}
    </GuideShell>
  );
}
