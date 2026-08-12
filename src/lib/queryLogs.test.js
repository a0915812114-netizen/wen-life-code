import { describe, expect, it } from 'vitest';
import { computeLifeCode, reduce } from './queryLogs';

describe('reduce', () => {
  it('maps 0 to 5 by project rule', () => {
    expect(reduce(0)).toBe(5);
  });

  it('keeps 9 as 9', () => {
    expect(reduce(9)).toBe(9);
    expect(reduce(18)).toBe(9);
  });

  it('reduces other numbers mod 9', () => {
    expect(reduce(10)).toBe(1);
    expect(reduce(11)).toBe(2);
  });
});

describe('computeLifeCode', () => {
  it('returns null for empty input', () => {
    expect(computeLifeCode('')).toBeNull();
    expect(computeLifeCode(null)).toBeNull();
  });

  it('applies year 2000 0+0=5 rule', () => {
    const r = computeLifeCode('2000-01-01');
    expect(r).not.toBeNull();
    // year digits 2,0,0,0 → K=reduce(2+0)=2, L=reduce(0+0)=5
    expect(r.K).toBe(2);
    expect(r.L).toBe(5);
    expect(r.O).toBeGreaterThanOrEqual(1);
    expect(r.O).toBeLessThanOrEqual(9);
  });

  it('returns expected codes for a fixed birthday', () => {
    const r = computeLifeCode('1990-08-12');
    expect(r.outerChar).toMatch(/^\d{3}$/);
    expect(r.innerChar).toMatch(/^\d{3}$/);
    expect(r.guardingCode).toMatch(/^\d{3}$/);
    expect(r.careerCode).toMatch(/^\d{3}$/);
  });
});
