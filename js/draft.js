// ════════════════════════════════
// BROUILLON PRODUIT (localStorage, expire 72h)
// ════════════════════════════════
const DRAFT_KEY = 'gaizan_product_draft';
const DRAFT_TTL = 72 * 60 * 60 * 1000; // 72h en millisecondes

function saveDraft() {
  const cat = document.getElementById('sellCat').value;
  const draft = {
    name: document.getElementById('sellName').value.trim(),
    desc: document.getElementById('sellDesc').value.trim(),
    price: document.getElementById('sellPrice').value.trim(),
    cat: cat,
    attributes: getCategoryAttributeValues(),
    savedAt: Date.now(),
  };
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.log('Impossible de sauvegarder le brouillon');
  }
}

function getDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    // Vérifier l'expiration 72h
    if (Date.now() - draft.savedAt > DRAFT_TTL) {
      clearDraft();
      return null;
    }
    return draft;
  } catch (e) {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {}
}

function restoreDraft() {
  const draft = getDraft();
  if (!draft) return;

  const nameEl = document.getElementById('sellName');
  const descEl = document.getElementById('sellDesc');
  const priceEl = document.getElementById('sellPrice');
  const catEl = document.getElementById('sellCat');

  if (nameEl) nameEl.value = draft.name || '';
  if (descEl) descEl.value = draft.desc || '';
  if (priceEl) priceEl.value = draft.price || '';
  if (catEl && draft.cat) {
    catEl.value = draft.cat;
    renderCategoryAttributes(draft.cat);
    // Restaurer les attributs après un court délai
    setTimeout(function() {
      if (draft.attributes) {
        Object.keys(draft.attributes).forEach(function(key) {
          const el = document.getElementById('attr_' + key);
          if (el) el.value = draft.attributes[key];
        });
      }
    }, 100);
  }

  toast('Ton brouillon a été restauré', 'success');
  clearDraft();
}