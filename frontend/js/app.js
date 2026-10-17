/* ============================================================
   EDELYNE · RestoStock Pro — interface
   Reprend l'application d'origine (inventaire, alertes, bons de
   commande) avec une présentation alignée sur le logo officiel.
   ============================================================ */

const state = {
  connecte: false, utilisateur: null,
  onglet: 'dashboard',
  produits: [], categories: [], mouvements: [], bons: [], dashboard: null,
  lotsSurveilles: [], fournisseurs: [],
  filtreCategorie: 'TOUTES', recherche: '', filtreMouvement: 'TOUS',
  chargement: true, erreur: null
};

/* ---------- Utilitaires ---------- */
const fcfa = (n) => (n === null || n === undefined || n === '') ? '—'
  : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' F';
const qte = (n) => (n === null || n === undefined) ? '—'
  : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
const dateFr = (s) => !s ? '—' : new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const dateHeureFr = (s) => !s ? '—' : new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = {
  dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v9"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.4 12.2a2 2 0 002 1.8h8.7a2 2 0 002-1.6L21 7H6"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3v5h5"/><path d="M19 21H5V3h9l5 5v13z"/><path d="M9 13h6M9 17h4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  in: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
  out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21V9M7 14l5-5 5 5M4 3h16"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 5v14M5 12h14"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-7.2-7.2V4h9.4l7.8 7.8a2 2 0 010 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3v13M7 11l5 5 5-5M4 21h16"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2"/><path d="M6 14h12v7H6z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 12a9 9 0 11-3-6.7M21 4v5h-5"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 6L9 17l-5-5"/></svg>',
  gap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12h4l2-3 3 6 2-3h5"/></svg>'
};

function toast(message, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = 'toast show ' + (type === 'ok' ? '' : type);
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'toast ' + (type === 'ok' ? '' : type); }, 3800);
}
function ouvrirModal(eyebrow, titre, corps, largeurMax) {
  document.getElementById('modal-box').style.maxWidth = largeurMax || '760px';
  document.getElementById('modal-box').innerHTML = `
    <div class="modal-head">
      <div>
        <div class="eyebrow">${eyebrow}</div>
        <h3>${titre}</h3>
      </div>
      <button onclick="fermerModal()" class="btn-icon" aria-label="Fermer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-body">${corps}</div>`;
  document.getElementById('modal').classList.remove('hidden');
}
function fermerModal() { document.getElementById('modal').classList.add('hidden'); }

function etatStock(p) {
  const s = Number(p.stockActuel), m = Number(p.stockMin);
  if (s <= 0) return '<span class="pill danger">Rupture</span>';
  if (s <= m) return '<span class="pill danger">À commander</span>';
  if (m > 0 && s <= m * 1.2) return '<span class="pill warn">Vigilance</span>';
  return '<span class="pill ok">Disponible</span>';
}
const besoin = (p) => Number(p.quantiteACommander ?? Math.max(0, Number(p.stockMin) * 2 - Number(p.stockActuel)));

/* ---------- Données ---------- */
async function chargerTout() {
  state.chargement = true; state.erreur = null; afficher();
  try {
    const [produits, categories, dashboard, mouvements, bons, fournisseurs] = await Promise.all([
      API.produits(), API.categories(), API.dashboard(), API.mouvements(), API.bons(), API.fournisseurs()
    ]);
    Object.assign(state, { produits, categories, dashboard, mouvements, bons, fournisseurs });
    state.alertes = produits.filter(p => Number(p.stockActuel) <= Number(p.stockMin));
  } catch (e) {
    state.erreur = e.message;
    toast('API injoignable : ' + e.message, 'error');
  } finally {
    state.chargement = false; afficher();
  }
}
async function chargerLots() {
  try { state.lotsSurveilles = await API.lotsASurveiller(30); afficher(); }
  catch (e) { /* silencieux */ }
}

/* ---------- Connexion ---------- */
function vueConnexion() {
  return `
  <div class="auth">
    <aside class="auth-art">
      <img src="assets/logo.png" alt="Edelyne Coffee House &amp; Restaurant">
      <div class="brand-line"><p>Gestion de stock</p></div>
      <p class="baseline">« Un inventaire juste, un service sans rupture. »</p>
    </aside>
    <section class="auth-panel">
      <div class="auth-box">
        <div class="eyebrow">Espace magasin</div>
        <h2>Bienvenue</h2>
        <p class="sub">Connectez-vous pour accéder à votre tableau de bord.</p>
        <form onsubmit="connexion(event)">
          <div class="field">
            <label for="login">Identifiant</label>
            <input id="login" name="login" type="text" required autocomplete="username" placeholder="ex. gerant">
          </div>
          <div class="field">
            <label for="mdp">Mot de passe</label>
            <input id="mdp" name="motDePasse" type="password" required autocomplete="current-password" placeholder="••••••••">
          </div>
          <button type="submit" class="btn btn-primary btn-wide">Se connecter</button>
        </form>
        <div class="hint">
          <b>Comptes de démonstration</b><br>
          <code>admin / admin123</code> · <code>gerant / gerant123</code><br>
          <code>magasin / magasin123</code> · <code>chef / chef123</code>
        </div>
      </div>
    </section>
  </div>`;
}

async function connexion(e) {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target).entries());
  try {
    const u = await API.login({ login: f.login, motDePasse: f.motDePasse });
    state.utilisateur = u; state.connecte = true;
    toast('Bonjour ' + u.nomComplet + ' — session ouverte');
    await chargerTout(); chargerLots();
  } catch (err) { toast(err.message, 'error'); }
}
function deconnexion() {
  state.connecte = false; state.utilisateur = null; state.onglet = 'dashboard'; afficher();
}

