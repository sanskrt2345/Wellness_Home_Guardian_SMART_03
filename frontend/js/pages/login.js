// Page: Sign In / Register  ->  dashboard after success
// Always show the Login / Register screen when this page is opened.
// Successful authentication redirects to the dashboard below.
let mode = location.hash === '#register' ? 'register' : 'login';
let busy = false;

function authShell() {
  return `<div class="login"><div class="login-box">
    <div class="login-brand">
      <div class="login-mark">${I('shield')}</div>
      <h1>Sanatan Labs</h1>
      <div class="sub">SMART-03 Wellness Home Guardian</div>
    </div>
    <div class="auth-card">
      <div class="tabs" role="tablist">
        <button type="button" role="tab" id="loginTab">Sign In</button>
        <button type="button" role="tab" id="regTab">Register</button>
      </div>
      <form id="authForm" novalidate></form>
    </div>
    <p class="auth-foot">Wellness &amp; Ergonomic Assessment System · Not a Medical Device</p>
    <p class="auth-foot"><a class="login-back" href="${HOME}">&larr; Back to home</a></p>
  </div></div>`;
}

function authForm(reg, email) {
  return `
    <div class="field">
      <label for="email">Email</label>
      <div class="input-wrap">
        <span class="lead-ic">${I('mail')}</span>
        <input id="email" class="input" type="email" placeholder="you@example.com" autocomplete="email" value="${esc(email)}">
      </div>
    </div>
    <div class="field">
      <label for="password">Password</label>
      <div class="input-wrap">
        <span class="lead-ic">${I('lock')}</span>
        <input id="password" class="input" type="password" placeholder="••••••••" autocomplete="${reg ? 'new-password' : 'current-password'}">
        <button type="button" class="eye" id="eye" aria-label="Show password">${I('eye')}</button>
      </div>
      ${reg ? '<div class="field-hint">At least 6 characters</div>' : ''}
    </div>
    ${reg ? '' : `<div class="auth-row">
      <label class="check"><input type="checkbox" id="remember" checked><span>Remember me</span></label>
      <a href="#" class="forgot" id="forgot">Forgot password?</a>
    </div>`}
    <div class="auth-error" id="authError" role="alert"></div>
    <button class="btn btn-primary auth-submit" type="submit" id="submitBtn">${reg ? 'Create Account' : 'Sign In'}</button>`;
}

function setMode(next) {
  const keep = document.getElementById('email')?.value || state.email || '';
  mode = next;
  const reg = mode === 'register';
  document.getElementById('loginTab').classList.toggle('active', !reg);
  document.getElementById('regTab').classList.toggle('active', reg);
  document.getElementById('authForm').innerHTML = authForm(reg, keep);
  bindForm();
}

function showError(msg) {
  const el = document.getElementById('authError');
  el.textContent = msg;
  el.classList.toggle('show', !!msg);
}

function bindForm() {
  const pw = document.getElementById('password');
  const eye = document.getElementById('eye');
  eye.onclick = () => {
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    eye.innerHTML = I(show ? 'eyeOff' : 'eye');
    eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  };
  const forgot = document.getElementById('forgot');
  if (forgot) forgot.onclick = e => { e.preventDefault(); toast('Password reset is not available in this demo'); };
  document.getElementById('authForm').oninput = () => showError('');
}

function submitAuth(e) {
  e.preventDefault();
  if (busy) return;
  const reg = mode === 'register';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Enter a valid email address.');
  if (!password) return showError('Enter your password.');
  if (reg && password.length < 6) return showError('Password must be at least 6 characters.');

  busy = true;
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = reg ? 'Creating account…' : 'Signing in…';

  setTimeout(() => {
    const remember = reg || document.getElementById('remember')?.checked !== false;
    state.email = email;
    localStorage.setItem('whg_email', email);
    if (reg) {
      localStorage.setItem('whg_member', new Date().toLocaleDateString('en-GB'));
      state.userId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      localStorage.setItem('whg_userid', state.userId);
    }
    // Remember me: stay signed in after closing the browser, otherwise only for this tab session
    (remember ? localStorage : sessionStorage).setItem('whg_auth', '1');
    state.auth = true;
    toast(reg ? 'Account created' : 'Welcome back');
    navigate('/dashboard');
  }, 500);
}

function render() {
  document.getElementById('app').innerHTML = authShell();
  document.getElementById('loginTab').onclick = () => setMode('login');
  document.getElementById('regTab').onclick = () => setMode('register');
  document.getElementById('authForm').onsubmit = submitAuth;
  setMode(mode);
}
render();
