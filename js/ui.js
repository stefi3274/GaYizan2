

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
  if (p==='home')        renderHome();
  if (p==='market')      renderMarket();
  if (p==='my-products') { renderMyProds(); if (typeof renderReceivedOrders === "function") renderReceivedOrders(); }
  if (p==='vendor-signup') loadVendorStatus();
  if (p==='profile')     renderProfile();
  if (p==='panier')      renderPanier();
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
// ════════════════════════════════
// MODAL EDIT PROFIL
// ════════════════════════════════
function openEditModal() {
  if (document.getElementById('editName')) document.getElementById('editName').value = S.profile.name || '';
  if (document.getElementById('editShopName')) document.getElementById('editShopName').value = S.profile.shop_name || '';
  if (document.getElementById('editWa')) document.getElementById('editWa').value = S.profile.whatsapp || '';
  if (document.getElementById('editMc')) document.getElementById('editMc').value = S.profile.moncash || '';
  if (document.getElementById('editNc')) document.getElementById('editNc').value = S.profile.natcash || '';
  document.getElementById('editModal').classList.add('open');
}
async function saveProfile(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  if (e && e.preventDefault) e.preventDefault();
  var name = document.getElementById('editName') ? document.getElementById('editName').value.trim() : '';
  var wa   = document.getElementById('editWa') ? document.getElementById('editWa').value.trim() : '';
  if (!name) { toast('Le nom ne peut pas etre vide', 'error'); return; }
  if (!wa)   { toast('Le numero WhatsApp est obligatoire', 'error'); return; }
  var update = {
    name: name,
    shop_name: document.getElementById('editShopName') ? (document.getElementById('editShopName').value.trim() || null) : null,
    whatsapp: wa,
    moncash: document.getElementById('editMc') ? document.getElementById('editMc').value.trim() : '',
    natcash: document.getElementById('editNc') ? document.getElementById('editNc').value.trim() : ''
  };
  var avatarFile = document.getElementById('editAvatar');
  if (avatarFile && avatarFile.files[0]) {
    var file = avatarFile.files[0];
    var ext = file.name.split('.').pop();
    var path = S.user.id + '/avatar.' + ext;
    var upRes = await sb.storage.from('avatars').upload(path, file, { upsert: true });
    if (!upRes.error) {
      var urlRes = sb.storage.from('avatars').getPublicUrl(path);
      if (urlRes.data) update.avatar_url = urlRes.data.publicUrl;
    }
  }
  if (S.user) {
    var res = await sb.from('profiles').update(update).eq('id', S.user.id);
    if (res.error) { toast('Erreur : ' + res.error.message, 'error'); return; }
  }
  S.profile = Object.assign({}, S.profile, update);
  closeModal('editModal');
  renderProfile();
  toast('Profil mis a jour !', 'success');
  renderProfileMenu();
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.modal-overlay').forEach(function(o) {
    o.addEventListener('click', function(e) {
      if (e.target === o) o.classList.remove('open');
    });
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
          '<div class="prod-card-seller">par ' + esc(p.seller||'—') + (p.verified ? ' <span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;background:var(--purple);border-radius:50%;color:#fff;font-size:8px;font-weight:700;margin-left:3px;">✓</span>' : '') + '</div>' +
          '<div class="prod-card-footer">' +
          '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;">' + promoPriceHtml(p,'13px') + (hasPromo(p) ? promoBadgeHtml(p) : '') + '</div>' +
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
      '<div class="prod-card-seller">par ' + esc(p.seller||'—') + (p.verified ? ' <span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;background:var(--purple);border-radius:50%;color:#fff;font-size:8px;font-weight:700;margin-left:3px;">✓</span>' : '') + '</div>' +
      '<div class="prod-card-footer">' +
      '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;">' + promoPriceHtml(p,'13px') + (hasPromo(p) ? promoBadgeHtml(p) : '') + '</div>' +
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
      '<div class="prod-row-img">' + (p.image_url ? '<img src="' + p.image_url + '" style="width:100%;height:100%;object-fit:cover;border-radius:var(--r);"/>' : p.emoji) + '</div>' +
      '<div class="prod-row-info">' +
      '<div class="prod-row-name">' + esc(p.name) + '</div>' +
      '<div class="prod-row-desc">' + esc((p.desc||'').substring(0,100)) + '</div>' +
      '<div class="prod-row-footer">' +
      '<div>' + promoPriceHtml(p,'14px') + (hasPromo(p) ? promoBadgeHtml(p) : '') + '</div>' +
      '<div class="prod-row-meta">' +
      '<div class="prod-row-seller-av">' + (p.seller||'?')[0].toUpperCase() + '</div>' +
      '<span style="font-size:11px;color:var(--muted2);">' + esc(p.seller||'—') + '</span>' +
      (p.location ? '<span style="font-size:10px;color:var(--muted2);margin-left:6px;">📍 ' + esc(p.location) + '</span>' : '') +
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
    '<div class="detail-img" style="position:relative;overflow:hidden;border-radius:var(--r-xl);">' +
    (p.image_url ? '<img src="' + p.image_url + '" style="width:100%;height:100%;object-fit:cover;"/>' : '<span style="font-size:70px;">' + p.emoji + '</span>') +
    '<div class="detail-views">👁 ' + p.views + ' vue' + (p.views>1?'s':'') + '</div></div>' +
    (p.image_url_2 || p.image_url_3 ? '<div style="display:flex;gap:8px;margin-bottom:12px;overflow-x:auto;">' +
    '<img src="' + p.image_url + '" style="width:80px;height:80px;object-fit:cover;border-radius:10px;flex-shrink:0;border:2px solid var(--purple);"/>' +
    (p.image_url_2 ? '<img src="' + p.image_url_2 + '" style="width:80px;height:80px;object-fit:cover;border-radius:10px;flex-shrink:0;border:2px solid var(--border);" onclick="this.style.borderColor=\'var(--purple)\';document.querySelector(\'.detail-img img\').src=this.src;"/>' : '') +
    (p.image_url_3 ? '<img src="' + p.image_url_3 + '" style="width:80px;height:80px;object-fit:cover;border-radius:10px;flex-shrink:0;border:2px solid var(--border);" onclick="this.style.borderColor=\'var(--purple)\';document.querySelector(\'.detail-img img\').src=this.src;"/>' : '') +
    '</div>' : '') +
    '<span class="chip chip-purple">' + catLabel(p.cat) + '</span>' +
    '<div class="gap-sm"></div>' +
    '<div class="detail-title">' + esc(p.name) + '</div>' +
    '<div class="detail-price-row">' +
    '<div class="detail-price">' + parseInt(p.price).toLocaleString('fr-FR') + '</div>' +
    '<div class="detail-currency">HTG</div></div>' +
    '<div class="detail-desc">' + esc(p.desc||'') + '</div>' +
    '<div class="seller-card">' +
    '<div class="seller-av">' + (p.seller||'?')[0].toUpperCase() + '</div>' +
    '<div><div class="seller-name">' + esc(p.seller||'—') + (p.verified ? ' <span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;background:var(--purple);border-radius:50%;color:#fff;font-size:10px;font-weight:700;margin-left:4px;">✓</span>' : '') + '</div>' +
    '<div class="seller-meta">Publie ' + fmtDate(p.created_at) + '</div>' + (p.location ? '<div style="font-size:12px;color:var(--muted2);margin-top:2px;">📍 ' + esc(p.location) + '</div>' : '') + '</div></div>' +
    '<div class="detail-actions">' +
    (isOwn ? '<div class="pay-warning">C\'est ton propre produit.</div>' : '') +
    (!isOwn && (hasMc||hasNc) ? '<button class="btn btn-gold btn-full" onclick="openPayFlow(' + p.id + ')">Proceder au paiement</button>' : '') +
    (!isOwn ? '<button class="btn btn-primary btn-full" onclick="openWA(\'' + p.phone + '\',\'' + encodeURIComponent(p.name) + '\',\'' + formatPrice(p.price) + '\')">Contacter sur WhatsApp</button>' : '') +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">' +
    '<button id="likeBtn_' + p.id + '" class="btn btn-ghost" style="flex:1;" onclick="toggleLike(' + p.id + ')">❤️ <span id="likeCount_' + p.id + '">0</span> J\'aime</button>' +
    (!isOwn ? '<button class="btn btn-ghost" style="font-size:12px;color:var(--muted);" onclick="signalerProduit(' + p.id + ',\'' + p.uid + '\')">⚠️ Signaler</button>' : '') +
    '</div>' +
    '<button class="btn btn-ghost btn-full" onclick="goBack()">Retour</button>' +
    (p.affiliation_active && S.user && !isOwn && S.profile.is_affiliate ? '<button class="btn btn-outline btn-full" style="margin-top:8px;" onclick="getAffiliateLink(' + p.id + ')">🔗 Obtenir mon lien d\'affiliation</button>' : '') +
    (p.affiliation_active && S.user && !isOwn && !S.profile.is_affiliate ? '<div style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;">💡 <a href="#" onclick="becomeAffiliate();return false;" style="color:var(--purple);font-weight:600;">Deviens affilié.e</a> pour partager ce produit et gagner 2%</div>' : '') +
    '</div>' +
    '<div style="margin-top:24px;">' +
    '<div style="font-size:15px;font-weight:700;margin-bottom:12px;">⭐ Avis clients</div>' +
    '<div id="reviewsList_' + p.id + '"></div>' +
    (!isOwn && S.user ? '<div style="margin-top:14px;padding:14px;background:var(--bg);border-radius:12px;border:1px solid var(--border);">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:10px;">Laisser un avis</div>' +
    '<select id="reviewRating_' + p.id + '" style="width:100%;margin-bottom:8px;padding:10px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;background:var(--surface);">' +
    '<option value="">— Ta note —</option>' +
    '<option value="5">⭐⭐⭐⭐⭐ Excellent</option>' +
    '<option value="4">⭐⭐⭐⭐ Bien</option>' +
    '<option value="3">⭐⭐⭐ Moyen</option>' +
    '<option value="2">⭐⭐ Mauvais</option>' +
    '<option value="1">⭐ Très mauvais</option>' +
    '</select>' +
    '<textarea id="reviewComment_' + p.id + '" placeholder="Ton commentaire (optionnel)\u2026" rows="3" style="width:100%;margin-bottom:10px;padding:10px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;background:var(--surface);"></textarea>' +
    '<button class="btn btn-primary btn-full btn-sm" onclick="submitReview(' + p.id + ')">Envoyer mon avis 🙏</button>' +
    '</div>' : '') +
    '</div>';
  loadLikes(p.id);
  loadReviews(p.id);
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
  document.getElementById('statProd').textContent  = mine.length;
  document.getElementById('statSales').textContent = S.profile.sales_count || 0;
  document.getElementById('statViews').textContent = mine.reduce(function(a,p) { return a+(p.views||0); }, 0);
  var wrap = document.getElementById('completeBannerWrap');
  if (wrap) wrap.innerHTML = '';
}
async function loadLikes(productId) {
  var res = await sb.from('product_likes')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId);
  var countEl = document.getElementById('likeCount_' + productId);
  if (countEl) countEl.textContent = res.count || 0;
  if (S.user) {
    var mine = await sb.from('product_likes')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', S.user.id)
      .maybeSingle();
    var btn = document.getElementById('likeBtn_' + productId);
    if (btn) {
      if (mine.data) {
        btn.setAttribute('data-liked','1');
        btn.style.color = '#DC2626';
      } else {
        btn.setAttribute('data-liked','0');
        btn.style.color = 'var(--muted)';
      }
    }
  }
}
// ════════════════════════════════
// AVIS
// ════════════════════════════════
async function loadReviews(productId) {
  var el = document.getElementById('reviewsList_' + productId);
  if (!el) return;
  var res = await sb.from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (!res.data || !res.data.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--muted);text-align:center;padding:12px;">Aucun avis pour l\'instant.</div>';
    return;
  }
  el.innerHTML = res.data.map(function(r) {
    var stars = '';
    for (var i = 1; i <= 5; i++) {
      stars += i <= r.rating ? '⭐' : '☆';
    }
    return '<div style="padding:12px;border:1px solid var(--border);border-radius:12px;margin-bottom:8px;">' +
      '<div style="font-size:14px;">' + stars + '</div>' +
      (r.comment ? '<div style="font-size:13px;color:var(--ink2);margin-top:4px;">' + esc(r.comment) + '</div>' : '') +
      '<div style="font-size:11px;color:var(--muted2);margin-top:4px;">' + fmtDate(r.created_at) + '</div>' +
      '</div>';
  }).join('');
}
async function submitReview(productId) {
  if (!S.user) { toast('Connecte-toi pour laisser un avis', 'error'); return; }
  var rating = parseInt(document.getElementById('reviewRating_' + productId).value);
  var comment = document.getElementById('reviewComment_' + productId).value.trim();
  if (!rating) { toast('Choisis une note', 'error'); return; }
  var res = await sb.from('reviews').insert([{
    product_id: productId,
    buyer_id: S.user.id,
    rating: rating,
    comment: comment || null
  }]);
  if (res.error) {
    if (res.error.code === '23505') {
      toast('Tu as déjà laissé un avis sur ce produit', 'error');
    } else {
      toast('Erreur : ' + res.error.message, 'error');
    }
    return;
  }
  toast('Avis envoyé ! Merci 🙏', 'success');
  document.getElementById('reviewComment_' + productId).value = '';
  document.getElementById('reviewRating_' + productId).value = '';
  loadReviews(productId);
}
// ════════════════════════════════
// SIGNALEMENT
// ════════════════════════════════
async function signalerProduit(productId, vendorId) {
  if (!S.user) { toast('Connecte-toi pour signaler', 'error'); return; }
  var motifs = ['Produit inexistant ou introuvable','Arnaque ou fraude','Fausse photo ou description trompeuse','Contenu inapproprié ou offensant','Prix abusif','Autre'];
  var liste = 'Motif du signalement :';
  for (var mi = 0; mi < motifs.length; mi++) { liste += ' ' + (mi+1) + '. ' + motifs[mi]; }
  liste += ' Tape le numéro :';
  var motif = prompt(liste);
  if (!motif) return;
  var idx = parseInt(motif) - 1;
  if (isNaN(idx) || idx < 0 || idx >= motifs.length) { toast('Numéro invalide', 'error'); return; }
  var details = prompt('Détails supplémentaires (optionnel) :');
  var res = await sb.from('reports').insert([{
    reporter_id: S.user.id,
    product_id: productId,
    vendor_id: vendorId || null,
    motif: motifs[idx],
    details: details || null
  }]);
  if (res.error) { toast('Erreur : ' + res.error.message, 'error'); return; }
  toast('Signalement envoyé. Merci !', 'success');
}

