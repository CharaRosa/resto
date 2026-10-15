# RestoStock Pro — Application full-stack (Java / Spring Boot + MySQL XAMPP)

Application de gestion de stock et d'approvisionnement pour **EDELYNE COFFEE HOUSE & RESTAURANT** (Ndjamena).
Version **full-stack** de votre application d'origine : le front-end est conservé et enrichi, la logique et les données
sont désormais portées par un **back-end Java Spring Boot** et une base **MySQL** hébergée par **XAMPP**.

---

## 1. Architecture

```
restostock/
├── backend/                                  ← Application Java (Spring Boot 3)
│   ├── pom.xml                               Maven : dépendances du projet
│   └── src/main/
│       ├── java/com/edelyne/restostock/
│       │   ├── RestoStockApplication.java     Point d'entrée
│       │   ├── config/
│       │   │   ├── CorsConfig.java            Autorise le front-end à appeler l'API
│       │   │   └── DonneesInitiales.java      Import auto des 68 articles + catégories + utilisateurs
│       │   ├── controller/                    5 contrôleurs REST (couche HTTP)
│       │   ├── service/                       Logique métier (Stock, Produit, Bon de commande, KPI)
│       │   ├── repository/                    Accès aux données (Spring Data JPA)
│       │   ├── model/                         8 entités JPA + 4 énumérations
│       │   ├── dto/                           Objets de requête validés
│       │   └── exception/                     Gestion centralisée des erreurs
│       └── resources/
│           ├── application.properties         Connexion MySQL XAMPP
│           └── static/                        Front-end (HTML / CSS / JS) servi par Spring Boot
│               ├── index.html
│               ├── css/styles.css
│               └── js/api.js · app.js
└── database/
    ├── restostock_schema.sql                 Création des tables (à importer dans phpMyAdmin)
    └── restostock_donnees.sql                Données de départ (68 produits, catégories, utilisateurs)
```

**Flux technique** : `Navigateur (index.html) → fetch() → API REST Spring Boot (:8080) → JPA/Hibernate → MySQL (:3306, XAMPP)`.

---

## 2. Prérequis

| Logiciel | Version conseillée | Rôle |
|---|---|---|
| XAMPP | 8.2+ | Fournit MySQL / MariaDB et phpMyAdmin |
| Java JDK | 17 ou 21 | Exécution du back-end |
| Maven | 3.8+ | Compilation (`mvn`) — **optionnel** si vous utilisez le JAR fourni |

> XAMPP n'est utilisé **que** pour MySQL. Le serveur web Apache/Tomcat de XAMPP n'est pas nécessaire :
> Spring Boot embarque son propre serveur (Tomcat interne sur le port 8080).

---

## 3. Installation pas à pas

### Étape 1 — Démarrer MySQL dans XAMPP
1. Ouvrez le **Panneau de contrôle XAMPP**.
2. Cliquez sur **Start** à côté de **MySQL** (Apache est inutile).
3. Vérifiez que la ligne affiche `Port(s) : 3306`.

### Étape 2 — Créer la base
Le plus simple — **la base se crée toute seule** : l'application crée le schéma et importe les
68 articles au premier lancement (`createDatabaseIfNotExist=true` + `ddl-auto=update`).
Passez directement à l'étape 3.

Pour une création **manuelle** (optionnelle) :
1. Ouvrez **phpMyAdmin** → `http://localhost/phpmyadmin`.
2. Onglet **Importer** → sélectionnez `database/restostock_schema.sql` → **Exécuter**.
3. Onglet **Importer** → sélectionnez `database/restostock_donnees.sql` → **Exécuter**.