/* ---------- Structure ---------- */
const NAV = [
  { groupe: 'Pilotage', items: [
    { id: 'dashboard', libelle: 'Tableau de bord', icone: 'dash' }
  ]},
  { groupe: 'Stock', items: [
    { id: 'stock', libelle: 'Inventaire', icone: 'box' },
    { id: 'reception', libelle: 'Réception de lot', icone: 'in' },
    { id: 'sortie', libelle: 'Sortie / consommation', icone: 'out' },
    { id: 'lots', libelle: 'Lots & DLC', icone: 'cal' },
    { id: 'inventaire', libelle: 'Ajuster l’inventaire', icone: 'gap' }
  ]},
  { groupe: 'Approvisionnement', items: [
    { id: 'commande', libelle: 'Bon de commande', icone: 'cart', compte: () => state.alertes.length },
    { id: 'bons', libelle: 'Bons & historique', icone: 'doc' }
  ]},
  { groupe: 'Catalogue', items: [
    { id: 'produits', libelle: 'Produits', icone: 'tag' },
    { id: 'nouveau', libelle: 'Nouveau produit', icone: 'plus' }
  ]},
  { groupe: 'Journal', items: [
    { id: 'mouvements', libelle: 'Mouvements de stock', icone: 'clock' }
  ]}
];

const TITRES = {
  dashboard: ['Pilotage', 'Tableau de bord'],
  stock: ['Stock', 'Inventaire général'],
  reception: ['Stock', 'Réception & entrée en stock'],
  sortie: ['Stock', 'Sortie / consommation'],
  lots: ['Stock', 'Lots & dates limites'],
  inventaire: ['Stock', 'Ajustement d’inventaire'],
  commande: ['Approvisionnement', 'Articles à commander'],
  bons: ['Approvisionnement', 'Bons de commande'],
  produits: ['Catalogue', 'Fiches produits'],
  nouveau: ['Catalogue', 'Nouveau produit'],
  mouvements: ['Journal', 'Mouvements de stock']
};

function afficher() {
  const app = document.getElementById('app');
  if (!state.connecte) { app.innerHTML = vueConnexion(); return; }
  if (state.chargement) {
    app.innerHTML = `<div class="loader"><div class="ring"></div><p>Ouverture du magasin…</p></div>`;
    return;
  }
  app.innerHTML = `
  <div class="shell">
    ${barreLaterale()}
    <div class="main">
      ${barreSuperieure()}
      <div class="content">${contenuOnglet()}</div>
    </div>
  </div>`;
}

function barreLaterale() {
  const u = state.utilisateur || {};
  return `
  <aside class="sidebar">
    <div class="sidebar-head">
      <div class="logo-chip"><img src="assets/logo.png" alt="Edelyne"></div>
      <h1>edelyne</h1>
      <p>Coffee house<br>&amp; restauration</p>
    </div>
    <nav class="nav">
      ${NAV.map(g => `
        <div class="eyebrow">${g.groupe}</div>
        ${g.items.map(it => {
          const n = it.compte ? it.compte() : 0;
          return `<button onclick="allerA('${it.id}')" class="nav-item ${state.onglet === it.id ? 'active' : ''}">
            ${ic[it.icone]}<span class="lbl">${it.libelle}</span>
            ${n ? `<span class="count">${n}</span>` : ''}
          </button>`;
        }).join('')}
      `).join('')}
    </nav>
    <div class="sidebar-foot">
      Connecté : <b>${esc(u.nomComplet || '—')}</b><br>
      ${esc(u.role || '')} · <a href="#" onclick="deconnexion();return false;" style="text-decoration:underline">Déconnexion</a>
    </div>
  </aside>`;
}

function barreSuperieure() {
  const d = state.dashboard || {};
  const [eyebrow, titre] = TITRES[state.onglet] || ['', ''];
  return `
  <header class="topbar">
    <div class="title-block">
      <div class="eyebrow">${eyebrow}</div>
      <h2>${titre}</h2>
    </div>
    <div class="kpi-strip">
      <div class="kpi-chip">
        <span>Valeur du stock</span>
        <strong class="num">${fcfa(d.valeurTotaleStock)}</strong>
      </div>
      <div class="kpi-chip ${state.alertes.length ? 'danger' : ''}">
        <span>À commander</span>
        <strong class="num">${state.alertes.length} article${state.alertes.length > 1 ? 's' : ''}</strong>
      </div>
      <div class="kpi-chip gold">
        <span>Lots en alerte DLC</span>
        <strong class="num">${d.nombreLotsDlcProche ?? 0}</strong>
      </div>
    </div>
    <button onclick="chargerTout()" class="btn btn-outline no-print" title="Recharger les données">${ic.refresh} Actualiser</button>
  </header>`;
}

function allerA(onglet) {
  state.onglet = onglet; fermerModal(); window.scrollTo(0, 0); afficher();
}
function contenuOnglet() {
  if (state.erreur) {
    return `<div class="card"><div class="empty">
      <b>Connexion à l’API impossible</b>
      <p>${esc(state.erreur)}</p>
      <p style="margin-top:14px">Vérifiez que MySQL est démarré dans XAMPP, puis que le back-end est lancé
      (<code>java -jar RestoStock-Pro.jar</code>).</p>
    </div></div>`;
  }
  switch (state.onglet) {
    case 'dashboard': return vueDashboard();
    case 'stock': return vueInventaire();
    case 'reception': return vueReception();
    case 'sortie': return vueSortie();
    case 'lots': return vueLots();
    case 'inventaire': return vueAjustement();
    case 'commande': return vueACommander();
    case 'bons': return vueBons();
    case 'produits': return vueProduits();
    case 'nouveau': return vueNouveauProduit();
    case 'mouvements': return vueMouvements();
    default: return '';
  }
}

