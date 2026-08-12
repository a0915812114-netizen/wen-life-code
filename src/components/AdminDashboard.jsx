import React, { useMemo, useState } from 'react';
import {
  Database,
  Download,
  FileText,
  Trash2,
  Search,
  BarChart3,
  Users,
  RefreshCw,
} from 'lucide-react';
import { numberProfiles } from '../data/numberProfiles';
import {
  aggregateLogs,
  buildSummaryReport,
  downloadTextFile,
  formatLogTime,
  getLogTime,
  logsToCsv,
  clearLocalLogs,
} from '../lib/queryLogs';

const PAGE_SIZE = 20;

export default function AdminDashboard({
  logs,
  firebaseReady,
  cloudConnected = false,
  cloudSyncError = '',
  adminEmail = '',
  onBack,
  onRefreshLocal,
}) {
  const [keyword, setKeyword] = useState('');
  const [mainFilter, setMainFilter] = useState('all');
  const [range, setRange] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const now = Date.now();
    return logs.filter((log) => {
      if (mainFilter !== 'all' && String(log.mainChar) !== String(mainFilter)) {
        return false;
      }
      if (range === '7d' && now - getLogTime(log) > 7 * 24 * 60 * 60 * 1000) {
        return false;
      }
      if (range === '30d' && now - getLogTime(log) > 30 * 24 * 60 * 60 * 1000) {
        return false;
      }
      if (keyword.trim()) {
        const q = keyword.trim().toLowerCase();
        const hay = `${log.name || ''} ${log.dob || ''} ${log.mainChar || ''} ${log.archetype || ''} ${log.outerChar || ''} ${log.innerChar || ''} ${log.guardingCode || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, keyword, mainFilter, range]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const stats = useMemo(() => aggregateLogs(filtered), [filtered]);
  const maxMain = Math.max(1, ...Object.values(stats.mainDist));

  const exportCsv = () => {
    const csv = '\uFEFF' + logsToCsv(filtered);
    downloadTextFile(
      `生命密碼查詢明細_${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      'text/csv;charset=utf-8',
    );
  };

  const exportSummary = () => {
    downloadTextFile(
      `生命密碼查詢彙整_${new Date().toISOString().slice(0, 10)}.txt`,
      buildSummaryReport(filtered),
    );
  };

  const exportJson = () => {
    downloadTextFile(
      `生命密碼查詢資料_${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(filtered, null, 2),
      'application/json;charset=utf-8',
    );
  };

  const handleClearLocal = () => {
    if (!window.confirm('確定清除本機查詢紀錄？雲端紀錄不會被刪除。')) return;
    clearLocalLogs();
    onRefreshLocal?.();
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] p-6 md:p-12 font-serif text-black ink-paper">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-3xl border-2 border-slate-800 ink-card shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-black text-white p-3 rounded-2xl">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">查詢彙整後台</h2>
              <p className="text-sm text-slate-500 font-bold mt-1">
                產出使用統計、名單明細與下載報告
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-black text-white rounded-full font-bold shadow-md"
          >
            返回首頁
          </button>
        </header>

        <div
          className={`rounded-2xl border-2 px-6 py-4 text-sm font-bold ${
            cloudSyncError
              ? 'border-rose-300 bg-rose-50 text-rose-800'
              : cloudConnected
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : firebaseReady
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-rose-300 bg-rose-50 text-rose-800'
          }`}
        >
          {cloudSyncError
            ? cloudSyncError
            : cloudConnected
              ? `已以管理員身份登入（${adminEmail}），正在讀取雲端查詢紀錄。`
              : firebaseReady
                ? 'Firebase 已設定，但尚未通過管理員登入；目前只顯示本機紀錄。雲端個資僅管理員可讀。'
                : '尚未設定 Firebase，目前僅本機紀錄可用。'}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '總查詢數', value: stats.total, icon: <BarChart3 size={18} /> },
            { label: '近 7 日', value: stats.recent7, icon: <RefreshCw size={18} /> },
            { label: '具名查詢', value: stats.withName, icon: <Users size={18} /> },
            {
              label: '熱門主性格',
              value: stats.topMainNumber
                ? `${stats.topMainNumber}號 ${numberProfiles[stats.topMainNumber]?.archetype || ''}`
                : '—',
              icon: <FileText size={18} />,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white border-2 border-slate-200 rounded-3xl p-5 ink-card"
            >
              <div className="flex items-center gap-2 text-slate-400 text-xs font-black tracking-[0.2em] mb-3">
                {card.icon}
                {card.label}
              </div>
              <div className="text-2xl md:text-3xl font-black break-words">
                {card.value}
              </div>
            </div>
          ))}
        </div>

        <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 ink-card">
          <h3 className="text-lg font-black tracking-widest mb-6">主性格分布</h3>
          <div className="space-y-3">
            {Object.entries(stats.mainDist).map(([n, count]) => (
              <div key={n} className="grid grid-cols-[72px_1fr_64px] gap-3 items-center">
                <div className="font-black text-sm">
                  {n} {numberProfiles[n]?.archetype}
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B22222] rounded-full transition-all"
                    style={{ width: `${(count / maxMain) * 100}%` }}
                  />
                </div>
                <div className="text-right font-black text-sm">
                  {count}
                  <span className="text-slate-400 font-bold text-xs ml-1">
                    ({stats.total ? Math.round((count / stats.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 ink-card">
            <h3 className="text-lg font-black tracking-widest mb-4">世界觀分布</h3>
            <div className="space-y-2">
              {Object.keys(stats.ideologyDist).length === 0 && (
                <p className="text-slate-400 font-bold">尚無資料</p>
              )}
              {Object.entries(stats.ideologyDist).map(([k, v]) => (
                <div key={k} className="flex justify-between font-bold border-b border-slate-100 py-2">
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 ink-card">
            <h3 className="text-lg font-black tracking-widest mb-4">外心價值觀分布</h3>
            <div className="space-y-2">
              {Object.keys(stats.outerHeartDist).length === 0 && (
                <p className="text-slate-400 font-bold">尚無資料</p>
              )}
              {Object.entries(stats.outerHeartDist).map(([k, v]) => (
                <div key={k} className="flex justify-between font-bold border-b border-slate-100 py-2">
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white border-2 border-slate-800 rounded-3xl p-6 ink-card space-y-4">
          <div className="flex flex-col xl:flex-row gap-4 xl:items-end xl:justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1">
                <label className="text-xs font-black text-slate-400 tracking-widest block mb-2">
                  搜尋
                </label>
                <div className="flex items-center gap-3 border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-black">
                  <Search size={18} className="text-slate-400" />
                  <input
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setPage(1);
                    }}
                    placeholder="姓名 / 生日 / 代碼"
                    className="w-full outline-none font-bold bg-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 tracking-widest block mb-2">
                  主性格
                </label>
                <select
                  value={mainFilter}
                  onChange={(e) => {
                    setMainFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold outline-none"
                >
                  <option value="all">全部</option>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} 號 {numberProfiles[n]?.archetype}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 tracking-widest block mb-2">
                  期間
                </label>
                <select
                  value={range}
                  onChange={(e) => {
                    setRange(e.target.value);
                    setPage(1);
                  }}
                  className="border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold outline-none"
                >
                  <option value="all">全部</option>
                  <option value="7d">近 7 日</option>
                  <option value="30d">近 30 日</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportSummary}
                className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white rounded-2xl font-black"
              >
                <FileText size={18} /> 下載彙整報告
              </button>
              <button
                onClick={exportCsv}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-black rounded-2xl font-black"
              >
                <Download size={18} /> 匯出 CSV
              </button>
              <button
                onClick={exportJson}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-300 rounded-2xl font-black"
              >
                <Download size={18} /> JSON
              </button>
              <button
                onClick={handleClearLocal}
                className="inline-flex items-center gap-2 px-5 py-3 bg-rose-50 text-rose-700 border-2 border-rose-200 rounded-2xl font-black"
              >
                <Trash2 size={18} /> 清本機
              </button>
            </div>
          </div>

          <div className="text-sm font-bold text-slate-500">
            符合 {filtered.length} / {logs.length} 筆｜第 {currentPage} / {totalPages} 頁（每頁 {PAGE_SIZE} 筆）
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-[11px] font-black uppercase tracking-[0.15em] border-b-2 border-slate-200">
                  <th className="px-5 py-4 text-slate-500">時間</th>
                  <th className="px-5 py-4">姓名</th>
                  <th className="px-5 py-4">生日</th>
                  <th className="px-5 py-4 text-center">主性格</th>
                  <th className="px-5 py-4">原型</th>
                  <th className="px-5 py-4 text-center">外顯</th>
                  <th className="px-5 py-4 text-center">內在</th>
                  <th className="px-5 py-4 text-center">坐鎮</th>
                  <th className="px-5 py-4">世界觀</th>
                  <th className="px-5 py-4">來源</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-slate-400 font-bold">
                      尚無符合條件的查詢紀錄。請先在前台按「開始解析」。
                    </td>
                  </tr>
                )}
                {pageRows.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-xs font-bold text-slate-400 whitespace-nowrap">
                      {formatLogTime(log)}
                    </td>
                    <td className="px-5 py-4 font-bold">{log.name}</td>
                    <td className="px-5 py-4 text-slate-500 font-mono tracking-tighter">
                      {log.dob}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="bg-slate-100 text-black px-2 py-1 rounded font-black border border-slate-300">
                        {log.mainChar}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold">
                      {log.archetype || numberProfiles[log.mainChar]?.archetype || '—'}
                    </td>
                    <td className="px-5 py-4 text-center font-bold">{log.outerChar}</td>
                    <td className="px-5 py-4 text-center font-bold">{log.innerChar}</td>
                    <td className="px-5 py-4 text-center font-bold text-slate-600">
                      {log.guardingCode}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-600">
                      {log.ideology || numberProfiles[log.mainChar]?.ideology || '—'}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-400">
                      {log.source === 'firebase' ? '雲端' : '本機'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-5 py-3 rounded-2xl border-2 border-slate-200 font-black disabled:opacity-40"
              >
                上一頁
              </button>
              <div className="text-sm font-bold text-slate-500">
                顯示第 {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} 筆
              </div>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-5 py-3 rounded-2xl border-2 border-slate-200 font-black disabled:opacity-40"
              >
                下一頁
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