### Étape 3 — Vérifier la connexion
Ouvrez `backend/src/main/resources/application.properties` :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/restostock?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8&createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
```

Par défaut XAMPP utilise l'utilisateur `root` **sans mot de passe**. Si vous avez défini un mot de passe
MySQL, renseignez-le dans `spring.datasource.password`.

### Étape 4 — Lancer l'application

**Option A — avec Maven (recommandée en développement)**
```bash
cd backend
mvn spring-boot:run
```

**Option B — avec le JAR déjà compilé (la plus simple)**
```bash
java -jar backend/target/restostock-1.0.0.jar
```

Le terminal affiche :
```
RestoStock Pro est demarre !
API   : http://localhost:8080/api
Test  : http://localhost:8080/api/dashboard
Front : ouvrez http://localhost:8080
```

### Étape 5 — Ouvrir l'application
Dans votre navigateur : **http://localhost:8080**

> Vous pouvez aussi ouvrir le fichier `backend/src/main/resources/static/index.html` directement en double-clic :
> il détectera automatiquement l'instance Java en local.

---

## 4. Fonctionnalités

| Module | Description |
|---|---|
| **Tableau de bord** | Valeur du stock, nombre d'alertes, ruptures, lots périmés, consommation du mois, valeur par catégorie |
| **Inventaire & Stock** | Liste des 68 articles, filtre par catégorie, recherche, états (OK / vigilance / stock faible / rupture), impression |
| **Bon de commande** | Liste automatique des articles sous le seuil, quantités conseillées, montant estimé, génération du bon en un clic |
| **Bons & Historique** | Bons enregistrés (numérotés `BC-00001`), consultation des lignes, visa/approbation, export CSV |
| **Mouvements** | Journal complet et horodaté de toutes les entrées/sorties, valorisation en FCFA |
| **Réception de lot** | Création d'un lot tracé (quantité, prix d'achat, DLC, n° de facture) + recalcul du **prix moyen pondéré** |
| **Sortie / Consommation** | Déduction automatique **FIFO** (ou **FEFO** par DLC), motifs : cuisine, bar, pâtisserie, perte, casse |
| **Lots & DLC** | Alerte sur les lots dont la date limite tombe dans les 7 prochains jours |
| **Créer un produit** | Ajout d'une nouvelle référence au catalogue |

---

## 5. API REST (points d'entrée principaux)

| Méthode | URL | Description |
|---|---|---|
| GET | `/api/dashboard` | Indicateurs du tableau de bord |
| GET | `/api/produits?categorie=&q=` | Liste / recherche de produits |
| GET | `/api/produits/alertes` | Produits sous le seuil minimum |
| POST | `/api/produits` | Créer un produit |
| PUT | `/api/produits/{id}` | Modifier un produit |
| POST | `/api/stock/entrees` | Réception d'une livraison (création d'un lot) |
| POST | `/api/stock/sorties` | Sortie de stock (FIFO / FEFO) |
| POST | `/api/stock/inventaire` | Ajustement d'inventaire |
| GET | `/api/stock/mouvements` | Historique des mouvements |
| GET | `/api/stock/lots/a-surveiller?jours=7` | Lots proches de la DLC |
| GET / POST | `/api/bons-commande` | Lister / créer un bon de commande |
| PATCH | `/api/bons-commande/{id}/statut?statut=ENVOYE` | Changer le statut |
| PATCH | `/api/bons-commande/{id}/lignes/{ligneId}/visa` | Viser une ligne |
| GET | `/api/bons-commande/{id}/export` | Export CSV du bon |
| GET | `/api/categories` · `/api/fournisseurs` | Référentiels |
| POST | `/api/auth/login` | Connexion (retourne le rôle) |

---

## 6. Comptes de démonstration

| Login | Mot de passe | Rôle |
|---|---|---|
| `admin` | `admin123` | Administrateur |
| `gerant` | `gerant123` | Gérant |
| `magasin` | `magasin123` | Magasinier |
| `chef` | `chef123` | Chef cuisinier |

> Ces mots de passe sont stockés en clair pour la simplicité d'un usage local.
> Pour une mise en réseau, remplacez-les par un hachage BCrypt (`spring-security-crypto`).

---

## 7. Améliorations apportées à l'application d'origine

**Ce qui a été conservé** : l'interface (Tailwind, codes couleur, onglets), les 68 articles de votre
registre Excel, vos 10 catégories, le principe du seuil d'alerte et du bon de commande.

**Ce qui a été ajouté**

1. **Persistance réelle en base** — fini le `localStorage` : les données vivent dans MySQL et survivent au navigateur.
2. **Architecture en couches** — entités JPA, services transactionnels, contrôleurs REST : chaque règle métier est centralisée et testable.
3. **Gestion de lots et traçabilité** — chaque livraison crée un lot avec quantité, prix, DLC et n° de facture.
4. **Sortie FIFO / FEFO** — la consommation déduit automatiquement les bons lots ; le mode FEFO évite les périmés.
5. **Valorisation au prix moyen pondéré (CMP)** — la valeur du stock devient exacte après chaque réception.
6. **Alertes DLC** — repérage automatique des lots à consommer sous 7 jours.
7. **Bons de commande numérotés et historisés** — statuts (brouillon, envoyé, reçu), visa par ligne, export CSV.
8. **Ajustement d'inventaire** — correction d'écart avec traçabilité complète.
9. **Gestion des utilisateurs et des rôles** — administration, gérant, magasinier, chef cuisinier.
10. **Tableau de bord enrichi** — KPI de valeur, ruptures, consommation mensuelle, répartition par catégorie.
11. **Validation et messages d'erreur explicites** — l'API renvoie des messages clairs (stock insuffisant, code déjà utilisé…).
12. **Front-end servi par Spring Boot** — une seule adresse à ouvrir : `http://localhost:8080`.

---

## 8. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `Communications link failure` | MySQL arrêté dans XAMPP | Cliquez **Start** sur MySQL |
| `Access denied for user 'root'` | Mot de passe MySQL défini | Renseignez-le dans `application.properties` |
| `Port 8080 already in use` | Un autre service occupe le port | `server.port=8081` dans `application.properties` |
| Le front affiche « Connexion à l'API impossible » | Back-end non démarré | Lancez `mvn spring-boot:run` puis rafraîchissez |
| Les produits n'apparaissent pas | Base vide | Redémarrez : l'import initial s'exécute automatiquement |

---

## 9. Passage en production (plus tard)

- Remplacer le mot de passe root vide par un compte MySQL dédié.
- Ajouter **Spring Security** + hachage BCrypt des mots de passe.
- Utiliser **Flyway** ou **Liquibase** pour versionner le schéma.
- Générer les bons de commande en **PDF** (OpenPDF / iText).
- Ajouter un **JAR packagé** et un service Windows/Linux pour un démarrage automatique.
