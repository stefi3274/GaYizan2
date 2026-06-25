
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
      '<div style="margin-top:8px;">' +
      '<button class="btn btn-danger btn-xs" onclick="supprimerMonProduit(' + p.id + ')">🗑 Supprimer</button>' +
      '</div>' +
      '</div></div>';
  }).join('');
}



async function supprimerMonProduit(id) {
  if (!confirm('Supprimer ce produit ? Cette action est irreversible.')) return;
  var res = await sb.from('products')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', S.user.id);
  if (res.error) { toast('Erreur : ' + res.error.message, 'error'); return; }
  toast('Produit supprime', 'success');
  await loadProducts();
  renderMyProds();
}
