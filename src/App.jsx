import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar,
  RefreshCw,
  Star,
  Send,
  User,
  Download,
  Image as ImageIcon,
  Briefcase,
  ShieldCheck,
  LockKeyhole,
  Heart,
  Compass,
  Sparkles,
  Users,
  Target,
  BookOpen,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  numberProfiles,
  ideologyGuide,
  dailyPractices,
  reminders,
} from './data/numberProfiles';
import {
  buildLogEntry,
  computeLifeCode,
  loadLocalLogs,
  logFingerprint,
  mergeLogs,
  saveLocalLog,
} from './lib/queryLogs';
import AdminDashboard from './components/AdminDashboard';

function readGlobal(name) {
  try {
    return globalThis[name];
  } catch {
    return undefined;
  }
}

function resolveFirebaseConfig() {
  const injected = readGlobal('__firebase_config');
  if (typeof injected === 'string' && injected.trim()) {
    return JSON.parse(injected);
  }
  if (injected && typeof injected === 'object') {
    return injected;
  }
  const fromEnv = import.meta.env.VITE_FIREBASE_CONFIG;
  if (fromEnv) {
    return JSON.parse(fromEnv);
  }
  return null;
}

const firebaseConfig = resolveFirebaseConfig();
const appId =
  readGlobal('__app_id') ||
  import.meta.env.VITE_APP_ID ||
  'life-code-pro';

let app = null;
let auth = null;
let db = null;
const firebaseReady = Boolean(firebaseConfig?.apiKey);

if (firebaseReady) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const GourdIcon = ({ className = '' }) => (
  <svg viewBox="0 0 100 140" className={`fill-current ${className}`}>
    <path d="M50,15 C40,15 32,25 32,42 C32,55 40,62 44,68 C38,73 25,85 25,108 C25,128 35,138 50,138 C65,138 75,128 75,108 C75,85 62,73 56,68 C60,62 68,55 68,42 C68,25 60,15 50,15 Z" />
  </svg>
);

