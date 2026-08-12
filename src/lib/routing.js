import { ENABLE_DUO } from './features';

export function readRoute() {
  const path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);

  if (path === '/atlas') return { view: 'atlas' };
  if (path === '/duo') return { view: ENABLE_DUO ? 'duo' : 'user' };
  if (path === '/triangle') return { view: 'triangle' };
  if (path === '/nine' || path === '/questions') return { view: 'nine' };
  if (path === '/login') return { view: 'login' };
  if (path === '/r' || path === '/share') {
    return {
      view: 'user',
      name: params.get('name') || '',
      dob: params.get('dob') || '',
      autoOpen: true,
    };
  }
  return { view: 'user' };
}

export function navigate(path) {
  if (window.location.pathname + window.location.search === path) {
    window.dispatchEvent(new Event('app:route'));
    return;
  }
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('app:route'));
}

export function buildShareUrl({ name, dob }) {
  const url = new URL('/r', window.location.origin);
  if (name?.trim()) url.searchParams.set('name', name.trim());
  if (dob) url.searchParams.set('dob', dob);
  return url;
}
