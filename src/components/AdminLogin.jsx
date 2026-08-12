import { LockKeyhole } from 'lucide-react';

export default function AdminLogin({
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  loginError,
  loginLoading,
  onSubmit,
  onBack,
}) {
  return (
    <div className="min-h-screen ink-paper flex items-center justify-center p-6 font-serif">
      <div className="scroll-stage max-w-md w-full anim-unfurl">
        <div className="scroll-rod" aria-hidden="true" />
        <div className="scroll-body text-center">
          <LockKeyhole className="text-[color:var(--ink)] mx-auto mb-6" size={48} />
          <h2 className="brand-mark text-4xl mb-2">管理員登入</h2>
          <p className="text-sm text-[color:var(--ink-soft)] font-bold mb-8 tracking-widest">
            書院後台 · Firebase 驗證
          </p>
          <form onSubmit={onSubmit} className="space-y-5 text-left">
            <label className="block">
              <span className="text-xs font-bold tracking-[0.28em] text-[color:var(--ink-soft)] mb-2 block">
                帳號 Email
              </span>
              <div className="field-line pb-2">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-transparent outline-none text-lg font-bold"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-bold tracking-[0.28em] text-[color:var(--ink-soft)] mb-2 block">
                密碼
              </span>
              <div className="field-line pb-2">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="輸入密碼"
                  className="w-full bg-transparent outline-none text-lg font-bold"
                  required
                />
              </div>
            </label>
            {loginError && (
              <p className="text-sm font-bold text-[color:var(--cinnabar)] text-center">
                {loginError}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3 border border-[color:var(--ink)]/25 font-bold"
              >
                返回
              </button>
              <button
                type="submit"
                disabled={loginLoading}
                className="flex-1 py-3 btn-cinnabar font-bold disabled:opacity-60"
              >
                {loginLoading ? '驗證中...' : '進入'}
              </button>
            </div>
          </form>
        </div>
        <div className="scroll-rod" aria-hidden="true" />
      </div>
    </div>
  );
}
