// ════════════════════════════════
// PRODUITS
// ════════════════════════════════
async function loadProducts() {
  setSyncStatus('loading');
  const { data, error } = await sb
    .from('products').select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) { setSyncStatus('error'); toast('⚠️ Erreur de chargement', 'error'); return; }

  S.products = (data||[]).map(p => ({
    id:         p.id,
    name:       p.name,
    desc:       p.description,
    cat:        p.category,
    emoji:      p.emoji || '📦',
    seller:     p.seller_name,
    phone:      p.whatsapp,
    mc:         p.moncash,
    nc:         p.natcash,
    price:      p.price,
    views:      p.views || 0,
    uid:        p.user_id,
    created_at: p.created_at,
  }));

  setSyncStatus('ok');
  updateHeroStats();
  renderHome();
  renderMarket();
  if (S.page === 'my-products') renderMyProds();
}

function setSyncStatus(s) {
  const dot = document.getElementById('syncDot');
  if (!dot) return;
  dot.className = 'sync-indicator' + (s==='ok'?'':s==='error'?' error':' loading');
}

function updateHeroStats() {
  const el = document.getElementById('heroStatProds');
  const el2 = document.getElementById('heroStatSellers');
  if (el) el.textContent = S.products.length;
  if (el2) el2.textContent = new Set(S.products.map(p => p.uid)).size;
}

function pickEmoji(el) {
  document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  S.emoji = el.dataset.e;
}

async function publishProduct() {
  if (!S.user) { toast('⚠️ Connecte-toi pour publier', 'error'); setTimeout(() => openAuthModal(), 600); return; }
  if (!isProfileComplete()) { toast('⚠️ Configure d\'abord ton profil', 'error'); setTimeout(() => openEditModal(), 600); return; }

  const name  = document.getElementById('sellName').value.trim();
  const desc  = document.getElementById('sellDesc').value.trim();
  const cat   = document.getElementById('sellCat').value;
  const price = document.getElementById('sellPrice').value;
  const phone = document.getElementById('sellPhone').value.trim() || S.profile.whatsapp;
  const mc    = document.getElementById('sellMc').value.trim()    || S.profile.moncash;
  const nc    = document.getElementById('sellNc').value.trim()    || S.profile.natcash;

  if (!name||!desc||!cat||!price) { toast('⚠️ Remplis tous les champs obligatoires', 'error'); return; }
  if (parseInt(price) <= 0)       { toast('⚠️ Le prix doit être supérieur à 0', 'error'); return; }
  if (!phone)                     { toast('⚠️ Saisis un numéro WhatsApp', 'error'); return; }

  const btn = document.getElementById('publishBtn');
  btn.disabled = true; btn.textContent = 'Publication…';

  const { error } = await sb.from('products').insert([{
    name, description: desc, category: cat,
    emoji: S.emoji, seller_name: S.profile.name,
    whatsapp: phone, moncash: mc, natcash: nc,
    price: parseInt(price), views: 0,
    user_id: S.user.id, is_active: true,
  }]);

  btn.disabled = false; btn.textContent = 'Publier le produit';

  if (error) { toast('❌ Erreur lors de la publication', 'error'); return; }

  ['sellName','sellDesc','sellPrice','sellPhone','sellMc','sellNc']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('sellCat').value = '';
  document.querySelectorAll('.emoji-opt').forEach((e,i) => e.classList.toggle('selected', i===0));
  S.emoji = '📚';

  toast('✅ Produit publié !', 'success');
  await loadProducts();
  setTimeout(() => navigate('my-products'), 800);
}

async function delProd(id) {
  if (!confirm('Supprimer ce produit ?')) return;
  const { error } = await sb.from('products').update({ is_active: false }).eq('id', id);
  if (error) { toast('❌ Erreur lors de la suppression', 'error'); return; }
  toast('Produit supprimé');
  await loadProducts();
  renderMyProds();
}function openWA(phone, name, price) {
  const msg = encodeURIComponent('Bonjour ! Je suis intéressé(e) par "' + decodeURIComponent(name) + '" (Prix : ' + price + ') sur GAyizan.');
  window.open('https://wa.me/' + phone.replace(/\D/g,'') + '?text=' + msg, '_blank');
}