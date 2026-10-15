/* ============================================================
   RestoStock Pro — interface (JavaScript natif, sans build)
   Reprend et ameliore l'application d'origine :
   inventaire, alertes, bons de commande, mouvements, lots/DLC.
   ============================================================ */

const state = {
  onglet: 'dashboard',
  produits: [],
  categories: [],
  alertes: [],
  mouvements: [],
  bons: [],
  dashboard: null,
  filtreCategorie: 'TOUTES',
  recherche: '',
  utilisateur: null,
  chargement: false
};

/* ---------- Utilitaires ---------- */
const fcfa = (n) => (n === null || n === undefined || n === '') ? '0' :
  Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' FCFA';
const qte = (n) => (n === null || n === undefined) ? '0' : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 3 });
const dateFr = (s) => !s ? '—' : new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const dateHeureFr = (s) => !s ? '—' : new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(message, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = 'toast show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'toast ' + type; }, 3600);
}

function ouvrirModal(titre, contenuHtml) {
  document.getElementById('modal-box').innerHTML = `
    <div class="flex justify-between items-start mb-5">
      <h3 class="text-xl font-extrabold text-slate-800">${titre}</h3>
      <button onclick="fermerModal()" class="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
    </div>${contenuHtml}`;
  document.getElementById('modal').classList.remove('hidden');
}
function fermerModal() { document.getElementById('modal').classList.add('hidden'); }

function classeEtat(p) {
  if (Number(p.stockActuel) <= 0) return '<span class="badge bg-rose-600 text-white">RUPTURE</span>';
  if (Number(p.stockActuel) <= Number(p.stockMin)) return '<span class="badge bg-rose-100 text-rose-800">⚠ Stock faible</span>';
  if (Number(p.stockMin) > 0 && Number(p.stockActuel) <= Number(p.stockMin) * 1.2) return '<span class="badge bg-amber-100 text-amber-800">Vigilance</span>';
  return '<span class="badge bg-emerald-100 text-emerald-800">✓ OK</span>';
}

/* ---------- Chargement des donnees ---------- */
async function chargerTout() {
  state.chargement = true;
  afficher();
  try {
    const [produits, categories, dashboard, mouvements, bons] = await Promise.all([
      API.produits(), API.categories(), API.dashboard(), API.mouvements(), API.bons()
    ]);
    state.produits = produits;
    state.categories = categories;
    state.dashboard = dashboard;
    state.mouvements = mouvements;
    state.bons = bons;
    state.alertes = produits.filter(p => Number(p.stockActuel) <= Number(p.stockMin));
  } catch (e) {
    toast('Connexion a l\'API impossible : ' + e.message, 'error');
  } finally {
    state.chargement = false;
    afficher();
  }
}

/* ---------- Coquille de l'interface ---------- */
const ONGLETS = [
  { id: 'dashboard', libelle: 'Tableau de bord', icone: '📊' },
  { id: 'stock', libelle: 'Inventaire & Stock', icone: '📦' },
  { id: 'commande', libelle: 'Bon de Commande', icone: '🛒' },
  { id: 'bons', libelle: 'Bons & Historique', icone: '📑' },
  { id: 'mouvements', libelle: 'Mouvements', icone: '📋' },
  { id: 'reception', libelle: 'Réception Lot', icone: '📥' },
  { id: 'sortie', libelle: 'Sortie / Consommation', icone: '📤' },
  { id: 'lots', libelle: 'Lots & DLC', icone: '🗓️' },
  { id: 'nouveau', libelle: 'Créer un Produit', icone: '➕' }
];

function afficher() {
  const app = document.getElementById('app');
  if (state.chargement) { app.innerHTML = '<div class="spinner"></div>'; return; }
  app.innerHTML = `
    ${entete()}
    ${barreNavigation()}
    <main class="max-w-7xl mx-auto px-4 pb-16">${contenuOnglet()}</main>
    <footer class="text-center text-xs text-slate-400 pb-8">
      RestoStock Pro — Spring Boot 3 · MySQL (XAMPP) · API REST · ${new Date().getFullYear()}
    </footer>`;
}

