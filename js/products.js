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
is_featured: p.is_featured || false,
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
 const el3 = document.getElementById('heroStatCats');
  if (el3) el3.textContent = new Set(S.products.map(function(p) { return p.cat; })).size; 
}

function pickEmoji(el) {
  document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  S.emoji = el.dataset.e;
}

async function publishProduct() {
  if (!S.user) { toast('Connecte-toi pour publier', 'error'); setTimeout(() => openAuthModal(), 600); return; }
  if (!isProfileComplete()) { toast('Configure d\'abord ton profil', 'error'); setTimeout(() => openEditModal(), 600); return; }
  if (S.profile.verification_status !== 'verified') { toast('Tu dois etre vendeur verifie pour publier', 'error'); setTimeout(() => navigate('vendor-signup'), 600); return; }

  const name  = document.getElementById('sellName').value.trim();
  const desc  = document.getElementById('sellDesc').value.trim();
  const cat   = document.getElementById('sellCat').value;
  const price = document.getElementById('sellPrice').value;
  const fileInput = document.getElementById('sellImage');
  const file  = fileInput && fileInput.files[0] ? fileInput.files[0] : null;

  if (!name||!desc||!cat||!price) { toast('Remplis tous les champs obligatoires', 'error'); return; }
  if (parseInt(price) <= 0)       { toast('Le prix doit etre superieur a 0', 'error'); return; }
  if (!phone)                     { toast('Saisis un numero WhatsApp', 'error'); return; }

  const btn = document.getElementById('publishBtn');
  btn.disabled = true; btn.textContent = 'Publication…';

  const image_url = await uploadImage(file);

  const { error } = await sb.from('products').insert([{
    name, description: desc, category: cat,
seller_name: S.profile.name,
whatsapp: S.profile.whatsapp,
moncash: S.profile.moncash,
natcash: S.profile.natcash,
    price: parseInt(price), views: 0,
    user_id: S.user.id, is_active: true,
    image_url: image_url,
  }]);

  btn.disabled = false; btn.textContent = 'Publier le produit';

  if (error) { toast('Erreur lors de la publication', 'error'); return; }

  ['sellName','sellDesc','sellPrice','sellPhone','sellMc','sellNc']
    .forEach(function(id) { document.getElementById(id).value = ''; });
  document.getElementById('sellCat').value = '';
  if (fileInput) fileInput.value = '';
  document.querySelectorAll('.emoji-opt').forEach(function(e,i) { e.classList.toggle('selected', i===0); });
  S.emoji = '📚';

  toast('Produit publie !', 'success');
  await loadProducts();
  setTimeout(function() { navigate('my-products'); }, 800);
}
async function delProd(id) {
  if (!confirm('Supprimer ce produit ?')) return;
  const { error } = await sb.from('products').update({ is_active: false }).eq('id', id);
  if (error) { toast('❌ Erreur lors de la suppression', 'error'); return; }
  toast('Produit supprimé');
  await loadProducts();
  renderMyProds();
}function openWA(phone, name, price) {
  const msg = encodeURIComponent('Bonjour ! Je suis intéressé(e) par "' + decodeURIComponent(name) + '" (Prix : ' + price + ') sur Ga-izan.');
  window.open('https://wa.me/' + phone.replace(/\D/g,'') + '?text=' + msg, '_blank');
}// ════════════════════════════════
// UPLOAD IMAGE
// ════════════════════════════════
async function uploadImage(file) {
  if (!file) return null;
  const ext = file.name.split('.').pop();
  const path = S.user.id + '/' + Date.now() + '.' + ext;
  const { error } = await sb.storage
    .from('products')
    .upload(path, file, { contentType: file.type });
  if (error) { toast('Erreur upload image', 'error'); return null; }
  const { data } = sb.storage.from('products').getPublicUrl(path);
  return data.publicUrl;
}