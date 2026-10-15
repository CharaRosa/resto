package com.edelyne.restostock.service;

import com.edelyne.restostock.model.Lot;
import com.edelyne.restostock.model.Produit;
import com.edelyne.restostock.model.enums.StatutBonCommande;
import com.edelyne.restostock.repository.BonCommandeRepository;
import com.edelyne.restostock.repository.LotRepository;
import com.edelyne.restostock.repository.MouvementRepository;
import com.edelyne.restostock.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Indicateurs du tableau de bord. */
@Service
@Transactional(readOnly = true)
public class TableauDeBordService {

    private final ProduitRepository produitRepository;
    private final LotRepository lotRepository;
    private final MouvementRepository mouvementRepository;
    private final BonCommandeRepository bonCommandeRepository;

    public TableauDeBordService(ProduitRepository produitRepository,
                                LotRepository lotRepository,
                                MouvementRepository mouvementRepository,
                                BonCommandeRepository bonCommandeRepository) {
        this.produitRepository = produitRepository;
        this.lotRepository = lotRepository;
        this.mouvementRepository = mouvementRepository;
        this.bonCommandeRepository = bonCommandeRepository;
    }

    public Map<String, Object> indicateurs() {
        List<Produit> produits = produitRepository.findByActifTrueOrderByCodeAsc();
        Map<String, Object> kpi = new LinkedHashMap<>();

        BigDecimal valeurTotale = produits.stream()
                .map(Produit::getValeurStock)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Produit> alertes = produitRepository.trouverEnAlerte();
        List<Lot> perimesOuProches = lotRepository.trouverLotsProchesDeLaDlc(LocalDate.now().plusDays(7));

        LocalDateTime debutMois = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime finMois = LocalDateTime.now();

        kpi.put("nombreProduits", produits.size());
        kpi.put("valeurTotaleStock", valeurTotale.setScale(0, RoundingMode.HALF_UP));
        kpi.put("nombreAlertes", alertes.size());
        kpi.put("nombreVigilance", produitRepository.trouverEnVigilance().size());
        kpi.put("nombreProduitsEnRupture", produits.stream()
                .filter(p -> p.getStockActuel() == null || p.getStockActuel().signum() <= 0).count());
        kpi.put("nombreLotsPerimes", lotRepository.compterLotsPerimes(LocalDate.now()));
        kpi.put("nombreLotsDlcProche", perimesOuProches.size());
        kpi.put("nombreBonsEnAttente", bonCommandeRepository.countByStatut(StatutBonCommande.BROUILLON)
                + bonCommandeRepository.countByStatut(StatutBonCommande.ENVOYE));
        kpi.put("consommationMois", mouvementRepository.totalConsommationPeriode(debutMois, finMois).abs());
        kpi.put("approvisionnementMois", mouvementRepository.totalApprovisionnementPeriode(debutMois, finMois));
        kpi.put("dateCalcul", LocalDateTime.now());

        // Valeur du stock par categorie (pour le camembert)
        Map<String, BigDecimal> parCategorie = new LinkedHashMap<>();
        for (Produit p : produits) {
            String nom = p.getCategorie() == null ? "NON CLASSE" : p.getCategorie().getNom();
            parCategorie.merge(nom, p.getValeurStock(), BigDecimal::add);
        }
        kpi.put("valeurParCategorie", parCategorie);

        // Top consommateurs de la periode
        List<Map<String, Object>> topAlertes = new ArrayList<>();
        alertes.stream().limit(10).forEach(p -> {
            Map<String, Object> ligne = new LinkedHashMap<>();
            ligne.put("code", p.getCode());
            ligne.put("designation", p.getDesignation());
            ligne.put("stockActuel", p.getStockActuel());
            ligne.put("stockMin", p.getStockMin());
            ligne.put("unite", p.getUnite());
            ligne.put("quantiteACommander", p.getQuantiteACommander());
            ligne.put("categorie", p.getCategorie() == null ? "-" : p.getCategorie().getNom());
            topAlertes.add(ligne);
        });
        kpi.put("principalesAlertes", topAlertes);

        return kpi;
    }
}
