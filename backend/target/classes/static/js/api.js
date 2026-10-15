/* ============================================================
   RestoStock Pro — couche d'acces a l'API Spring Boot
   ============================================================ */

// Si la page est ouverte directement (file://) on cible le backend en local,
// sinon on utilise le chemin relatif (page servie par Spring Boot lui-meme).
const API_BASE = (location.protocol === 'file:')
  ? 'http://localhost:8080/api'
  : '/api';

const API = {
  async requete(chemin, options = {}) {
    const reponse = await fetch(API_BASE + chemin, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (!reponse.ok) {
      let message = 'Erreur ' + reponse.status;
      try {
        const err = await reponse.json();
        message = err.message || err.erreur || message;
        if (err.details) message += ' — ' + Object.values(err.details).join(', ');
      } catch (e) { /* reponse non JSON */ }
      throw new Error(message);
    }
    if (reponse.status === 204) return null;
    const type = reponse.headers.get('content-type') || '';
    return type.includes('application/json') ? reponse.json() : reponse.text();
  },

  // --- Produits ---
  produits: (categorie, q) => {
    const p = new URLSearchParams();
    if (categorie && categorie !== 'TOUTES') p.set('categorie', categorie);
    if (q) p.set('q', q);
    const qs = p.toString();
    return API.requete('/produits' + (qs ? '?' + qs : ''));
  },
  produit: (id) => API.requete('/produits/' + id),
  alertes: () => API.requete('/produits/alertes'),
  creerProduit: (corps) => API.requete('/produits', { method: 'POST', body: corps }),
  modifierProduit: (id, corps) => API.requete('/produits/' + id, { method: 'PUT', body: corps }),
  supprimerProduit: (id) => API.requete('/produits/' + id, { method: 'DELETE' }),

  // --- Stock ---
  entree: (corps) => API.requete('/stock/entrees', { method: 'POST', body: corps }),
  sortie: (corps) => API.requete('/stock/sorties', { method: 'POST', body: corps }),
  inventaire: (corps) => API.requete('/stock/inventaire', { method: 'POST', body: corps }),
  mouvements: () => API.requete('/stock/mouvements'),
  lotsASurveiller: (jours) => API.requete('/stock/lots/a-surveiller?jours=' + (jours || 7)),

  // --- Bons de commande ---
  bons: () => API.requete('/bons-commande'),
  bon: (id) => API.requete('/bons-commande/' + id),
  creerBon: (corps) => API.requete('/bons-commande', { method: 'POST', body: corps }),
  changerStatutBon: (id, statut) => API.requete('/bons-commande/' + id + '/statut?statut=' + statut, { method: 'PATCH' }),
  viserLigne: (id, ligneId, visa) => API.requete('/bons-commande/' + id + '/lignes/' + ligneId + '/visa',
    { method: 'PATCH', body: { visa } }),
  exportBonUrl: (id) => API_BASE + '/bons-commande/' + id + '/export',

  // --- Referentiels ---
  categories: () => API.requete('/categories'),
  fournisseurs: () => API.requete('/fournisseurs'),
  creerFournisseur: (corps) => API.requete('/fournisseurs', { method: 'POST', body: corps }),

  // --- Tableau de bord / Auth ---
  dashboard: () => API.requete('/dashboard'),
  login: (corps) => API.requete('/auth/login', { method: 'POST', body: corps })
};
