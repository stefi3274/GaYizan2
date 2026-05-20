// ════════════════════════════════
// UTILS
// ════════════════════════════════
function catLabel(c) {
  return {
    vetement:'👕 Vêtements & Mode',
    chaussures:'👟 Chaussures & Accessoires',
    electronique:'📱 Électronique & Téléphones',
    maison:'🏠 Maison & Décoration',
    alimentation:'🛒 Alimentation & Épicerie',
    beaute:'💄 Beauté & Cosmétiques',
    auto:'🚗 Auto & Moto',
    agriculture:'🌿 Agriculture & Jardinage',
    jouets:'🎮 Jeux & Jouets',
    sport:'🏋️ Sport & Fitness',
    formation:'📚 Cours & Formation',
    digital:'💾 Produits digitaux',
    services:'🔧 Services & Réparation',
    artisanat:'🎨 Art & Artisanat',
    photo:'📷 Photo & Vidéo',
    construction:'🏗️ Construction & BTP',
    animaux:'🐄 Animaux',
    musique:'🎵 Musique & Instruments',
    divers:'📦 Divers',
    others:'🌐 Others',
  }[c] || c;
}
function formatPrice(p) {
  if (!p && p !== 0) return '—';
  return parseInt(p).toLocaleString('fr-HT') + ' HTG';
}
function formatPhone(n) {
  if (!n) return '';
  n = n.replace(/\s/g,'');
  if (n.startsWith('+509') && n.length === 12)
    return n.slice(0,4) + ' ' + n.slice(4,8) + ' ' + n.slice(8);
  return n;
}
function statusChip(s) {
  if (s==='confirmed') return '<span class="chip chip-green">Confirme</span>';
  if (s==='cancelled') return '<span class="chip chip-red">Annule</span>';
  return '<span class="chip chip-orange">En attente</span>';
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
}
function timeAgo(d) {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return 'Instant';
  if (diff < 3600) return Math.floor(diff/60) + ' min';
  if (diff < 86400) return Math.floor(diff/3600) + 'h';
  return Math.floor(diff/86400) + 'j';
}
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}// ════════════════════════════════
// NAVIGATION
// ════════════════════════════════
function navigate(p) {
  if (p === S.page) return;
  S.prev = S.page; S.page = p;
  document.querySelectorAll('.page').forEach(function(x) { x.classList.remove('active'); });
  document.getElementById('page-' + p).classList.add('active');
  ['home','market','panier','profile'].forEach(function(n) {
    const el = document.getElementById('nav-' + n);
    if (el) el.classList.toggle('active', n === p);
  });
  if (p==='home')        renderHome();
  if (p==='market')      renderMarket();
  if (p==='my-products') { renderMyProds(); renderReceivedOrders(); }
  if (p==='profile')     renderProfile();
  if (p==='panier')      renderPanier();
  window.scrollTo({ top:0, behavior:'smooth' });
}
function goBack() { navigate(S.prev || 'home'); }

// ════════════════════════════════
// TOAST / MODAL
// ════════════════════════════════
let toastTimer;
function toast(msg, type) {
  type = type || '';
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' '+type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.classList.remove('show'); }, 2800);
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.modal-overlay').forEach(function(o) {
    o.addEventListener('click', function(e) { if (e.target===o) o.classList.remove('open'); });
  });
});// ════════════════════════════════
// HOME
// ════════════════════════════════
function filterHomeCat(el, cat) {
  document.querySelectorAll('#homeCats .cat-pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active'); S.homeCat = cat; renderHome();
}
function renderHome() {
  const list = S.homeCat === 'all' ? S.products : S.products.filter(function(p) { return p.cat === S.homeCat; });
  const grid = document.getElementById('homeGrid');
  if (!list.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;" class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Aucun produit</div></div>';
    return;
  }
  grid.innerHTML = list.slice(0,8).map(function(p) {
    return '<div class="prod-card" onclick="openDetail(' + p.id + ')">' +
      '<div class="prod-card-img">' + p.emoji + '<span class="prod-card-badge">' + timeAgo(p.created_at) + '</span></div>' +
      '<div class="prod-card-body">' +
      '<div class="prod-card-name">' + esc(p.name) + '</div>' +
      '<div class="prod-card-seller">par ' + esc(p.seller||'—') + '</div>' +
      '<div class="prod-card-footer">' +
      '<div class="prod-card-price">' + formatPrice(p.price) + '</div>' +
      '<div class="prod-card-views">👁 ' + p.views + '</div>' +
      '</div></div></div>';
  }).join('');
}

