function renderMyProds() {
  const el = document.getElementById('myProdList');
  if (!S.user) {
    el.innerHTML = <div class="empty-state"><div class="empty-icon">🔒</div><div class="empty-title">Connexion requise</div><div class="empty-sub">Connecte-toi pour voir tes produits.</div><button class="btn btn-primary btn-sm" onclick="openAuthModal()">Se connecter</button></div>;
    return;
  }
  const mine = S.products.filter(p => p.uid === S.user.id);
  if (!mine.length) {
    el.innerHTML = <div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">Aucun produit</div><div class="empty-sub">Tu n'as pas encore publié de produit.</div><button class="btn btn-primary btn-sm" onclick="navigate('sell')">+ Publier</button></div>;
    return;
  }
  el.innerHTML = mine.map(p => 
    <div class="my-prod">
      <div class="my-prod-img">${p.emoji}</div>
      <div class="my-prod-info">
        <div class="my-prod-name">${esc(p.name)}</div>
        <div class="my-prod-meta">${catLabel(p.cat)} · 👁 ${p.views}</div>
        <div class="my-prod-price">${formatPrice(p.price)}</div>
      </div>
      <div class="my-prod-actions">
        <button class="btn btn-outline btn-xs" onclick="openDetail(${p.id})">Voir</button>
        <button class="btn btn-danger btn-xs" onclick="delProd(${p.id})">✕</button>
      </div>
    </div>).join('');
}

function renderReceivedOrders() {
  const el = document.getElementById('receivedOrdersList');
  if (!S.user) { el.innerHTML = ''; return; }
  updatePendingBadge();
  if (!S.receivedOrders.length) {
    el.innerHTML = <div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Aucune commande</div><div class="empty-sub">Tu n'as reçu aucune commande.</div></div>;
    return;
  }
  el.innerHTML = S.receivedOrders.map(o => 
    <div class="order-card">
      <div class="order-card-top">
        <div class="order-card-name">${esc(o.product_name||'Produit')}</div>
        ${statusChip(o.status)}
      </div>
      <div class="order-card-meta">
        Acheteur : <strong>${esc(o.buyer_name||'—')}</strong> · ${esc(o.payment_method)} · ${fmtDate(o.created_at)}
      </div>
      <div class="order-card-footer">
        <div class="order-card-price">${formatPrice(o.amount)}</div>
        <div class="order-actions">
          ${o.status==='pending' ? 
            <button class="btn btn-green btn-xs" onclick="updateOrderStatus(${o.id},'confirmed')">✅</button>
            <button class="btn btn-danger btn-xs" onclick="updateOrderStatus(${o.id},'cancelled')">✗</button> : ''}
        </div>
      </div>
    </div>).join('');
}

function renderPanier() {
  const el = document.getElementById('panierList');
  if (!S.user) {
    el.innerHTML = <div class="empty-state"><div class="empty-icon">🔒</div><div class="empty-title">Connexion requise</div><div class="empty-sub">Connecte-toi pour voir tes commandes.</div><button class="btn btn-primary btn-sm" onclick="openAuthModal()">Se connecter</button></div>;
    return;
  }
  if (!S.myOrders.length) {
    el.innerHTML = <div class="empty-state"><div class="empty-icon">🛒</div><div class="empty-title">Aucune commande</div><div class="empty-sub">Tu n'as encore effectué aucune commande.</div><button class="btn btn-primary btn-sm" onclick="navigate('market')">Explorer</button></div>;
    return;
  }
  el.innerHTML = S.myOrders.map(o => 
    <div class="order-card">
      <div class="order-card-top">
        <div class="order-card-name">${esc(o.product_name||'Produit')}</div>
        ${statusChip(o.status)}
      </div>
      <div class="order-card-meta">
        Vendeur : ${esc(o.seller_name||'—')} · ${esc(o.payment_method)} · ${fmtDate(o.created_at)}
      </div>
      <div class="order-card-footer">
        <div class="order-card-price">${formatPrice(o.amount)}</div>
      </div>
    </div>).join('');
}