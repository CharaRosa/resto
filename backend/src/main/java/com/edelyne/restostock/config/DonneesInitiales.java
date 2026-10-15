package com.edelyne.restostock.config;

import com.edelyne.restostock.model.*;
import com.edelyne.restostock.model.enums.RoleUtilisateur;
import com.edelyne.restostock.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * Importe au premier demarrage :
 *  - les 68 articles de votre "Base de Produits" (fichier Excel BON DE COMME.xlsx),
 *  - les 10 categories de l'application d'origine,
 *  - les utilisateurs de demonstration.
 * Idempotent : relancez l'application autant de fois que necessaire, rien n'est duplique.
 */
@Configuration
public class DonneesInitiales implements CommandLineRunner {

    private final CategorieRepository categorieRepository;
    private final ProduitRepository produitRepository;
    private final UtilisateurRepository utilisateurRepository;

    public DonneesInitiales(CategorieRepository categorieRepository,
                            ProduitRepository produitRepository,
                            UtilisateurRepository utilisateurRepository) {
        this.categorieRepository = categorieRepository;
        this.produitRepository = produitRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (categorieRepository.count() == 0) {
            importerCategories();
        }
        if (produitRepository.count() == 0) {
            importerProduits();
        }
        if (utilisateurRepository.count() == 0) {
            importerUtilisateurs();
        }
    }

    private void importerCategories() {
        Object[][] donnees = {
                {"LEG", "LEGUMES", "#16a34a", "\uD83E\uDD66", 1},
                {"PV", "POISSONS ET VIANDES", "#dc2626", "\uD83D\uDC1F", 2},
                {"FRU", "FRUITS", "#f59e0b", "\uD83C\uDF4E", 3},
                {"EPI", "EPICERIE", "#7c3aed", "\uD83E\uDDC2", 4},
                {"PAT", "PATISSERIE", "#db2777", "\uD83C\uDF70", 5},
                {"FEC", "FECULENTS", "#ca8a04", "\uD83C\uDF5A", 6},
                {"BOI", "BOISSONS", "#0284c7", "\uD83E\uDD64", 7},
                {"DES", "DESINFECTION", "#0d9488", "\uD83E\uDDEA", 8},
                {"BUR", "FOURNITURES DE BUREAU", "#475569", "\uD83D\uDCC4", 9},
                {"DIV", "DIVERS", "#64748b", "\uD83D\uDCE6", 10}
        };
        for (Object[] d : donnees) {
            categorieRepository.save(Categorie.builder()
                    .code((String) d[0]).nom((String) d[1]).couleur((String) d[2])
                    .icone((String) d[3]).ordre((Integer) d[4]).actif(true).build());
        }
    }

