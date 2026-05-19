if (S.user && S.user.id !== p.uid) {
    sb.from('product_views')
      .insert({ product_id: id, viewer_id: S.user.id })
      .then(async ({ error }) => {
        if (!error) {
          await sb.from('products').update({ views: p.views + 1 }).eq('id', id);
          p.views += 1;
        }
      });
  }

  const hasMc = p.mc && p.mc.trim();
  const hasNc = p.nc && p.nc.trim();
  const isOwn = S.user && S.user.id === p.uid;

  document.getElementById('detailContent').innerHTML = 
    <div class="detail-img">
      ${p.emoji}
      <div class="detail-views">👁 ${p.views} vue${p.views>1?'s':''}</div>
    </div>
    <span class="chip chip-purple">${catLabel(p.cat)}</span>
    <div class="gap-sm"></div>
    <div class="detail-title">${esc(p.name)}</div>
    <div class="detail-price-row">
      <div class="detail-price">${parseInt(p.price).toLocaleString('fr-FR')}</div>
      <div class="detail-currency">HTG</div>
    </div>
    <div class="detail-desc">${esc(p.desc||'')}</div>
    <div class="seller-card">
      <div class="seller-av">${(p.seller||'?')[0].toUpperCase()}</div>
      <div>
        <div class="seller-name">${esc(p.seller||'—')}</div>
        <div class="seller-meta">Publié ${fmtDate(p.created_at)}</div>
      </div>
    </div>
    <div class="detail-actions">
      ${isOwn ? <div class="pay-warning">C'est ton propre produit.</div> : ''}
      ${(!isOwn && (hasMc||hasNc)) ? <button class="btn btn-gold btn-full" onclick="openPayFlow(${p.id})">💳 Procéder au paiement</button> : ''}
      ${!isOwn ? <button class="btn btn-primary btn-full" onclick="openWA('${p.phone}','${encodeURIComponent(p.name)}','${formatPrice(p.price)}')">📱 Contacter sur WhatsApp</button> : ''}
      <button class="btn btn-ghost btn-full" onclick="goBack()">← Retour</button>
    </div>;
}

function openWA(phone, name, price) {
  const msg = encodeURIComponent('Bonjour ! Je suis intéressé(e) par "' + decodeURIComponent(name) + '" (Prix : ' + price + ') sur GAyizan.');
  window.open('https://wa.me/' + phone.replace(/\D/g,'') + '?text=' + msg, '_blank');
}