/* ---------- Tableau de bord ---------- */
function vueDashboard() {
  const d = state.dashboard || {};
  const cartes = [
    { t: 'Valeur totale du stock', v: fcfa(d.valeurTotaleStock), s: `${d.nombreProduits ?? 0} références actives`, c: 'accent' },
    { t: 'Articles à commander', v: d.nombreAlertes ?? 0, s: `${d.nombreProduitsEnRupture ?? 0} en rupture totale`, c: 'danger' },
    { t: 'Consommation du mois', v: fcfa(d.consommationMois), s: `Approvisionné : ${fcfa(d.approvisionnementMois)}`, c: '' },
    { t: 'Lots à surveiller', v: d.nombreLotsDlcProche ?? 0, s: `${d.nombreLotsPerimes ?? 0} lot(s) périmé(s)`, c: '' }
  ];
  const cats = Object.entries(d.valeurParCategorie || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
  const maxVal = Math.max(1, ...cats.map(([, v]) => Number(v)));
  const alertes = d.principalesAlertes || [];

  return `
  <div class="grid-kpi">
    ${cartes.map(k => `
      <div class="kpi-card ${k.c}">
        <span>${k.t}</span>
        <strong class="num">${k.v}</strong>
        <em>${k.s}</em>
      </div>`).join('')}
  </div>

  <div class="grid-2">
    <section class="card">
      <div class="card-head">
        <div>
          <div class="eyebrow">Valorisation</div>
          <h3>Répartition par catégorie</h3>
        </div>
        <span class="pill cat">${cats.length} catégories</span>
      </div>
      ${cats.length === 0 ? '<p style="color:var(--muted);font-size:13px">Aucune donnée de valorisation.</p>' :
        cats.map(([nom, val]) => `
        <div class="bar-row">
          <div class="bar-top"><b>${esc(nom)}</b><span class="num">${fcfa(val)}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(Number(val) / maxVal * 100).toFixed(1)}%"></div></div>
        </div>`).join('')}
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <div class="eyebrow">Priorités</div>
          <h3>À réapprovisionner</h3>
        </div>
      </div>
      ${alertes.length === 0
        ? `<div class="empty">${ic.check}<b>Stocks au niveau optimal</b><p>Aucun article sous son seuil minimum.</p></div>`
        : alertes.map(a => `
        <div class="alert-item">
          <div class="who">
            <b>${esc(a.designation)}</b>
            <span>${esc(a.code)} · ${esc(a.categorie)}</span>
          </div>
          <div class="qty">
            <b class="num">${qte(a.stockActuel)} / ${qte(a.stockMin)} ${esc(a.unite)}</b>
            <span>commander <b class="num">${qte(a.quantiteACommander)}</b> ${esc(a.unite)}</span>
          </div>
        </div>`).join('')}
      <button onclick="allerA('commande')" class="btn btn-gold btn-wide" style="margin-top:18px">${ic.cart} Préparer le bon de commande</button>
    </section>
  </div>`;
}

/* ---------- Inventaire ---------- */
function produitsFiltres() {
  let liste = state.produits;
  if (state.filtreCategorie !== 'TOUTES') {
    liste = liste.filter(p => (p.categorie?.nom || '') === state.filtreCategorie);
  }
  if (state.recherche) {
    const r = state.recherche.toLowerCase();
    liste = liste.filter(p => (p.designation + ' ' + p.code).toLowerCase().includes(r));
  }
  return liste;
}

function vueInventaire() {
  const liste = produitsFiltres();
  const valeur = liste.reduce((s, p) => s + Number(p.stockActuel) * Number(p.prixUnitaire || 0), 0);
  return `
  <section class="card">
    <div class="card-head">
      <div>
        <div class="eyebrow">${liste.length} référence(s) affichée(s)</div>
        <h3>État général des stocks</h3>
      </div>
      <div class="toolbar no-print">
        <input type="search" placeholder="Rechercher un article ou un code…"
          value="${esc(state.recherche)}"
          oninput="state.recherche=this.value; afficher(); const i=document.querySelector('.toolbar input[type=search]'); i.focus(); i.setSelectionRange(i.value.length,i.value.length);">
        <select onchange="state.filtreCategorie=this.value; afficher();">
          <option value="TOUTES">Toutes les catégories</option>
          ${state.categories.map(c => `<option value="${esc(c.nom)}" ${state.filtreCategorie === c.nom ? 'selected' : ''}>${esc(c.nom)}</option>`).join('')}
        </select>
        <button onclick="window.print()" class="btn btn-outline">${ic.print} Imprimer</button>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Code</th><th>Désignation</th><th>Catégorie</th><th class="c">Unité</th>
            <th class="r">Stock min</th><th class="r">Stock actuel</th><th class="r">P.U.</th>
            <th class="r">Valeur</th><th class="c">État</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${liste.length === 0 ? `<tr><td colspan="10"><div class="empty"><b>Aucun résultat</b><p>Modifiez la recherche ou le filtre de catégorie.</p></div></td></tr>` :
            liste.map(p => `
            <tr>
              <td><span class="mono">${esc(p.code)}</span></td>
              <td class="strong">${esc(p.designation)}</td>
              <td><span class="pill cat">${esc(p.categorie?.nom || '—')}</span></td>
              <td class="c" style="color:var(--muted)">${esc(p.unite)}</td>
              <td class="r num" style="color:var(--muted)">${qte(p.stockMin)}</td>
              <td class="r num strong" style="${Number(p.stockActuel) <= Number(p.stockMin) ? 'color:var(--danger)' : ''}">${qte(p.stockActuel)}</td>
              <td class="r num">${fcfa(p.prixUnitaire)}</td>
              <td class="r num strong">${fcfa(p.valeurStock)}</td>
              <td class="c">${etatStock(p)}</td>
              <td class="r no-print">
                <button class="btn-icon" onclick="modalModifierProduit(${p.id})" title="Modifier">${ic.edit}</button>
              </td>
            </tr>`).join('')}
          <tr class="total-row">
            <td colspan="7" class="r">Valeur du stock affiché</td>
            <td class="r">${fcfa(valeur)}</td><td colspan="2"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>`;
}

