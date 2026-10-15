package com.edelyne.restostock.service;

import com.edelyne.restostock.dto.BonCommandeRequest;
import com.edelyne.restostock.dto.LigneBonCommandeRequest;
import com.edelyne.restostock.exception.RegleMetierException;
import com.edelyne.restostock.exception.ResourceNotFoundException;
import com.edelyne.restostock.model.BonCommande;
import com.edelyne.restostock.model.Fournisseur;
import com.edelyne.restostock.model.LigneBonCommande;
import com.edelyne.restostock.model.Produit;
import com.edelyne.restostock.model.enums.ServiceDemandeur;
import com.edelyne.restostock.model.enums.StatutBonCommande;
import com.edelyne.restostock.repository.BonCommandeRepository;
import com.edelyne.restostock.repository.FournisseurRepository;
import com.edelyne.restostock.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Generation et suivi des bons de commande (document papier EDELYNE numerise). */
@Service
@Transactional
public class BonCommandeService {

    private final BonCommandeRepository bonCommandeRepository;
    private final ProduitRepository produitRepository;
    private final FournisseurRepository fournisseurRepository;

    public BonCommandeService(BonCommandeRepository bonCommandeRepository,
                              ProduitRepository produitRepository,
                              FournisseurRepository fournisseurRepository) {
        this.bonCommandeRepository = bonCommandeRepository;
        this.produitRepository = produitRepository;
        this.fournisseurRepository = fournisseurRepository;
    }

    @Transactional(readOnly = true)
    public List<BonCommande> listerTous() {
        return bonCommandeRepository.findAllByOrderByDateCreationDesc();
    }

    @Transactional(readOnly = true)
    public BonCommande trouver(Long id) {
        return bonCommandeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bon de commande introuvable : " + id));
    }

    /** Cree un bon de commande : lignes automatiques depuis les alertes ou lignes saisies. */
    public BonCommande creer(BonCommandeRequest requete) {
        BonCommande bon = BonCommande.builder()
                .numero(genererNumero())
                .dateCreation(LocalDateTime.now())
                .dateLivraisonSouhaitee(requete.dateLivraisonSouhaitee())
                .service(requete.service() == null ? ServiceDemandeur.CUISINE : requete.service())
                .statut(StatutBonCommande.BROUILLON)
                .responsable(requete.responsable())
                .genereAutomatiquement(Boolean.TRUE.equals(requete.automatique()))
                .observation(requete.observation())
                .montantEstime(BigDecimal.ZERO)
                .build();

        if (requete.fournisseurId() != null) {
            Fournisseur f = fournisseurRepository.findById(requete.fournisseurId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fournisseur introuvable"));
            bon.setFournisseur(f);
        }

        if (Boolean.TRUE.equals(requete.automatique())) {
            for (Produit p : produitRepository.trouverEnAlerte()) {
                bon.ajouterLigne(construireLigne(p, p.getQuantiteACommander(), p.getPrixUnitaire(), "URGENTE", "Genere automatiquement (stock sous seuil)"));
            }
        }

        if (requete.lignes() != null) {
            for (LigneBonCommandeRequest l : requete.lignes()) {
                Produit produit = produitRepository.findById(l.produitId())
                        .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable : " + l.produitId()));
                BigDecimal prix = l.prixUnitaire() != null ? l.prixUnitaire() : produit.getPrixUnitaire();
                bon.ajouterLigne(construireLigne(produit, l.quantite(), prix,
                        l.priorite() == null ? "NORMALE" : l.priorite(), l.observation()));
            }
        }

        if (bon.getLignes().isEmpty()) {
            throw new RegleMetierException("Aucune ligne : le bon de commande serait vide");
        }
        bon.recalculerMontant();
        return bonCommandeRepository.save(bon);
    }

    public BonCommande changerStatut(Long id, StatutBonCommande statut) {
        BonCommande bon = trouver(id);
        bon.setStatut(statut);
        return bonCommandeRepository.save(bon);
    }

    public BonCommande viserLigne(Long bonId, Long ligneId, String visa) {
        BonCommande bon = trouver(bonId);
        bon.getLignes().stream()
                .filter(l -> l.getId().equals(ligneId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ligne introuvable : " + ligneId))
                .setVisa(visa);
        return bonCommandeRepository.save(bon);
    }

    private LigneBonCommande construireLigne(Produit produit, BigDecimal quantite, BigDecimal prix,
                                             String priorite, String observation) {
        return LigneBonCommande.builder()
                .produit(produit)
                .quantite(quantite)
                .unite(produit.getUnite())
                .prixUnitaire(prix == null ? BigDecimal.ZERO : prix)
                .stockAuMoment(produit.getStockActuel())
                .priorite(priorite)
                .quantiteRecue(BigDecimal.ZERO)
                .observation(observation)
                .build();
    }

    private String genererNumero() {
        return bonCommandeRepository.findTopByOrderByIdDesc()
                .map(b -> {
                    String num = b.getNumero();
                    try {
                        int seq = Integer.parseInt(num.replaceAll("[^0-9]", ""));
                        return String.format("BC-%05d", seq + 1);
                    } catch (NumberFormatException e) {
                        return "BC-00001";
                    }
                })
                .orElse("BC-00001");
    }

    /** Liste des lignes pretes a etre exportees en CSV / imprimees. */
    @Transactional(readOnly = true)
    public List<String[]> lignesPourExport(Long id) {
        BonCommande bon = trouver(id);
        List<String[]> lignes = new ArrayList<>();
        lignes.add(new String[]{"CODE PRODUIT", "DESIGNATION", "UNITE", "QUANTITE", "PRIX UNITAIRE", "TOTAL", "PRIORITE", "VISA"});
        for (LigneBonCommande l : bon.getLignes()) {
            lignes.add(new String[]{
                    l.getProduit().getCode(),
                    l.getProduit().getDesignation(),
                    l.getUnite() == null ? "" : l.getUnite(),
                    l.getQuantite() == null ? "" : l.getQuantite().stripTrailingZeros().toPlainString(),
                    l.getPrixUnitaire() == null ? "" : l.getPrixUnitaire().stripTrailingZeros().toPlainString(),
                    l.getTotalLigne() == null ? "" : l.getTotalLigne().stripTrailingZeros().toPlainString(),
                    l.getPriorite() == null ? "" : l.getPriorite(),
                    l.getVisa() == null ? "" : l.getVisa()
            });
        }
        return lignes;
    }
}