// ════════════════════════════════
// MARKET
// ════════════════════════════════
function filterMktCat(el, cat) {
  document.querySelectorAll('#marketCats .cat-pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active'); S.mktCat = cat; renderMarket();
}
function renderMarket() {
  const q = (document.getElementById('searchInput') ? document.getElementById('searchInput').value : '').toLowerCase().trim();
  let list = S.products;
  if (S.mktCat !== 'all') list = list.filter(function(p) { return p.cat === S.mktCat; });
  if (q) list = list.filter(function(p) {
    return p.name.toLowerCase().includes(q) ||
      (p.desc||'').toLowerCase().includes(q) ||
      (p.seller||'').toLowerCase().includes(q);
  });
  const countEl = document.getElementById('marketCount');
  if (countEl) countEl.innerHTML = '<strong>' + list.length + '</strong> resultat' + (list.length>1?'s':'');
  const el = document.getElementById('marketList');
  if (!list.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Aucun resultat</div></div>';
    return;
  }
  el.innerHTML = list.map(function(p) {
    return '<div class="prod-row" onclick="openDetail(' + p.id + ')">' +
      '<div class="prod-row-img">' + p.emoji + '</div>' +
      '<div class="prod-row-info">' +
      '<div class="prod-row-name">' + esc(p.name) + '</div>' +
      '<div class="prod-row-desc">' + esc((p.desc||'').substring(0,100)) + '</div>' +
      '<div class="prod-row-footer">' +
      '<div class="prod-row-price">' + formatPrice(p.price) + '</div>' +
      '<div class="prod-row-meta">' +
      '<div class="prod-row-seller-av">' + (p.seller||'?')[0].toUpperCase() + '</div>' +
      '<span style="font-size:11px;color:var(--muted2);">' + esc(p.seller||'—') + '</span>' +
      '</div></div></div></div>';
  }).join('');
}// ════════════════════════════════
// DETAIL
// ════════════════════════════════
async function openDetail(id) {
  const p = S.products.find(function(x) { return x.id === id; });
  if (!p) return;
  S.detailId = id;
  navigate('detail');

  if (S.user && S.user.id !== p.uid) {
    sb.from('product_views')
      .insert({ product_id: id, viewer_id: S.user.id })
      .then(async function(res) {
        if (!res.error) {
          await sb.from('products').update({ views: p.views + 1 }).eq('id', id);
          p.views += 1;
        }
      });
  }

  const hasMc = p.mc && p.mc.trim();
  const hasNc = p.nc && p.nc.trim();
  const isOwn = S.user && S.user.id === p.uid;

  document.getElementById('detailContent').innerHTML =
    '<div class="detail-img">' + p.emoji +
    '<div class="detail-views">👁 ' + p.views + ' vue' + (p.views>1?'s':'') + '</div></div>' +
    '<span class="chip chip-purple">' + catLabel(p.cat) + '</span>' +
    '<div class="gap-sm"></div>' +
    '<div class="detail-title">' + esc(p.name) + '</div>' +
    '<div class="detail-price-row">' +
    '<div class="detail-price">' + parseInt(p.price).toLocaleString('fr-FR') + '</div>' +
    '<div class="detail-currency">HTG</div></div>' +
    '<div class="detail-desc">' + esc(p.desc||'') + '</div>' +
    '<div class="seller-card">' +
    '<div class="seller-av">' + (p.seller||'?')[0].toUpperCase() + '</div>' +
    '<div><div class="seller-name">' + esc(p.seller||'—') + '</div>' +
    '<div class="seller-meta">Publie ' + fmtDate(p.created_at) + '</div></div></div>' +
    '<div class="detail-actions">' +
    (isOwn ? '<div class="pay-warning">C\'est ton propre produit.</div>' : '') +
    (!isOwn && (hasMc||hasNc) ? '<button class="btn btn-gold btn-full" onclick="openPayFlow(' + p.id + ')">Proceder au paiement</button>' : '') +
    (!isOwn ? '<button class="btn btn-primary btn-full" onclick="openWA(\'' + p.phone + '\',\'' + encodeURIComponent(p.name) + '\',\'' + formatPrice(p.price) + '\')">Contacter sur WhatsApp</button>' : '') +
    '<button class="btn btn-ghost btn-full" onclick="goBack()">Retour</button>' +
    '</div>';
}// ════════════════════════════════
// PROFIL
// ════════════════════════════════
async function loadProfile() {
  if (!S.user) return;
  const res = await sb.from('profiles').select('*').eq('id', S.user.id).maybeSingle();
  if (res.error) { console.error('loadProfile:', res.error); return; }
  if (res.data) {
    S.profile = { name: res.data.name||'', whatsapp: res.data.whatsapp||'', moncash: res.data.moncash||'', natcash: res.data.natcash||'', sales_count: res.data.sales_count||0 };
  } else {
    await sb.from('profiles').insert({ id: S.user.id, name:'', whatsapp:'', moncash:'', natcash:'', sales_count:0 });
  }
  renderProfile();
}