function entete() {
  const d = state.dashboard || {};
  return `
  <header class="bg-slate-900 text-white px-4 md:px-8 py-6 mb-6">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
      <div class="flex items-center gap-3">
        <span class="bg-amber-500 text-slate-900 font-black px-3 py-1.5 rounded-lg text-lg">RESTO</span>
        <div>
          <h1 class="text-xl md:text-2xl font-bold tracking-wide">EDELYNE COFFEE HOUSE & RESTAURANT</h1>
          <p class="text-slate-400 text-xs md:text-sm">Gestion de stock, lots FIFO/DLC & bons de commande — back-end Java</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        <div class="bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700">
          <p class="text-[10px] uppercase text-slate-400 font-bold">Valeur du stock</p>
          <p class="text-lg font-black text-amber-400">${fcfa(d.valeurTotaleStock)}</p>
        </div>
        <div class="bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700">
          <p class="text-[10px] uppercase text-slate-400 font-bold">Alertes</p>
          <p class="text-lg font-black text-rose-400">${state.alertes.length} article(s)</p>
        </div>
        <button onclick="chargerTout()" class="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm no-print">↻ Rafraîchir</button>
      </div>
    </div>
  </header>`;
}

function barreNavigation() {
  return `
  <nav class="max-w-7xl mx-auto px-4 mb-6 no-print">
    <div class="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
      ${ONGLETS.map(o => `
        <button onclick="allerA('${o.id}')"
          class="nav-btn px-3.5 py-2.5 rounded-lg font-bold text-sm transition ${state.onglet === o.id ? 'active' : 'text-slate-600 hover:bg-slate-100'}">
          ${o.icone} ${o.libelle}${o.id === 'commande' && state.alertes.length ? ` <span class="badge bg-rose-500 text-white ml-1">${state.alertes.length}</span>` : ''}
        </button>`).join('')}
    </div>
  </nav>`;
}

function allerA(onglet) { state.onglet = onglet; fermerModal(); afficher(); }

function contenuOnglet() {
  switch (state.onglet) {
    case 'dashboard': return vueDashboard();
    case 'stock': return vueStock();
    case 'commande': return vueBonDeCommande();
    case 'bons': return vueBons();
    case 'mouvements': return vueMouvements();
    case 'reception': return vueReception();
    case 'sortie': return vueSortie();
    case 'lots': return vueLots();
    case 'nouveau': return vueNouveauProduit();
    default: return '';
  }
}

/* ---------- 1. Tableau de bord ---------- */
function vueDashboard() {
  const d = state.dashboard || {};
  const cartes = [
    { t: 'Valeur totale du stock', v: fcfa(d.valeurTotaleStock), c: 'text-amber-600' },
    { t: 'Articles au catalogue', v: d.nombreProduits ?? 0, c: 'text-slate-800' },
    { t: 'Articles en alerte', v: d.nombreAlertes ?? 0, c: 'text-rose-600' },
    { t: 'Articles en rupture', v: d.nombreProduitsEnRupture ?? 0, c: 'text-rose-700' },
    { t: 'Lots périmés', v: d.nombreLotsPerimes ?? 0, c: 'text-rose-600' },
    { t: 'Lots DLC < 7 jours', v: d.nombreLotsDlcProche ?? 0, c: 'text-amber-600' },
    { t: 'Bons en attente', v: d.nombreBonsEnAttente ?? 0, c: 'text-sky-600' },
    { t: 'Consommation du mois', v: fcfa(d.consommationMois), c: 'text-slate-800' }
  ];
  const cats = Object.entries(d.valeurParCategorie || {});
  const maxVal = Math.max(1, ...cats.map(([, v]) => Number(v)));

  return `
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    ${cartes.map(c => `
      <div class="kpi-card bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <p class="text-[11px] font-bold uppercase text-slate-400">${c.t}</p>
        <p class="text-lg md:text-xl font-black mt-1 ${c.c}">${c.v}</p>
      </div>`).join('')}
  </div>

  <div class="grid md:grid-cols-2 gap-6">
    <section class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h2 class="text-lg font-extrabold mb-4">Valeur du stock par catégorie</h2>
      ${cats.length === 0 ? '<p class="text-slate-400 text-sm">Aucune donnée</p>' : cats.map(([nom, val]) => `
        <div class="mb-3">
          <div class="flex justify-between text-xs font-bold text-slate-600 mb-1">
            <span>${esc(nom)}</span><span>${fcfa(val)}</span>
          </div>
          <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-amber-500" style="width:${(Number(val) / maxVal * 100).toFixed(1)}%"></div>
          </div>
        </div>`).join('')}
    </section>

    <section class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h2 class="text-lg font-extrabold mb-4">Priorités de réapprovisionnement</h2>
      ${(d.principalesAlertes || []).length === 0
        ? '<p class="text-emerald-600 font-bold text-sm">🎉 Aucun article sous le seuil minimum.</p>'
        : `<div class="divide-y divide-slate-100">${d.principalesAlertes.map(a => `
            <div class="py-2.5 flex justify-between items-center gap-3">
              <div class="min-w-0">
                <p class="font-bold text-sm text-slate-800 truncate">${esc(a.designation)}</p>
                <p class="text-[11px] text-slate-400">${esc(a.code)} · ${esc(a.categorie)}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs font-bold text-rose-600">${qte(a.stockActuel)} / ${qte(a.stockMin)} ${esc(a.unite)}</p>
                <p class="text-[11px] text-slate-500">à commander : <b>${qte(a.quantiteACommander)}</b></p>
              </div>
            </div>`).join('')}</div>`}
      <button onclick="allerA('commande')" class="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm">
        🛒 Voir le bon de commande
      </button>
    </section>
  </div>`;
}