/* ---------- Produits ---------- */
function vueProduits() {
  return `
  <section class="card">
    <div class="card-head">
      <div>
        <div class="eyebrow">Catalogue</div>
        <h3>Fiches produits</h3>
      </div>
      <button onclick="allerA('nouveau')" class="btn btn-primary no-print">${ic.plus} Nouvelle référence</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Code</th><th>Désignation</th><th>Catégorie</th><th>Unité</th>
        <th class="r">Stock min</th><th class="r">Stock cible</th><th class="r">P.U. référence</th>
        <th class="r">Dernier prix d’achat</th><th></th></tr></thead>
        <tbody>
          ${state.produits.map(p => `
          <tr>
            <td><span class="mono">${esc(p.code)}</span></td>
            <td class="strong">${esc(p.designation)}</td>
            <td><span class="pill cat">${esc(p.categorie?.nom || '—')}</span></td>
            <td style="color:var(--muted)">${esc(p.unite)}</td>
            <td class="r num">${qte(p.stockMin)}</td>
            <td class="r num">${qte(p.stockCible)}</td>
            <td class="r num">${fcfa(p.prixUnitaire)}</td>
            <td class="r num">${fcfa(p.dernierPrixAchat)}</td>
            <td class="r no-print"><button class="btn-icon" onclick="modalModifierProduit(${p.id})" title="Modifier">${ic.edit}</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </section>`;
}

/* ---------- À commander ---------- */
function vueACommander() {
  const alertes = state.alertes;
  const total = alertes.reduce((s, p) => s + besoin(p) * Number(p.prixUnitaire || 0), 0);
  return `
  <section class="card">
    <div class="card-head">
      <div>
        <div class="eyebrow">Seuil minimum atteint</div>
        <h3>${alertes.length} article(s) à commander</h3>
      </div>
      <div class="toolbar no-print">
        <button onclick="window.print()" class="btn btn-outline">${ic.print} Imprimer</button>
        <button onclick="modalGenererBon()" class="btn btn-gold" ${alertes.length === 0 ? 'disabled style="opacity:.5;cursor:not-allowed"' : ''}>${ic.cart} Générer le bon de commande</button>
      </div>
    </div>
    ${alertes.length === 0
      ? `<div class="empty">${ic.check}<b>Aucune commande nécessaire</b><p>Tous les articles sont au-dessus de leur seuil minimum.</p></div>`
      : `<div class="table-wrap"><table>
        <thead><tr><th class="c">Priorité</th><th>Code</th><th>Désignation</th><th>Catégorie</th>
        <th class="r">Stock min</th><th class="r">Stock actuel</th><th class="r">Qté conseillée</th>
        <th class="r">P.U.</th><th class="r">Total estimé</th></tr></thead>
        <tbody>
          ${alertes.map(p => {
            const q = besoin(p);
            return `<tr>
              <td class="c"><span class="pill danger">Urgent</span></td>
              <td><span class="mono">${esc(p.code)}</span></td>
              <td class="strong">${esc(p.designation)}</td>
              <td style="color:var(--muted)">${esc(p.categorie?.nom || '—')}</td>
              <td class="r num" style="color:var(--muted)">${qte(p.stockMin)} ${esc(p.unite)}</td>
              <td class="r num strong" style="color:var(--danger)">${qte(p.stockActuel)} ${esc(p.unite)}</td>
              <td class="r num strong" style="background:var(--gold-soft)">${qte(q)} ${esc(p.unite)}</td>
              <td class="r num">${fcfa(p.prixUnitaire)}</td>
              <td class="r num strong">${fcfa(q * Number(p.prixUnitaire || 0))}</td>
            </tr>`; }).join('')}
          <tr class="total-row"><td colspan="8" class="r">Montant total estimé</td><td class="r">${fcfa(total)}</td></tr>
        </tbody></table></div>`}
  </section>`;
}

/* ---------- Bons ---------- */
function vueBons() {
  return `
  <section class="card">
    <div class="card-head">
      <div>
        <div class="eyebrow">Historique</div>
        <h3>Bons de commande enregistrés</h3>
      </div>
    </div>
    ${state.bons.length === 0
      ? `<div class="empty">${ic.doc}<b>Aucun bon de commande</b><p>Générez-en un depuis l’onglet « Articles à commander ».</p></div>`
      : `<div class="table-wrap"><table>
        <thead><tr><th>Numéro</th><th>Date</th><th>Service</th><th>Responsable</th>
        <th class="c">Lignes</th><th class="r">Montant estimé</th><th class="c">Statut</th><th></th></tr></thead>
        <tbody>
          ${state.bons.map(b => `
          <tr>
            <td class="strong" style="font-family:var(--font-mono)">${esc(b.numero)}</td>
            <td style="color:var(--muted)">${dateHeureFr(b.dateCreation)}</td>
            <td><span class="pill neutral">${esc(b.service || '—')}</span></td>
            <td>${esc(b.responsable || '—')}</td>
            <td class="c num">${(b.lignes || []).length}</td>
            <td class="r num strong">${fcfa(b.montantEstime)}</td>
            <td class="c"><span class="pill ${b.statut === 'BROUILLON' ? 'neutral' : b.statut === 'ANNULE' ? 'danger' : 'ok'}">${esc(b.statut)}</span></td>
            <td class="r no-print" style="white-space:nowrap">
              <button class="btn-icon" onclick="modalVoirBon(${b.id})" title="Consulter">${ic.eye}</button>
              <a class="btn-icon" href="${API.exportBonUrl(b.id)}" title="Exporter en CSV">${ic.down}</a>
            </td>
          </tr>`).join('')}
        </tbody></table></div>`}
  </section>`;
}

/* ---------- Mouvements ---------- */
function vueMouvements() {
  const types = [...new Set(state.mouvements.map(m => m.type))];
  const liste = state.filtreMouvement === 'TOUS'
    ? state.mouvements
    : state.mouvements.filter(m => m.type === state.filtreMouvement);
  return `
  <section class="card">
    <div class="card-head">
      <div>
        <div class="eyebrow">${liste.length} mouvement(s)</div>
        <h3>Journal des entrées et sorties</h3>
      </div>
      <div class="toolbar no-print">
        <select onchange="state.filtreMouvement=this.value; afficher();">
          <option value="TOUS">Tous les types</option>
          ${types.map(t => `<option value="${esc(t)}" ${state.filtreMouvement === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}
        </select>
        <button onclick="window.print()" class="btn btn-outline">${ic.print} Imprimer</button>
      </div>
    </div>
    ${liste.length === 0
      ? `<div class="empty">${ic.clock}<b>Aucun mouvement</b><p>Les réceptions et sorties de stock apparaîtront ici.</p></div>`
      : `<div class="table-wrap"><table>
        <thead><tr><th>Date & heure</th><th>Code</th><th>Produit</th><th>Type</th>
        <th class="r">Quantité</th><th class="r">Valeur</th><th class="r">Stock après</th><th>Responsable</th><th>Commentaire</th></tr></thead>
        <tbody>
          ${liste.map(m => `
          <tr>
            <td style="color:var(--muted);white-space:nowrap">${dateHeureFr(m.dateMouvement)}</td>
            <td><span class="mono">${esc(m.produit?.code || '')}</span></td>
            <td class="strong">${esc(m.produit?.designation || '')}</td>
            <td><span class="pill ${String(m.type).startsWith('ENTREE') ? 'ok' : 'warn'}">${esc(String(m.type).replace(/_/g, ' ').toLowerCase())}</span></td>
            <td class="r num strong" style="color:${Number(m.quantite) > 0 ? 'var(--ok)' : 'var(--danger)'}">
              ${Number(m.quantite) > 0 ? '+' : ''}${qte(m.quantite)} ${esc(m.unite || '')}</td>
            <td class="r num">${fcfa(m.valeurTotale)}</td>
            <td class="r num">${qte(m.stockApres)}</td>
            <td>${esc(m.responsable || '—')}</td>
            <td style="color:var(--muted);font-size:12px">${esc(m.commentaire || '—')}</td>
          </tr>`).join('')}
        </tbody></table></div>`}
  </section>`;
}

/* ---------- Lots ---------- */
function vueLots() {
  const lots = state.lotsSurveilles || [];
  return `
  <section class="card">
    <div class="card-head">
      <div>
        <div class="eyebrow">Traçabilité</div>
        <h3>Lots dont la DLC approche</h3>
      </div>
      <button onclick="chargerLots()" class="btn btn-outline no-print">${ic.refresh} Actualiser</button>
    </div>
    ${lots.length === 0
      ? `<div class="empty">${ic.cal}<b>Aucun lot à surveiller</b><p>Aucun lot ne périme dans les 30 prochains jours.</p></div>`
      : `<div class="table-wrap"><table>
        <thead><tr><th>N° de lot</th><th>Produit</th><th class="r">Restant</th><th>Réception</th>
        <th>DLC</th><th class="c">Échéance</th></tr></thead>
        <tbody>
          ${lots.map(l => `
          <tr>
            <td style="font-family:var(--font-mono);font-size:11.5px">${esc(l.numeroLot)}</td>
            <td class="strong">${esc(l.produit?.designation || '')}</td>
            <td class="r num">${qte(l.quantiteRestante)} ${esc(l.unite || '')}</td>
            <td style="color:var(--muted)">${dateFr(l.dateEntree)}</td>
            <td>${dateFr(l.dlc)}</td>
            <td class="c"><span class="pill ${l.perime ? 'danger' : (l.joursAvantDlc <= 3 ? 'danger' : 'warn')}">
              ${l.perime ? 'Périmé' : l.joursAvantDlc + ' jours'}</span></td>
          </tr>`).join('')}
        </tbody></table></div>`}
  </section>`;
}

/* ---------- Formulaires ---------- */
function optionsProduits(avecStock) {
  return state.produits.map(p => `<option value="${p.id}">[${esc(p.code)}] ${esc(p.designation)}${avecStock ? ' — stock : ' + qte(p.stockActuel) + ' ' + esc(p.unite) : ' — ' + esc(p.unite)}</option>`).join('');
}

function vueReception() {
  return `
  <section class="card form-card">
    <div class="card-head">
      <div>
        <div class="eyebrow">Entrée en stock</div>
        <h3>Enregistrer une livraison</h3>
      </div>
    </div>
    <p class="note" style="margin-bottom:22px">La réception crée un <b>lot tracé</b> (quantité, prix d’achat, DLC, facture)
    et recalcule automatiquement le <b>prix moyen pondéré</b> de l’article.</p>
    <form onsubmit="soumettreEntree(event)">
      <div class="field">
        <label for="r-produit">Article réceptionné</label>
        <select id="r-produit" name="produitId" required>${optionsProduits(false)}</select>
      </div>
      <div class="form-row">
        <div class="field"><label for="r-qte">Quantité reçue</label>
          <input id="r-qte" type="number" step="0.01" min="0.01" name="quantite" required placeholder="0,00"></div>
        <div class="field"><label for="r-prix">Prix d’achat unitaire (FCFA)</label>
          <input id="r-prix" type="number" step="1" min="0" name="prixAchat" placeholder="ex. 4500"></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="r-dlc">Date limite de consommation</label>
          <input id="r-dlc" type="date" name="dlc"></div>
        <div class="field"><label for="r-fact">N° de facture / bon de livraison</label>
          <input id="r-fact" type="text" name="numeroFacture" placeholder="ex. FA-2026-014"></div>
      </div>
      <div class="field"><label for="r-resp">Responsable</label>
        <input id="r-resp" type="text" name="responsable" value="${esc(state.utilisateur?.nomComplet || '')}"></div>
      <div class="field"><label for="r-com">Commentaire</label>
        <input id="r-com" type="text" name="commentaire" placeholder="ex. Livraison du matin"></div>
      <button type="submit" class="btn btn-primary btn-wide">${ic.in} Valider l’entrée en stock</button>
    </form>
  </section>`;
}

function vueSortie() {
  return `
  <section class="card form-card">
    <div class="card-head">
      <div>
        <div class="eyebrow">Consommation</div>
        <h3>Déclarer une sortie de stock</h3>
      </div>
    </div>
    <p class="note" style="margin-bottom:22px">La sortie déduit automatiquement les lots en <b>FIFO</b>
    (premier entré, premier sorti) — ou en <b>FEFO</b> (par date de péremption) si l’option est cochée.</p>
    <form onsubmit="soumettreSortie(event)">
      <div class="field">
        <label for="s-produit">Article concerné</label>
        <select id="s-produit" name="produitId" required>${optionsProduits(true)}</select>
      </div>
      <div class="form-row">
        <div class="field"><label for="s-qte">Quantité sortie</label>
          <input id="s-qte" type="number" step="0.01" min="0.01" name="quantite" required placeholder="0,00"></div>
        <div class="field"><label for="s-type">Motif de sortie</label>
          <select id="s-type" name="type">
            <option value="SORTIE_CUISINE">Sortie cuisine / préparation</option>
            <option value="SORTIE_BAR">Sortie bar</option>
            <option value="SORTIE_PATISSERIE">Sortie pâtisserie</option>
            <option value="PERTE_PERIMEE">Perte / produit périmé</option>
            <option value="CASSE_DEGRADATION">Casse / dégradation</option>
          </select></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="s-resp">Responsable</label>
          <input id="s-resp" type="text" name="responsable" value="${esc(state.utilisateur?.nomComplet || '')}"></div>
        <label class="check-line"><input type="checkbox" name="fefo"> Sortir par date de péremption (FEFO)</label>
      </div>
      <div class="field"><label for="s-com">Commentaire</label>
        <input id="s-com" type="text" name="commentaire"></div>
      <button type="submit" class="btn btn-primary btn-wide">${ic.out} Valider la sortie</button>
    </form>
  </section>`;
}

function vueAjustement() {
  return `
  <section class="card form-card">
    <div class="card-head">
      <div>
        <div class="eyebrow">Correction</div>
        <h3>Ajuster le stock après inventaire physique</h3>
      </div>
    </div>
    <p class="note" style="margin-bottom:22px">Saisissez la quantité réellement comptée : l’écart est calculé,
    appliqué et journalisé comme un mouvement d’inventaire.</p>
    <form onsubmit="soumettreAjustement(event)">
      <div class="field">
        <label for="a-produit">Article</label>
        <select id="a-produit" name="produitId" required>${optionsProduits(true)}</select>
      </div>
      <div class="form-row">
        <div class="field"><label for="a-stock">Quantité comptée (stock réel)</label>
          <input id="a-stock" type="number" step="0.01" min="0" name="nouveauStock" required placeholder="0,00"></div>
        <div class="field"><label for="a-resp">Responsable</label>
          <input id="a-resp" type="text" name="responsable" value="${esc(state.utilisateur?.nomComplet || '')}"></div>
      </div>
      <div class="field"><label for="a-com">Motif de l’écart</label>
        <input id="a-com" type="text" name="commentaire" placeholder="ex. Inventaire mensuel, écart de pesée"></div>
      <button type="submit" class="btn btn-primary btn-wide">${ic.gap} Enregistrer l’ajustement</button>
    </form>
  </section>`;
}

function vueNouveauProduit() {
  return `
  <section class="card form-card">
    <div class="card-head">
      <div>
        <div class="eyebrow">Catalogue</div>
        <h3>Créer une nouvelle référence</h3>
      </div>
    </div>
    <form onsubmit="soumettreProduit(event)">
      <div class="form-row">
        <div class="field"><label for="n-code">Code produit</label>
          <input id="n-code" type="text" name="code" required placeholder="ex. PRD069" style="font-family:var(--font-mono);text-transform:uppercase"></div>
        <div class="field"><label for="n-cat">Catégorie</label>
          <select id="n-cat" name="categorieId" required>
            ${state.categories.map(c => `<option value="${c.id}">${esc(c.nom)}</option>`).join('')}
          </select></div>
      </div>
      <div class="field"><label for="n-des">Désignation</label>
        <input id="n-des" type="text" name="designation" required></div>
      <div class="form-row-3">
        <div class="field"><label for="n-unite">Unité</label>
          <input id="n-unite" type="text" name="unite" required placeholder="Kg, L, Unité…"></div>
        <div class="field"><label for="n-min">Stock minimum (alerte)</label>
          <input id="n-min" type="number" step="0.01" min="0" name="stockMin" required value="5"></div>
        <div class="field"><label for="n-prix">Prix unitaire (FCFA)</label>
          <input id="n-prix" type="number" step="1" min="0" name="prixUnitaire" required value="0"></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="n-cible">Stock cible (confort)</label>
          <input id="n-cible" type="number" step="0.01" min="0" name="stockCible" placeholder="par défaut : 2 × stock minimum"></div>
        <div class="field"><label for="n-emp">Emplacement de rangement</label>
          <input id="n-emp" type="text" name="emplacement" placeholder="ex. Chambre froide 1"></div>
      </div>
      <button type="submit" class="btn btn-primary btn-wide">${ic.check} Enregistrer dans le catalogue</button>
    </form>
  </section>`;
}

/* ---------- Actions ---------- */
const val = (form) => Object.fromEntries(new FormData(form).entries());

async function soumettreEntree(e) {
  e.preventDefault();
  const f = val(e.target);
  try {
    await API.entree({
      produitId: Number(f.produitId), quantite: Number(f.quantite),
      prixAchat: f.prixAchat ? Number(f.prixAchat) : null,
      dlc: f.dlc || null, numeroFacture: f.numeroFacture || null,
      responsable: f.responsable || null, commentaire: f.commentaire || null
    });
    toast('Livraison enregistrée en stock');
    await chargerTout(); allerA('mouvements');
  } catch (err) { toast(err.message, 'error'); }
}

async function soumettreSortie(e) {
  e.preventDefault();
  const f = val(e.target);
  try {
    await API.sortie({
      produitId: Number(f.produitId), quantite: Number(f.quantite), type: f.type,
      responsable: f.responsable || null, commentaire: f.commentaire || null,
      fefo: f.fefo === 'on'
    });
    toast('Sortie de stock enregistrée');
    await chargerTout(); allerA('mouvements');
  } catch (err) { toast(err.message, 'error'); }
}

async function soumettreAjustement(e) {
  e.preventDefault();
  const f = val(e.target);
  try {
    await API.inventaire({
      produitId: Number(f.produitId), nouveauStock: Number(f.nouveauStock),
      responsable: f.responsable || null, commentaire: f.commentaire || null
    });
    toast('Inventaire ajusté');
    await chargerTout(); allerA('mouvements');
  } catch (err) { toast(err.message, 'error'); }
}

async function soumettreProduit(e) {
  e.preventDefault();
  const f = val(e.target);
  try {
    await API.creerProduit({
      code: f.code, designation: f.designation, categorieId: Number(f.categorieId),
      unite: f.unite, stockMin: Number(f.stockMin),
      stockCible: f.stockCible ? Number(f.stockCible) : null,
      prixUnitaire: Number(f.prixUnitaire), emplacement: f.emplacement || null, actif: true
    });
    toast('Référence ajoutée au catalogue');
    await chargerTout(); allerA('produits');
  } catch (err) { toast(err.message, 'error'); }
}

function modalGenererBon() {
  const total = state.alertes.reduce((s, p) => s + besoin(p) * Number(p.prixUnitaire || 0), 0);
  ouvrirModal('Bon de commande', 'Générer depuis les alertes', `
    <p class="note" style="margin-bottom:20px">Les <b>${state.alertes.length} article(s)</b> sous seuil seront repris
    automatiquement avec les quantités conseillées, pour un montant estimé de <b>${fcfa(total)}</b>.</p>
    <form onsubmit="soumettreGenerationBon(event)">
      <div class="form-row">
        <div class="field"><label for="b-service">Service demandeur</label>
          <select id="b-service" name="service">
            <option value="CUISINE">Cuisine</option><option value="BAR">Bar</option>
            <option value="PATISSERIE">Pâtisserie</option><option value="MAGASIN">Magasin</option>
          </select></div>
        <div class="field"><label for="b-resp">Responsable demandeur</label>
          <input id="b-resp" type="text" name="responsable" value="${esc(state.utilisateur?.nomComplet || '')}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="b-date">Livraison souhaitée</label>
          <input id="b-date" type="date" name="dateLivraisonSouhaitee"></div>
        <div class="field"><label for="b-four">Fournisseur</label>
          <select id="b-four" name="fournisseurId">
            <option value="">— non précisé —</option>
            ${state.fournisseurs.map(f => `<option value="${f.id}">${esc(f.nom)}</option>`).join('')}
          </select></div>
      </div>
      <div class="field"><label for="b-obs">Observation</label>
        <input id="b-obs" type="text" name="observation" placeholder="ex. Commande semaine 42"></div>
      <button type="submit" class="btn btn-gold btn-wide">${ic.cart} Valider et enregistrer le bon</button>
    </form>`);
}

async function soumettreGenerationBon(e) {
  e.preventDefault();
  const f = val(e.target);
  try {
    const bon = await API.creerBon({
      service: f.service, responsable: f.responsable || null,
      dateLivraisonSouhaitee: f.dateLivraisonSouhaitee || null,
      fournisseurId: f.fournisseurId ? Number(f.fournisseurId) : null,
      observation: f.observation || null, automatique: true, lignes: []
    });
    fermerModal();
    toast('Bon de commande ' + bon.numero + ' créé');
    await chargerTout(); allerA('bons');
  } catch (err) { toast(err.message, 'error'); }
}

function modalVoirBon(id) {
  API.bon(id).then(b => {
    const lignes = b.lignes || [];
    ouvrirModal('Bon de commande', esc(b.numero), `
      <div class="print-head">
        <div class="ph-logo"><img src="assets/logo.png" alt="Edelyne"></div>
        <div class="ph-lines">
          <p><b>EDELYNE COFFEE HOUSE &amp; RESTAURANT</b> — Ndjamena</p>
          <p>Bon n° ${esc(b.numero)} · ${dateHeureFr(b.dateCreation)} ·
             Service : ${esc(b.service || '—')} · Responsable : ${esc(b.responsable || '—')}</p>
        </div>
      </div>
      <div class="grid-2" style="gap:14px;margin-bottom:20px">
        <div class="field" style="margin:0"><label>Date d’émission</label><input value="${dateHeureFr(b.dateCreation)}" disabled></div>
        <div class="field" style="margin:0"><label>Service demandeur</label><input value="${esc(b.service || '—')}" disabled></div>
        <div class="field" style="margin:0"><label>Responsable</label><input value="${esc(b.responsable || '—')}" disabled></div>
        <div class="field" style="margin:0"><label>Statut</label><input value="${esc(b.statut)}" disabled></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Désignation</th><th class="c">Unité</th>
          <th class="r">Quantité</th><th class="r">Total</th><th class="c">Visa</th></tr></thead>
          <tbody>
            ${lignes.map(l => `
            <tr>
              <td><span class="mono">${esc(l.produit?.code || '')}</span></td>
              <td class="strong">${esc(l.produit?.designation || '')}</td>
              <td class="c" style="color:var(--muted)">${esc(l.unite || '')}</td>
              <td class="r num strong">${qte(l.quantite)}</td>
              <td class="r num">${fcfa(l.totalLigne)}</td>
              <td class="c"><button onclick="viser(${b.id}, ${l.id})" class="btn btn-outline" style="padding:5px 12px;font-size:11.5px">
                ${l.visa ? esc(l.visa) : 'Viser'}</button></td>
            </tr>`).join('')}
            <tr class="total-row"><td colspan="4" class="r">Montant estimé</td><td class="r">${fcfa(b.montantEstime)}</td><td></td></tr>
          </tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:22px" class="no-print">
        <button onclick="window.print()" class="btn btn-outline">${ic.print} Imprimer</button>
        <a href="${API.exportBonUrl(b.id)}" class="btn btn-primary">${ic.down} Exporter en CSV</a>
      </div>`, '860px');
  }).catch(err => toast(err.message, 'error'));
}

async function viser(bonId, ligneId) {
  try {
    await API.viserLigne(bonId, ligneId, 'VU');
    modalVoirBon(bonId);
    state.bons = await API.bons();
    toast('Ligne visée');
  } catch (err) { toast(err.message, 'error'); }
}

function modalModifierProduit(id) {
  const p = state.produits.find(x => x.id === id);
  if (!p) return;
  ouvrirModal('Catalogue', 'Modifier la fiche produit', `
    <form onsubmit="soumettreModification(event, ${id})">
      <div class="form-row">
        <div class="field"><label for="m-code">Code</label>
          <input id="m-code" type="text" name="code" value="${esc(p.code)}" required style="font-family:var(--font-mono);text-transform:uppercase"></div>
        <div class="field"><label for="m-unite">Unité</label>
          <input id="m-unite" type="text" name="unite" value="${esc(p.unite)}" required></div>
      </div>
      <div class="field"><label for="m-des">Désignation</label>
        <input id="m-des" type="text" name="designation" value="${esc(p.designation)}" required></div>
      <div class="form-row">
        <div class="field"><label for="m-cat">Catégorie</label>
          <select id="m-cat" name="categorieId">
            ${state.categories.map(c => `<option value="${c.id}" ${p.categorie && p.categorie.id === c.id ? 'selected' : ''}>${esc(c.nom)}</option>`).join('')}
          </select></div>
        <div class="field"><label for="m-emp">Emplacement</label>
          <input id="m-emp" type="text" name="emplacement" value="${esc(p.emplacement || '')}"></div>
      </div>
      <div class="form-row-3">
        <div class="field"><label for="m-min">Stock minimum</label>
          <input id="m-min" type="number" step="0.01" name="stockMin" value="${Number(p.stockMin)}" required></div>
        <div class="field"><label for="m-cible">Stock cible</label>
          <input id="m-cible" type="number" step="0.01" name="stockCible" value="${Number(p.stockCible || Number(p.stockMin) * 2)}"></div>
        <div class="field"><label for="m-prix">Prix unitaire (FCFA)</label>
          <input id="m-prix" type="number" step="1" name="prixUnitaire" value="${Number(p.prixUnitaire || 0)}"></div>
      </div>
      <div style="display:flex;gap:12px;margin-top:8px">
        <button type="submit" class="btn btn-primary" style="flex:1">Enregistrer les modifications</button>
        <button type="button" onclick="fermerModal()" class="btn btn-outline">Annuler</button>
      </div>
    </form>`);
}

async function soumettreModification(e, id) {
  e.preventDefault();
  const f = val(e.target);
  try {
    await API.modifierProduit(id, {
      code: f.code, designation: f.designation, categorieId: Number(f.categorieId),
      unite: f.unite, stockMin: Number(f.stockMin),
      stockCible: f.stockCible ? Number(f.stockCible) : null,
      prixUnitaire: Number(f.prixUnitaire), emplacement: f.emplacement || null, actif: true
    });
    fermerModal();
    toast('Fiche produit mise à jour');
    await chargerTout();
  } catch (err) { toast(err.message, 'error'); }
}

/* ---------- Démarrage ---------- */
document.addEventListener('DOMContentLoaded', () => { afficher(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerModal(); });
