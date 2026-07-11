// ════════════════════════════════
// REALTIME
// ════════════════════════════════
function setupRealtime() {
  var dot = document.getElementById('syncDot');

  sb.channel('orders-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
      function(payload) {
        if (!S.user) return;
        var row = payload.new || payload.old || {};
        if (row.buyer_id === S.user.id || row.seller_id === S.user.id) {
          loadMyOrders();
          loadReceivedOrders();
          if (S.page === 'panier') renderPanier();
          if (S.page === 'my-products') { if (typeof renderReceivedOrders === 'function') renderReceivedOrders(); }
          if (row.buyer_id === S.user.id && payload.eventType === 'UPDATE') {
            if (payload.new && payload.new.status === 'confirmed') toast('✅ Commande confirmée !', 'success');
            if (payload.new && payload.new.status === 'cancelled') toast('❌ Commande annulée', 'error');
          }
        }
      }
    )
    .subscribe(function(status) {
      if (!dot) return;
      if (status === 'SUBSCRIBED') {
        dot.className = 'sync-indicator';
        dot.style.background = '#10B981';
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        dot.className = 'sync-indicator error';
      } else {
        dot.className = 'sync-indicator loading';
      }
    });
}
