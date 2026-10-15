-- =====================================================================
--  RestoStock Pro — Schéma de base de données MySQL (XAMPP / MariaDB)
--  Import : phpMyAdmin > Importer > choisir ce fichier
--  (Variante manuelle : l'application crée et remplit tout seule au
--   1er démarrage, via spring.jpa.hibernate.ddl-auto=update)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS restostock
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restostock;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS ligne_bon_commande;
DROP TABLE IF EXISTS mouvement;
DROP TABLE IF EXISTS lot;
DROP TABLE IF EXISTS bon_commande;
DROP TABLE IF EXISTS produit;
DROP TABLE IF EXISTS categorie;
DROP TABLE IF EXISTS fournisseur;
DROP TABLE IF EXISTS utilisateur;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- Utilisateurs
-- ---------------------------------------------------------------------
CREATE TABLE utilisateur (
  id                BIGINT       NOT NULL AUTO_INCREMENT,
  login             VARCHAR(50)  NOT NULL,
  mot_de_passe      VARCHAR(120) NOT NULL,
  nom_complet       VARCHAR(80)  NOT NULL,
  role              VARCHAR(20)  NOT NULL,
  actif             BIT(1)       DEFAULT b'1',
  derniere_connexion DATETIME    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_utilisateur_login (login)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Fournisseurs
-- ---------------------------------------------------------------------
CREATE TABLE fournisseur (
  id                    BIGINT       NOT NULL AUTO_INCREMENT,
  nom                   VARCHAR(100) NOT NULL,
  telephone             VARCHAR(40)  NULL,
  email                 VARCHAR(100) NULL,
  adresse               VARCHAR(150) NULL,
  contact               VARCHAR(60)  NULL,
  delai_livraison_jours INT          NULL,
  actif                 BIT(1)       DEFAULT b'1',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Catégories
-- ---------------------------------------------------------------------
CREATE TABLE categorie (
  id      BIGINT      NOT NULL AUTO_INCREMENT,
  code    VARCHAR(10) NOT NULL,
  nom     VARCHAR(80) NOT NULL,
  couleur VARCHAR(20) NULL,
  icone   VARCHAR(10) NULL,
  ordre   INT         NULL,
  actif   BIT(1)      DEFAULT b'1',
  PRIMARY KEY (id),
  UNIQUE KEY uk_categorie_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Produits (catalogue)
-- ---------------------------------------------------------------------
CREATE TABLE produit (
  id                 BIGINT        NOT NULL AUTO_INCREMENT,
  code               VARCHAR(20)   NOT NULL,
  designation        VARCHAR(120)  NOT NULL,
  categorie_id       BIGINT        NULL,
  unite              VARCHAR(30)   NOT NULL,
  stock_min          DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_cible        DECIMAL(12,2) NULL,
  stock_actuel       DECIMAL(12,2) NOT NULL DEFAULT 0,
  prix_unitaire      DECIMAL(14,2) DEFAULT 0,
  dernier_prix_achat DECIMAL(14,2) NULL,
  prix_moyen_pondere DECIMAL(14,4) DEFAULT 0,
  emplacement        VARCHAR(60)   NULL,
  fournisseur_id     BIGINT        NULL,
  actif              BIT(1)        DEFAULT b'1',
  date_creation      DATETIME      NULL,
  date_modification  DATETIME      NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_produit_code (code),
  KEY idx_produit_designation (designation),
  KEY idx_produit_categorie (categorie_id),
  CONSTRAINT fk_produit_categorie   FOREIGN KEY (categorie_id)   REFERENCES categorie (id),
  CONSTRAINT fk_produit_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseur (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Lots (traçabilité, DLC, FIFO/FEFO)
-- ---------------------------------------------------------------------
CREATE TABLE lot (
  id                BIGINT        NOT NULL AUTO_INCREMENT,
  numero_lot        VARCHAR(40)   NOT NULL,
  produit_id        BIGINT        NOT NULL,
  quantite_initiale DECIMAL(12,2) NOT NULL,
  quantite_restante DECIMAL(12,2) NOT NULL,
  unite             VARCHAR(30)   NULL,
  prix_achat        DECIMAL(14,2) NULL,
  date_entree       DATETIME      NOT NULL,
  dlc               DATE          NULL,
  numero_facture    VARCHAR(40)   NULL,
  statut            VARCHAR(30)   NOT NULL DEFAULT 'DISPONIBLE',
  date_creation     DATETIME      NULL,
  PRIMARY KEY (id),
  KEY idx_lot_produit (produit_id),
  KEY idx_lot_dlc (dlc),
  CONSTRAINT fk_lot_produit FOREIGN KEY (produit_id) REFERENCES produit (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Bons de commande
-- ---------------------------------------------------------------------
CREATE TABLE bon_commande (
  id                       BIGINT        NOT NULL AUTO_INCREMENT,
  numero                   VARCHAR(30)   NOT NULL,
  date_creation            DATETIME      NOT NULL,
  date_livraison_souhaitee DATE          NULL,
  service                  VARCHAR(20)   NOT NULL,
  statut                   VARCHAR(20)   NOT NULL DEFAULT 'BROUILLON',
  responsable              VARCHAR(80)   NULL,
  genere_automatiquement   BIT(1)        DEFAULT b'0',
  fournisseur_id           BIGINT        NULL,
  montant_estime           DECIMAL(16,2) DEFAULT 0,
  observation              VARCHAR(255)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_bon_numero (numero),
  CONSTRAINT fk_bon_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseur (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Lignes de bon de commande
-- ---------------------------------------------------------------------
CREATE TABLE ligne_bon_commande (
  id               BIGINT        NOT NULL AUTO_INCREMENT,
  bon_commande_id  BIGINT        NOT NULL,
  produit_id       BIGINT        NOT NULL,
  quantite         DECIMAL(12,2) NOT NULL,
  unite            VARCHAR(30)   NULL,
  prix_unitaire    DECIMAL(14,2) NULL,
  stock_au_moment  DECIMAL(12,2) NULL,
  priorite         VARCHAR(10)   DEFAULT 'NORMALE',
  quantite_recue   DECIMAL(12,2) DEFAULT 0,
  visa             VARCHAR(60)   NULL,
  observation      VARCHAR(255)  NULL,
  PRIMARY KEY (id),
  KEY idx_ligne_bon (bon_commande_id),
  CONSTRAINT fk_ligne_bon     FOREIGN KEY (bon_commande_id) REFERENCES bon_commande (id) ON DELETE CASCADE,
  CONSTRAINT fk_ligne_produit FOREIGN KEY (produit_id)      REFERENCES produit (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Mouvements de stock (historisés, quantités signées)
-- ---------------------------------------------------------------------
CREATE TABLE mouvement (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  type            VARCHAR(30)   NOT NULL,
  produit_id      BIGINT        NOT NULL,
  lot_id          BIGINT        NULL,
  quantite        DECIMAL(12,2) NOT NULL,
  unite           VARCHAR(30)   NULL,
  prix_unitaire   DECIMAL(14,2) NULL,
  valeur_totale   DECIMAL(16,2) NULL,
  date_mouvement  DATETIME      NOT NULL,
  responsable     VARCHAR(80)   NULL,
  service         VARCHAR(30)   NULL,
  stock_apres     DECIMAL(12,2) NULL,
  commentaire     VARCHAR(255)  NULL,
  bon_commande_id BIGINT        NULL,
  PRIMARY KEY (id),
  KEY idx_mvt_produit (produit_id),
  KEY idx_mvt_date (date_mouvement),
  KEY idx_mvt_type (type),
  CONSTRAINT fk_mvt_produit FOREIGN KEY (produit_id)      REFERENCES produit (id),
  CONSTRAINT fk_mvt_lot     FOREIGN KEY (lot_id)          REFERENCES lot (id),
  CONSTRAINT fk_mvt_bon     FOREIGN KEY (bon_commande_id) REFERENCES bon_commande (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
