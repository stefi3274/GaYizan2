

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
    art:'🖼️ Beaux-Arts',
    photo:'📷 Photo & Vidéo',
    construction:'🏗️ Construction & BTP',
    animaux:'🐄 Animaux',
    musique:'🎵 Musique & Instruments',
    electrique:'💡 Matériel Électrique',
    bijoux:'💍 Bijoux & Accessoires',
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
 ['home','market','panier','profile','sales'].forEach(function(n) {
    const el = document.getElementById('nav-' + n);
    if (el) {
      var matches = (n === p) || (n === 'sales' && p === 'my-products');
      el.classList.toggle('active', matches);
    }
  });
  if (p==='home')        renderHome();
  if (p==='market')      renderMarket();
  if (p==='my-products') { renderMyProds(); renderReceivedOrders(); }
  if (p==='vendor-signup') loadVendorStatus();
  if (p==='profile')     renderProfile();
  if (p==='panier')      renderPanier();
  if (p==='infos') document.getElementById('infoContent').innerHTML = '';
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
  // Produits mis en avant
  const featured = S.products.filter(function(p) { return p.is_featured; });
  const featuredSection = document.getElementById('featuredSection');
  const featuredGrid = document.getElementById('featuredGrid');
  if (featuredSection && featuredGrid) {
    if (featured.length) {
      featuredSection.style.display = 'block';
      featuredGrid.innerHTML = featured.map(function(p) {
        return '<div class="prod-card" onclick="openDetail(' + p.id + ')">' +
          '<div class="prod-card-img">' + (p.image_url ? '<img src="' + p.image_url + '" style="width:100%;height:100%;object-fit:cover;"/>' : p.emoji) +
          '<span class="prod-card-badge" style="background:var(--gold);color:#fff;">⭐</span></div>' +
          '<div class="prod-card-body">' +
          '<div class="prod-card-name">' + esc(p.name) + '</div>' +
          '<div class="prod-card-seller">par ' + esc(p.seller||'—') + '</div>' +
          '<div class="prod-card-footer">' +
          '<div class="prod-card-price">' + formatPrice(p.price) + '</div>' +
          '<div class="prod-card-views">👁 ' + p.views + '</div>' +
          '</div></div></div>';
      }).join('');
    } else {
      featuredSection.style.display = 'none';
    }
  }
  // Produits récents
