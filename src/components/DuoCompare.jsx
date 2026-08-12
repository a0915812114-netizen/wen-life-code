import { useMemo, useState } from 'react';
import { ArrowLeft, Calendar, HeartHandshake, User } from 'lucide-react';
import { numberProfiles } from '../data/numberProfiles';
import { analyzeDuo } from '../lib/duo';
import { computeLifeCode, validateBirthDate } from '../lib/queryLogs';
import { getTodayString } from '../lib/firebase';

const MIN_DOB = '1900-01-01';

function PersonForm({ title, name, setName, dob, setDob, error }) {
  const today = getTodayString();
  return (
    <div className="border border-[color:var(--ink)]/15 p-6 text-left space-y-5">
      <h3 className="font-black tracking-widest text-lg">{title}</h3>
      <label className="block">
        <span className="text-xs font-bold tracking-[0.28em] text-[color:var(--ink-soft)] mb-2 block">
          姓名
        </span>
        <div className="field-line flex items-center gap-3 pb-2">
          <User size={18} className="text-[color:var(--cinnabar)]" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="請輸入姓名"
            className="bg-transparent outline-none w-full font-bold text-lg tracking-widest"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-xs font-bold tracking-[0.28em] text-[color:var(--ink-soft)] mb-2 block">
          陽曆生日
        </span>
        <div className="field-line flex items-center gap-3 pb-2">
          <Calendar size={18} className="text-[color:var(--cinnabar)]" />
          <input
            type="date"
            min={MIN_DOB}
            max={today}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="bg-transparent outline-none w-full font-bold text-lg cursor-pointer"
          />
        </div>
      </label>
      {error && (
        <p className="text-sm font-bold text-[color:var(--cinnabar)]">{error}</p>
      )}
    </div>
  );
}

export default function DuoCompare({ onBack }) {
  const today = getTodayString();
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [dobA, setDobA] = useState(today);
  const [dobB, setDobB] = useState(today);
  const [errorA, setErrorA] = useState('');
  const [errorB, setErrorB] = useState('');
  const [ready, setReady] = useState(false);

  const pair = useMemo(() => {
    if (!ready) return null;
    const rA = computeLifeCode(dobA);
    const rB = computeLifeCode(dobB);
    if (!rA || !rB) return null;
    return analyzeDuo(
      { name: nameA.trim() || '甲方', dob: dobA, result: rA },
      { name: nameB.trim() || '乙方', dob: dobB, result: rB },
    );
  }, [ready, nameA, nameB, dobA, dobB]);

  const handleCompare = () => {
    const vA = validateBirthDate(dobA);
    const vB = validateBirthDate(dobB);
    setErrorA(vA.ok ? '' : vA.message);
    setErrorB(vB.ok ? '' : vB.message);
    if (!vA.ok || !vB.ok) {
      setReady(false);
      return;
    }
    setReady(true);
  };

  return (
    <div className="min-h-screen ink-paper px-4 md:px-8 py-10 md:py-14 font-serif text-[color:var(--ink)]">
      <div className="w-full max-w-5xl mx-auto">
        <div className="scroll-stage max-w-none anim-unfurl">
          <div className="scroll-rod" aria-hidden="true" />
          <div className="scroll-body !px-4 md:!px-10 !py-8 md:!py-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 border-b border-[color:var(--ink)]/20 pb-6">
              <div>
                <p className="text-xs font-bold tracking-[0.35em] text-[color:var(--ink-soft)] mb-2">
                  DUAL READING
                </p>
                <h1 className="brand-mark text-4xl md:text-6xl">雙人合盤</h1>
                <p className="mt-3 text-[color:var(--ink-soft)] font-bold tracking-widest text-sm">
                  看兩人主性格如何相遇、互補與成長
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <PersonForm
                title="第一人"
                name={nameA}
                setName={setNameA}
                dob={dobA}
                setDob={setDobA}
                error={errorA}
              />
              <PersonForm
                title="第二人"
                name={nameB}
                setName={setNameB}
                dob={dobB}
                setDob={setDobB}
                error={errorB}
              />
            </div>

            <div className="text-center mb-12">
              <button
                type="button"
                onClick={handleCompare}
                className="btn-cinnabar inline-flex items-center gap-3 px-10 py-4 font-black text-lg"
              >
                <HeartHandshake size={22} />
                展開合盤
              </button>
            </div>

            {pair && (
              <div className="space-y-10 anim-rise">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  <div className="border border-[color:var(--ink)]/15 p-6 text-center">
                    <div className="text-xs font-bold tracking-[0.3em] text-[color:var(--ink-soft)] mb-3">
                      {nameA.trim() || '甲方'}
                    </div>
                    <div className="font-brush text-6xl text-[color:var(--cinnabar)] leading-none">
                      {pair.o1}
                    </div>
                    <div className="mt-3 font-black tracking-widest">
                      {pair.archetypeA}
                    </div>
                    <div className="text-sm text-[color:var(--ink-soft)] font-bold mt-1">
                      {pair.ideologyA}
                    </div>
                  </div>
                  <div className="bg-[color:var(--ink)] text-[#F7F1E6] p-6 text-center flex flex-col justify-center">
                    <div className="text-xs font-bold tracking-[0.3em] text-[#F5D76E] mb-3">
                      合盤能量
                    </div>
                    <div className="font-brush text-5xl leading-none mb-3">
                      {pair.bondCode}
                    </div>
                    <div className="text-xl font-black tracking-widest mb-2">
                      {pair.vibe}
                    </div>
                    <p className="text-sm text-[#E8E0D2] font-medium leading-relaxed">
                      {pair.vibeDetail}
                    </p>
                  </div>
                  <div className="border border-[color:var(--ink)]/15 p-6 text-center">
                    <div className="text-xs font-bold tracking-[0.3em] text-[color:var(--ink-soft)] mb-3">
                      {nameB.trim() || '乙方'}
                    </div>
                    <div className="font-brush text-6xl text-[color:var(--cinnabar)] leading-none">
                      {pair.o2}
                    </div>
                    <div className="mt-3 font-black tracking-widest">
                      {pair.archetypeB}
                    </div>
                    <div className="text-sm text-[color:var(--ink-soft)] font-bold mt-1">
                      {pair.ideologyB}
                    </div>
                  </div>
                </div>

                <section className="border border-[color:var(--ink)]/20 p-8">
                  <h3 className="text-xl font-black tracking-widest mb-5">相處提醒</h3>
                  <ul className="space-y-3">
                    {pair.tips.map((tip) => (
                      <li
                        key={tip}
                        className="font-bold text-[color:var(--ink-soft)] leading-relaxed"
                      >
                        · {tip}
                      </li>
                    ))}
                  </ul>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { n: pair.o1, name: nameA.trim() || '甲方' },
                    { n: pair.o2, name: nameB.trim() || '乙方' },
                  ].map((item) => {
                    const p = numberProfiles[item.n];
                    return (
                      <div
                        key={item.name + item.n}
                        className="border border-[color:var(--ink)]/15 p-6"
                      >
                        <div className="font-black tracking-widest mb-2">
                          {item.name} · {item.n} 號 {p?.archetype}
                        </div>
                        <p className="text-sm text-[color:var(--ink-soft)] font-medium leading-relaxed mb-3">
                          {p?.core}
                        </p>
                        <p className="text-sm font-bold text-[color:var(--cinnabar)]">
                          修行：{p?.heart?.name} — {p?.practice}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="scroll-rod" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