function renderProfile() {
  const name = S.profile.name || (S.user ? S.user.email.split('@')[0] : 'Mon Profil');
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileAvatar').textContent = (name[0]||'?').toUpperCase();
  document.getElementById('profileWa').textContent = S.profile.whatsapp ? formatPhone(S.profile.whatsapp) : 'Complete ton profil';
  const mine = S.products.filter(function(p) { return S.user && p.uid === S.user.id; });
  document.getElementById('statProd').textContent  = mine.length;
  document.getElementById('statSales').textContent = S.profile.sales_count || 0;
  document.getElementById('statViews').textContent = mine.reduce(function(a,p) { return a+(p.views||0); }, 0);
  const wrap = document.getElementById('completeBannerWrap');
  if (S.user && !isProfileComplete()) {
    wrap.innerHTML = '<div class="complete-banner"><div class="complete-banner-icon">⚠️</div><div class="complete-banner-body"><div class="complete-banner-title">Profil incomplet</div><div class="complete-banner-sub">Ajoute ton nom et WhatsApp pour vendre.</div></div><button class="btn btn-gold btn-sm" onclick="openEditModal()">Completer</button></div>';
  } else { wrap.innerHTML = ''; }
  updateAuthUI();
}

function isProfileComplete() { return !!(S.profile.name && S.profile.whatsapp); }

async function saveProfile() {
  const name = document.getElementById('editName').value.trim();
  const wa   = document.getElementById('editWa').value.trim();
  if (!name) { toast('Le nom ne peut pas etre vide', 'error'); return; }
  if (!wa)   { toast('Le numero WhatsApp est obligatoire', 'error'); return; }
  const update = { name: name, whatsapp: wa, moncash: document.getElementById('editMc').value.trim(), natcash: document.getElementById('editNc').value.trim() };
  if (S.user) {
    const res = await sb.from('profiles').upsert(Object.assign({ id: S.user.id }, update));
    if (res.error) { toast('Erreur lors de la sauvegarde', 'error'); return; }
  }
  S.profile = Object.assign({}, S.profile, update);
  closeModal('editModal');
  renderProfile();
  toast('Profil mis a jour', 'success');
}

function openEditModal() {
  document.getElementById('editName').value = S.profile.name     || '';
  document.getElementById('editWa').value   = S.profile.whatsapp || '';
  document.getElementById('editMc').value   = S.profile.moncash  || '';
  document.getElementById('editNc').value   = S.profile.natcash  || '';
  document.getElementById('editModal').classList.add('open');
}

function openOnboarding() {
  document.getElementById('onboardContent').innerHTML =
    '<div class="onboard-step">' +
    '<div class="onboard-icon">🎉</div>' +
    '<div class="onboard-title">Bienvenue sur GAyizan !</div>' +
    '<div class="onboard-sub">Configure ton profil en 30 secondes.</div>' +
    '<div class="onboard-progress"><div class="onboard-dot active"></div><div class="onboard-dot"></div></div>' +
    '</div>' +
    '<div class="field"><label>Nom *</label><input id="onbName" placeholder="Jean Pierre" maxlength="40"/></div>' +
    '<div class="field"><label>WhatsApp *</label><input id="onbWa" placeholder="+509 XXXX XXXX" type="tel" maxlength="16"/></div>' +'<div class="field-row">' +
    '<div class="field" style="margin-bottom:0;"><label>MonCash</label><input id="onbMc" placeholder="+509 XXXX XXXX" type="tel" maxlength="16"/></div>' +
    '<div class="field" style="margin-bottom:0;"><label>NatCash</label><input id="onbNc" placeholder="+509 XXXX XXXX" type="tel" maxlength="16"/></div>' +
    '</div>' +
    '<div class="gap-md"></div>' +
    '<button class="btn btn-primary btn-full" onclick="saveOnboarding()">Terminer</button>' +
    '<button style="background:none;border:none;color:var(--muted2);font-size:12px;cursor:pointer;width:100%;margin-top:12px;text-align:center;" onclick="closeModal(\'onboardModal\')">Plus tard</button>';
  document.getElementById('onboardModal').classList.add('open');
}

async function saveOnboarding() {
  const name = document.getElementById('onbName').value.trim();
  const wa   = document.getElementById('onbWa').value.trim();
  if (!name) { toast('Le nom ne peut pas etre vide', 'error'); return; }
  if (!wa)   { toast('Le numero WhatsApp est obligatoire', 'error'); return; }
  const update = { name: name, whatsapp: wa, moncash: document.getElementById('onbMc').value.trim(), natcash: document.getElementById('onbNc').value.trim() };
  if (S.user) {
    const res = await sb.from('profiles').upsert(Object.assign({ id: S.user.id }, update));
    if (res.error) { toast('Erreur lors de la sauvegarde', 'error'); return; }
  }
  S.profile = Object.assign({}, S.profile, update);
  closeModal('onboardModal');
  renderProfile();
  toast('Profil configure !', 'success');
}