import { numberProfiles } from '../data/numberProfiles';

const STORAGE_KEY = 'wen-life-code-query-logs-v1';

export function reduce(n) {
  // 兩位加總為 0 時（如年份 2000 的 0+0）以 5 計
  if (n === 0) return 5;
  return n % 9 === 0 ? 9 : n % 9;
}

export function computeLifeCode(birthDate) {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.split('-');
  const A = parseInt(day[0], 10) || 0;
  const B = parseInt(day[1], 10) || 0;
  const C = parseInt(month[0], 10) || 0;
  const D = parseInt(month[1], 10) || 0;
  const E = parseInt(year[0], 10) || 0;
  const F = parseInt(year[1], 10) || 0;
  const G = parseInt(year[2], 10) || 0;
  const H = parseInt(year[3], 10) || 0;
  const I = reduce(A + B);
  const J = reduce(C + D);
  const K = reduce(E + F);
  const L = reduce(G + H);
  const M = reduce(I + J);
  const N = reduce(K + L);
  const O = reduce(M + N);
  const P = reduce(M + O);
  const Q = reduce(N + O);
  const R = reduce(P + Q);
  const X = reduce(I + M);
  const W = reduce(J + M);
  const S = reduce(X + W);
  const V = reduce(K + N);
  const U = reduce(L + N);
  const T = reduce(V + U);
  const outerHeart = reduce(S + R + T);
  const outerHeartType =
    outerHeart === 3
      ? '理想主義者'
      : outerHeart === 6
        ? '現實主義者'
        : outerHeart === 9
          ? '遠見主義者'
          : '多樣價值觀';

  return {
    A, B, C, D, E, F, G, H,
    I, J, K, L, M, N, O, P, Q, R, S, T, X, W, V, U,
    motivation: M,
    energy: N,
    subconscious: reduce(O + I + L),
    innerHeart: reduce(O + M + N),
    outerHeart,
    outerHeartType,
    outerChar: `${I}${J}${M}`,
    innerChar: `${K}${L}${N}`,
    guardingCode: `${M}${N}${O}`,
    careerCode: `${Q}${P}${R}`,
    archetype: numberProfiles[O]?.archetype || '',
    ideology: numberProfiles[O]?.ideology || '',
  };
}

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function loadLocalLogs() {
  return readLocal().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function getLogTime(log) {
  if (log.createdAt) return log.createdAt;
  if (log.timestamp?.seconds) return log.timestamp.seconds * 1000;
  if (typeof log.timestamp === 'number') return log.timestamp;
  return 0;
}

/** 業務去重鍵：同姓名+生日+主性格，同一分鐘視為同一筆 */
export function logFingerprint(log, bucketMs = 60 * 1000) {
  const name = (log.name || '未填寫').trim();
  const dob = log.dob || '';
  const main = String(log.mainChar ?? '');
  const t = getLogTime(log);
  const bucket = t ? Math.floor(t / bucketMs) : 0;
  return `${name}|${dob}|${main}|${bucket}`;
}

/** Firestore 文件 ID（依 dedupeKey 穩定產生，供雲端 upsert 去重） */
export function toLogDocId(dedupeKey) {
  const raw = String(dedupeKey || '');
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  const safe = raw
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 48);
  return `log_${hex}_${safe || 'x'}`;
}

export function mergeLogs(primary = [], secondary = []) {
  const map = new Map();
  // 先本機、後雲端；相同指紋時優先保留雲端
  [...primary, ...secondary].forEach((item) => {
    const key = item.dedupeKey || logFingerprint(item);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, { ...item, dedupeKey: key });
      return;
    }
    if (item.source === 'firebase' || prev.source !== 'firebase') {
      map.set(key, {
        ...item,
        dedupeKey: key,
        source: item.source === 'firebase' ? 'firebase' : prev.source || item.source,
      });
    }
  });
  return [...map.values()].sort((a, b) => getLogTime(b) - getLogTime(a));
}

export function saveLocalLog(entry) {
  const logs = readLocal();
  const key = entry.dedupeKey || logFingerprint(entry);
  // 同一指紋已存在則不重複寫入
  if (logs.some((item) => (item.dedupeKey || logFingerprint(item)) === key)) {
    return logs;
  }
  const next = [{ ...entry, dedupeKey: key }, ...logs].slice(0, 2000);
  writeLocal(next);
  return next;
}

export function clearLocalLogs() {
  writeLocal([]);
}

export function formatLogTime(log) {
  const t = getLogTime(log);
  if (!t) return '—';
  return new Date(t).toLocaleString('zh-TW');
}

