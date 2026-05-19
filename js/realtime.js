// ════════════════════════════════
// REALTIME
// ════════════════════════════════
function setupRealtime() {
  sb.channel('orders-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
      async (payload) => {
        if (!S.user) return;
        const row = payload.new || payload.old || {};
        if (row.buyer_id === S.user.id || row.seller_id === S.user.id) {
          await loadMyOrders();
          await loadReceivedOrders();
          if (S.page === 'panier')      renderPanier();
          if (S.page === 'my-products') renderReceivedOrders();
          if (row.buyer_id === S.user.id && payload.eventType === 'UPDATE') {
            if (payload.new?.status === 'confirmed') toast('✅ Commande confirmée !', 'success');
            if (payload.new?.status === 'cancelled') toast('❌ Commande annulée', 'error');
          }
        }
      }
    ).subscribe();
}