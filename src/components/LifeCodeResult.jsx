import {
  Download,
  Image as ImageIcon,
  Briefcase,
  ShieldCheck,
  Star,
  Heart,
  Compass,
  Sparkles,
  Users,
  Target,
  BookOpen,
  Share2,
  Link2,
} from 'lucide-react';
import { dailyPractices, reminders } from '../data/numberProfiles';
import GourdIcon from './GourdIcon';

export default function LifeCodeResult({
  resultRef,
  userName,
  r,
  profile,
  ideology,
  isExporting,
  exportNotice,
  shareNotice,
  onDownload,
  onShare,
  onCopyLink,
}) {
  return (
    <div
      ref={resultRef}
      className="w-full flex flex-col gap-10 items-stretch justify-center mt-4 mb-8 anim-unfurl ink-paper-texture"
    >
      <div className="scroll-stage max-w-none">
        <div className="scroll-rod" aria-hidden="true" />
        <div className="scroll-body !px-4 md:!px-10 !py-8 md:!py-12">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b border-[color:var(--ink)]/20 pb-6">
            <h2 className="brand-mark text-3xl md:text-5xl text-[color:var(--ink)]">
              {userName ? `「${userName}」命數全息圖` : '生命靈數圖'}
            </h2>
            {!isExporting && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onShare}
                  className="inline-flex items-center gap-2 px-5 py-3 border border-[color:var(--cinnabar)] text-[color:var(--cinnabar)] font-black hover:bg-[color:var(--cinnabar)] hover:text-[#F7F1E6] transition-all"
                >
                  <Share2 size={18} />
                  分享結果
                </button>
                <button
                  onClick={onCopyLink}
                  className="inline-flex items-center gap-2 px-5 py-3 border border-[color:var(--ink)]/40 text-[color:var(--ink)] font-black hover:border-[color:var(--ink)] transition-all"
                >
                  <Link2 size={18} />
                  複製連結
                </button>
                <button
                  onClick={onDownload}
                  className="inline-flex items-center gap-3 px-8 py-3 border border-[color:var(--ink)] text-[color:var(--ink)] font-black hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] transition-all"
                >
                  <Download size={20} />
                  下載卷軸
                </button>
              </div>
            )}
          </div>
          {(exportNotice || shareNotice) && (
            <p className="w-full text-center text-sm font-bold text-[color:var(--cinnabar-deep)] -mt-4 mb-6 break-all">
              {exportNotice || shareNotice}
            </p>
          )}

          <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-12 relative">
            <div className="xl:col-span-2 relative flex flex-col items-center overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] text-[650px] font-brush text-[color:var(--ink)]">
                理
              </div>
              <div className="w-full max-w-2xl relative z-10">
            <svg
              viewBox="0 0 600 750"
              className="w-full h-auto drop-shadow-2xl"
            >
              <polygon
                points="300,230 40,585 560,585"
                className="fill-white stroke-[#D32F2F] stroke-[3]"
                strokeLinejoin="round"
              />

              <line
                x1="213.5"
                y1="348"
                x2="386.5"
                y2="348"
                stroke="#D32F2F"
                strokeWidth="2.5"
              />
              <line
                x1="127"
                y1="466"
                x2="473"
                y2="466"
                stroke="#D32F2F"
                strokeWidth="2.5"
              />
              <line
                x1="300"
                y1="348"
                x2="300"
                y2="585"
                stroke="#D32F2F"
                strokeWidth="2.5"
              />

              <line
                x1="210"
                y1="218"
                x2="390"
                y2="218"
                stroke="#D32F2F"
                strokeWidth="2.5"
              />
              <line
                x1="15"
                y1="432"
                x2="125"
                y2="432"
                stroke="#D32F2F"
                strokeWidth="2.5"
              />
              <line
                x1="475"
                y1="432"
                x2="585"
                y2="432"
                stroke="#D32F2F"
                strokeWidth="2.5"
              />

              <text
                x="70"
                y="275"
                textAnchor="middle"
                className="text-[17px] font-black fill-black tracking-[0.1em] font-serif"
              >
                (工作、人際)
              </text>
              <text
                x="300"
                y="80"
                textAnchor="middle"
                className="text-[17px] font-black fill-black tracking-[0.1em] font-serif"
              >
                (事業、發展)
              </text>
              <text
                x="530"
                y="275"
                textAnchor="middle"
                className="text-[17px] font-black fill-black tracking-[0.1em] font-serif"
              >
                (家庭、財富)
              </text>
              <text
                x="101"
                y="542"
                textAnchor="middle"
                className="text-[16px] font-black fill-black tracking-wider font-serif"
              >
                動機
              </text>
              <text
                x="499"
                y="542"
                textAnchor="middle"
                className="text-[16px] font-black fill-black tracking-wider font-serif"
              >
                內在
              </text>

              <text
                x="300"
                y="160"
                textAnchor="middle"
                className="text-4xl font-serif font-black"
                style={{ fill: '#DAA520' }}
              >
                {r.R}
              </text>
              <text
                x="300"
                y="210"
                textAnchor="middle"
                className="text-3xl font-serif font-black fill-[#0B193C]"
                style={{ letterSpacing: '0.3em' }}
              >
                {r.P} {r.Q}
              </text>

              <text
                x="70"
                y="420"
                textAnchor="middle"
                className="text-3xl font-serif font-black"
              >
                <tspan fill="#0B193C">
                  {r.X}
                  {r.W}
                </tspan>
                <tspan fill="#0B193C">=</tspan>
                <tspan fill="#DAA520">{r.S}</tspan>
              </text>

              <text
                x="530"
                y="420"
                textAnchor="middle"
                className="text-3xl font-serif font-black"
              >
                <tspan fill="#0B193C">
                  {r.V}
                  {r.U}
                </tspan>
                <tspan fill="#0B193C">=</tspan>
                <tspan fill="#DAA520">{r.T}</tspan>
              </text>

              <text
                x="300"
                y="315"
                textAnchor="middle"
                className="text-5xl font-serif font-black fill-[#B22222]"
              >
                {r.O}
              </text>
              <text
                x="300"
                y="270"
                textAnchor="middle"
                className="text-[12px] font-bold tracking-widest uppercase fill-[#B22222]"
              >
                主性格
              </text>

              <text
                x="210"
                y="425"
                textAnchor="middle"
                className="text-4xl font-serif font-black fill-[#0B193C]"
              >
                {r.M}
              </text>
              <text
                x="390"
                y="425"
                textAnchor="middle"
                className="text-4xl font-serif font-black fill-[#0B193C]"
              >
                {r.N}
              </text>

              <text
                x="210"
                y="545"
                textAnchor="middle"
                className="text-4xl font-serif font-black fill-[#0B193C]"
                style={{ letterSpacing: '0.4em' }}
              >
                {r.I} {r.J}
              </text>
              <text
                x="390"
                y="545"
                textAnchor="middle"
                className="text-4xl font-serif font-black fill-[#0B193C]"
                style={{ letterSpacing: '0.4em' }}
              >
                {r.K} {r.L}
              </text>

              <g transform="translate(0, 45)">
                {[
                  { l: 'A', v: r.A, x: 120 },
                  { l: 'B', v: r.B, x: 170 },
                  { l: 'C', v: r.C, x: 220 },
                  { l: 'D', v: r.D, x: 270 },
                  { l: 'E', v: r.E, x: 330 },
                  { l: 'F', v: r.F, x: 380 },
                  { l: 'G', v: r.G, x: 430 },
                  { l: 'H', v: r.H, x: 480 },
                ].map((item) => (
                  <g key={item.l} transform={`translate(${item.x}, 562)`}>
                    <rect
                      x="-20"
                      y="-20"
                      width="40"
                      height="40"
                      fill="white"
                      stroke="#D32F2F"
                      strokeWidth="2"
                    />
                    <text
                      textAnchor="middle"
                      dy=".35em"
                      className="font-serif font-black text-2xl fill-[#0B193C]"
                    >
                      {item.v}
                    </text>
                  </g>
                ))}
                <text
                  x="145"
                  y="618"
                  textAnchor="middle"
                  className="text-[18px] font-black fill-black tracking-[0.2em] font-serif"
                >
                  日期
                </text>
                <text
                  x="245"
                  y="618"
                  textAnchor="middle"
                  className="text-[18px] font-black fill-black tracking-[0.2em] font-serif"
                >
                  月份
                </text>
                <text
                  x="405"
                  y="618"
                  textAnchor="middle"
                  className="text-[18px] font-black fill-black tracking-[0.2em] font-serif"
                >
                  出生年份
                </text>
              </g>
            </svg>
          </div>
        </div>

        <div className="space-y-10">
          <section className="bg-white rounded-3xl p-8 shadow-xl border-t-8 border-black ink-card flex flex-col items-center">
            <div className="relative w-48 h-52 flex items-center justify-center mb-4">
              <GourdIcon className="absolute inset-0 w-full h-full text-slate-100 opacity-50" />
              <div className="relative z-10 text-center">
                <div className="text-8xl font-black text-[#B22222] drop-shadow-sm leading-none">
                  {r.O}
                </div>
                <div className="text-xl font-black text-black mt-3 tracking-widest underline decoration-double decoration-slate-300">
                  {profile?.archetype}
                </div>
                <p className="text-sm text-slate-500 font-bold mt-2 italic">
                  {profile?.quote}
                </p>
              </div>
            </div>
            <div className="w-full h-px bg-slate-200 my-4"></div>
            <div className="text-[12px] text-slate-400 font-bold tracking-[0.5em] mb-4 uppercase">
              主要性格能量
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {profile?.keywords?.map((k) => (
                <span
                  key={k}
                  className="px-3 py-1 bg-black text-white text-xs font-black tracking-widest rounded-full"
                >
                  {k}
                </span>
              ))}
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl w-full border border-slate-100 flex justify-between items-center shadow-inner mb-3">
              <span className="text-slate-500 font-bold tracking-widest underline decoration-slate-200">
                世界觀
              </span>
              <span className="font-black text-black text-lg">
                {profile?.ideology}
              </span>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl w-full border border-slate-100 flex justify-between items-center shadow-inner">
              <span className="text-slate-500 font-bold tracking-widest underline decoration-slate-200">
                外心價值觀
              </span>
              <span className="font-black text-black text-lg">
                {r.outerHeartType}
              </span>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-200 text-center ink-card shadow-inner">
              <div className="text-[11px] font-black text-slate-500 tracking-[0.2em] mb-2 uppercase">
                起心動念
              </div>
              <div className="text-5xl font-black text-black">
                {r.motivation}
              </div>
            </div>
            <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-200 text-center ink-card shadow-inner">
              <div className="text-[11px] font-black text-slate-500 tracking-[0.2em] mb-2 uppercase">
                本源能量
              </div>
              <div className="text-5xl font-black text-black">{r.energy}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mt-12 pt-12 border-t-4 border-double border-slate-300">
        {[
          {
            area: `${r.I}${r.J}${r.M}`,
            title: '外顯性格',
            desc: '行為展現與初步印象',
            icon: <ImageIcon className="w-5 h-5" />,
          },
          {
            area: `${r.K}${r.L}${r.N}`,
            title: '內在性格',
            desc: '深層潛能與內在底色',
            icon: <Star className="w-5 h-5" />,
          },
          {
            area: `${r.M}${r.N}${r.O}`,
            title: '坐鎮碼',
            desc: '核心守護與生命重心',
            icon: <ShieldCheck className="w-5 h-5" />,
            highlight: true,
          },
          {
            area: `${r.Q}${r.P}${r.R}`,
            title: '事業運勢',
            desc: '成就高度與發展趨勢',
            icon: <Briefcase className="w-5 h-5" />,
            highlight: true,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-3xl border-2 flex flex-col items-center text-center ink-card ${
              item.highlight
                ? 'border-black bg-slate-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="bg-black text-white p-3 rounded-xl mb-4 shadow-lg">
              {item.icon}
            </div>
            <div className="text-xs font-black text-slate-400 tracking-[0.5em] mb-3 uppercase underline decoration-slate-300 decoration-2">
              {item.title}
            </div>
            <div className="text-4xl font-black tracking-[0.2em] mb-3 text-black">
              {item.area}
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed font-bold">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {profile && (
        <div className="w-full mt-16 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b-2 border-slate-800 pb-6">
            <div>
              <p className="text-xs font-black tracking-[0.4em] text-slate-400 mb-2 uppercase">
                {profile.english}
              </p>
              <h3 className="text-3xl md:text-4xl font-black tracking-[0.15em]">
                {r.O} 號人 · {profile.archetype}深度解析
              </h3>
            </div>
            <p className="text-slate-500 font-bold italic max-w-xl">
              {profile.quote}
            </p>
          </div>

          <section className="bg-white border-2 border-slate-800 rounded-3xl p-8 md:p-10 ink-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-black text-white p-2 rounded-xl">
                <BookOpen size={18} />
              </div>
              <h4 className="text-xl font-black tracking-widest">核心人格</h4>
            </div>
            {profile.bookTitle && (
              <p className="text-sm font-bold tracking-widest text-[color:var(--cinnabar)] mb-4">
                書中篇章：{profile.bookTitle}
              </p>
            )}
            <p className="text-lg leading-relaxed text-slate-700 font-medium">
              {profile.core}
            </p>
            {profile.bookInsight && (
              <p className="mt-5 text-sm font-bold leading-relaxed border-l-4 border-[#B22222] pl-4">
                書本洞見：{profile.bookInsight}
              </p>
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 ink-card">
              <div className="flex items-center gap-3 mb-5">
                <Sparkles className="text-emerald-700" size={22} />
                <h4 className="text-xl font-black tracking-widest text-emerald-900">
                  高能量 · 天賦發光時
                </h4>
              </div>
              <ul className="space-y-3">
                {profile.high.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-slate-800 font-bold"
                  >
                    <span className="mt-1 w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-8 ink-card">
              <div className="flex items-center gap-3 mb-5">
                <Target className="text-rose-700" size={22} />
                <h4 className="text-xl font-black tracking-widest text-rose-900">
                  低能量 · 卡住的時候
                </h4>
              </div>
              <ul className="space-y-3">
                {profile.low.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-slate-800 font-bold"
                  >
                    <span className="mt-1 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="bg-white border-2 border-slate-200 rounded-3xl p-8 ink-card">
              <div className="flex items-center gap-3 mb-5">
                <Briefcase size={20} />
                <h4 className="text-lg font-black tracking-widest">天賦職場</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.careers.map((c) => (
                  <span
                    key={c}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </section>
            <section className="bg-white border-2 border-slate-200 rounded-3xl p-8 ink-card">
              <div className="flex items-center gap-3 mb-5">
                <Users size={20} />
                <h4 className="text-lg font-black tracking-widest">相處之道</h4>
              </div>
              <ul className="space-y-3 mb-5">
                {profile.relate.map((item) => (
                  <li key={item} className="font-bold text-slate-700">
                    · {item}
                  </li>
                ))}
              </ul>
              <div className="bg-black text-white rounded-2xl px-4 py-3 text-sm font-black tracking-wider">
                一句話：{profile.oneLiner}
              </div>
            </section>
            <section className="bg-white border-2 border-slate-200 rounded-3xl p-8 ink-card">
              <div className="flex items-center gap-3 mb-5">
                <Compass size={20} />
                <h4 className="text-lg font-black tracking-widest">職場識別口吻</h4>
              </div>
              <p className="text-2xl font-black text-[#B22222] leading-relaxed">
                {profile.workplaceCue}
              </p>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-[color:var(--ink)] text-[#F7F1E6] rounded-sm p-8 border border-[color:var(--ink)]">
              <div className="flex items-center gap-3 mb-5">
                <Heart size={20} className="text-[#F5D76E]" />
                <h4 className="text-lg font-black tracking-widest text-[#F7F1E6]">
                  修行課題 · {profile.heart.name}
                </h4>
              </div>
              <p className="text-xl font-black mb-4 tracking-wide text-[#F7F1E6]">
                {profile.practice}
              </p>
              <p className="text-[#F5D76E] font-black mb-3 text-lg leading-relaxed">
                {profile.heart.mantra}
              </p>
              <p className="text-[#E8E0D2] leading-relaxed font-bold text-base">
                {profile.heart.why}
              </p>
            </section>
            {ideology && (
              <section className="bg-white border-2 border-slate-800 rounded-3xl p-8 ink-card">
                <div className="flex items-center gap-3 mb-5">
                  <Compass size={20} />
                  <h4 className="text-lg font-black tracking-widest">
                    三大主義 · {profile.ideology}
                  </h4>
                </div>
                <p className="text-sm font-black tracking-[0.3em] text-slate-400 mb-2">
                  對應數字 {ideology.numbers}
                </p>
                <p className="text-xl font-black mb-3">{ideology.focus}</p>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {ideology.desc}
                </p>
              </section>
            )}
          </div>

          <section className="bg-[#FDFCF8] border-2 border-dashed border-slate-300 rounded-3xl p-8 md:p-10">
            <h4 className="text-xl font-black tracking-widest mb-6">
              每天三分鐘，把修行變習慣
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {dailyPractices.map((item, idx) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-5 border border-slate-200"
                >
                  <div className="text-xs font-black text-slate-400 tracking-[0.3em] mb-2">
                    0{idx + 1}
                  </div>
                  <div className="font-black text-lg mb-2">{item.title}</div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-center font-black text-lg tracking-wide">
              給自己的一句話：我要練習「
              <span className="text-[#B22222]">{profile.heart.name}</span>
              」。
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reminders.map((item) => (
              <div
                key={item.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 ink-card"
              >
                <div className="font-black mb-2 tracking-widest">
                  {item.title}
                </div>
                <p className="text-sm text-slate-600 font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
        <div className="scroll-rod" aria-hidden="true" />
      </div>
    </div>
  );
}
