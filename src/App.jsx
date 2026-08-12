import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar,
  RefreshCw,
  Send,
  User,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  numberProfiles,
  ideologyGuide,
} from './data/numberProfiles';
import {
  buildLogEntry,
  computeLifeCode,
  loadLocalLogs,
  logFingerprint,
  mergeLogs,
  saveLocalLog,
  toLogDocId,
} from './lib/queryLogs';
import {
  firebaseReady,
  auth,
  db,
  appId,
  DEFAULT_ADMIN_EMAIL,
  isAdminUser,
  getTodayString,
} from './lib/firebase';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import LifeCodeResult from './components/LifeCodeResult';
import NumberAtlas from './components/NumberAtlas';

const App = () => {
  const todayStr = getTodayString();
  const [birthDate, setBirthDate] = useState(todayStr);
  const [userName, setUserName] = useState('');
  const [tempBirthDate, setTempBirthDate] = useState(todayStr);
  const [tempUserName, setTempUserName] = useState('');
  const [view, setView] = useState('user');
  const [adminEmail, setAdminEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [cloudLogs, setCloudLogs] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [cloudSaveNotice, setCloudSaveNotice] = useState('');
  const [cloudSyncError, setCloudSyncError] = useState('');
  const [exportNotice, setExportNotice] = useState('');
  const [html2canvasReady, setHtml2canvasReady] = useState(
    () => typeof window !== 'undefined' && typeof window.html2canvas !== 'undefined',
  );

  const resultRef = useRef(null);
  const lastLoggedRef = useRef(null);

  const refreshLocalLogs = () => {
    const local = loadLocalLogs().map((item) => ({
      ...item,
      source: item.source || 'local',
    }));
    setLogs(mergeLogs(local, cloudLogs));
  };

  useEffect(() => {
    if (typeof window.html2canvas !== 'undefined') {
      setHtml2canvasReady(true);
    }

    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.async = true;
    script.onload = () => setHtml2canvasReady(true);
    script.onerror = () => setHtml2canvasReady(false);
    document.body.appendChild(script);

    if (!firebaseReady || !auth) {
      return () => {
        if (document.body.contains(script)) document.body.removeChild(script);
      };
    }

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
    setCloudSaveNotice('');
    setBirthDate(tempBirthDate);
    setUserName(tempUserName);
    setHasConfirmed(true);

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

        if (firebaseReady && db) {
          try {
            const docId = toLogDocId(entry.dedupeKey);
            await setDoc(
              doc(
                db,
                'artifacts',
                appId,
                'public',
                'data',
                'analysis_logs',
                docId,
              ),
              {
                timestamp: serverTimestamp(),
                createdAt: entry.createdAt,
                dedupeKey: entry.dedupeKey,
                name: entry.name.slice(0, 40),
                dob: entry.dob,
                mainChar: Number(entry.mainChar),
                archetype: String(entry.archetype || '').slice(0, 20),
                ideology: String(entry.ideology || '').slice(0, 20),
                outerChar: String(entry.outerChar || '').slice(0, 12),
                innerChar: String(entry.innerChar || '').slice(0, 12),
                guardingCode: String(entry.guardingCode || '').slice(0, 12),
                careerCode: String(entry.careerCode || '').slice(0, 12),
                outerHeartType: String(entry.outerHeartType || '').slice(0, 20),
                motivation: Number(entry.motivation),
                energy: Number(entry.energy),
              },
              { merge: true },
            );
          } catch (err) {
            console.error('雲端紀錄失敗:', err);
            setCloudSaveNotice('本機已儲存；雲端同步失敗，請稍後再試。');
          }
        }
      }
    }

    setTimeout(() => setIsConfirming(false), 800);
  };

  const downloadImage = async () => {
    if (!resultRef.current) return;
    setExportNotice('');
    if (typeof window.html2canvas === 'undefined') {
      setExportNotice(
        html2canvasReady
          ? '下載工具異常，請重新整理頁面後再試。'
          : '下載工具載入中，請稍候再試。',
      );
      return;
    }
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
      setExportNotice('下載失敗，請再試一次。');
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
    if (!firebaseReady || !db || view !== 'admin' || !isAdminUser(user)) {
      if (view === 'admin' && !isAdminUser(user)) {
        setCloudLogs([]);
      }
      if (view !== 'admin') {
        setCloudSyncError('');
      }
      return;
    }
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'analysis_logs'),
      orderBy('createdAt', 'desc'),
      limit(500),
    );
    setCloudSyncError('');
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
        setCloudSyncError('');
      },
      (err) => {
        console.error('監聽失敗:', err);
        setCloudLogs([]);
        setCloudSyncError(
          err?.code === 'failed-precondition'
            ? '雲端同步失敗：可能缺少索引，請稍後再試或聯繫管理員。'
            : '雲端同步失敗，目前只顯示本機紀錄。',
        );
      },
    );
    return () => unsubscribe();
  }, [view, user]);

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!firebaseReady || !auth) {
      setLoginError('Firebase 尚未就緒，無法登入後台。');
      return;
    }
    setLoginLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        adminEmail.trim(),
        adminPassword,
      );
      if (!isAdminUser(cred.user)) {
        await signOut(auth);
        setLoginError('此帳號沒有後台權限。');
        setAdminPassword('');
        return;
      }
      refreshLocalLogs();
      setView('admin');
      setAdminPassword('');
    } catch (err) {
      console.error(err);
      setLoginError('帳號或密碼錯誤，請再試一次。');
      setAdminPassword('');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminBack = async () => {
    setView('user');
    setAdminPassword('');
    setLoginError('');
    setCloudLogs([]);
    setCloudSyncError('');
    if (auth?.currentUser) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (view === 'login')
    return (
      <AdminLogin
        adminEmail={adminEmail}
        setAdminEmail={setAdminEmail}
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        loginError={loginError}
        loginLoading={loginLoading}
        onSubmit={handleAdminAuth}
        onBack={() => {
          setView('user');
          setLoginError('');
          setAdminPassword('');
        }}
      />
    );

  if (view === 'admin')
    return (
      <AdminDashboard
        logs={logs}
        firebaseReady={firebaseReady}
        cloudConnected={isAdminUser(user)}
        cloudSyncError={cloudSyncError}
        adminEmail={user?.email || ''}
        onBack={handleAdminBack}
        onRefreshLocal={refreshLocalLogs}
      />
    );

  if (view === 'atlas')
    return <NumberAtlas onBack={() => setView('user')} />;

  return (
    <div className="min-h-screen ink-paper flex flex-col items-center px-4 md:px-8 relative overflow-hidden font-serif text-[color:var(--ink)]">
      <div className="absolute inset-0 z-0 pointer-events-none ink-wash-bg" />
      <div className="w-full max-w-6xl z-10 flex flex-col items-center">
        <header className="w-full min-h-[100svh] flex flex-col items-center justify-center py-10 md:py-14">
          <div className="scroll-stage anim-unfurl">
            <div className="scroll-rod" aria-hidden="true" />
            <div className="scroll-body text-center">
              <div className="flex items-start justify-center gap-4 mb-6">
                <h1 className="brand-mark text-5xl md:text-7xl">生命靈數解析</h1>
                <span className="brand-seal anim-seal" aria-hidden="true">
                  悟
                </span>
              </div>
              <p className="anim-rise text-[color:var(--ink-soft)] text-sm md:text-base tracking-[0.35em] font-bold mb-10">
                天賦人格研究院 · 一卷解讀命數
              </p>
              <button
                type="button"
                onClick={() => setView('atlas')}
                className="anim-rise mb-10 inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-[color:var(--cinnabar)] hover:opacity-80 transition-opacity"
              >
                <BookOpen size={16} />
                瀏覽 1–9 號人格圖鑑
              </button>

              <div className="anim-rise grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-8 md:gap-10 items-end text-left">
                <label className="block w-full">
                  <span className="text-xs font-bold tracking-[0.28em] text-[color:var(--ink-soft)] mb-3 block">
                    姓名
                  </span>
                  <div className="field-line flex items-center gap-3 pb-2">
                    <User size={20} className="text-[color:var(--cinnabar)] shrink-0" />
                    <input
                      type="text"
                      value={tempUserName}
                      onChange={(e) => setTempUserName(e.target.value)}
                      placeholder="請輸入姓名"
                      className="bg-transparent text-xl md:text-2xl font-bold outline-none w-full tracking-widest placeholder:text-[color:var(--ink-soft)]/35"
                    />
                  </div>
                </label>

                <label className="block w-full">
                  <span className="text-xs font-bold tracking-[0.28em] text-[color:var(--ink-soft)] mb-3 block">
                    陽曆生日
                  </span>
                  <div className="field-line flex items-center gap-3 pb-2">
                    <Calendar size={20} className="text-[color:var(--cinnabar)] shrink-0" />
                    <input
                      type="date"
                      value={tempBirthDate}
                      onChange={(e) => setTempBirthDate(e.target.value)}
                      className="bg-transparent text-xl md:text-2xl font-bold outline-none w-full tracking-tight cursor-pointer"
                    />
                  </div>
                </label>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className={`group flex-1 md:flex-none inline-flex items-center justify-center gap-3 px-8 py-4 rounded-sm font-black text-lg ${
                      isConfirming ? 'btn-ink opacity-80' : 'btn-cinnabar'
                    }`}
                  >
                    {isConfirming ? (
                      <span>展卷中...</span>
                    ) : (
                      <>
                        <Send
                          size={20}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                        <span>展開卷軸</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="重置"
                    onClick={() => {
                      const now = getTodayString();
                      setTempBirthDate(now);
                      setBirthDate(now);
                      setTempUserName('');
                      setUserName('');
                      setHasConfirmed(false);
                      setCloudSaveNotice('');
                      setExportNotice('');
                      lastLoggedRef.current = null;
                    }}
                    className="p-3 text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] border border-transparent hover:border-[color:var(--ink)]/20 rounded-sm transition-all"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>

              {(cloudSaveNotice || exportNotice) && (
                <div className="mt-8 text-sm font-bold text-[color:var(--cinnabar-deep)] bg-[rgba(178,34,34,0.08)] border border-[rgba(178,34,34,0.25)] px-4 py-3">
                  {cloudSaveNotice || exportNotice}
                </div>
              )}
            </div>
            <div className="scroll-rod" aria-hidden="true" />
          </div>

          {!hasConfirmed && (
            <p className="mt-10 text-center text-[color:var(--ink-soft)] text-sm tracking-[0.28em] font-bold">
              填妥後展卷，方見命數全圖
            </p>
          )}
        </header>

        {hasConfirmed && r && (
          <LifeCodeResult
            resultRef={resultRef}
            userName={userName}
            r={r}
            profile={profile}
            ideology={ideology}
            isExporting={isExporting}
            html2canvasReady={html2canvasReady}
            exportNotice={exportNotice}
            onDownload={downloadImage}
          />
        )}

        <footer className="mt-16 text-center pb-16 flex flex-col items-center">
          <p className="text-[11px] font-bold text-[color:var(--ink-soft)] tracking-[0.8em] uppercase relative">
            生命靈數精
            <span className="relative inline-block">
              要
              {!isExporting && (
                <button
                  type="button"
                  onClick={() => setView('login')}
                  title="後台入口"
                  className="absolute left-1/2 top-full mt-3 -translate-x-1/2 text-[color:var(--ink-soft)] hover:text-[color:var(--cinnabar)] transition-all p-2"
                >
                  <ShieldCheck size={20} />
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
