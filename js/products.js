
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
  S.products = (data||[]).map(function(p) {
    return {
      id: p.id,
      name: p.name,
      desc: p.description,
      cat: p.category,
      emoji: p.emoji || '📦',
      seller: p.seller_name,
      phone: p.whatsapp,
      mc: p.moncash,
      nc: p.natcash,
      price: p.price,
      views: p.views || 0,
      uid: p.user_id,
      created_at: p.created_at,
      image_url: p.image_url || null,
      image_url_2: p.image_url_2 || null,
      image_url_3: p.image_url_3 || null,
      is_featured: p.is_featured || false,
      affiliation_active: p.affiliation_active || false,
    };
  });
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
  if (el2) el2.textContent = new Set(S.products.map(function(p) { return p.uid; })).size;
  const el3 = document.getElementById('heroStatCats');
  if (el3) el3.textContent = new Set(S.products.map(function(p) { return p.cat; })).size;
}
async function publishProduct() {
  if (!S.user) { saveDraft(); toast('Connecte-toi pour finaliser ta publication', 'error'); setTimeout(function() { openAuthModal(); }, 800); return; }
  if (!isProfileComplete()) { toast('Configure d\'abord ton profil', 'error'); setTimeout(function() { openEditModal(); }, 600); return; }
  if (S.profile.verification_status !== 'verified') {
    if (S.profile.verification_status === 'pending') {
      toast('⏳ Ta demande est en cours de vérification (24-48h)', 'error');
    } else {
      toast('⚠️ Tu dois être vendeur vérifié pour publier', 'error');
      setTimeout(function() { navigate('vendor-signup'); }, 800);
    }
    return;
  }
  const name = document.getElementById('sellName').value.trim();
  const desc = document.getElementById('sellDesc').value.trim();
  const cat = document.getElementById('sellCat').value;
  const price = document.getElementById('sellPrice').value;
  var fileInput = document.getElementById('sellImage');
  var file = fileInput && fileInput.files[0] ? fileInput.files[0] : null;
  var fileInput2 = document.getElementById('sellImage2');
  var file2 = fileInput2 && fileInput2.files[0] ? fileInput2.files[0] : null;
  var fileInput3 = document.getElementById('sellImage3');
  var file3 = fileInput3 && fileInput3.files[0] ? fileInput3.files[0] : null;
  var affiliationActive = document.getElementById('sellAffiliation') ? document.getElementById('sellAffiliation').checked : false;
  if (!name||!desc||!cat||!price) { toast('Remplis tous les champs obligatoires', 'error'); return; }
  if (parseInt(price) <= 0) { toast('Le prix doit etre superieur a 0', 'error'); return; }
  if (!file) { toast('La photo du produit est obligatoire', 'error'); return; }
  var btn = document.getElementById('publishBtn');
  btn.disabled = true; btn.textContent = 'Publication…';

  var steps = [{ key: 'photo1', label: 'Photo principale' }];
  if (file2) steps.push({ key: 'photo2', label: 'Photo 2' });
  if (file3) steps.push({ key: 'photo3', label: 'Photo 3' });
  steps.push({ key: 'pub', label: 'Publication du produit' });
  initUploadModal(steps);
  showUploadModal();

  var image_url = await uploadImage(file, 'photo1');
  var image_url_2 = file2 ? await uploadImage(file2, 'photo2') : null;
  var image_url_3 = file3 ? await uploadImage(file3, 'photo3') : null;
  const attributes = getCategoryAttributeValues();
  const { error } = await sb.from('products').insert([{
    name: name, description: desc, category: cat,
    seller_name: S.profile.name,
    whatsapp: S.profile.whatsapp,
    moncash: S.profile.moncash,
    natcash: S.profile.natcash,
    price: parseInt(price), views: 0,
    user_id: S.user.id, is_active: true,
    image_url: image_url,
    image_url_2: image_url_2,
    image_url_3: image_url_3,
    affiliation_active: affiliationActive,
    attributes: Object.keys(attributes).length ? attributes : null,
  }]);
  updateUploadModal('pub', error ? 'error' : 'done');
  btn.disabled = false; btn.textContent = 'Publier le produit';
  if (error) { hideUploadModal(); toast('Erreur lors de la publication', 'error'); return; }
  setTimeout(function() { hideUploadModal(); }, 800);
  ['sellName','sellDesc','sellPrice'].forEach(function(id) {
    var elx = document.getElementById(id);
    if (elx) elx.value = '';
  });
  document.getElementById('sellCat').value = '';
  if (fileInput) fileInput.value = '';
  if (fileInput2) fileInput2.value = '';
  if (fileInput3) fileInput3.value = '';
  if (document.getElementById('sellAffiliation')) document.getElementById('sellAffiliation').checked = false;
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
}
function openWA(phone, name, price) {
  const msg = encodeURIComponent('Bonjour ! Je suis intéressé(e) par "' + decodeURIComponent(name) + '" (Prix : ' + price + ') sur Ga-izan.');
  window.open('https://wa.me/' + phone.replace(/\D/g,'') + '?text=' + msg, '_blank');
}
// ════════════════════════════════
// UPLOAD IMAGE
// ════════════════════════════════
async function compressImage(file) {
  return new Promise(function(resolve) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var maxW = 1200;
        var ratio = Math.min(maxW / img.width, maxW / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function(blob) {
          resolve(blob);
        }, 'image/jpeg', 0.82);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file, label) {
  if (!file) return null;
  updateUploadModal(label, 'upload');

  // Compression
  var blob = await compressImage(file);
  var path = S.user.id + '/' + Date.now() + '.jpg';

  var res = await sb.storage
    .from('Produits')
    .upload(path, blob, { contentType: 'image/jpeg' });

  if (res.error) {
    updateUploadModal(label, 'error');
    toast('Erreur upload image', 'error');
    return null;
  }
  updateUploadModal(label, 'done');
  var urlRes = sb.storage.from('Produits').getPublicUrl(path);
  return urlRes.data.publicUrl;
}

function showUploadModal() {
  var modal = document.getElementById('uploadModal');
  if (modal) modal.classList.add('open');
}

function hideUploadModal() {
  var modal = document.getElementById('uploadModal');
  if (modal) modal.classList.remove('open');
}

function updateUploadModal(label, status) {
  var el = document.getElementById('uploadStep_' + label);
  if (!el) return;
  var lbl = el.getAttribute('data-label');
  if (status === 'upload') {
    el.innerHTML = '<span style="font-size:18px;">⏳</span> <span>' + lbl + '</span>';
    el.style.background = 'var(--bg)';
  } else if (status === 'done') {
    el.innerHTML = '<span style="font-size:18px;color:#059669;">✅</span> <span style="color:#059669;font-weight:600;">' + lbl + '</span>';
    el.style.background = '#D1FAE5';
  } else if (status === 'error') {
    el.innerHTML = '<span style="font-size:18px;color:#DC2626;">❌</span> <span style="color:#DC2626;">' + lbl + '</span>';
    el.style.background = '#FEE2E2';
  }
}

function initUploadModal(steps) {
  var content = document.getElementById('uploadModalContent');
  if (!content) return;
  var html = '<div style="font-family:sans-serif;">' +
    '<div style="font-size:18px;font-weight:700;margin-bottom:20px;text-align:center;">Publication en cours...</div>';
  for (var i = 0; i < steps.length; i++) {
    html += '<div id="uploadStep_' + steps[i].key + '" data-label="' + steps[i].label + '" ' +
      'style="display:flex;align-items:center;gap:12px;padding:12px;margin-bottom:8px;' +
      'background:var(--bg);border-radius:12px;font-size:14px;">⏳ ' + steps[i].label + '</div>';
  }
  html += '</div>';
  content.innerHTML = html;
}


