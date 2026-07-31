

// ════════════════════════════════
// COMMANDES
// ════════════════════════════════
async function loadMyOrders() {
  if (!S.user) return;
  const { data } = await sb.from('orders').select('*')
    .eq('buyer_id', S.user.id).order('created_at', { ascending: false });
  S.myOrders = data || [];
  updateCartBadge();
}
async function loadReceivedOrders() {
  if (!S.user) return;
  const { data } = await sb.from('orders').select('*')
    .eq('seller_id', S.user.id).order('created_at', { ascending: false });
  S.receivedOrders = data || [];
  updatePendingBadge();
}
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const n = S.myOrders.length;
  badge.textContent = n;
  badge.classList.toggle('show', n > 0);
}
function updatePendingBadge() {
  const pending = S.receivedOrders.filter(o => o.status === 'pending').length;
  const badge = document.getElementById('pendingBadge');
  if (!badge) return;
  badge.textContent = pending;
  badge.style.display = pending > 0 ? 'inline-block' : 'none';
}
async function updateOrderStatus(orderId, status) {
  const { error } = await sb.from('orders').update({ status }).eq('id', orderId);
  if (error) { toast('Erreur lors de la mise à jour', 'error'); return; }
  await loadReceivedOrders();
  renderReceivedOrders();
  toast(status === 'confirmed' ? 'Commande confirmee' : 'Commande annulee');
}
function openPayFlow(id) {
  if (!S.user) { toast('Connecte-toi pour passer une commande', 'error'); setTimeout(() => openAuthModal(), 600); return; }
  const p = S.products.find(x => x.id === id);
  if (!p) return;
  const hasMc = p.mc && p.mc.trim();
  const hasNc = p.nc && p.nc.trim();
  let methods = '';
  if (hasMc) methods += '<div class="pay-method" id="pm-mc" onclick="selPayMethod(\'mc\',' + id + ')"><div class="pay-logo pm-mc">MC</div><div><div class="pay-method-name">MonCash</div><div class="pay-method-desc">Paiement mobile via Digicel</div></div></div>';
  if (hasNc) methods += '<div class="pay-method" id="pm-nc" onclick="selPayMethod(\'nc\',' + id + ')"><div class="pay-logo pm-nc">NC</div><div><div class="pay-method-name">NatCash</div><div class="pay-method-desc">Paiement mobile via Natcom</div></div></div>';
  document.getElementById('payModalContent').innerHTML = '<div class="modal-title">Mode de paiement</div><div class="pay-amount-box"><div class="pay-amount-lbl">Montant a payer</div><div class="pay-amount-val">' + formatPrice(p.price) + '</div></div><div class="pay-warning">Effectue le paiement apres confirmation avec le vendeur.</div><div class="pay-methods">' + methods + '</div><button class="btn btn-ghost btn-full" onclick="closeModal(\'payModal\')">Annuler</button>';
  document.getElementById('payModal').classList.add('open');
}
function selPayMethod(m, id) {
  document.querySelectorAll('.pay-method').forEach(x => x.classList.remove('selected'));
  document.getElementById('pm-' + m).classList.add('selected');
  setTimeout(() => showPayStep2(m, id), 280);
}
function showPayStep2(m, id) {
  const p = S.products.find(x => x.id === id);
  const num = m === 'mc' ? p.mc : p.nc;
  const label = m === 'mc' ? 'MonCash' : 'NatCash';
  const steps = m === 'mc'
    ? '1. Ouvre MonCash<br>2. Selectione Payer<br>3. Saisis le numero ci-dessous<br>4. Entre le montant exact<br>5. Envoie la capture au vendeur'
    : '1. Ouvre NatCash<br>2. Selectionne Envoyer<br>3. Saisis le numero ci-dessous<br>4. Entre le montant exact<br>5. Envoie la capture au vendeur';
  document.getElementById('payModalContent').innerHTML =
    '<div class="modal-title">' + label + ' - Instructions</div>' +
    '<div class="pay-amount-box"><div class="pay-amount-lbl">Montant a envoyer</div><div class="pay-amount-val">' + formatPrice(p.price) + '</div></div>' +
    '<p style="font-size:12px;color:var(--muted);margin-bottom:4px;text-align:center;">Numero ' + label + ' du vendeur :</p>' +'<div class="pay-phone-box"><div class="pay-phone-num">' + formatPhone(num) + '</div><div class="pay-phone-lbl">' + esc(p.seller || 'Vendeur') + '</div></div>' +
    '<div class="pay-steps"><strong>Etapes :</strong><br>' + steps + '</div>' +
    '<div class="pay-warning">Envoie ta capture au vendeur sur WhatsApp.</div>' +
    '<button class="btn btn-gold btn-full" onclick="confirmPay(' + id + ',\'' + label + '\',\'' + m + '\')">J\'ai effectue le paiement</button>' +
    '<button class="btn btn-ghost btn-full" style="margin-top:10px;" onclick="openWA(\'' + p.phone + '\',\'' + encodeURIComponent(p.name) + '\',\'' + formatPrice(p.price) + '\')">Envoyer la preuve sur WhatsApp</button>' +
    '<button style="margin-top:10px;background:none;border:none;color:var(--muted2);font-size:12px;cursor:pointer;width:100%;text-align:center;" onclick="openPayFlow(' + id + ')">Changer de methode</button>';
}
async function confirmPay(id, label, method) {
  const p = S.products.find(x => x.id === id);
  if (!p || !S.user) return;
  const { data, error } = await sb.rpc('create_order', {
    p_product_id:     id,
    p_buyer_name:     S.profile.name || S.user.email.split('@')[0] || 'Acheteur',
    p_payment_method: label,
    p_amount:         p.price,
  });
  if (error) {
    const msg = (error.message || '').includes('propre produit')
      ? 'Tu ne peux pas acheter ton propre produit'
      : 'Erreur lors de l\'enregistrement';
    toast(msg, 'error'); return;
  }
  if (data) S.myOrders.unshift(data);
  updateCartBadge();
  document.getElementById('payModalContent').innerHTML =
    '<div style="text-align:center;padding:16px 0;">' +
    '<div style="font-size:54px;margin-bottom:14px;">✅</div>' +
    '<div style="font-family:\'Playfair Display\',serif;font-size:22px;font-weight:800;margin-bottom:10px;">Paiement enregistre</div>' +
    '<p style="font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:22px;">Paiement via ' + label + ' enregistre.<br>Envoie ta capture au vendeur.<br>Il confirmera ta commande sous peu.</p>' +
    '<button class="btn btn-gold btn-full" onclick="openWA(\'' + p.phone + '\',\'' + encodeURIComponent(p.name) + '\',\'' + formatPrice(p.price) + '\')">Envoyer la preuve sur WhatsApp</button>' +
    '<button class="btn btn-ghost btn-full" style="margin-top:10px;" onclick="closeModal(\'payModal\');navigate(\'panier\')">Voir mes commandes</button>' +
    '</div>';
}
function renderPanier() {
  var el = document.getElementById('panierList');
  if (!S.user) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div><div class="empty-title">Connecte-toi pour voir tes achats</div></div>'; return; }
  if (!S.myOrders.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div><div class="empty-title">Aucune commande</div></div>'; return; }
  el.innerHTML = S.myOrders.map(function(o) {
    return '<div class="order-row">' +
      '<div class="order-info"><div class="order-name">' + esc(o.product_name || '—') + '</div>' +
      '<div class="order-meta">' + fmtDate(o.created_at) + ' · ' + (o.payment_method || '—') + '</div></div>' +
      '<div>' + statusChip(o.status) + '</div></div>';
  }).join('');
}
function renderMyProds() {
  var el = document.getElementById('myProdList');
  if (!S.user) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">Connecte-toi pour voir tes produits</div></div>'; return; }
  var mine = S.products.filter(function(p) { return p.uid === S.user.id; });
  if (!mine.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">Aucun produit publie</div></div>'; return; }
  el.innerHTML = mine.map(function(p) {
    return '<div class="prod-row" style="align-items:flex-start;">' +
      '<div class="prod-row-img">' + (p.image_url ? '<img src="' + p.image_url + '" style="width:100%;height:100%;object-fit:cover;border-radius:var(--r);"/>' : p.emoji) + '</div>' +
      '<div class="prod-row-info">' +
      '<div class="prod-row-name">' + esc(p.name) + '</div>' +
      '<div class="prod-row-desc">' + formatPrice(p.price) + '</div>' +
      '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">' +
      (p.promo_price ? '<button class="btn btn-xs" style="background:#7C3AED;color:#fff;" onclick="gererPromo(' + p.id + ')">🏷️ Modifier promo</button>' : '<button class="btn btn-xs" style="background:#F97316;color:#fff;" onclick="gererPromo(' + p.id + ')">🏷️ Ajouter promo</button>') +
      '<button class="btn btn-xs" style="background:linear-gradient(135deg,#f43f5e,#f97316,#eab308,#22c55e,#3b82f6,#a855f7);color:#fff;font-weight:700;" onclick="partagerReseaux(' + p.id + ')">✦ Réseaux</button>' +
      '<button class="btn btn-danger btn-xs" onclick="supprimerMonProduit(' + p.id + ')">🗑 Supprimer</button>' +
      '</div>' +
      '</div></div>';
  }).join('');
}


async function supprimerMonProduit(id) {
  if (!confirm('Supprimer ce produit ? Cette action est irreversible.')) return;
  var res = await sb.rpc('supprimer_produit', { product_id: id });
  if (res.error) { toast('Erreur : ' + res.error.message, 'error'); return; }
  toast('Produit supprime !', 'success');
  await loadProducts();
  renderMyProds();
}



async function gererPromo(productId) {
  var p = S.products.find(function(x) { return x.id === productId; });
  if (!p) return;

  var hasP = p.promo_price && p.promo_price > 0;
  var action = hasP ? prompt(
    'Promo actuelle : ' + formatPrice(p.promo_price) + ' HTG (' + (p.promo_label||'Promo') + ')\n\n1. Modifier la promo\n2. Supprimer la promo\n\nTape 1 ou 2 :'
  ) : '1';

  if (!action) return;

  if (action === '2') {
    var res = await sb.from('products').update({ promo_price: null, promo_label: null, promo_end: null }).eq('id', productId);
    if (res.error) { toast('Erreur : ' + res.error.message, 'error'); return; }
    toast('Promo supprimée ✓', 'success');
    await loadProducts();
    renderMyProds();
    return;
  }

  var newPrice = prompt('Prix promotionnel (HTG) — Prix actuel : ' + formatPrice(p.price) + ' HTG :');
  if (!newPrice || isNaN(parseInt(newPrice))) { toast('Prix invalide', 'error'); return; }
  newPrice = parseInt(newPrice);
  if (newPrice >= p.price) { toast('Le prix promo doit être inférieur au prix normal', 'error'); return; }

  var types = ['Promo', 'Weekend', 'Fin de mois', 'Black Friday', 'Flash', 'Soldes', 'Liquidation'];
  var typeList = types.map(function(t, i) { return (i+1) + '. ' + t; }).join('\n');
  var typeChoice = prompt('Type de promo :\n' + typeList + '\n\nTape le numéro :');
  var typeIdx = parseInt(typeChoice) - 1;
  var label = (typeIdx >= 0 && typeIdx < types.length) ? types[typeIdx] : 'Promo';

  var endDate = prompt('Date de fin (optionnel, format: 2025-12-31) — Laisse vide pour sans limite :');
  var promoEnd = null;
  if (endDate && endDate.trim()) {
    promoEnd = new Date(endDate.trim()).toISOString();
  }

  var res = await sb.from('products').update({
    promo_price: newPrice,
    promo_label: label,
    promo_end: promoEnd
  }).eq('id', productId);

  if (res.error) { toast('Erreur : ' + res.error.message, 'error'); return; }
  toast('Promo activée ! 🏷️', 'success');
  await loadProducts();
  renderMyProds();
}

// ════════════════════════════════
// FICHE PRODUIT RÉSEAUX SOCIAUX
// ════════════════════════════════
async function partagerReseaux(productId) {
  var p = S.products.find(function(x) { return x.id === productId; });
  if (!p) { toast('Produit introuvable', 'error'); return; }

  toast('Génération de la fiche...', 'success');

  var canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  var ctx = canvas.getContext('2d');

  // Fond dégradé violet
  var grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, '#5B21B6');
  grad.addColorStop(1, '#7C3AED');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  // Cercles décoratifs
  ctx.beginPath();
  ctx.arc(900, 150, 200, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(150, 900, 150, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(253,230,138,0.08)';
  ctx.fill();

  // Logo Ga-Izan en haut
  ctx.fillStyle = '#FDE68A';
  ctx.font = 'bold 48px serif';
  ctx.fillText('Ga-Izan', 60, 80);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '28px sans-serif';
  ctx.fillText('gaizanmarket.com', 60, 120);

  // Photo du produit (si disponible)
  var drawContent = function() {
    // Zone blanche pour la photo
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.roundRect(60, 150, 960, 480, 24);
    ctx.fill();

    // Nom du produit
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px sans-serif';
    var name = p.name || 'Produit';
    if (name.length > 20) name = name.substring(0, 20) + '...';
    ctx.fillText(name, 60, 720);

    // Prix
    if (p.promo_price && p.promo_price < p.price) {
      ctx.fillStyle = '#FDE68A';
      ctx.font = 'bold 80px monospace';
      ctx.fillText(parseInt(p.promo_price).toLocaleString('fr-FR') + ' HTG', 60, 820);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '40px monospace';
      ctx.fillText(parseInt(p.price).toLocaleString('fr-FR') + ' HTG', 60, 870);
      // Barrer
      var w = ctx.measureText(parseInt(p.price).toLocaleString('fr-FR') + ' HTG').width;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(60, 855);
      ctx.lineTo(60 + w, 855);
      ctx.stroke();
      // Badge promo
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.roundRect(60, 890, 300, 60, 30);
      ctx.fill();
      ctx.fillStyle = '#5B21B6';
      ctx.font = 'bold 28px sans-serif';
      var pct = Math.round((1 - p.promo_price/p.price)*100);
      ctx.fillText((p.promo_label || 'Promo') + ' -' + pct + '%', 80, 930);
    } else {
      ctx.fillStyle = '#FDE68A';
      ctx.font = 'bold 80px monospace';
      ctx.fillText(parseInt(p.price).toLocaleString('fr-FR') + ' HTG', 60, 820);
    }

    // Vendeur
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '36px sans-serif';
    ctx.fillText('Par ' + (p.seller || 'Vendeur Ga-Izan'), 60, 980);

    // "Payez à la livraison"
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('✅ Payez à la livraison', 1020, 980);
    ctx.textAlign = 'left';

    // Télécharger
    var link = document.createElement('a');
    link.download = 'ga-izan-' + (p.name || 'produit').replace(/\s+/g,'-') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('Fiche téléchargée ! 🎉', 'success');
  };

  // Charger la photo si disponible
  if (p.image_url) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(80, 170, 920, 440, 20);
      ctx.clip();
      ctx.drawImage(img, 80, 170, 920, 440);
      ctx.restore();
      drawContent();
    };
    img.onerror = function() { drawContent(); };
    img.src = p.image_url;
  } else {
    // Emoji à la place
    ctx.font = '200px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.emoji || '📦', 540, 500);
    ctx.textAlign = 'left';
    drawContent();
  }
}
