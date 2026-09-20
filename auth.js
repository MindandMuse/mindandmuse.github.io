const SUPABASE_URL = 'https://yqkenojjfergqfslbpts.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_8lZ1sx8R_-p9aryao9IrtA_XqRWEHSm';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

function setMessage(message, type='') {
  const el = document.getElementById('auth-message');
  if (!el) return;
  el.textContent = message;
  el.className = 'auth-message ' + type;
}

async function handleSignup() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-password-confirm').value;
  if (!name || !email || !password || !confirmPassword) return setMessage('Please complete all fields.', 'error');
  if (password !== confirmPassword) return setMessage('Passwords do not match. Please try again.', 'error');;
  if (password.length < 6) return setMessage('Your password must be at least 6 characters.', 'error');
  const { error } = await supabaseClient.auth.signUp({
    email, password,
    options: { data: { full_name: name }, emailRedirectTo: window.location.origin + '/account.html' }
  });
  if (error) return setMessage(error.message, 'error');
  setMessage('Account created. Please check your email to confirm your account, then log in.', 'success');
  document.getElementById('signup-form').reset();
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return setMessage(error.message, 'error');
  window.location.href = 'account.html';
}

async function handleReset() {
  const email = document.getElementById('reset-email').value.trim();
  if (!email) return setMessage('Please enter your email address.', 'error');
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/auth.html?reset=1'
  });
  if (error) return setMessage(error.message, 'error');
  setMessage('Password reset instructions have been sent to your email.', 'success');
}

async function updatePassword() {
  const password = document.getElementById('new-password').value;
  if (password.length < 6) return setMessage('Your password must be at least 6 characters.', 'error');
  const { error } = await supabaseClient.auth.updateUser({ password });
  if (error) return setMessage(error.message, 'error');
  setMessage('Your password has been updated. You can now log in.', 'success');
  document.getElementById('reset-panel').style.display='none';
  document.getElementById('login-panel').style.display='block';
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('signup-form')?.addEventListener('submit', e => { e.preventDefault(); handleSignup(); });
  document.getElementById('login-form')?.addEventListener('submit', e => { e.preventDefault(); handleLogin(); });
  document.getElementById('reset-form')?.addEventListener('submit', e => { e.preventDefault(); handleReset(); });
  document.getElementById('new-password-form')?.addEventListener('submit', e => { e.preventDefault(); updatePassword(); });
  document.getElementById('show-reset')?.addEventListener('click', () => {
    document.getElementById('login-panel').style.display='none';
    document.getElementById('signup-panel').style.display='none';
    document.getElementById('reset-panel').style.display='block';
    setMessage('');
  });
  document.getElementById('show-login')?.addEventListener('click', () => {
    document.getElementById('reset-panel').style.display='none';
    document.getElementById('signup-panel').style.display='none';
    document.getElementById('login-panel').style.display='block';
    setMessage('');
  });

  const { data: { session } } = await supabaseClient.auth.getSession();
  const isReset = new URLSearchParams(window.location.search).has('reset');
  if (session && !isReset) window.location.href='account.html';
  if (isReset) {
    document.getElementById('login-panel').style.display='none';
    document.getElementById('signup-panel').style.display='none';
    document.getElementById('reset-panel').style.display='block';
    document.getElementById('new-password-form').style.display='block';
  }
});