// ════════════════════════════════
// HELPERS PROMO
// ════════════════════════════════
function promoExpired(p) {
  if (!p.promo_end) return false;
  return new Date(p.promo_end) < new Date();
}

function hasPromo(p) {
  return p.promo_price && p.promo_price > 0 && p.promo_price < p.price && !promoExpired(p);
}

function promoPct(p) {
  return Math.round((1 - p.promo_price / p.price) * 100);
}

function promoColors() {
  return { bg: 'var(--purple)', text: '#fff' };
}

function promoBadgeHtml(p) {
  if (!hasPromo(p)) return '';
  var labels = {
    'Weekend': '🎉', 'Fin de mois': '📅', 'Black Friday': '🖤',
    'Flash': '⚡', 'Soldes': '🛍️', 'Liquidation': '🔥', 'Promo': '🏷️'
  };
  var emoji = labels[p.promo_label] || '🏷️';
  return '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--purple);color:#fff;' +
    'font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;margin-left:6px;">' +
    emoji + ' ' + (p.promo_label || 'Promo') + ' -' + promoPct(p) + '%</span>';
}

function promoPriceHtml(p, size) {
  size = size || '14px';
  if (!hasPromo(p)) {
    return '<span style="font-family:DM Mono,monospace;font-size:' + size + ';font-weight:500;color:var(--purple);">' +
      formatPrice(p.price) + '</span>';
  }
  return '<span style="font-family:DM Mono,monospace;font-size:' + size + ';font-weight:700;color:var(--purple);">' +
    formatPrice(p.promo_price) + '</span>' +
    '<span style="font-family:DM Mono,monospace;font-size:11px;color:var(--muted2);text-decoration:line-through;margin-left:6px;">' +
    formatPrice(p.price) + '</span>';
}

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
  // Bandeau encouragement vérification
  if (isLoggedIn && S.profile.verification_status !== 'verified') {
    html += '<div style="background:linear-gradient(135deg,#7C3AED,#A855F7);border-radius:16px;padding:16px;margin-bottom:12px;color:#fff;">' +
      '<div style="font-size:14px;font-weight:700;margin-bottom:4px;">🏆 Deviens un vendeur certifié !</div>' +
      '<div style="font-size:12px;opacity:.85;margin-bottom:10px;line-height:1.5;">Les acheteurs font 3x plus confiance aux vendeurs vérifiés. Obtiens ton badge ✓ violet dès aujourd\'hui.</div>' +
      '<button class="btn" style="background:#fff;color:var(--purple);font-size:12px;padding:8px 14px;border-radius:10px;font-weight:700;" onclick="navigate(\'vendor-signup\')">Soumettre ma vérification →</button>' +
      '</div>';
  }
  // 1. Publier un produit — icône + gras
  html += '<div class="menu-item menu-vendeur" onclick="navigate(\'sell\')">' +
    '<div class="menu-icon green" style="background:#059669;">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/></svg>' +
    '</div>' +
    '<div class="menu-text"><div class="menu-label">Publier un produit</div><div class="menu-sub" style="color:#059669;">Mets ton produit en vente dès maintenant 🚀</div></div>' +
    '<span class="menu-arrow">›</span></div>';
  // 2. Espace Vendeur — icône boutique
  if (isVerified) {
    html += '<div class="menu-item menu-espace" onclick="navigate(\'my-products\')">' +
      '<div class="menu-icon violet" style="background:var(--purple);">' +
      '<svg viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="white" stroke-width="1.5"/></svg>' +
      '</div>' +
      '<div class="menu-text"><div class="menu-label">Espace Vendeur</div><div class="menu-sub" style="color:#7C3AED;">Gérer mes produits & commandes reçues 🛍️</div></div>' +
      '<span class="menu-arrow">›</span></div>';
  }
  // 3. Mes achats — sac de shopping
  html += '<div class="menu-item menu-achats" onclick="navigate(\'panier\')">' +
    '<div class="menu-icon blue" style="background:#2563EB;">' +
    '<svg viewBox="0 0 24 24" fill="white"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6" stroke="white" stroke-width="1.5" fill="none"/><path d="M16 10a4 4 0 01-8 0" fill="none" stroke="white" stroke-width="1.5"/></svg>' +
    '</div>' +
    '<div class="menu-text"><div class="menu-label">Mes achats</div><div class="menu-sub" style="color:#2563EB;">Retrouve toutes tes commandes ici 📦</div></div>' +
    '<span class="menu-arrow">›</span></div>';

  // 4. Affiliation — chaîne de partage
  if (isAffiliate) {
    html += '<div class="menu-item menu-affilie" id="affiliateMenuItem" onclick="navigate(\'affiliations\')">' +
      '<div class="menu-icon yellow" style="background:#D97706;">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3" fill="white"/><circle cx="6" cy="12" r="3" fill="white"/><circle cx="18" cy="19" r="3" fill="white"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
      '</div>' +
      '<div class="menu-text"><div class="menu-label">Espace Affilié</div><div class="menu-sub" style="color:#D97706;">Mes points, mes liens & mes gains 💰</div></div>' +
      '<span class="menu-arrow">›</span></div>';
  } else {
    html += '<div class="menu-item menu-affilie" id="affiliateMenuItem" onclick="becomeAffiliate()">' +
      '<div class="menu-icon yellow" style="background:#D97706;">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3" fill="white"/><circle cx="6" cy="12" r="3" fill="white"/><circle cx="18" cy="19" r="3" fill="white"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
      '</div>' +
      '<div class="menu-text"><div class="menu-label">Marketing d\'affiliation</div><div class="menu-sub" style="color:#D97706;">Partage & gagne 2% sur chaque vente générée ✨</div></div>' +
      '<span class="menu-arrow">›</span></div>';
  }
  // 5. Modifier le profil — crayon
  html += '<div class="menu-item menu-edit" onclick="openEditModal()">' +
    '<div class="menu-icon purple-main" style="background:linear-gradient(135deg,var(--purple),var(--purple-l));">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
    '</div>' +
    '<div class="menu-text"><div class="menu-label">Mes coordonnées</div><div class="menu-sub" style="color:var(--purple);">Mon nom, boutique, WhatsApp, MonCash, NatCash 🖊️</div></div>' +
    '<span class="menu-arrow">›</span></div>';
  // 6. Infos & Contact — i dans cercle
  html += '<div class="menu-item menu-infos" onclick="navigate(\'infos\')">' +
    '<div class="menu-icon gold" style="background:#B45309;">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8" stroke-width="3"/></svg>' +
    '</div>' +
    '<div class="menu-text"><div class="menu-label">Infos & Contact</div><div class="menu-sub" style="color:#B45309;">À propos, nous contacter, mentions légales 📋</div></div>' +
    '<span class="menu-arrow">›</span></div>';
  // 7. Se déconnecter — porte avec flèche
  if (isLoggedIn) {
    html += '<div class="menu-item menu-logout" id="logoutItem" onclick="signOut()">' +
      '<div class="menu-icon red-icon" style="background:#DC2626;">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' +
      '</div>' +
      '<div class="menu-text"><div class="menu-label" style="color:var(--red);">Se déconnecter</div><div class="menu-sub" style="color:var(--red);">À bientôt sur Ga-Izan 👋</div></div>' +
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






