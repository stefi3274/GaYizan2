// ════════════════════════════════
// ATTRIBUTS DYNAMIQUES PAR CATÉGORIE
// ════════════════════════════════
const CATEGORY_ATTRIBUTES = {
  vetement: [
    { id: 'attr_taille', label: 'Taille', type: 'select', options: ['XS','S','M','L','XL','XXL','XXXL'] },
    { id: 'attr_couleur', label: 'Couleur', type: 'text', placeholder: 'Ex: Rouge, Bleu...' },
    { id: 'attr_etat', label: 'État', type: 'select', options: ['Neuf','Très bon','Bon','Usagé'] },
    { id: 'attr_matiere', label: 'Matière', type: 'text', placeholder: 'Ex: Coton, Polyester...' },
  ],
  chaussures: [
    { id: 'attr_pointure', label: 'Pointure', type: 'number', placeholder: 'Ex: 42' },
    { id: 'attr_couleur', label: 'Couleur', type: 'text', placeholder: 'Ex: Noir, Blanc...' },
    { id: 'attr_etat', label: 'État', type: 'select', options: ['Neuf','Très bon','Bon','Usagé'] },
    { id: 'attr_marque', label: 'Marque', type: 'text', placeholder: 'Ex: Nike, Adidas...' },
  ],
  electronique: [
    { id: 'attr_marque', label: 'Marque', type: 'text', placeholder: 'Ex: Samsung, Apple...' },
    { id: 'attr_modele', label: 'Modèle', type: 'text', placeholder: 'Ex: Galaxy S21...' },
    { id: 'attr_etat', label: 'État', type: 'select', options: ['Neuf','Très bon','Bon','Usagé'] },
    { id: 'attr_stockage', label: 'Stockage (GB)', type: 'number', placeholder: 'Ex: 128' },
    { id: 'attr_couleur', label: 'Couleur', type: 'text', placeholder: 'Ex: Noir...' },
  ],
  maison: [
    { id: 'attr_type', label: 'Type', type: 'select', options: ['Meuble','Électroménager','Décoration','Autre'] },
    { id: 'attr_etat', label: 'État', type: 'select', options: ['Neuf','Très bon','Bon','Usagé'] },
    { id: 'attr_matiere', label: 'Matière', type: 'text', placeholder: 'Ex: Bois, Métal...' },
    { id: 'attr_dimensions', label: 'Dimensions', type: 'text', placeholder: 'Ex: 120x60x80 cm' },
  ],
  alimentation: [
    { id: 'attr_quantite', label: 'Quantité', type: 'number', placeholder: 'Ex: 5' },
    { id: 'attr_unite', label: 'Unité', type: 'select', options: ['kg','g','litre','ml','pièce','sac','boîte'] },
    { id: 'attr_expiration', label: 'Date d\'expiration', type: 'text', placeholder: 'Ex: 12/2025' },
    { id: 'attr_origine', label: 'Origine', type: 'text', placeholder: 'Ex: Haïti, USA...' },
  ],
  beaute: [
    { id: 'attr_marque', label: 'Marque', type: 'text', placeholder: 'Ex: L\'Oréal...' },
    { id: 'attr_type', label: 'Type', type: 'select', options: ['Soin','Maquillage','Parfum','Cheveux','Autre'] },
    { id: 'attr_pour', label: 'Pour', type: 'select', options: ['Femme','Homme','Unisexe','Enfant'] },
    { id: 'attr_etat', label: 'État', type: 'select', options: ['Neuf','Ouvert'] },
  ],
  auto: [
    { id: 'attr_marque', label: 'Marque', type: 'text', placeholder: 'Ex: Toyota, Honda...' },
    { id: 'attr_modele', label: 'Modèle', type: 'text', placeholder: 'Ex: Corolla, Civic...' },
    { id: 'attr_annee', label: 'Année', type: 'number', placeholder: 'Ex: 2018' },
    { id: 'attr_couleur', label: 'Couleur', type: 'text', placeholder: 'Ex: Blanc...' },
    { id: 'attr_kilometrage', label: 'Kilométrage', type: 'number', placeholder: 'Ex: 85000' },
    { id: 'attr_carburant', label: 'Carburant', type: 'select', options: ['Essence','Diesel','Électrique','Hybride'] },
    { id: 'attr_etat', label: 'État', type: 'select', options: ['Excellent','Très bon','Bon','À réparer'] },
  ],
  agriculture: [
    { id: 'attr_type', label: 'Type', type: 'select', options: ['Plante','Outil','Semence','Animal','Engrais','Autre'] },
    { id: 'attr_quantite', label: 'Quantité', type: 'number', placeholder: 'Ex: 10' },
    { id: 'attr_unite', label: 'Unité', type: 'select', options: ['kg','litre','pièce','sac'] },
  ],
  jouets: [
    { id: 'attr_plateforme', label: 'Plateforme', type: 'select', options: ['PS4','PS5','Xbox','Nintendo Switch','PC','Mobile','Aucune'] },{ id: 'attr_etat', label: 'État', type: 'select', options: ['Neuf','Très bon','Bon','Usagé'] },
    { id: 'attr_age', label: 'Âge minimum', type: 'select', options: ['0-2 ans','3-5 ans','6-10 ans','11-14 ans','15+ ans'] },
  ],
  sport: [
    { id: 'attr_sport', label: 'Type de sport', type: 'text', placeholder: 'Ex: Football, Natation...' },
    { id: 'attr_etat', label: 'État', type: 'select', options: ['Neuf','Très bon','Bon','Usagé'] },
    { id: 'attr_marque', label: 'Marque', type: 'text', placeholder: 'Ex: Nike, Adidas...' },
    { id: 'attr_taille', label: 'Taille', type: 'text', placeholder: 'Ex: M, L, 42...' },
  ],
  formation: [
    { id: 'attr_niveau', label: 'Niveau', type: 'select', options: ['Débutant','Intermédiaire','Avancé','Tous niveaux'] },
    { id: 'attr_format', label: 'Format', type: 'select', options: ['En ligne','Présentiel','PDF','Vidéo','Autre'] },
    { id: 'attr_duree', label: 'Durée', type: 'text', placeholder: 'Ex: 3 heures, 2 semaines...' },
    { id: 'attr_langue', label: 'Langue', type: 'select', options: ['Créole','Français','Anglais','Espagnol'] },
  ],
  digital: [
    { id: 'attr_format', label: 'Format', type: 'select', options: ['PDF','Word','Excel','Image','Vidéo','Audio','Logiciel','Autre'] },
    { id: 'attr_langue', label: 'Langue', type: 'select', options: ['Créole','Français','Anglais','Espagnol'] },
  ],
  services: [
    { id: 'attr_type', label: 'Type de service', type: 'text', placeholder: 'Ex: Plomberie, Coiffure...' },
    { id: 'attr_zone', label: 'Zone de service', type: 'text', placeholder: 'Ex: Pétion-Ville, Delmas...' },
    { id: 'attr_disponibilite', label: 'Disponibilité', type: 'select', options: ['Lundi-Vendredi','Weekend','Tous les jours','Sur rendez-vous'] },
  ],
  artisanat: [
    { id: 'attr_type', label: 'Type', type: 'text', placeholder: 'Ex: Peinture, Sculpture...' },
    { id: 'attr_matiere', label: 'Matière', type: 'text', placeholder: 'Ex: Bois, Métal, Tissu...' },
    { id: 'attr_dimensions', label: 'Dimensions', type: 'text', placeholder: 'Ex: 30x40 cm' },
  ],
  art: [
    { id: 'attr_type', label: 'Type', type: 'select', options: ['Peinture','Sculpture','Tissu','Poterie','Bijou artisanal','Autre'] },
    { id: 'attr_matiere', label: 'Matière', type: 'select', options: ['Bois','Métal','Tissu','Argile','Papier','Autre'] },
    { id: 'attr_dimensions', label: 'Dimensions', type: 'text', placeholder: 'Ex: 30x40 cm' },
    { id: 'attr_signe', label: 'Signé par l\'artiste', type: 'select', options: ['Oui','Non'] },
  ],
  photo: [
    { id: 'attr_type', label: 'Type', type: 'select', options: ['Photo','Vidéo','Montage','Retouche','Autre'] },
    { id: 'attr_format', label: 'Format livraison', type: 'select', options: ['Fichier numérique','Impression','Les deux'] },
  ],
  construction: [
    { id: 'attr_type', label: 'Type', type: 'text', placeholder: 'Ex: Ciment, Fer, Peinture...' },
    { id: 'attr_quantite', label: 'Quantité', type: 'number', placeholder: 'Ex: 50' },
    { id: 'attr_unite', label: 'Unité', type: 'select', options: ['kg','litre','sac','pièce','m²','m'] },
    { id: 'attr_marque', label: 'Marque', type: 'text', placeholder: 'Ex: Caribe...' },
  ],
  animaux: [
    { id: 'attr_espece', label: 'Espèce', type: 'text', placeholder: 'Ex: Chien, Chat, Poule...' },
    { id: 'attr_race', label: 'Race', type: 'text', placeholder: 'Ex: Labrador...' },
    { id: 'attr_age', label: 'Âge', type: 'text', placeholder: 'Ex: 2 ans, 6 mois...' },
    { id: 'attr_sexe', label: 'Sexe', type: 'select', options: ['Mâle','Femelle','Inconnu'] },
  ],
  musique: [
    { id: 'attr_type', label: 'Type', type: 'select', options: ['Instrument','Accessoire','Partition','Cours','Autre'] },
    { id: 'attr_marque', label: 'Marque', type: 'text', placeholder: 'Ex: Yamaha, Gibson...' },{ id: 'attr_etat', label: 'État', type: 'select', options: ['Neuf','Très bon','Bon','Usagé'] },
  ],
  electrique: [
    { id: 'attr_type', label: 'Type', type: 'select', options: ['Câble','Ampoule','Disjoncteur','Groupe électrogène','Prise','Interrupteur','Autre'] },
    { id: 'attr_marque', label: 'Marque', type: 'text', placeholder: 'Ex: Schneider...' },
    { id: 'attr_voltage', label: 'Voltage', type: 'select', options: ['110V','220V','Les deux'] },
    { id: 'attr_etat', label: 'État', type: 'select', options: ['Neuf','Bon','Usagé'] },
  ],
  bijoux: [
    { id: 'attr_type', label: 'Type', type: 'select', options: ['Collier','Bracelet','Bague','Boucles d\'oreilles','Montre','Autre'] },
    { id: 'attr_matiere', label: 'Matière', type: 'select', options: ['Or','Argent','Acier','Plaqué or','Fantaisie'] },
    { id: 'attr_etat', label: 'État', type: 'select', options: ['Neuf','Très bon','Bon'] },
    { id: 'attr_pour', label: 'Pour', type: 'select', options: ['Femme','Homme','Unisexe'] },
  ],
};

function renderCategoryAttributes(cat) {
  const wrap = document.getElementById('attrWrap');
  if (!wrap) return;
  const attrs = CATEGORY_ATTRIBUTES[cat];
  if (!attrs || !attrs.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = '<div class="divider"></div><div class="section-lbl">Détails du produit</div>' +
    attrs.map(function(a) {
      if (a.type === 'select') {
        return '<div class="field"><label>' + a.label + '</label><select id="' + a.id + '">' +
          '<option value="">— Choisir —</option>' +
          a.options.map(function(o) { return '<option value="' + o + '">' + o + '</option>'; }).join('') +
          '</select></div>';
      }
      return '<div class="field"><label>' + a.label + '</label><input id="' + a.id + '" type="' + a.type + '" placeholder="' + (a.placeholder||'') + '"/></div>';
    }).join('');
}

function getCategoryAttributeValues() {
  const cat = document.getElementById('sellCat').value;
  const attrs = CATEGORY_ATTRIBUTES[cat];
  if (!attrs) return {};
  const values = {};
  attrs.forEach(function(a) {
    const el = document.getElementById(a.id);
    if (el && el.value.trim()) values[a.id.replace('attr_','')] = el.value.trim();
  });
  return values;
}