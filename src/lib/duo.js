import { numberProfiles } from '../data/numberProfiles';
import { reduce } from './queryLogs';

export function analyzeDuo(personA, personB) {
  const a = personA.result;
  const b = personB.result;
  if (!a || !b) return null;

  const o1 = a.O;
  const o2 = b.O;
  const p1 = numberProfiles[o1];
  const p2 = numberProfiles[o2];
  const bondCode = reduce(o1 + o2);
  const gap = Math.abs(o1 - o2);

  let vibe = '';
  let vibeDetail = '';
  if (o1 === o2) {
    vibe = '同頻共振';
    vibeDetail =
      '主性格相同，默契來得快，也容易一起放大同樣的優點與盲點。記得輪流當鏡子，而不是互相催促。';
  } else if (gap <= 2) {
    vibe = '相近互補';
    vibeDetail =
      '能量距離不遠，容易理解彼此節奏；適合一起做事，也適合互相補位。';
  } else if (gap <= 4) {
    vibe = '張力成長';
    vibeDetail =
      '差異帶來刺激與學習空間；衝突時先對齊目標，再談方法。';
  } else {
    vibe = '差異共學';
    vibeDetail =
      '世界觀與步調可能差很多，關係要靠明確溝通與尊重界線來維持溫度。';
  }

  const sameIdeology = p1?.ideology && p1.ideology === p2?.ideology;
  const tips = [
    `${personA.name || '甲方'}：${p1?.oneLiner || '給他空間與尊重'}`,
    `${personB.name || '乙方'}：${p2?.oneLiner || '給他空間與尊重'}`,
    sameIdeology
      ? `雙方同屬「${p1.ideology}」，價值觀容易對齊。`
      : `一方偏「${p1?.ideology || '—'}」、一方偏「${p2?.ideology || '—'}」，決策時先說清楚各自在意什麼。`,
    `合盤碼 ${bondCode}：把差異當成課題，而不是對錯裁判。`,
  ];

  return {
    o1,
    o2,
    bondCode,
    gap,
    vibe,
    vibeDetail,
    sameIdeology,
    ideologyA: p1?.ideology || '',
    ideologyB: p2?.ideology || '',
    archetypeA: p1?.archetype || '',
    archetypeB: p2?.archetype || '',
    tips,
  };
}
