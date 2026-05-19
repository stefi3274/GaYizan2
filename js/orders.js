<div class="pay-phone-box">
      <div class="pay-phone-num">${formatPhone(num)}</div>
      <div class="pay-phone-lbl">${esc(p.seller||'Vendeur')}</div>
    </div>
    <div class="pay-steps"><strong>Étapes :</strong><br>${steps}</div>
    <div class="pay-warning">⚠️ Envoie ta capture d'écran au vendeur sur WhatsApp.</div>
    <button class="btn btn-gold btn-full" onclick="confirmPay(${id},'${label}','${m}')">✅ J'ai effectué le paiement</button>
    <button class="btn btn-ghost btn-full" style="margin-top:10px;" onclick="openWA('${p.phone}','${encodeURIComponent(p.name)}','${formatPrice(p.price)}')">📱 Envoyer la preuve sur WhatsApp</button>
    <button style="margin-top:10px;background:none;border:none;color:var(--muted2);font-size:12px;cursor:pointer;width:100%;text-align:center;" onclick="openPayFlow(${id})">← Changer de méthode</button>;
}

async function confirmPay(id, label, method) {
  const p = S.products.find(x => x.id === id);
  if (!p || !S.user) return;
  const { data, error } = await sb.rpc('create_order', {
    p_product_id:     id,
    p_buyer_name:     S.profile.name || S.user.email?.split('@')[0] || 'Acheteur',
    p_payment_method: label,
    p_amount:         p.price,
  });
  if (error) {
    const msg = (error.message||'').includes('propre produit')
      ? '⚠️ Tu ne peux pas acheter ton propre produit'
      : '❌ Erreur lors de l\'enregistrement';
    toast(msg, 'error'); return;
  }
  if (data) S.myOrders.unshift(data);
  updateCartBadge();
  document.getElementById('payModalContent').innerHTML = 
    <div style="text-align:center;padding:16px 0;">
      <div style="font-size:54px;margin-bottom:14px;">✅</div>
      <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:800;margin-bottom:10px;">Paiement enregistré</div>
      <p style="font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:22px;">
        Paiement via <strong>${label}</strong> enregistré.<br>
        Envoie ta capture au vendeur.<br>
        Il confirmera ta commande sous peu.
      </p>
      <button class="btn btn-gold btn-full" onclick="openWA('${p.phone}','${encodeURIComponent(p.name)}','${formatPrice(p.price)}')">📱 Envoyer la preuve sur WhatsApp</button>
      <button class="btn btn-ghost btn-full" style="margin-top:10px;" onclick="closeModal('payModal');navigate('panier')">Voir mes commandes</button>
    </div>`;
}