const all = S.homeCat === 'all' ? S.products : S.products.filter(function(p) { return p.cat === S.homeCat; });
const list = all.filter(function(p) { return p.image_url; });
  const grid = document.getElementById('homeGrid');
  if (!list.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;" class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Aucun produit</div><div class="empty-sub">Aucun produit dans cette categorie.</div></div>';
    return;
  }
  grid.innerHTML = list.slice(0,8).map(function(p) {
    return '<div class="prod-card" onclick="openDetail(' + p.id + ')">' +
      '<div class="prod-card-img">' + (p.image_url ? '<img src="' + p.image_url + '" style="width:100%;height:100%;object-fit:cover;"/>' : p.emoji) +
      '<span class="prod-card-badge">' + timeAgo(p.created_at) + '</span></div>' +
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
    (p.affiliation_active && S.user && !isOwn && S.profile.is_affiliate ? '<button class="btn btn-outline btn-full" style="margin-top:8px;" onclick="getAffiliateLink(' + p.id + ')">🔗 Obtenir mon lien d\'affiliation</button>' : '') +
    (p.affiliation_active && S.user && !isOwn && !S.profile.is_affiliate ? '<div style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;">💡 <a href="#" onclick="becomeAffiliate();return false;" style="color:var(--purple);font-weight:600;">Deviens affilié.e</a> pour partager ce produit et gagner 2%</div>' : '') +
    '</div>';
}// ════════════════════════════════
// PROFIL
// ════════════════════════════════
async function loadProfile() {
  if (!S.user) return;
  const res = await sb.from('profiles').select('*').eq('id', S.user.id).maybeSingle();
  if (res.error) { console.error('loadProfile:', res.error); return; }
  if (res.data) {
S.profile = { name: res.data.name||'', whatsapp: res.data.whatsapp||'', moncash: res.data.moncash||'', natcash: res.data.natcash||'', sales_count: res.data.sales_count||0, avatar_url: res.data.avatar_url||'', verification_status: res.data.verification_status||'', is_affiliate: res.data.is_affiliate||false, points_total: res.data.points_total||0 };
  renderProfileMenu();
  renderProfileMenu();
  } else {
    await sb.from('profiles').insert({ id: S.user.id, name:'', whatsapp:'', moncash:'', natcash:'', sales_count:0 });
  }
  renderProfile();
}
function renderProfile() {
  const name = S.profile.name || (S.user ? S.user.email.split('@')[0] : 'Mon Profil');
  document.getElementById('profileName').textContent = name;
var avEl = document.getElementById('profileAvatar');
if (S.profile.avatar_url) {
  avEl.innerHTML = '<img src="' + S.profile.avatar_url + '" style="width:100%;height:100%;object-fit:cover;border-radius:20px;"/>';
} else {
  avEl.textContent = (name[0]||'?').toUpperCase();
}
  document.getElementById('profileWa').textContent = S.profile.whatsapp ? formatPhone(S.profile.whatsapp) : 'Complete ton profil';
  const mine = S.products.filter(function(p) { return S.user && p.uid === S.user.id; });
  document.getElementById('statProd').textContent  = mine.length;
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
  var name = document.getElementById('editName').value.trim();
  var wa   = document.getElementById('editWa').value.trim();
  if (!name) { toast('Le nom ne peut pas etre vide', 'error'); return; }
  if (!wa)   { toast('Le numero WhatsApp est obligatoire', 'error'); return; }
  var update = {
    name: name,
    shop_name: (document.getElementById('editShopName') ? document.getElementById('editShopName').value.trim() || null : null),
    whatsapp: wa,
    moncash: document.getElementById('editMc').value.trim(),
    natcash: document.getElementById('editNc').value.trim()
  };
  var avatarFile = document.getElementById('editAvatar');
  if (avatarFile && avatarFile.files[0]) {
    var file = avatarFile.files[0];
    var ext = file.name.split('.').pop();
    var path = S.user.id + '.' + ext;
    var up = await sb.storage.from('avatars').upload(path, file, { upsert: true });
    if (!up.error) {
      var urlData = sb.storage.from('avatars').getPublicUrl(path);
      update.avatar_url = urlData.data.publicUrl;
    }
  }
  if (S.user) {
    var res = await sb.from('profiles').upsert(Object.assign({ id: S.user.id }, update));
    if (res.error) { toast('Erreur lors de la sauvegarde', 'error'); return; }
  }
  S.profile = Object.assign({}, S.profile, update);
  closeModal('editModal');
  renderProfile();
  toast('Profil mis a jour', 'success');
}
function openEditModal() {
  document.getElementById('editName').value = S.profile.name     || '';
  if (document.getElementById('editShopName')) document.getElementById('editShopName').value = S.profile.shop_name || '';
  document.getElementById('editWa').value   = S.profile.whatsapp || '';
  document.getElementById('editMc').value   = S.profile.moncash  || '';
  document.getElementById('editNc').value   = S.profile.natcash  || '';
  document.getElementById('editModal').classList.add('open');
}
function openOnboarding() {
  document.getElementById('onboardContent').innerHTML =
    '<div class="onboard-step">' +
    '<div class="onboard-icon">🎉</div>' +
    '<div class="onboard-title">Bienvenue sur Ga-izan !</div>' +
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
  const wa   = document.getElementById('onbWa').value.trim();
  if (!name) { toast('Le nom ne peut pas etre vide', 'error'); return; }
  if (!wa)   { toast('Le numero WhatsApp est obligatoire', 'error'); return; }
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
// ════════════════════════════════
// PAGE INFOS
// ════════════════════════════════
var GAIZAN_WA = '50955108873';

function showInfoSection(section) {
  var el = document.getElementById('infoContent');
  if (section === 'apropos') {
    el.innerHTML = '<div class="info-box"><h3 style="font-family:\'Playfair Display\',serif;margin-bottom:10px;">À propos de Ga-izan</h3>' +
      '<p style="line-height:1.7;color:var(--muted);">Ga-izan est une marketplace haïtienne qui connecte acheteurs et vendeurs partout dans le pays. Notre mission : permettre à chaque Haïtien.ne d\'acheter et vendre des produits locaux en toute confiance, avec le paiement mobile MonCash et NatCash.</p></div>';
  } else if (section === 'contact') {
    el.innerHTML = '<div class="info-box">' +
      '<h3 style="font-family:\'Playfair Display\',serif;margin-bottom:14px;">Nous contacter</h3>' +
      '<div class="field"><label>Ton nom *</label><input id="contactName" placeholder="Ton nom" maxlength="60"/></div>' +
      '<div class="field"><label>Objet *</label><input id="contactSubject" placeholder="Ex : Mettre un produit en avant" maxlength="80"/></div>' +
      '<div class="field"><label>Message *</label><textarea id="contactMsg" rows="4" placeholder="Ton message…" maxlength="500"></textarea></div>' +
      '<button class="btn btn-primary btn-full" onclick="sendContact()">Envoyer sur WhatsApp</button></div>';
} else if (section === 'legal') {
    el.innerHTML = '<div class="info-box"><h3 style="font-family:\'Playfair Display\',serif;margin-bottom:10px;">Mentions légales</h3>' +
      '<p style="line-height:1.7;color:var(--muted);">Ga-izan est une plateforme de mise en relation entre acheteurs et vendeurs. Les transactions et paiements sont effectués directement entre les parties, via MonCash ou NatCash. Ga-izan ne reçoit ni ne gère aucun paiement, et ne saurait être tenu responsable des litiges, fraudes ou défauts de paiement entre utilisateurs. En utilisant cette plateforme, vous acceptez ces conditions.</p>' +
      '<h3 style="font-family:\'Playfair Display\',serif;margin:22px 0 10px;">Programme d\'affiliation</h3>' +
      '<p style="line-height:1.7;color:var(--muted);">Le programme d\'affiliation permet à un utilisateur (l\'affilié) de promouvoir les produits d\'un vendeur ayant activé cette option, en échange d\'une commission de <strong>2% du prix de vente</strong> sur chaque vente qu\'il génère.</p>' +
      '<p style="line-height:1.7;color:var(--muted);margin-top:10px;"><strong>1. Activation.</strong> Seuls les produits dont le vendeur a explicitement activé l\'affiliation sont éligibles. Le vendeur peut activer ou désactiver cette option à tout moment.</p>' +
      '<p style="line-height:1.7;color:var(--muted);margin-top:10px;"><strong>2. Commission.</strong> La commission est fixée à 2% du prix affiché du produit vendu. Elle est due par le vendeur à l\'affilié uniquement lorsqu\'une vente est effectivement réalisée et confirmée grâce au lien de l\'affilié.</p>' +
      '<p style="line-height:1.7;color:var(--muted);margin-top:10px;"><strong>3. Paiement.</strong> Le paiement de la commission se fait directement entre le vendeur et l\'affilié, via MonCash ou NatCash. Ga-izan ne perçoit, ne retient ni ne verse aucune commission. Ga-izan fournit uniquement un outil de suivi indicatif des ventes générées.</p>' +
      '<p style="line-height:1.7;color:var(--muted);margin-top:10px;"><strong>4. Suivi.</strong> Le suivi des ventes affiliées est fourni à titre indicatif. Bien que Ga-izan s\'efforce d\'assurer son exactitude, il ne constitue pas une preuve juridique et peut comporter des erreurs.</p>' +
      '<p style="line-height:1.7;color:var(--muted);margin-top:10px;"><strong>5. Bonne foi et litiges.</strong> Le programme repose sur la bonne foi des parties. En cas de litige, de fraude ou d\'abus (faux clics, ventes fictives, non-paiement répété), Ga-izan se réserve le droit de trancher, de suspendre ou d\'exclure définitivement tout compte concerné, sans préavis.</p>' +
      '<p style="line-height:1.7;color:var(--muted);margin-top:10px;"><strong>6. Responsabilité.</strong> Ga-izan agit comme simple intermédiaire technique. Il ne garantit aucun revenu à l\'affilié, ni aucun volume de ventes au vendeur, et décline toute responsabilité en cas de désaccord sur le paiement des commissions.</p>' +
      '<p style="line-height:1.7;color:var(--muted);margin-top:10px;">En activant l\'affiliation ou en devenant affilié, vous reconnaissez avoir lu et accepté l\'ensemble de ces conditions.</p>' +
      '<p style="line-height:1.7;color:var(--muted);margin-top:22px;">Tous droits réservés · SteFi Services</p></div>';
  }
}
function sendContact() {
  var name = document.getElementById('contactName').value.trim();
  var subject = document.getElementById('contactSubject').value.trim();
  var msg = document.getElementById('contactMsg').value.trim();
  if (!name || !subject || !msg) { toast('Remplis tous les champs', 'error'); return; }
  var text = encodeURIComponent('Bonjour Ga-izan !\n\nNom : ' + name + '\nObjet : ' + subject + '\n\n' + msg);
  window.open('https://wa.me/' + GAIZAN_WA + '?text=' + text, '_blank');
}
// ════════════════════════════════
// INSTALLATION PWA
// ════════════════════════════════
var deferredPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
  var b = document.getElementById('installBtnHeader');
  if (b) b.style.display = 'flex';
});
function installPWA() {
  if (!deferredPrompt) { toast('Utilise le menu du navigateur pour installer', 'error'); return; }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(function() {
    deferredPrompt = null;
    var b = document.getElementById('installBtnHeader');
    if (b) b.style.display = 'none';
  });
}
window.addEventListener('appinstalled', function() {
  var b = document.getElementById('installBtnHeader');
  if (b) b.style.display = 'none';
});
// ════════════════════════════════
// MENU PROFIL DYNAMIQUE
// ════════════════════════════════
function renderProfileMenu() {
  var el = document.getElementById('profileMenuList');
  if (!el) return;
  var isVerified = S.profile.verification_status === 'verified';
  var isAffiliate = S.profile.is_affiliate === true;
  var isLoggedIn = !!S.user;
  var html = '';
  // 1. Espace Vendeur / Devenir Vendeur
  if (isVerified) {
    html += '<div class="menu-item menu-espace" onclick="navigate(\'my-products\')">' +
      '<div class="menu-icon violet" style="background:var(--purple);"><svg viewBox="0 0 24 24" fill="white"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8L6 7h12l-2-4z"/></svg></div>' +
      '<div class="menu-text"><div class="menu-label">Espace Vendeur</div><div class="menu-sub" style="color:#7C3AED;">Gérer mes produits & commandes reçues 🛍️</div></div>' +
      '<span class="menu-arrow">›</span></div>';
  } else {
    html += '<div class="menu-item menu-vendeur" onclick="navigate(\'vendor-signup\')">' +
      '<div class="menu-icon green" style="background:#059669;"><svg viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="12" y1="11" x2="12" y2="17" stroke="white" stroke-width="1.8"/><line x1="9" y1="14" x2="15" y2="14" stroke="white" stroke-width="1.8"/></svg></div>' +
      '<div class="menu-text"><div class="menu-label">Devenir Vendeur/Vendeuse</div><div class="menu-sub" style="color:#059669;">Rejoins la communauté et commence à vendre 🌟</div></div>' +
      '<span class="menu-arrow">›</span></div>';
  }
  // 2. Mes achats
  html += '<div class="menu-item menu-achats" onclick="navigate(\'panier\')">' +
    '<div class="menu-icon blue" style="background:#2563EB;"><svg viewBox="0 0 24 24" fill="white"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6" stroke="white" stroke-width="1.8"/><path d="M16 10a4 4 0 01-8 0" fill="none" stroke="white" stroke-width="1.8"/></svg></div>' +
    '<div class="menu-text"><div class="menu-label">Mes achats</div><div class="menu-sub" style="color:#2563EB;">Retrouve toutes tes commandes ici 📦</div></div>' +
    '<span class="menu-arrow">›</span></div>';

  // 3. Marketing d affiliation / Espace Affilié
  if (isAffiliate) {
    html += '<div class="menu-item menu-affilie" id="affiliateMenuItem" onclick="navigate(\'affiliations\')">' +
      '<div class="menu-icon yellow" style="background:#D97706;"><svg viewBox="0 0 24 24" fill="white"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="white" stroke-width="1.8"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="white" stroke-width="1.8"/></svg></div>' +
      '<div class="menu-text"><div class="menu-label">Espace Affilié</div><div class="menu-sub" style="color:#D97706;">Mes points, mes liens & mes gains 💰</div></div>' +
      '<span class="menu-arrow">›</span></div>';
  } else {
    html += '<div class="menu-item menu-affilie" id="affiliateMenuItem" onclick="becomeAffiliate()">' +
      '<div class="menu-icon yellow" style="background:#D97706;"><svg viewBox="0 0 24 24" fill="white"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="white" stroke-width="1.8"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="white" stroke-width="1.8"/></svg></div>' +
      '<div class="menu-text"><div class="menu-label">Marketing d\'affiliation</div><div class="menu-sub" style="color:#D97706;">Partage & gagne 2% sur chaque vente générée ✨</div></div>' +
      '<span class="menu-arrow">›</span></div>';
  }
  // 4. Modifier le profil
  html += '<div class="menu-item menu-edit" onclick="openEditModal()">' +
    '<div class="menu-icon purple-main" style="background:linear-gradient(135deg,var(--purple),var(--purple-l));"><svg viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>' +
    '<div class="menu-text"><div class="menu-label">Modifier le profil</div><div class="menu-sub" style="color:var(--purple);">Nom, boutique, WhatsApp, MonCash, NatCash 🖊️</div></div>' +
    '<span class="menu-arrow">›</span></div>';
  // 5. Infos & Contact
  html += '<div class="menu-item menu-infos" onclick="navigate(\'infos\')">' +
    '<div class="menu-icon gold" style="background:#B45309;"><svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12" stroke="white" stroke-width="1.8"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="white" stroke-width="1.8"/></svg></div>' +
    '<div class="menu-text"><div class="menu-label">Infos & Contact</div><div class="menu-sub" style="color:#B45309;">À propos, nous contacter, mentions légales 📋</div></div>' +
    '<span class="menu-arrow">›</span></div>';
  // 6. Se déconnecter (si connecté)
  if (isLoggedIn) {
    html += '<div class="menu-item menu-logout" id="logoutItem" onclick="signOut()">' +
      '<div class="menu-icon red-icon" style="background:#DC2626;"><svg viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="white" stroke-width="1.8"/><polyline points="16 17 21 12 16 7" stroke="white" stroke-width="1.8" fill="none"/><line x1="21" y1="12" x2="9" y2="12" stroke="white" stroke-width="1.8"/></svg></div>' +
      '<div class="menu-text"><div class="menu-label" style="color:var(--red);">Se déconnecter</div><div class="menu-sub" style="color:var(--red);">À bientôt sur Ga-izan 👋</div></div>' +
      '<span class="menu-arrow">›</span></div>';
  }
  el.innerHTML = html;
}
// ════════════════════════════════
// AFFILIATION — LIEN & CLICS
// ════════════════════════════════
async function getAffiliateLink(productId) {
  if (!S.user || !S.profile.is_affiliate) {
    toast('Tu dois être affilié.e pour obtenir un lien', 'error');
    return;
  }
  var link = 'https://gaizanmarket.com?ref=' + S.user.id + '&produit=' + productId;
  // Copier dans le presse-papier
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(function() {
      toast('🔗 Lien copié ! Partage-le pour gagner des points', 'success');
    });
  } else {
    window.prompt('Copie ce lien :', link);
  }
}
async function trackAffiliateClick(affiliateId, productId) {
  // Fingerprint visiteur (éviter doublons)
  var fp = localStorage.getItem('ga_visitor');
  if (!fp) {
    fp = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
    localStorage.setItem('ga_visitor', fp);
  }
  // Stocker l'affilié dans localStorage pour suivi futur (inscription vendeur, etc.)
  localStorage.setItem('ga_ref', affiliateId);
  localStorage.setItem('ga_ref_time', Date.now());
  // Enregistrer le clic
  var res = await sb.from('affiliate_clicks').insert([{
    affiliate_id: affiliateId,
    product_id: productId ? parseInt(productId) : null,
    visitor_fingerprint: fp
  }]);
  if (!res.error) {
    // Créditer 0.5 point à l'affilié
    await sb.from('affiliate_points').insert([{
      affiliate_id: affiliateId,
      points: 0.5,
      reason: 'Clic sur lien affilié'
    }]);
    await sb.from('profiles')
      .update({ points_total: sb.raw('points_total + 0.5') })
      .eq('id', affiliateId);
  }
}
function checkAffiliateParams() {
  var params = new URLSearchParams(window.location.search);
  var ref = params.get('ref');
  var produit = params.get('produit');
  if (ref) {
    trackAffiliateClick(ref, produit);
    // Si un produit est spécifié, l'ouvrir directement
    if (produit && S.products.length) {
      var p = S.products.find(function(x) { return String(x.id) === String(produit); });
      if (p) { showDetail(p.id); }
    }
    // Nettoyer l'URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}
// ════════════════════════════════
// DEVENIR AFFILIÉ
// ════════════════════════════════
async function becomeAffiliate() {
  if (!S.user) {
    toast('Connecte-toi pour devenir affilié', 'error');
    setTimeout(function() { openAuthModal(); }, 800);
    return;
  }
  if (S.profile.is_affiliate) {
    navigate('infos');
    setTimeout(function() { showInfoSection('contact'); }, 100);
    toast('Tu es déjà affilié.e !', 'success');
    return;
  }
  var ok = confirm('Devenir affilié.e te permet de partager des produits et de gagner 2% sur chaque vente que tu génères.\n\nEn acceptant, tu reconnais avoir lu et accepté les Conditions du programme d\'affiliation (voir Mentions légales).\n\nConfirmer ?');
  if (!ok) return;
  var res = await sb.from('profiles')
    .update({ is_affiliate: true })
    .eq('id', S.user.id);
  if (res.error) { toast('Erreur : ' + res.error.message, 'error'); return; }
  S.profile.is_affiliate = true;
  toast('🎉 Tu es maintenant affilié.e !', 'success');
}




