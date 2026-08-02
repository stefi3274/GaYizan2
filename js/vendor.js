// ==================== VENDOR ====================
async function loadVendorStatus() {
  var banner = document.getElementById('vendorStatusBanner');
  var formWrap = document.getElementById('vendorFormWrap');
  if (!banner || !formWrap) return;
  if (!S.user) {
    banner.innerHTML = '';
    formWrap.style.display = 'block';
    return;
  }
  var status = S.profile.verification_status;
  if (status === 'verified') {
    banner.innerHTML = '<div class="complete-banner"><div class="complete-banner-icon">✅</div><div class="complete-banner-body"><div class="complete-banner-title">Tu es vendeur.se vérifié.e !</div><div class="complete-banner-sub">Tu peux publier des produits sur Ga-izan.</div></div></div>';
    formWrap.style.display = 'none';
  } else if (status === 'pending') {
    banner.innerHTML = '<div class="complete-banner"><div class="complete-banner-icon">⏳</div><div class="complete-banner-body"><div class="complete-banner-title">Demande en cours de vérification</div><div class="complete-banner-sub">La vérification prend 24-48h. On te contactera par WhatsApp.</div></div></div>';
    formWrap.style.display = 'none';
  } else if (status === 'rejected') {
    banner.innerHTML = '<div class="complete-banner" style="border-color:var(--red);background:var(--red-pale);"><div class="complete-banner-icon">❌</div><div class="complete-banner-body"><div class="complete-banner-title" style="color:var(--red);">Demande rejetée</div><div class="complete-banner-sub">Vérifie tes documents et resoumet ta demande.</div></div></div>';
    formWrap.style.display = 'block';
  } else {
    banner.innerHTML = '';
    formWrap.style.display = 'block';
  }

  // Pré-remplir les champs si profil existant
  var nameEl = document.getElementById('vendorName');
  var waEl = document.getElementById('vendorWa');
  var mcEl = document.getElementById('vendorMc');
  var ncEl = document.getElementById('vendorNc');
  var shopEl = document.getElementById('vendorShopName');
  if (nameEl) nameEl.value = S.profile.name || '';
  if (waEl) waEl.value = S.profile.whatsapp || '';
  if (mcEl) mcEl.value = S.profile.moncash || '';
  if (ncEl) ncEl.value = S.profile.natcash || '';
  if (shopEl) shopEl.value = S.profile.shop_name || '';
}

async function submitVendorApplication() {
  if (!S.user) { toast('Connecte-toi d\'abord', 'error'); setTimeout(function() { openAuthModal(); }, 600); return; }
  var name     = document.getElementById('vendorName').value.trim();
  var shopName = document.getElementById('vendorShopName') ? document.getElementById('vendorShopName').value.trim() : '';
  var wa       = document.getElementById('vendorWa').value.trim();
  var mc       = document.getElementById('vendorMc').value.trim();
  var nc       = document.getElementById('vendorNc').value.trim();
  var idFile   = document.getElementById('vendorIdCard').files[0];
  var selfie   = document.getElementById('vendorSelfie').files[0];
  if (!name)   { toast('Le nom est obligatoire', 'error'); return; }
  if (!wa)     { toast('Le WhatsApp est obligatoire', 'error'); return; }
  if (!idFile) { toast('La carte d\'identité est obligatoire', 'error'); return; }
  if (!selfie) { toast('Le selfie est obligatoire', 'error'); return; }
  var btn = document.getElementById('vendorSubmitBtn');
  btn.disabled = true; btn.textContent = 'Envoi en cours...';
  var idUrl    = await uploadKycFile(idFile, 'id-cards');
  var selfieUrl = await uploadKycFile(selfie, 'selfies');
  if (!idUrl || !selfieUrl) {
    btn.disabled = false; btn.textContent = 'Soumettre ma demande';
    return;
  }
  var update = {
    name: name,
    shop_name: shopName || null,
    whatsapp: wa,
    moncash: mc,
    natcash: nc,
    id_card_url: idUrl,
    selfie_url: selfieUrl,
    verification_status: 'pending',
  };
  var res = await sb.from('profiles').upsert(Object.assign({ id: S.user.id }, update));
  btn.disabled = false; btn.textContent = 'Soumettre ma demande';
  if (res.error) { toast('Erreur lors de l\'envoi', 'error'); return; }
  S.profile = Object.assign({}, S.profile, update);
  sb.functions.invoke('notify-kyc', {
    body: { vendorName: name, vendorEmail: S.user.email }
  });
  toast('Demande envoyée ! Vérification sous 24-48h.', 'success');
  loadVendorStatus();
}

async function uploadKycFile(file, bucket) {
  var ext = file.name.split('.').pop();
  var path = S.user.id + '_' + Date.now() + '.' + ext;
  var res = await sb.storage.from(bucket).upload(path, file, { upsert: true });
  if (res.error) { toast('Erreur upload fichier', 'error'); return null; }
  var url = sb.storage.from(bucket).getPublicUrl(path);
  return url.data ? url.data.publicUrl : null;
}
