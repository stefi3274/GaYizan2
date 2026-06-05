// ════════════════════════════════
// DEVENIR VENDEUR
// ════════════════════════════════
async function loadVendorStatus() {
  if (!S.user) return;
  const status = S.profile.verification_status || 'unverified';
  const banner = document.getElementById('vendorStatusBanner');
  const form = document.getElementById('vendorFormWrap');
  if (!banner) return;

  if (status === 'verified') {
    banner.innerHTML = '<div class="complete-banner" style="background:#D1FAE5;border-color:#059669;"><div class="complete-banner-icon">✅</div><div class="complete-banner-body"><div class="complete-banner-title" style="color:#059669;">Compte vérifié</div><div class="complete-banner-sub">Tu peux publier des produits sur Ga-izan.</div></div></div>';
    if (form) form.style.display = 'none';
  } else if (status === 'pending') {
    banner.innerHTML = '<div class="complete-banner" style="background:#FEF3C7;border-color:#D97706;"><div class="complete-banner-icon">⏳</div><div class="complete-banner-body"><div class="complete-banner-title" style="color:#D97706;">Demande en cours</div><div class="complete-banner-sub">Ta demande est en cours de vérification. 24-48h.</div></div></div>';
    if (form) form.style.display = 'none';
  } else if (status === 'rejected') {
    banner.innerHTML = '<div class="complete-banner" style="background:#FEE2E2;border-color:#DC2626;"><div class="complete-banner-icon">❌</div><div class="complete-banner-body"><div class="complete-banner-title" style="color:#DC2626;">Demande rejetée</div><div class="complete-banner-sub">Ton dossier a été rejeté. Soumet un nouveau dossier.</div></div></div>';
    if (form) form.style.display = 'block';
  } else {
    banner.innerHTML = '';
    if (form) form.style.display = 'block';
  }

  // Pré-remplir les champs
  const nameEl = document.getElementById('vendorName');
  const waEl   = document.getElementById('vendorWa');
  const mcEl   = document.getElementById('vendorMc');
  const ncEl   = document.getElementById('vendorNc');
  if (nameEl) nameEl.value = S.profile.name     || '';
  if (waEl)   waEl.value   = S.profile.whatsapp || '';
  if (mcEl)   mcEl.value   = S.profile.moncash  || '';
  if (ncEl)   ncEl.value   = S.profile.natcash  || '';
}

async function uploadKycFile(file, bucket) {
  if (!file) return null;
  const ext  = file.name.split('.').pop();
  const path = S.user.id + '/' + Date.now() + '.' + ext;
  const { error } = await sb.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) { toast('Erreur upload ' + bucket, 'error'); return null; }
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function submitVendorApplication() {
  if (!S.user) { toast('Connecte-toi d\'abord', 'error'); setTimeout(() => openAuthModal(), 600); return; }

  const name    = document.getElementById('vendorName').value.trim();
  const wa      = document.getElementById('vendorWa').value.trim();
  const mc      = document.getElementById('vendorMc').value.trim();
  const nc      = document.getElementById('vendorNc').value.trim();
  const idFile  = document.getElementById('vendorIdCard').files[0];
  const selfie  = document.getElementById('vendorSelfie').files[0];

  if (!name)   { toast('Le nom est obligatoire', 'error'); return; }
  if (!wa)     { toast('Le WhatsApp est obligatoire', 'error'); return; }
  if (!idFile) { toast('La carte d\'identite est obligatoire', 'error'); return; }
  if (!selfie) { toast('Le selfie est obligatoire', 'error'); return; }

  const btn = document.getElementById('vendorSubmitBtn');
  btn.disabled = true; btn.textContent = 'Envoi en cours...';

  const idUrl     = await uploadKycFile(idFile, 'id-cards');
  const selfieUrl = await uploadKycFile(selfie, 'selfies');

  if (!idUrl || !selfieUrl) {
    btn.disabled = false; btn.textContent = 'Soumettre ma demande';
    return;
  }

  const update = {
    name, whatsapp: wa, moncash: mc, natcash: nc,
    id_card_url: idUrl,
    selfie_url: selfieUrl,
    verification_status: 'pending',
  };const { error } = await sb.from('profiles').upsert(Object.assign({ id: S.user.id }, update));

  btn.disabled = false; btn.textContent = 'Soumettre ma demande';

  if (error) { toast('Erreur lors de l\'envoi', 'error'); return; }

  S.profile = Object.assign({}, S.profile, update);
  toast('Demande envoyee ! Verification sous 24-48h.', 'success');
  loadVendorStatus();
}