const App = () => {
  const todayStr = getTodayString();
  const [birthDate, setBirthDate] = useState(todayStr);
  const [userName, setUserName] = useState('');
  const [tempBirthDate, setTempBirthDate] = useState(todayStr);
  const [tempUserName, setTempUserName] = useState('');
  const [view, setView] = useState('user');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [cloudLogs, setCloudLogs] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const resultRef = useRef(null);
  const lastLoggedRef = useRef(null);
  const SECRET_KEY = 'gobbie403';

  const refreshLocalLogs = () => {
    const local = loadLocalLogs().map((item) => ({
      ...item,
      source: item.source || 'local',
    }));
    setLogs(mergeLogs(local, cloudLogs));
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.async = true;
    document.body.appendChild(script);

    if (!firebaseReady || !auth) {
      return () => {
        if (document.body.contains(script)) document.body.removeChild(script);
      };
    }

    const initAuth = async () => {
      try {
        const token = readGlobal('__initial_auth_token');
        if (token) {
          await signInWithCustomToken(auth, token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('驗證錯誤:', err);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => {
      unsubscribe();
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const r = useMemo(() => computeLifeCode(birthDate), [birthDate]);

  const profile = r ? numberProfiles[r.O] : null;
  const ideology = profile ? ideologyGuide[profile.ideology] : null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    setBirthDate(tempBirthDate);
    setUserName(tempUserName);

    const result = computeLifeCode(tempBirthDate);
    if (result) {
      const logKey = `${tempUserName || '未填寫'}-${tempBirthDate}-${result.O}`;
      if (lastLoggedRef.current !== logKey) {
        lastLoggedRef.current = logKey;
        const entry = buildLogEntry({
          name: tempUserName,
          dob: tempBirthDate,
          result,
        });
        saveLocalLog(entry);
        refreshLocalLogs();

        if (firebaseReady && db && auth) {
          try {
            if (!auth.currentUser) {
              await signInAnonymously(auth);
            }
            await addDoc(
              collection(db, 'artifacts', appId, 'public', 'data', 'analysis_logs'),
              {
                timestamp: serverTimestamp(),
                createdAt: entry.createdAt,
                dedupeKey: entry.dedupeKey,
                name: entry.name,
                dob: entry.dob,
                mainChar: entry.mainChar,
                archetype: entry.archetype,
                ideology: entry.ideology,
                outerChar: entry.outerChar,
                innerChar: entry.innerChar,
                guardingCode: entry.guardingCode,
                careerCode: entry.careerCode,
                outerHeartType: entry.outerHeartType,
                motivation: entry.motivation,
                energy: entry.energy,
              },
            );
          } catch (err) {
            console.error('雲端紀錄失敗:', err);
          }
        }
      }
    }

    setTimeout(() => setIsConfirming(false), 800);
  };

  const downloadImage = async () => {
    if (!resultRef.current || typeof window.html2canvas === 'undefined') return;
    setIsExporting(true);
    try {
      const canvas = await window.html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: '#FDFCF8',
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `生命靈數圖-${userName || '解析'}-${birthDate}.png`;
      link.click();
    } catch (err) {
      console.error('失敗:', err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const local = loadLocalLogs().map((item) => ({
      ...item,
      source: item.source || 'local',
    }));
    setLogs(mergeLogs(local, cloudLogs));
  }, [cloudLogs]);

  useEffect(() => {
    if (!firebaseReady || !db || view !== 'admin') return;
    const q = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'analysis_logs',
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const item = {
            id: docSnap.id,
            ...d,
            source: 'firebase',
            createdAt:
              d.createdAt ||
              (d.timestamp?.seconds ? d.timestamp.seconds * 1000 : Date.now()),
          };
          item.dedupeKey = d.dedupeKey || logFingerprint(item);
          return item;
        });
        setCloudLogs(data);
      },
      (err) => console.error('監聽失敗:', err),
    );
    return () => unsubscribe();
  }, [view]);

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminPassword === SECRET_KEY) {
      refreshLocalLogs();
      setView('admin');
      setLoginError(false);
    } else {
      setLoginError(true);
      setAdminPassword('');
    }
  };

  if (view === 'login')
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6 font-serif ink-paper">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border-4 border-double border-slate-800 max-w-md w-full text-center ink-card">
          <LockKeyhole className="text-slate-800 mx-auto mb-8" size={64} />
          <h2 className="text-2xl font-black text-slate-800 mb-2">權限驗證</h2>
          <form onSubmit={handleAdminAuth} className="space-y-6">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="輸入密碼"
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-800 outline-none text-center text-xl font-black"
            />
            {loginError && (
              <p className="text-sm font-bold text-red-600">密碼錯誤，請再試一次</p>
            )}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setView('user')}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                返回
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-black text-white rounded-2xl font-bold"
              >
                進入
              </button>
            </div>
          </form>
        </div>
      </div>
    );

  if (view === 'admin')
    return (
      <AdminDashboard
        logs={logs}
        firebaseReady={firebaseReady}
        onBack={() => {
          setView('user');
          setAdminPassword('');
        }}
        onRefreshLocal={refreshLocalLogs}
      />
    );

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center py-10 px-4 md:px-8 relative overflow-hidden font-serif text-black ink-paper">
      <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none ink-wash-bg"></div>
      <div className="w-full max-w-6xl z-10">
        <header className="mb-12 flex flex-col items-center text-center">
          <div className="inline-block bg-black text-white px-12 py-3 mb-6 relative shadow-lg">
            <h1 className="text-4xl md:text-5xl font-black tracking-[0.3em] uppercase">
              生命密碼解析
            </h1>
          </div>
          <p className="text-slate-500 text-sm tracking-[0.5em] flex items-center gap-3 font-bold underline decoration-slate-200 decoration-2">
            天賦人格研究院 ‧ 深度解讀
          </p>

          <div className="mt-12 flex flex-col items-center bg-white shadow-xl rounded-3xl p-8 border-2 border-slate-800 ink-card w-full">
            <div className="flex flex-col xl:flex-row items-end gap-10 px-4 w-full relative z-10">
              <div className="flex flex-col items-start gap-4 flex-1 w-full">
                <span className="text-xs font-black text-slate-400 tracking-[0.2em] border-l-4 border-black pl-3 uppercase">
                  姓名
                </span>
                <div className="flex items-center gap-6 bg-slate-50 rounded-2xl p-2 pr-6 border border-slate-200 w-full group focus-within:border-black transition-all">
                  <div className="bg-black text-white p-4 rounded-xl shadow-lg">
                    <User size={28} />
                  </div>
                  <input
                    type="text"
                    value={tempUserName}
                    onChange={(e) => setTempUserName(e.target.value)}
                    placeholder="姓名"
                    className="bg-transparent text-2xl font-black outline-none text-black border-none focus:ring-0 tracking-widest w-full placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div className="flex flex-col items-start gap-4 flex-1 w-full">
                <span className="text-xs font-black text-slate-400 tracking-[0.2em] border-l-4 border-black pl-3 uppercase">
                  出生日期(陽曆)
                </span>
                <div className="flex items-center gap-6 bg-slate-50 rounded-2xl p-2 pr-6 border border-slate-200 w-full group focus-within:border-black transition-all">
                  <div className="bg-black text-white p-4 rounded-xl shadow-lg">
                    <Calendar size={28} />
                  </div>
                  <input
                    type="date"
                    value={tempBirthDate}
                    onChange={(e) => setTempBirthDate(e.target.value)}
                    className="bg-transparent text-3xl font-black outline-none cursor-pointer text-black border-none focus:ring-0 tracking-tight w-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6 w-full xl:w-auto">
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className={`group flex-1 xl:flex-none relative flex items-center justify-center gap-4 px-12 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 border-b-4 ${
                    isConfirming
                      ? 'bg-emerald-600 border-emerald-800 text-white'
                      : 'bg-black border-slate-700 text-white hover:-translate-y-1'
                  }`}
                >
                  {isConfirming ? (
                    <span>演算中...</span>
                  ) : (
                    <>
                      <Send
                        size={24}
                        className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                      />
                      <span>開始解析</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const now = getTodayString();
                    setTempBirthDate(now);
                    setBirthDate(now);
                    setTempUserName('');
                    setUserName('');
                  }}
                  className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-300 hover:text-black hover:border-black shadow-md transition-all"
                >
                  <RefreshCw size={24} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {r && (
          <div
            ref={resultRef}
            className="flex flex-col gap-12 items-start justify-center mt-16 animate-in fade-in duration-1000 p-4 md:p-12 ink-paper-texture"
          >
            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-10 mb-8 border-b-2 border-slate-800 pb-8">
              <h2 className="text-4xl font-black text-black tracking-[0.2em]">
                {userName ? `「${userName}」命數全息圖` : '生命靈數圖'}
              </h2>
              {!isExporting && (
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-3 px-10 py-4 bg-white border-4 border-double border-black text-black rounded-xl font-black hover:bg-black hover:text-white transition-all shadow-xl active:scale-95 ink-card"
                >
                  <Download size={22} /> 下載卷軸
                </button>
              )}
            </div>

            <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-12 relative">
              <div className="xl:col-span-2 bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-slate-800 relative flex flex-col items-center overflow-hidden ink-card">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] text-[650px] font-black font-brush">
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
                      <tspan fill="#DAA520">{r.S}</tspan>
                      <tspan fill="#0B193C"> = </tspan>
                      <tspan fill="#0B193C">
                        {r.X} {r.W}
                      </tspan>
                    </text>

                    <text
                      x="530"
                      y="420"
                      textAnchor="middle"
                      className="text-3xl font-serif font-black"
                    >
                      <tspan fill="#DAA520">{r.T}</tspan>
                      <tspan fill="#0B193C"> = </tspan>
                      <tspan fill="#0B193C">
                        {r.V} {r.U}
                      </tspan>
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
                  <p className="text-lg leading-relaxed text-slate-700 font-medium">
                    {profile.core}
                  </p>
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
                  <section className="bg-slate-900 text-white rounded-3xl p-8 ink-card">
                    <div className="flex items-center gap-3 mb-5">
                      <Heart size={20} />
                      <h4 className="text-lg font-black tracking-widest">
                        修行課題 · {profile.heart.name}
                      </h4>
                    </div>
                    <p className="text-xl font-black mb-4 tracking-wide">
                      {profile.practice}
                    </p>
                    <p className="text-amber-300 font-bold mb-3">
                      {profile.heart.mantra}
                    </p>
                    <p className="text-slate-300 leading-relaxed font-medium">
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
                    這週給自己一句：我要練習「
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
        )}

        <footer className="mt-20 text-center pb-20 flex flex-col items-center">
          <p className="text-[12px] font-black text-slate-500 tracking-[1em] uppercase relative">
            生命靈數精
            <span className="relative inline-block">
              要
              {!isExporting && (
                <button
                  type="button"
                  onClick={() => setView('login')}
                  title="後台入口"
                  className="absolute left-1/2 top-full mt-3 -translate-x-1/2 text-slate-400 hover:text-black transition-all p-2 border-2 border-transparent hover:border-black rounded-full"
                >
                  <ShieldCheck size={22} />
                </button>
              )}
            </span>
            {' '}‧ 墨跡傳承
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