/* ---------- 2. Inventaire ---------- */
function produitsFiltres() {
  let liste = state.produits;
  if (state.filtreCategorie !== 'TOUTES') {
    liste = liste.filter(p => (p.categorie?.nom || p.categorie?.code || '') === state.filtreCategorie);
  }
  if (state.recherche) {
    const r = state.recherche.toLowerCase();
    liste = liste.filter(p => (p.designation + ' ' + p.code).toLowerCase().includes(r));
  }
  return liste;
}

function vueStock() {
  const liste = produitsFiltres();
  const valeur = liste.reduce((s, p) => s + Number(p.stockActuel) * Number(p.prixUnitaire || 0), 0);
  return `
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
      <div>
        <h2 class="text-xl font-extrabold">État général des stocks</h2>
        <p class="text-sm text-slate-500">${liste.length} article(s) · valeur affichée ${fcfa(valeur)}</p>
      </div>
      <div class="flex flex-wrap gap-2 no-print">
        <input type="search" placeholder="Rechercher un article…" value="${esc(state.recherche)}"
          oninput="state.recherche=this.value; afficher(); document.querySelector('input[type=search]').focus();"
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm w-56">
        <select onchange="state.filtreCategorie=this.value; afficher();" class="border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium">
          <option value="TOUTES">Toutes les catégories</option>
          ${state.categories.map(c => `<option value="${esc(c.nom)}" ${state.filtreCategorie === c.nom ? 'selected' : ''}>${esc(c.nom)}</option>`).join('')}
        </select>
        <button onclick="window.print()" class="border border-slate-300 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-50">🖨 Imprimer</button>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider">
          <tr>
            <th class="p-3">Code</th><th class="p-3">Désignation</th><th class="p-3">Catégorie</th>
            <th class="p-3 text-center">Unité</th><th class="p-3 text-right">Stock min</th>
            <th class="p-3 text-right">Stock actuel</th><th class="p-3 text-right">Prix unitaire</th>
            <th class="p-3 text-right">Valeur</th><th class="p-3 text-center">État</th><th class="p-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${liste.length === 0 ? '<tr><td colspan="10" class="p-8 text-center text-slate-400">Aucun article ne correspond à la recherche.</td></tr>' :
            liste.map(p => `
            <tr>
              <td class="p-3 font-mono font-bold text-slate-500">${esc(p.code)}</td>
              <td class="p-3 font-bold text-slate-900">${esc(p.designation)}</td>
              <td class="p-3 text-xs">${p.categorie ? `<span class="badge" style="background:${esc(p.categorie.couleur)}22;color:${esc(p.categorie.couleur)}">${esc(p.categorie.icone || '')} ${esc(p.categorie.nom)}</span>` : '—'}</td>
              <td class="p-3 text-center text-slate-500">${esc(p.unite)}</td>
              <td class="p-3 text-right text-slate-400 font-semibold">${qte(p.stockMin)}</td>
              <td class="p-3 text-right font-black ${Number(p.stockActuel) <= Number(p.stockMin) ? 'text-rose-600' : 'text-slate-800'}">${qte(p.stockActuel)}</td>
              <td class="p-3 text-right">${fcfa(p.prixUnitaire)}</td>
              <td class="p-3 text-right font-bold">${fcfa(p.valeurStock)}</td>
              <td class="p-3 text-center">${classeEtat(p)}</td>
              <td class="p-3 text-right no-print">
                <button onclick="modalModifierProduit(${p.id})" class="text-slate-400 hover:text-slate-800 font-bold">✎</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </section>`;
}

/* ---------- 3. Bon de commande (alertes) ---------- */
function vueBonDeCommande() {
  const alertes = state.alertes;
  const total = alertes.reduce((s, p) => s + Number(p.quantiteACommander || 0) * Number(p.prixUnitaire || 0), 0);
  return `
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
      <div>
        <h2 class="text-xl font-extrabold">Bon de commande & réapprovisionnement</h2>
        <p class="text-sm text-slate-500">Articles ayant atteint ou franchi le seuil minimum</p>
      </div>
      <div class="flex gap-2 no-print">
        <button onclick="window.print()" class="border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50">🖨 Imprimer</button>
        <button onclick="modalGenererBon()" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm">
          🛒 Générer le bon de commande
        </button>
      </div>
    </div>
    ${alertes.length === 0 ? `
      <div class="p-12 text-center text-emerald-600 font-bold">🎉 Tous vos stocks sont au niveau optimal. Aucune commande nécessaire !</div>` : `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-rose-50 text-rose-900 text-[11px] uppercase tracking-wider">
            <tr>
              <th class="p-3">Priorité</th><th class="p-3">Code</th><th class="p-3">Article</th>
              <th class="p-3">Catégorie</th><th class="p-3 text-right">Stock min</th>
              <th class="p-3 text-right">Stock actuel</th><th class="p-3 text-right">Qté à commander</th>
              <th class="p-3 text-right">P.U.</th><th class="p-3 text-right">Total estimé</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${alertes.map(p => {
              const q = Number(p.quantiteACommander || 0);
              return `<tr>
                <td class="p-3"><span class="badge bg-rose-600 text-white">URGENT</span></td>
                <td class="p-3 font-mono font-bold text-slate-500">${esc(p.code)}</td>
                <td class="p-3 font-bold">${esc(p.designation)}</td>
                <td class="p-3 text-xs text-slate-500">${esc(p.categorie?.nom || '—')}</td>
                <td class="p-3 text-right text-slate-400">${qte(p.stockMin)} ${esc(p.unite)}</td>
                <td class="p-3 text-right font-black text-rose-600">${qte(p.stockActuel)} ${esc(p.unite)}</td>
                <td class="p-3 text-right font-black bg-amber-50">${qte(q)} ${esc(p.unite)}</td>
                <td class="p-3 text-right">${fcfa(p.prixUnitaire)}</td>
                <td class="p-3 text-right font-extrabold">${fcfa(q * Number(p.prixUnitaire || 0))}</td>
              </tr>`; }).join('')}
            <tr class="bg-slate-900 text-white font-black">
              <td colspan="8" class="p-3 text-right">MONTANT TOTAL ESTIMÉ</td>
              <td class="p-3 text-right text-amber-400">${fcfa(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>`}
  </section>`;
}

/* ---------- 4. Bons enregistres ---------- */
function vueBons() {
  return `
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <h2 class="text-xl font-extrabold mb-5">Bons de commande enregistrés</h2>
    ${state.bons.length === 0 ? '<p class="text-slate-400 text-sm">Aucun bon de commande pour le moment. Générez-en un depuis l\'onglet « Bon de Commande ».</p>' : `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider">
          <tr>
            <th class="p-3">Numéro</th><th class="p-3">Date</th><th class="p-3">Service</th>
            <th class="p-3">Responsable</th><th class="p-3 text-center">Lignes</th>
            <th class="p-3 text-right">Montant estimé</th><th class="p-3 text-center">Statut</th><th class="p-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${state.bons.map(b => `
            <tr>
              <td class="p-3 font-mono font-bold">${esc(b.numero)}</td>
              <td class="p-3 text-xs text-slate-500">${dateHeureFr(b.dateCreation)}</td>
              <td class="p-3">${esc(b.service || '—')}</td>
              <td class="p-3">${esc(b.responsable || '—')}</td>
              <td class="p-3 text-center font-bold">${(b.lignes || []).length}</td>
              <td class="p-3 text-right font-bold">${fcfa(b.montantEstime)}</td>
              <td class="p-3 text-center"><span class="badge ${b.statut === 'BROUILLON' ? 'bg-slate-200 text-slate-700' : b.statut === 'ANNULE' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}">${esc(b.statut)}</span></td>
              <td class="p-3 text-right whitespace-nowrap no-print">
                <button onclick='modalVoirBon(${b.id})' class="text-slate-500 hover:text-slate-900 font-bold mr-2" title="Voir">👁</button>
                <a href="${API.exportBonUrl(b.id)}" class="text-slate-500 hover:text-emerald-700 font-bold" title="Exporter CSV">⬇</a>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`}
  </section>`;
}

/* ---------- 5. Mouvements ---------- */
function vueMouvements() {
  return `
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-xl font-extrabold">Registre historique des mouvements</h2>
      <button onclick="window.print()" class="border border-slate-300 px-3 py-2 rounded-lg text-sm font-bold no-print">🖨 Imprimer</button>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider">
          <tr>
            <th class="p-3">Date & heure</th><th class="p-3">Code</th><th class="p-3">Produit</th>
            <th class="p-3">Type</th><th class="p-3 text-right">Quantité</th>
            <th class="p-3 text-right">Valeur</th><th class="p-3">Responsable</th><th class="p-3">Commentaire</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${state.mouvements.length === 0 ? '<tr><td colspan="8" class="p-8 text-center text-slate-400">Aucun mouvement enregistré.</td></tr>' :
            state.mouvements.map(m => `
            <tr>
              <td class="p-3 text-xs text-slate-500 whitespace-nowrap">${dateHeureFr(m.dateMouvement)}</td>
              <td class="p-3 font-mono font-bold text-slate-500">${esc(m.produit?.code || '')}</td>
              <td class="p-3 font-bold">${esc(m.produit?.designation || '')}</td>
              <td class="p-3"><span class="badge ${String(m.type).startsWith('ENTREE') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${esc(m.type)}</span></td>
              <td class="p-3 text-right font-black ${Number(m.quantite) > 0 ? 'text-emerald-600' : 'text-rose-600'}">
                ${Number(m.quantite) > 0 ? '+' : ''}${qte(m.quantite)} ${esc(m.unite || '')}</td>
              <td class="p-3 text-right text-slate-600">${fcfa(m.valeurTotale)}</td>
              <td class="p-3">${esc(m.responsable || '—')}</td>
              <td class="p-3 text-xs text-slate-500">${esc(m.commentaire || '—')}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </section>`;
}

/* ---------- 6. Reception ---------- */
function vueReception() {
  return `
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto">
    <h2 class="text-xl font-extrabold mb-1">Réception & entrée en stock</h2>
    <p class="text-sm text-slate-500 mb-5">Crée un lot tracé (FIFO) et recalcule le prix moyen pondéré.</p>
    <form onsubmit="soumettreEntree(event)" class="space-y-4">
      <div>
        <label class="block text-sm font-bold mb-1">Article</label>
        <select name="produitId" required class="w-full border border-slate-300 p-3 rounded-xl font-semibold bg-white">
          ${state.produits.map(p => `<option value="${p.id}">[${esc(p.code)}] ${esc(p.designation)} — ${esc(p.unite)}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Quantité reçue</label>
          <input type="number" step="0.01" min="0.01" required name="quantite" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Prix d'achat unitaire (FCFA)</label>
          <input type="number" step="1" min="0" name="prixAchat" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">DLC (péremption)</label>
          <input type="date" name="dlc" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">N° de facture / bon</label>
          <input type="text" name="numeroFacture" placeholder="ex: FA-2026-014" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
      </div>
      <div>
        <label class="block text-sm font-bold mb-1">Responsable / commentaire</label>
        <input type="text" name="commentaire" placeholder="ex: Livraison du matin" class="w-full border border-slate-300 p-3 rounded-xl">
      </div>
      <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl">✅ Valider l'entrée en stock</button>
    </form>
  </section>`;
}

/* ---------- 7. Sortie ---------- */
function vueSortie() {
  return `
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto">
    <h2 class="text-xl font-extrabold mb-1">Sortie de stock / consommation</h2>
    <p class="text-sm text-slate-500 mb-5">Déduction automatique des lots en FIFO, ou FEFO (par DLC) si activé.</p>
    <form onsubmit="soumettreSortie(event)" class="space-y-4">
      <div>
        <label class="block text-sm font-bold mb-1">Article</label>
        <select name="produitId" required class="w-full border border-slate-300 p-3 rounded-xl font-semibold bg-white">
          ${state.produits.map(p => `<option value="${p.id}">[${esc(p.code)}] ${esc(p.designation)} — stock : ${qte(p.stockActuel)} ${esc(p.unite)}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Quantité à sortir</label>
          <input type="number" step="0.01" min="0.01" required name="quantite" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Motif de sortie</label>
          <select name="type" class="w-full border border-slate-300 p-3 rounded-xl bg-white">
            <option value="SORTIE_CUISINE">Sortie cuisine / préparation</option>
            <option value="SORTIE_BAR">Sortie bar</option>
            <option value="SORTIE_PATISSERIE">Sortie pâtisserie</option>
            <option value="PERTE_PERIMEE">Perte / périmé</option>
            <option value="CASSE_DEGRADATION">Casse / dégradation</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Responsable</label>
          <input type="text" name="responsable" placeholder="ex: Service du soir" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
        <div class="flex items-end">
          <label class="flex items-center gap-2 text-sm font-bold pb-3">
            <input type="checkbox" name="fefo" class="w-4 h-4"> Sortir par DLC (FEFO)
          </label>
        </div>
      </div>
      <button type="submit" class="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3.5 rounded-xl">📤 Valider la sortie</button>
    </form>
  </section>`;
}

/* ---------- 8. Lots & DLC ---------- */
function vueLots() {
  const lots = state.lotsSurveilles || [];
  return `
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <div class="flex justify-between items-center mb-5">
      <div>
        <h2 class="text-xl font-extrabold">Lots & dates limites de consommation</h2>
        <p class="text-sm text-slate-500">Lots dont la DLC tombe dans les 7 prochains jours</p>
      </div>
      <button onclick="chargerLots()" class="border border-slate-300 px-3 py-2 rounded-lg text-sm font-bold no-print">↻ Actualiser</button>
    </div>
    ${lots.length === 0 ? '<p class="text-slate-400 text-sm">Aucun lot proche de sa DLC (ou aucun lot enregistré pour l\'instant).</p>' : `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider">
          <tr><th class="p-3">N° lot</th><th class="p-3">Produit</th><th class="p-3 text-right">Restant</th>
          <th class="p-3">Entrée</th><th class="p-3">DLC</th><th class="p-3 text-center">Jours restants</th></tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${lots.map(l => `
            <tr>
              <td class="p-3 font-mono text-xs font-bold">${esc(l.numeroLot)}</td>
              <td class="p-3 font-bold">${esc(l.produit?.designation || '')}</td>
              <td class="p-3 text-right">${qte(l.quantiteRestante)} ${esc(l.unite || '')}</td>
              <td class="p-3 text-xs text-slate-500">${dateFr(l.dateEntree)}</td>
              <td class="p-3 text-xs">${dateFr(l.dlc)}</td>
              <td class="p-3 text-center">
                <span class="badge ${l.perime ? 'bg-rose-600 text-white' : (l.joursAvantDlc <= 3 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')}">
                  ${l.perime ? 'PÉRIMÉ' : (l.joursAvantDlc + ' j')}</span>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`}
  </section>`;
}

/* ---------- 9. Nouveau produit ---------- */
function vueNouveauProduit() {
  return `
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto">
    <h2 class="text-xl font-extrabold mb-5">Créer une nouvelle référence produit</h2>
    <form onsubmit="soumettreProduit(event)" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Code produit</label>
          <input type="text" name="code" required placeholder="ex: PRD069" class="w-full border border-slate-300 p-3 rounded-xl font-mono uppercase">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Catégorie</label>
          <select name="categorieId" required class="w-full border border-slate-300 p-3 rounded-xl bg-white">
            ${state.categories.map(c => `<option value="${c.id}">${esc(c.nom)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div>
        <label class="block text-sm font-bold mb-1">Désignation</label>
        <input type="text" name="designation" required class="w-full border border-slate-300 p-3 rounded-xl">
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Unité</label>
          <input type="text" name="unite" required placeholder="Kg / L / Unité" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Stock min (alerte)</label>
          <input type="number" step="0.01" min="0" name="stockMin" required value="5" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Prix unitaire (FCFA)</label>
          <input type="number" step="1" min="0" name="prixUnitaire" required value="0" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Stock cible (confort)</label>
          <input type="number" step="0.01" min="0" name="stockCible" placeholder="par défaut : 2 × stock min" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Emplacement</label>
          <input type="text" name="emplacement" placeholder="ex: Chambre froide 1" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
      </div>
      <button type="submit" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl">💾 Enregistrer dans le catalogue</button>
    </form>
  </section>`;
}

/* ---------- Actions ---------- */
function donneesFormulaire(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function soumettreEntree(e) {
  e.preventDefault();
  const f = donneesFormulaire(e.target);
  try {
    await API.entree({
      produitId: Number(f.produitId),
      quantite: Number(f.quantite),
      prixAchat: f.prixAchat ? Number(f.prixAchat) : null,
      dlc: f.dlc || null,
      numeroFacture: f.numeroFacture || null,
      commentaire: f.commentaire || null
    });
    toast('Livraison enregistrée en stock ✓');
    await chargerTout();
    allerA('mouvements');
  } catch (err) { toast(err.message, 'error'); }
}

async function soumettreSortie(e) {
  e.preventDefault();
  const f = donneesFormulaire(e.target);
  try {
    await API.sortie({
      produitId: Number(f.produitId),
      quantite: Number(f.quantite),
      type: f.type,
      responsable: f.responsable || null,
      fefo: f.fefo === 'on'
    });
    toast('Sortie effectuée avec succès ✓');
    await chargerTout();
    allerA('mouvements');
  } catch (err) { toast(err.message, 'error'); }
}

async function soumettreProduit(e) {
  e.preventDefault();
  const f = donneesFormulaire(e.target);
  try {
    await API.creerProduit({
      code: f.code, designation: f.designation,
      categorieId: Number(f.categorieId), unite: f.unite,
      stockMin: Number(f.stockMin),
      stockCible: f.stockCible ? Number(f.stockCible) : null,
      prixUnitaire: Number(f.prixUnitaire),
      emplacement: f.emplacement || null,
      actif: true
    });
    toast('Produit ajouté au catalogue ✓');
    await chargerTout();
    allerA('stock');
  } catch (err) { toast(err.message, 'error'); }
}

function modalGenererBon() {
  const total = state.alertes.reduce((s, p) => s + Number(p.quantiteACommander || 0) * Number(p.prixUnitaire || 0), 0);
  ouvrirModal('Générer le bon de commande', `
    <p class="text-sm text-slate-600 mb-4">
      ${state.alertes.length} article(s) en alerte seront repris automatiquement,
      pour un montant estimé de <b>${fcfa(total)}</b>.
    </p>
    <form onsubmit="soumettreGenerationBon(event)" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Service demandeur</label>
          <select name="service" class="w-full border border-slate-300 p-3 rounded-xl bg-white">
            <option value="CUISINE">Cuisine</option>
            <option value="BAR">Bar</option>
            <option value="PATISSERIE">Pâtisserie</option>
            <option value="MAGASIN">Magasin</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Responsable demandeur</label>
          <input type="text" name="responsable" placeholder="Nom du demandeur" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Livraison souhaitée</label>
          <input type="date" name="dateLivraisonSouhaitee" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Observation</label>
          <input type="text" name="observation" placeholder="ex: Commande semaine 14" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
      </div>
      <button type="submit" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3.5 rounded-xl">
        🛒 Valider et enregistrer le bon
      </button>
    </form>`);
}

async function soumettreGenerationBon(e) {
  e.preventDefault();
  const f = donneesFormulaire(e.target);
  try {
    const bon = await API.creerBon({
      service: f.service,
      responsable: f.responsable || null,
      dateLivraisonSouhaitee: f.dateLivraisonSouhaitee || null,
      observation: f.observation || null,
      automatique: true,
      lignes: []
    });
    fermerModal();
    toast('Bon de commande ' + bon.numero + ' créé ✓');
    await chargerTout();
    allerA('bons');
  } catch (err) { toast(err.message, 'error'); }
}

function modalVoirBon(id) {
  API.bon(id).then(b => {
    const lignes = b.lignes || [];
    ouvrirModal('Bon de commande ' + esc(b.numero), `
      <div class="grid grid-cols-2 gap-3 text-sm mb-4">
        <p><span class="text-slate-400 font-bold">DATE :</span> ${dateHeureFr(b.dateCreation)}</p>
        <p><span class="text-slate-400 font-bold">SERVICE :</span> ${esc(b.service || '—')}</p>
        <p><span class="text-slate-400 font-bold">RESPONSABLE :</span> ${esc(b.responsable || '—')}</p>
        <p><span class="text-slate-400 font-bold">STATUT :</span> ${esc(b.statut)}</p>
      </div>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-[11px] uppercase text-slate-600">
            <tr><th class="p-2">Code</th><th class="p-2">Désignation</th><th class="p-2">Unité</th>
            <th class="p-2 text-right">Quantité</th><th class="p-2 text-right">Total</th><th class="p-2 text-center">Visa</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${lignes.map(l => `
              <tr>
                <td class="p-2 font-mono text-xs">${esc(l.produit?.code || '')}</td>
                <td class="p-2 font-bold">${esc(l.produit?.designation || '')}</td>
                <td class="p-2 text-xs">${esc(l.unite || '')}</td>
                <td class="p-2 text-right font-bold">${qte(l.quantite)}</td>
                <td class="p-2 text-right">${fcfa(l.totalLigne)}</td>
                <td class="p-2 text-center">
                  <button onclick="viser(${b.id}, ${l.id})" class="text-xs border border-slate-300 px-2 py-1 rounded-lg font-bold hover:bg-slate-50">
                    ${l.visa ? esc(l.visa) : 'Viser'}
                  </button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="flex justify-between items-center">
        <p class="font-black text-lg">Total : <span class="text-amber-600">${fcfa(b.montantEstime)}</span></p>
        <a href="${API.exportBonUrl(b.id)}" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm">⬇ Exporter en CSV</a>
      </div>`);
  }).catch(err => toast(err.message, 'error'));
}

async function viser(bonId, ligneId) {
  try {
    await API.viserLigne(bonId, ligneId, 'VU');
    toast('Ligne visée ✓');
    modalVoirBon(bonId);
    state.bons = await API.bons();
  } catch (err) { toast(err.message, 'error'); }
}

function modalModifierProduit(id) {
  const p = state.produits.find(x => x.id === id);
  if (!p) return;
  const seuil = p.stockCible || (Number(p.stockMin) * 2);
  ouvrirModal('Modifier : ' + esc(p.designation), `
    <form onsubmit="soumettreModification(event, ${id})" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Code</label>
          <input type="text" name="code" value="${esc(p.code)}" required class="w-full border border-slate-300 p-3 rounded-xl font-mono uppercase">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Unité</label>
          <input type="text" name="unite" value="${esc(p.unite)}" required class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
      </div>
      <div>
        <label class="block text-sm font-bold mb-1">Désignation</label>
        <input type="text" name="designation" value="${esc(p.designation)}" required class="w-full border border-slate-300 p-3 rounded-xl">
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Catégorie</label>
          <select name="categorieId" class="w-full border border-slate-300 p-3 rounded-xl bg-white">
            ${state.categories.map(c => `<option value="${c.id}" ${p.categorie && p.categorie.id === c.id ? 'selected' : ''}>${esc(c.nom)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Stock min</label>
          <input type="number" step="0.01" name="stockMin" value="${Number(p.stockMin)}" required class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Stock cible</label>
          <input type="number" step="0.01" name="stockCible" value="${Number(seuil)}" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Prix unitaire (FCFA)</label>
          <input type="number" step="1" name="prixUnitaire" value="${Number(p.prixUnitaire || 0)}" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Emplacement</label>
          <input type="text" name="emplacement" value="${esc(p.emplacement || '')}" class="w-full border border-slate-300 p-3 rounded-xl">
        </div>
      </div>
      <div class="flex gap-3 pt-2">
        <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl">💾 Enregistrer</button>
        <button type="button" onclick="fermerModal()" class="px-5 border border-slate-300 rounded-xl font-bold">Annuler</button>
      </div>
    </form>`);
}

async function soumettreModification(e, id) {
  e.preventDefault();
  const f = donneesFormulaire(e.target);
  const ancien = state.produits.find(p => p.id === id);
  try {
    await API.modifierProduit(id, {
      code: f.code, designation: f.designation,
      categorieId: Number(f.categorieId), unite: f.unite,
      stockMin: Number(f.stockMin),
      stockCible: f.stockCible ? Number(f.stockCible) : null,
      prixUnitaire: Number(f.prixUnitaire),
      emplacement: f.emplacement || null,
      actif: true,
      fournisseurId: ancien?.fournisseur?.id || null
    });
    fermerModal();
    toast('Produit mis à jour ✓');
    await chargerTout();
  } catch (err) { toast(err.message, 'error'); }
}

async function chargerLots() {
  try {
    state.lotsSurveilles = await API.lotsASurveiller(7);
    afficher();
  } catch (err) { toast(err.message, 'error'); }
}

/* ---------- Demarrage ---------- */
document.addEventListener('DOMContentLoaded', () => {
  chargerTout();
  chargerLots();
});