    /** Code, Designation, Unite, Categorie, StockMin, StockActuel, PrixUnitaire (FCFA). */
    private void importerProduits() {
        Map<String, Categorie> cat = new HashMap<>();
        categorieRepository.findAll().forEach(c -> cat.put(c.getCode(), c));

        Object[][] articles = {
                {"PRD001", "Ail décortiqué", "Kg", "LEG", 5, 1.5, 3500},
                {"PRD002", "Ailes de poulet", "Kg", "PV", 10, 4, 3200},
                {"PRD003", "Ananas", "Kg", "FRU", 5, 6, 1500},
                {"PRD004", "Banane", "Kg", "FRU", 5, 8, 1000},
                {"PRD005", "Banane plantain", "Kg", "FRU", 6, 3, 1200},
                {"PRD006", "Barquette", "Unité", "BUR", 20, 50, 500},
                {"PRD007", "Blanc de poulet", "Kg", "PV", 10, 4, 4500},
                {"PRD008", "Caramel", "Kg", "PAT", 3, 2, 2800},
                {"PRD009", "Citron", "Kg", "FRU", 4, 2, 1500},
                {"PRD010", "Concombre", "Kg", "LEG", 3, 0.8, 800},
                {"PRD011", "Cornichons bocal", "Unité", "EPI", 4, 6, 2500},
                {"PRD012", "Courgette", "Kg", "LEG", 3, 4, 900},
                {"PRD013", "Câpres bocal", "Unité", "EPI", 2, 3, 3200},
                {"PRD014", "Déodorant", "Kg", "DIV", 2, 2, 2000},
                {"PRD015", "Eau de Javel", "Litre", "DES", 4, 3, 2500},
                {"PRD016", "Farine T45", "Kg", "FEC", 15, 25, 700},
                {"PRD017", "Farine T65", "Kg", "FEC", 15, 10, 750},
                {"PRD018", "Faux filet", "Kg", "PV", 6, 3, 5200},
                {"PRD019", "Filet de bœuf", "Kg", "PV", 8, 2, 5000},
                {"PRD020", "Filet de capitaine", "Kg", "PV", 5, 8, 6000},
                {"PRD021", "Fraise", "Kg", "FRU", 2, 1, 4500},
                {"PRD022", "Gingembre (1L)", "Litre", "EPI", 2, 2, 3500},
                {"PRD023", "Haricot blanc", "Kg", "FEC", 5, 6, 1100},
                {"PRD024", "Huile d'olive", "Litre", "EPI", 6, 2, 4200},
                {"PRD025", "Huile de tournesol", "Litre", "EPI", 10, 12, 1300},
                {"PRD026", "Huile végétale 20L", "Litre", "EPI", 2, 3, 18000},
                {"PRD027", "Insecticide", "Kg", "DES", 2, 1, 4500},
                {"PRD028", "Jambon de dinde", "Kg", "PV", 4, 2.5, 4800},
                {"PRD029", "Ketchup (Bidon)", "Unité", "EPI", 4, 5, 1500},
                {"PRD030", "Lait", "Kg", "EPI", 10, 8, 900},
                {"PRD031", "Lait liquide", "Litre", "EPI", 12, 6, 1200},
                {"PRD032", "Levure chimique", "Gramme", "PAT", 1000, 2500, 8},
                {"PRD033", "Mangue", "Kg", "FRU", 4, 2, 1500},
                {"PRD034", "Merguez", "Kg", "PV", 5, 4, 4000},
                {"PRD035", "Miel", "Kg", "EPI", 3, 2, 6500},
                {"PRD036", "Mouchoirs (1 op)", "Unité", "BUR", 10, 12, 800},
                {"PRD037", "Moutarde", "Kg", "EPI", 3, 4, 2000},
                {"PRD038", "Oignon", "Koro", "LEG", 3, 1, 12000},
                {"PRD039", "Olive noire", "Kg", "EPI", 2, 3, 3800},
                {"PRD040", "Olive verte", "Kg", "EPI", 2, 2, 3600},
                {"PRD041", "Omo (1 sac)", "Unité", "DES", 4, 3, 9000},
                {"PRD042", "Orange", "Kg", "FRU", 5, 7, 1200},
                {"PRD043", "Papier hygiénique (2 p)", "Kg", "BUR", 6, 4, 1800},
                {"PRD044", "Pastèque", "Kg", "FRU", 4, 5, 900},
                {"PRD045", "Persil + Céleri", "Kg", "LEG", 2, 1, 2000},
                {"PRD046", "Pilon de poulet", "Kg", "PV", 6, 5, 3000},
                {"PRD047", "Piment", "Gramme", "LEG", 500, 300, 12},
                {"PRD048", "Poivre blanc", "Gramme", "EPI", 500, 800, 15},
                {"PRD049", "Poivre noir", "Gramme", "EPI", 500, 600, 16},
                {"PRD050", "Poivron", "Kg", "LEG", 4, 3, 2200},
                {"PRD051", "Pomme de terre", "Koro", "FEC", 4, 2, 14000},
                {"PRD052", "Poulet entier", "Kg", "PV", 10, 6, 3500},
                {"PRD053", "Riz Basmati", "Kg", "FEC", 20, 15, 1400},
                {"PRD054", "Salade", "Kg", "LEG", 5, 2, 4000},
                {"PRD055", "Sauce chinois", "Kg", "EPI", 2, 3, 4500},
                {"PRD056", "Saumon", "Kg", "PV", 4, 1.5, 9500},
                {"PRD057", "Savon liquide", "Litre", "DES", 5, 6, 2200},
                {"PRD058", "Sel", "Gramme", "EPI", 2000, 5000, 3},
                {"PRD059", "Sucre", "Kg", "PAT", 20, 30, 800},
                {"PRD060", "Sucre en poudre blanc", "Kg", "PAT", 15, 10, 900},
                {"PRD061", "Sucre en poudre roux", "Kg", "PAT", 10, 8, 1100},
                {"PRD062", "Tomate concentrée", "Koro", "LEG", 4, 2, 16000},
                {"PRD063", "Tomate fraîche", "Koro", "LEG", 3, 1, 15000},
                {"PRD064", "Vanille", "Gramme", "PAT", 500, 300, 25},
                {"PRD065", "Vanille chocolat", "Gramme", "PAT", 500, 700, 22},
                {"PRD066", "Vanille essentielle", "Gramme", "PAT", 500, 400, 30},
                {"PRD067", "Vinaigre", "Litre", "EPI", 4, 5, 900},
                {"PRD068", "Vinaigre de cidre", "Litre", "EPI", 3, 2, 1400}
        };

        for (Object[] a : articles) {
            Categorie c = cat.get((String) a[3]);
            BigDecimal stockMin = new BigDecimal(a[4].toString());
            BigDecimal prix = new BigDecimal(a[6].toString());
            produitRepository.save(Produit.builder()
                    .code((String) a[0])
                    .designation((String) a[1])
                    .unite((String) a[2])
                    .categorie(c)
                    .stockMin(stockMin)
                    .stockCible(stockMin.multiply(BigDecimal.valueOf(2)))
                    .stockActuel(new BigDecimal(a[5].toString()))
                    .prixUnitaire(prix)
                    .prixMoyenPondere(prix)
                    .dernierPrixAchat(prix)
                    .actif(true)
                    .emplacement(c == null ? null : c.getNom())
                    .build());
        }
    }

    private void importerUtilisateurs() {
        utilisateurRepository.save(Utilisateur.builder().login("admin").motDePasse("admin123")
                .nomComplet("Administrateur").role(RoleUtilisateur.ADMIN).actif(true).build());
        utilisateurRepository.save(Utilisateur.builder().login("gerant").motDePasse("gerant123")
                .nomComplet("Le Gérant").role(RoleUtilisateur.GERANT).actif(true).build());
        utilisateurRepository.save(Utilisateur.builder().login("magasin").motDePasse("magasin123")
                .nomComplet("Magasinier").role(RoleUtilisateur.MAGASINIER).actif(true).build());
        utilisateurRepository.save(Utilisateur.builder().login("chef").motDePasse("chef123")
                .nomComplet("Chef Cuisinier").role(RoleUtilisateur.CHEF_CUISINE).actif(true).build());
    }
}
