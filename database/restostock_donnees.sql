-- =====================================================================
--  RestoStock Pro — Données initiales
--  Source : votre fichier « BON DE COMME.xlsx » (feuille « Base de Produits »)
--  + les catégories de votre application d'origine.
--  Import : phpMyAdmin > onglet Importer (après restostock_schema.sql)
-- =====================================================================
USE restostock;

-- ---------- Catégories (miroir de vos 10 catégories) ----------
INSERT INTO categorie (id, code, nom, couleur, icone, ordre, actif) VALUES
 (1,'LEG','LEGUMES','#16a34a','🥦',1,1),
 (2,'PV','POISSONS ET VIANDES','#dc2626','🐟',2,1),
 (3,'FRU','FRUITS','#f59e0b','🍎',3,1),
 (4,'EPI','EPICERIE','#7c3aed','🧂',4,1),
 (5,'PAT','PATISSERIE','#db2777','🍰',5,1),
 (6,'FEC','FECULENTS','#ca8a04','🍚',6,1),
 (7,'BOI','BOISSONS','#0284c7','🥤',7,1),
 (8,'DES','DESINFECTION','#0d9488','🧪',8,1),
 (9,'BUR','FOURNITURES DE BUREAU','#475569','📄',9,1),
 (10,'DIV','DIVERS','#64748b','📦',10,1);