export function buildLogEntry({ name, dob, result }) {
  const createdAt = Date.now();
  const entry = {
    id: `local_${createdAt}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
    name: name?.trim() || '未填寫',
    dob,
    mainChar: result.O,
    archetype: result.archetype,
    ideology: result.ideology,
    outerChar: result.outerChar,
    innerChar: result.innerChar,
    guardingCode: result.guardingCode,
    careerCode: result.careerCode,
    outerHeartType: result.outerHeartType,
    motivation: result.motivation,
    energy: result.energy,
    source: 'local',
  };
  entry.dedupeKey = logFingerprint(entry);
  return entry;
}

export function aggregateLogs(logs = []) {
  const total = logs.length;
  const uniqueNames = new Set(logs.map((l) => l.name).filter((n) => n && n !== '未填寫')).size;
  const withName = logs.filter((l) => l.name && l.name !== '未填寫').length;

  const mainDist = {};
  const ideologyDist = {};
  const outerHeartDist = {};
  for (let i = 1; i <= 9; i++) mainDist[i] = 0;

  logs.forEach((log) => {
    const n = Number(log.mainChar);
    if (n >= 1 && n <= 9) mainDist[n] += 1;
    const ideo = log.ideology || numberProfiles[n]?.ideology || '未標示';
    ideologyDist[ideo] = (ideologyDist[ideo] || 0) + 1;
    const oh = log.outerHeartType || '未標示';
    outerHeartDist[oh] = (outerHeartDist[oh] || 0) + 1;
  });

  const topMain = Object.entries(mainDist)
    .sort((a, b) => b[1] - a[1])[0];

  const recent7 = logs.filter((l) => Date.now() - getLogTime(l) <= 7 * 24 * 60 * 60 * 1000).length;

  return {
    total,
    uniqueNames,
    withName,
    anonymous: total - withName,
    recent7,
    mainDist,
    ideologyDist,
    outerHeartDist,
    topMainNumber: topMain ? Number(topMain[0]) : null,
    topMainCount: topMain ? topMain[1] : 0,
  };
}

export function logsToCsv(logs = []) {
  const headers = [
    '時間',
    '姓名',
    '生日',
    '主性格',
    '原型',
    '世界觀',
    '外顯',
    '內在',
    '坐鎮',
    '事業',
    '外心價值觀',
    '起心動念',
    '本源能量',
    '來源',
  ];
  const rows = logs.map((log) => [
    formatLogTime(log),
    log.name || '',
    log.dob || '',
    log.mainChar ?? '',
    log.archetype || numberProfiles[log.mainChar]?.archetype || '',
    log.ideology || numberProfiles[log.mainChar]?.ideology || '',
    log.outerChar || '',
    log.innerChar || '',
    log.guardingCode || '',
    log.careerCode || '',
    log.outerHeartType || '',
    log.motivation ?? '',
    log.energy ?? '',
    log.source || '',
  ]);

  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
}

export function buildSummaryReport(logs = []) {
  const stats = aggregateLogs(logs);
  const lines = [
    '生命密碼查詢彙整報告',
    `產出時間：${new Date().toLocaleString('zh-TW')}`,
    '',
    `總查詢數：${stats.total}`,
    `近 7 日查詢：${stats.recent7}`,
    `具名查詢：${stats.withName}`,
    `匿名查詢：${stats.anonymous}`,
    `不重複姓名數：${stats.uniqueNames}`,
    stats.topMainNumber
      ? `最多主性格：${stats.topMainNumber} 號（${numberProfiles[stats.topMainNumber]?.archetype || ''}）共 ${stats.topMainCount} 次`
      : '最多主性格：—',
    '',
    '【主性格分布】',
    ...Object.entries(stats.mainDist).map(
      ([n, c]) =>
        `${n} 號 ${numberProfiles[n]?.archetype || ''}：${c}（${stats.total ? Math.round((c / stats.total) * 100) : 0}%）`,
    ),
    '',
    '【世界觀分布】',
    ...Object.entries(stats.ideologyDist).map(([k, c]) => `${k}：${c}`),
    '',
    '【外心價值觀分布】',
    ...Object.entries(stats.outerHeartDist).map(([k, c]) => `${k}：${c}`),
    '',
    '【明細】',
    ...logs.map(
      (log, idx) =>
        `${idx + 1}. ${formatLogTime(log)}｜${log.name}｜${log.dob}｜主${log.mainChar} ${log.archetype || ''}｜外顯${log.outerChar}｜內在${log.innerChar}｜坐鎮${log.guardingCode}`,
    ),
  ];
  return lines.join('\n');
}

export function downloadTextFile(filename, content, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
