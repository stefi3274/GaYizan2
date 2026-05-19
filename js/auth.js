// ════════════════════════════════
// AUTH
// ════════════════════════════════
sb.auth.onAuthStateChange(async (event, session) => {
  S.user = session?.user || null;
  if (S.user) {
    await loadProfile();
    await loadMyOrders();
    await loadReceivedOrders();
  } else {
    S.profile = { name:'', whatsapp:'', moncash:'', natcash:'', sales_count:0 };
    S.myOrders = [];
    S.receivedOrders = [];
  }
  updateAuthUI();
  if (event === 'SIGNED_IN') {
    toast('✅ Connecté !', 'success');
    closeModal('authModal');
    if (!S.profile.name) setTimeout(() => openOnboarding(), 600);
  }
  if (event === 'SIGNED_OUT') toast('Déconnecté');
});

function updateAuthUI() {
  const u = S.user;
  const logoutItem = document.getElementById('logoutItem');
  const authBanner = document.getElementById('authBanner');
  if (logoutItem) logoutItem.style.display = u ? 'flex' : 'none';
  if (authBanner) authBanner.style.display  = u ? 'none' : 'block';
  const name = S.profile.name || (u ? u.email?.split('@')[0] : '?');
  document.getElementById('avatarBtn').textContent = (name[0]||'?').toUpperCase();
}

function handleAvatarClick() { navigate('profile'); }
function openAuthModal() { document.getElementById('authModal').classList.add('open'); }

function switchAuthTab(tab) {
  document.getElementById('authSignup').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('authSignin').style.display = tab === 'signin'  ? 'block' : 'none';
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
  document.getElementById('tabSignin').classList.toggle('active',  tab === 'signin');
}

async function doSignUp() {
  const email = document.getElementById('signupEmail').value.trim();
  const pass  = document.getElementById('signupPass').value;
  if (!email || pass.length < 6) { toast('⚠️ Email valide + 6 caractères minimum', 'error'); return; }
  const btn = document.getElementById('signupBtn');
  btn.disabled = true; btn.textContent = 'Création…';
  const { error } = await sb.auth.signUp({ email, password: pass });
  btn.disabled = false; btn.textContent = 'Créer mon compte';
  if (error) { toast('❌ ' + error.message, 'error'); return; }
  closeModal('authModal');
  toast('✅ Compte créé ! Vérifie ton email.', 'success');
  setTimeout(() => switchAuthTab('signin'), 800);
}

async function doSignIn() {
  const email = document.getElementById('signinEmail').value.trim();
  const pass  = document.getElementById('signinPass').value;
  if (!email || !pass) { toast('⚠️ Remplis les deux champs', 'error'); return; }
  const btn = document.getElementById('signinBtn');
  btn.disabled = true; btn.textContent = 'Connexion…';
  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  btn.disabled = false; btn.textContent = 'Se connecter';
  if (error) { toast('❌ Email ou mot de passe incorrect', 'error'); }
}

async function doForgotPassword() {
  const email = document.getElementById('signinEmail').value.trim();
  if (!email) { toast('⚠️ Saisis ton email d\'abord', 'error'); return; }
  const { error } = await sb.auth.resetPasswordForEmail(email);
  if (error) { toast('❌ ' + error.message, 'error'); return; }
  toast('✅ Lien envoyé dans ta boîte mail !', 'success');
}

async function signOut() {
  await sb.auth.signOut();
  navigate('home');
}

function togglePwd(id, btn) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.textContent = input.type === 'password' ? '👁' : '🙈';
}