-- ---------- Produits : Code / Désignation / Unité / Catégorie / Stock min / Stock actuel / Prix unitaire (FCFA) ----------
INSERT INTO produit (code, designation, unite, categorie_id, stock_min, stock_cible, stock_actuel, prix_unitaire, prix_moyen_pondere, dernier_prix_achat, emplacement, actif, date_creation) VALUES
 ('PRD001','Ail décortiqué','Kg',1,5,10,1.5,3500,3500,3500,'LÉGUMES',1,NOW()),
 ('PRD002','Ailes de poulet','Kg',2,10,20,4,3200,3200,3200,'POISSONS ET VIANDES',1,NOW()),
 ('PRD003','Ananas','Kg',3,5,10,6,1500,1500,1500,'FRUITS',1,NOW()),
 ('PRD004','Banane','Kg',3,5,10,8,1000,1000,1000,'FRUITS',1,NOW()),
 ('PRD005','Banane plantain','Kg',3,6,12,3,1200,1200,1200,'FRUITS',1,NOW()),
 ('PRD006','Barquette','Unité',9,20,40,50,500,500,500,'FOURNITURES DE BUREAU',1,NOW()),
 ('PRD007','Blanc de poulet','Kg',2,10,20,4,4500,4500,4500,'POISSONS ET VIANDES',1,NOW()),
 ('PRD008','Caramel','Kg',5,3,6,2,2800,2800,2800,'PÂTISSERIE',1,NOW()),
 ('PRD009','Citron','Kg',3,4,8,2,1500,1500,1500,'FRUITS',1,NOW()),
 ('PRD010','Concombre','Kg',1,3,6,0.8,800,800,800,'LÉGUMES',1,NOW()),
 ('PRD011','Cornichons bocal','Unité',4,4,8,6,2500,2500,2500,'ÉPICERIE',1,NOW()),
 ('PRD012','Courgette','Kg',1,3,6,4,900,900,900,'LÉGUMES',1,NOW()),
 ('PRD013','Câpres bocal','Unité',4,2,4,3,3200,3200,3200,'ÉPICERIE',1,NOW()),
 ('PRD014','Déodorant','Kg',10,2,4,2,2000,2000,2000,'DIVERS',1,NOW()),
 ('PRD015','Eau de Javel','Litre',8,4,8,3,2500,2500,2500,'DÉSINFECTION',1,NOW()),
 ('PRD016','Farine T45','Kg',6,15,30,25,700,700,700,'FÉCULENTS',1,NOW()),
 ('PRD017','Farine T65','Kg',6,15,30,10,750,750,750,'FÉCULENTS',1,NOW()),
 ('PRD018','Faux filet','Kg',2,6,12,3,5200,5200,5200,'POISSONS ET VIANDES',1,NOW()),
 ('PRD019','Filet de bœuf','Kg',2,8,16,2,5000,5000,5000,'POISSONS ET VIANDES',1,NOW()),
 ('PRD020','Filet de capitaine','Kg',2,5,10,8,6000,6000,6000,'POISSONS ET VIANDES',1,NOW()),
 ('PRD021','Fraise','Kg',3,2,4,1,4500,4500,4500,'FRUITS',1,NOW()),
 ('PRD022','Gingembre (1L)','Litre',4,2,4,2,3500,3500,3500,'ÉPICERIE',1,NOW()),
 ('PRD023','Haricot blanc','Kg',6,5,10,6,1100,1100,1100,'FÉCULENTS',1,NOW()),
 ('PRD024','Huile d''olive','Litre',4,6,12,2,4200,4200,4200,'ÉPICERIE',1,NOW()),
 ('PRD025','Huile de tournesol','Litre',4,10,20,12,1300,1300,1300,'ÉPICERIE',1,NOW()),
 ('PRD026','Huile végétale 20L','Litre',4,2,4,3,18000,18000,18000,'ÉPICERIE',1,NOW()),
 ('PRD027','Insecticide','Kg',8,2,4,1,4500,4500,4500,'DÉSINFECTION',1,NOW()),
 ('PRD028','Jambon de dinde','Kg',2,4,8,2.5,4800,4800,4800,'POISSONS ET VIANDES',1,NOW()),
 ('PRD029','Ketchup (Bidon)','Unité',4,4,8,5,1500,1500,1500,'ÉPICERIE',1,NOW()),
 ('PRD030','Lait','Kg',4,10,20,8,900,900,900,'ÉPICERIE',1,NOW()),
 ('PRD031','Lait liquide','Litre',4,12,24,6,1200,1200,1200,'ÉPICERIE',1,NOW()),
 ('PRD032','Levure chimique','Gramme',5,1000,2000,2500,8,8,8,'PÂTISSERIE',1,NOW()),
 ('PRD033','Mangue','Kg',3,4,8,2,1500,1500,1500,'FRUITS',1,NOW()),
 ('PRD034','Merguez','Kg',2,5,10,4,4000,4000,4000,'POISSONS ET VIANDES',1,NOW()),
 ('PRD035','Miel','Kg',4,3,6,2,6500,6500,6500,'ÉPICERIE',1,NOW()),
 ('PRD036','Mouchoirs (1 op)','Unité',9,10,20,12,800,800,800,'FOURNITURES DE BUREAU',1,NOW()),
 ('PRD037','Moutard','Kg',4,3,6,4,2000,2000,2000,'ÉPICERIE',1,NOW()),
 ('PRD038','Oignon','Koro',1,3,6,1,12000,12000,12000,'LÉGUMES',1,NOW()),
 ('PRD039','Olive noire','Kg',4,2,4,3,3800,3800,3800,'ÉPICERIE',1,NOW()),
 ('PRD040','Olive verte','Kg',4,2,4,2,3600,3600,3600,'ÉPICERIE',1,NOW()),
 ('PRD041','Omo (1 sac)','Unité',8,4,8,3,9000,9000,9000,'DÉSINFECTION',1,NOW()),
 ('PRD042','Orange','Kg',3,5,10,7,1200,1200,1200,'FRUITS',1,NOW()),
 ('PRD043','Papier hygiénique (2 p)','Kg',9,6,12,4,1800,1800,1800,'FOURNITURES DE BUREAU',1,NOW()),
 ('PRD044','Pastèque','Kg',3,4,8,5,900,900,900,'FRUITS',1,NOW()),
 ('PRD045','Persil + Céleri','Kg',1,2,4,1,2000,2000,2000,'LÉGUMES',1,NOW()),
 ('PRD046','Pilon de poulet','Kg',2,6,12,5,3000,3000,3000,'POISSONS ET VIANDES',1,NOW()),
 ('PRD047','Piment','Gramme',1,500,1000,300,12,12,12,'LÉGUMES',1,NOW()),
 ('PRD048','Poivre blanc','Gramme',4,500,1000,800,15,15,15,'ÉPICERIE',1,NOW()),
 ('PRD049','Poivre noir','Gramme',4,500,1000,600,16,16,16,'ÉPICERIE',1,NOW()),
 ('PRD050','Poivron','Kg',1,4,8,3,2200,2200,2200,'LÉGUMES',1,NOW()),
 ('PRD051','Pomme de terre','Koro',6,4,8,2,14000,14000,14000,'FÉCULENTS',1,NOW()),
 ('PRD052','Poulet entier','Kg',2,10,20,6,3500,3500,3500,'POISSONS ET VIANDES',1,NOW()),
 ('PRD053','Riz Basmati','Kg',6,20,40,15,1400,1400,1400,'FÉCULENTS',1,NOW()),
 ('PRD054','Salade','Kg',1,5,10,2,4000,4000,4000,'LÉGUMES',1,NOW()),
 ('PRD055','Sauce chinois','Kg',4,2,4,3,4500,4500,4500,'ÉPICERIE',1,NOW()),
 ('PRD056','Saumon','Kg',2,4,8,1.5,9500,9500,9500,'POISSONS ET VIANDES',1,NOW()),
 ('PRD057','Savon liquide','Litre',8,5,10,6,2200,2200,2200,'DÉSINFECTION',1,NOW()),
 ('PRD058','Sel','Gramme',4,2000,4000,5000,3,3,3,'ÉPICERIE',1,NOW()),
 ('PRD059','Sucre','Kg',5,20,40,30,800,800,800,'PÂTISSERIE',1,NOW()),
 ('PRD060','Sucre en poudre blanc','Kg',5,15,30,10,900,900,900,'PÂTISSERIE',1,NOW()),
 ('PRD061','Sucre en poudre roux','Kg',5,10,20,8,1100,1100,1100,'PÂTISSERIE',1,NOW()),
 ('PRD062','Tomate concentrée','Koro',1,4,8,2,16000,16000,16000,'LÉGUMES',1,NOW()),
 ('PRD063','Tomate fraîche','Koro',1,3,6,1,15000,15000,15000,'LÉGUMES',1,NOW()),
 ('PRD064','Vanille','Gramme',5,500,1000,300,25,25,25,'PÂTISSERIE',1,NOW()),
 ('PRD065','Vanille chocolat','Gramme',5,500,1000,700,22,22,22,'PÂTISSERIE',1,NOW()),
 ('PRD066','Vanille essentielle','Gramme',5,500,1000,400,30,30,30,'PÂTISSERIE',1,NOW()),
 ('PRD067','Vinaigre','Litre',4,4,8,5,900,900,900,'ÉPICERIE',1,NOW()),
 ('PRD068','Vinaigre de cidre','Litre',4,3,6,2,1400,1400,1400,'ÉPICERIE',1,NOW());

-- ---------- Utilisateurs de démonstration ----------
INSERT INTO utilisateur (login, mot_de_passe, nom_complet, role, actif) VALUES
 ('admin','admin123','Administrateur','ADMIN',1),
 ('gerant','gerant123','Le Gérant','GERANT',1),
 ('magasin','magasin123','Magasinier','MAGASINIER',1),
 ('chef','chef123','Chef Cuisinier','CHEF_CUISINE',1);
