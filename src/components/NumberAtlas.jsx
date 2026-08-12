import { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Compass,
  Heart,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import {
  ideologyGuide,
  numberProfiles,
} from '../data/numberProfiles';

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function NumberAtlas({ onBack }) {
  const [selected, setSelected] = useState(null);
  const profile = selected ? numberProfiles[selected] : null;
  const ideology = profile ? ideologyGuide[profile.ideology] : null;

  return (
    <div className="min-h-screen ink-paper px-4 md:px-8 py-10 md:py-14 font-serif text-[color:var(--ink)]">
      <div className="w-full max-w-6xl mx-auto">
        <div className="scroll-stage max-w-none anim-unfurl">
          <div className="scroll-rod" aria-hidden="true" />
          <div className="scroll-body !px-4 md:!px-10 !py-8 md:!py-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 border-b border-[color:var(--ink)]/20 pb-6">
              <div>
                <p className="text-xs font-bold tracking-[0.35em] text-[color:var(--ink-soft)] mb-2">
                  NUMBER ATLAS
                </p>
                <h1 className="brand-mark text-4xl md:text-6xl">1–9 號人格圖鑑</h1>
                <p className="mt-3 text-[color:var(--ink-soft)] font-bold tracking-widest text-sm">
                  不需輸入生日，先認識九種生命能量
                </p>
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

            <div className="grid grid-cols-3 md:grid-cols-9 gap-3 md:gap-4 mb-12">
              {NUMBERS.map((n) => {
                const item = numberProfiles[n];
                const active = selected === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSelected(n)}
                    className={`group flex flex-col items-center justify-center gap-2 py-5 px-2 border transition-all ${
                      active
                        ? 'border-[color:var(--cinnabar)] bg-[rgba(178,34,34,0.08)]'
                        : 'border-[color:var(--ink)]/15 hover:border-[color:var(--cinnabar)]/50'
                    }`}
                  >
                    <span
                      className={`font-brush text-4xl leading-none ${
                        active
                          ? 'text-[color:var(--cinnabar)]'
                          : 'text-[color:var(--ink)]'
                      }`}
                    >
                      {n}
                    </span>
                    <span className="text-[11px] md:text-xs font-bold tracking-widest text-[color:var(--ink-soft)] text-center leading-snug">
                      {item.archetype}
                    </span>
                  </button>
                );
              })}
            </div>

            {!profile && (
              <p className="text-center text-[color:var(--ink-soft)] font-bold tracking-[0.28em] py-16">
                點選上方數字，展開該號人格卷軸
              </p>
            )}

            {profile && (
              <div className="space-y-10 anim-rise">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-[color:var(--ink)]/20 pb-6">
                  <div>
                    <p className="text-xs font-black tracking-[0.4em] text-[color:var(--ink-soft)] mb-2 uppercase">
                      {profile.english}
                    </p>
                    <h2 className="brand-mark text-3xl md:text-5xl">
                      {selected} 號人 · {profile.archetype}
                    </h2>
                    {profile.bookTitle && (
                      <p className="mt-2 text-sm font-bold tracking-widest text-[color:var(--cinnabar)]">
                        書中篇章：{profile.bookTitle}
                      </p>
                    )}
                  </div>
                  <p className="text-[color:var(--ink-soft)] font-bold italic max-w-xl">
                    {profile.quote}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.keywords.map((k) => (
                    <span
                      key={k}
                      className="px-3 py-1 bg-[color:var(--ink)] text-[#F7F1E6] text-xs font-black tracking-widest"
                    >
                      {k}
                    </span>
                  ))}
                  <span className="px-3 py-1 border border-[color:var(--cinnabar)] text-[color:var(--cinnabar)] text-xs font-black tracking-widest">
                    {profile.ideology}
                  </span>
                </div>

                <section className="border border-[color:var(--ink)]/20 p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-[color:var(--ink)] text-[#F7F1E6] p-2">
                      <BookOpen size={18} />
                    </div>
                    <h3 className="text-xl font-black tracking-widest">核心人格</h3>
                  </div>
                  <p className="text-lg leading-relaxed text-[color:var(--ink-soft)] font-medium">
                    {profile.core}
                  </p>
                  {profile.bookInsight && (
                    <p className="mt-5 text-sm font-bold leading-relaxed border-l-4 border-[color:var(--cinnabar)] pl-4 text-[color:var(--ink)]">
                      書本洞見：{profile.bookInsight}
                    </p>
                  )}
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="bg-emerald-50/80 border border-emerald-200 p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <Sparkles className="text-emerald-700" size={22} />
                      <h3 className="text-xl font-black tracking-widest text-emerald-900">
                        高能量 · 天賦發光時
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {profile.high.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-[color:var(--ink)] font-bold"
                        >
                          <span className="mt-1 w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section className="bg-rose-50/80 border border-rose-200 p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <Target className="text-rose-700" size={22} />
                      <h3 className="text-xl font-black tracking-widest text-rose-900">
                        低能量 · 卡住的時候
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {profile.low.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-[color:var(--ink)] font-bold"
                        >
                          <span className="mt-1 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <section className="border border-[color:var(--ink)]/15 p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <Briefcase size={20} />
                      <h3 className="text-lg font-black tracking-widest">天賦職場</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.careers.map((c) => (
                        <span
                          key={c}
                          className="px-3 py-2 bg-[rgba(22,20,15,0.04)] border border-[color:var(--ink)]/10 text-sm font-bold"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </section>
                  <section className="border border-[color:var(--ink)]/15 p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <Users size={20} />
                      <h3 className="text-lg font-black tracking-widest">相處之道</h3>
                    </div>
                    <ul className="space-y-3 mb-5">
                      {profile.relate.map((item) => (
                        <li key={item} className="font-bold text-[color:var(--ink-soft)]">
                          · {item}
                        </li>
                      ))}
                    </ul>
                    <div className="bg-[color:var(--ink)] text-[#F7F1E6] px-4 py-3 text-sm font-black tracking-wider">
                      一句話：{profile.oneLiner}
                    </div>
                  </section>
                  <section className="border border-[color:var(--ink)]/15 p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <Compass size={20} />
                      <h3 className="text-lg font-black tracking-widest">職場識別口吻</h3>
                    </div>
                    <p className="text-2xl font-black text-[color:var(--cinnabar)] leading-relaxed">
                      {profile.workplaceCue}
                    </p>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="bg-[color:var(--ink)] text-[#F7F1E6] p-8 border border-[color:var(--ink)]">
                    <div className="flex items-center gap-3 mb-5">
                      <Heart size={20} className="text-[#F5D76E]" />
                      <h3 className="text-lg font-black tracking-widest">
                        修行課題 · {profile.heart.name}
                      </h3>
                    </div>
                    <p className="text-xl font-black mb-4 tracking-wide text-[#F7F1E6]">
                      {profile.practice}
                    </p>
                    <p className="text-[#F5D76E] font-black mb-3 text-lg leading-relaxed">
                      {profile.heart.mantra}
                    </p>
                    <p className="text-[#E8E0D2] leading-relaxed font-bold">
                      {profile.heart.why}
                    </p>
                  </section>
                  {ideology && (
                    <section className="border border-[color:var(--ink)]/25 p-8">
                      <div className="flex items-center gap-3 mb-5">
                        <Compass size={20} />
                        <h3 className="text-lg font-black tracking-widest">
                          三大主義 · {profile.ideology}
                        </h3>
                      </div>
                      <p className="text-sm font-black tracking-[0.3em] text-[color:var(--ink-soft)] mb-2">
                        對應數字 {ideology.numbers}
                      </p>
                      <p className="text-xl font-black mb-3">{ideology.focus}</p>
                      <p className="text-[color:var(--ink-soft)] font-medium leading-relaxed">
                        {ideology.desc}
                      </p>
                    </section>
                  )}
                </div>

                <p className="text-center font-black text-lg tracking-wide pt-4">
                  給自己的一句話：我要練習「
                  <span className="text-[color:var(--cinnabar)]">
                    {profile.heart.name}
                  </span>
                  」。
                </p>
              </div>
            )}
          </div>
          <div className="scroll-rod" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
