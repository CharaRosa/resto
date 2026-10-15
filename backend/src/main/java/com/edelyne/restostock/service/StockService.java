package com.edelyne.restostock.service;

import com.edelyne.restostock.dto.EntreeStockRequest;
import com.edelyne.restostock.dto.SortieStockRequest;
import com.edelyne.restostock.exception.RegleMetierException;
import com.edelyne.restostock.model.Lot;
import com.edelyne.restostock.model.Mouvement;
import com.edelyne.restostock.model.Produit;
import com.edelyne.restostock.repository.LotRepository;
import com.edelyne.restostock.repository.MouvementRepository;
import com.edelyne.restostock.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Coeur du systeme : toute variation de stock passe par ce service.
 * - Entree  : cree un lot + incremente le stock + recalcule le prix moyen pondere (CMP).
 * - Sortie  : deduit les lots en FIFO (ou FEFO par DLC), decremente le stock,
 *             journalise le mouvement et valorise au CMP.
 */
@Service
@Transactional
public class StockService {

    private static final int ECHELLE = 2;

    private final ProduitRepository produitRepository;
    private final LotRepository lotRepository;
    private final MouvementRepository mouvementRepository;

    public StockService(ProduitRepository produitRepository,
                        LotRepository lotRepository,
                        MouvementRepository mouvementRepository) {
        this.produitRepository = produitRepository;
        this.lotRepository = lotRepository;
        this.mouvementRepository = mouvementRepository;
    }

    /* ==========================================================
       ENTREE EN STOCK (reception d'une livraison)
       ========================================================== */
    public Mouvement enregistrerEntree(EntreeStockRequest requete) {
        Produit produit = produitRepository.findById(requete.produitId())
                .orElseThrow(() -> new RegleMetierException("Produit introuvable"));

        BigDecimal quantite = requete.quantite().setScale(ECHELLE, RoundingMode.HALF_UP);
        BigDecimal prixAchat = requete.prixAchat() == null ? BigDecimal.ZERO : requete.prixAchat();

        LocalDateTime dateEntree = requete.dateEntree() == null ? LocalDateTime.now() : requete.dateEntree();
        String numeroLot = (requete.numeroLot() == null || requete.numeroLot().isBlank())
                ? genererNumeroLot(produit)
                : requete.numeroLot();

        Lot lot = Lot.builder()
                .numeroLot(numeroLot)
                .produit(produit)
                .quantiteInitiale(quantite)
                .quantiteRestante(quantite)
                .unite(produit.getUnite())
                .prixAchat(prixAchat)
                .dateEntree(dateEntree)
                .dlc(requete.dlc())
                .numeroFacture(requete.numeroFacture())
                .statut("DISPONIBLE")
                .dateCreation(LocalDateTime.now())
                .build();
        lotRepository.save(lot);

        // Recalcul du prix moyen pondere : CMP = (stock * CMP + qte * prixAchat) / (stock + qte)
        BigDecimal ancienStock = produit.getStockActuel() == null ? BigDecimal.ZERO : produit.getStockActuel();
        BigDecimal ancienCmp = produit.getPrixMoyenPondere() == null ? BigDecimal.ZERO : produit.getPrixMoyenPondere();
        BigDecimal nouveauStock = ancienStock.add(quantite);

        if (nouveauStock.signum() > 0 && prixAchat.signum() > 0) {
            BigDecimal valeurAncienne = ancienStock.multiply(ancienCmp);
            BigDecimal valeurNouvelle = quantite.multiply(prixAchat);
            produit.setPrixMoyenPondere(valeurAncienne.add(valeurNouvelle)
                    .divide(nouveauStock, 4, RoundingMode.HALF_UP));
        }
        produit.setStockActuel(nouveauStock);
        if (prixAchat.signum() > 0) produit.setDernierPrixAchat(prixAchat);
        produitRepository.save(produit);

        Mouvement mouvement = Mouvement.builder()
                .type(com.edelyne.restostock.model.enums.TypeMouvement.ENTREE_LIVRAISON)
                .produit(produit)
                .lot(lot)
                .quantite(quantite)
                .unite(produit.getUnite())
                .prixUnitaire(prixAchat)
                .valeurTotale(quantite.multiply(prixAchat))
                .dateMouvement(dateEntree)
                .responsable(requete.responsable() == null ? "Magasinier" : requete.responsable())
                .service(com.edelyne.restostock.model.enums.ServiceDemandeur.MAGASIN)
                .stockApres(nouveauStock)
                .commentaire(requete.commentaire() == null
                        ? "Reception lot " + numeroLot + (requete.numeroFacture() == null ? "" : " / Facture " + requete.numeroFacture())
                        : requete.commentaire())
                .build();
        return mouvementRepository.save(mouvement);
    }

    /* ==========================================================
       SORTIE DE STOCK (consommation, perte, casse)
       ========================================================== */
    public Mouvement enregistrerSortie(SortieStockRequest requete) {
        Produit produit = produitRepository.findById(requete.produitId())
                .orElseThrow(() -> new RegleMetierException("Produit introuvable"));

        BigDecimal quantite = requete.quantite().setScale(ECHELLE, RoundingMode.HALF_UP);
        BigDecimal stockDisponible = produit.getStockActuel() == null ? BigDecimal.ZERO : produit.getStockActuel();

        if (stockDisponible.compareTo(quantite) < 0) {
            throw new RegleMetierException(String.format(
                    "Stock insuffisant pour %s : disponible %s %s, demande %s %s",
                    produit.getDesignation(), stockDisponible.stripTrailingZeros().toPlainString(), produit.getUnite(),
                    quantite.stripTrailingZeros().toPlainString(), produit.getUnite()));
        }

        boolean fefo = Boolean.TRUE.equals(requete.fefo());
        List<Lot> lots = fefo
                ? lotRepository.trouverLotsDisponiblesFefo(produit.getId())
                : lotRepository.trouverLotsDisponiblesFifo(produit.getId());

        BigDecimal reste = quantite;
        Lot dernierLotTouche = null;
        for (Lot lot : lots) {
            if (reste.signum() <= 0) break;
            BigDecimal prelevement = lot.getQuantiteRestante().min(reste);
            lot.setQuantiteRestante(lot.getQuantiteRestante().subtract(prelevement));
            if (lot.getQuantiteRestante().signum() == 0) lot.setStatut("EPUISE");
            lotRepository.save(lot);
            reste = reste.subtract(prelevement);
            dernierLotTouche = lot;
        }

        BigDecimal nouveauStock = stockDisponible.subtract(quantite);
        produit.setStockActuel(nouveauStock);
        produitRepository.save(produit);

        BigDecimal cmp = produit.getPrixMoyenPondere() == null || produit.getPrixMoyenPondere().signum() == 0
                ? produit.getPrixUnitaire() : produit.getPrixMoyenPondere();

        Mouvement mouvement = Mouvement.builder()
                .type(requete.type())
                .produit(produit)
                .lot(dernierLotTouche)
                .quantite(quantite.negate())
                .unite(produit.getUnite())
                .prixUnitaire(cmp)
                .valeurTotale(quantite.multiply(cmp).negate())
                .dateMouvement(LocalDateTime.now())
                .responsable(requete.responsable() == null ? "Magasinier" : requete.responsable())
                .service(requete.service())
                .stockApres(nouveauStock)
                .commentaire(requete.commentaire())
                .build();
        return mouvementRepository.save(mouvement);
    }

    /* ==========================================================
       AJUSTEMENT D'INVENTAIRE
       ========================================================== */
    public Mouvement ajusterInventaire(Long produitId, BigDecimal nouveauStock, String responsable, String commentaire) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RegleMetierException("Produit introuvable"));
        BigDecimal ancien = produit.getStockActuel() == null ? BigDecimal.ZERO : produit.getStockActuel();
        BigDecimal ecart = nouveauStock.subtract(ancien);
        if (ecart.signum() == 0) throw new RegleMetierException("Le stock saisi est identique au stock actuel");

        produit.setStockActuel(nouveauStock);
        produitRepository.save(produit);

        BigDecimal cmp = produit.getPrixMoyenPondere() == null || produit.getPrixMoyenPondere().signum() == 0
                ? produit.getPrixUnitaire() : produit.getPrixMoyenPondere();

        Mouvement mouvement = Mouvement.builder()
                .type(ecart.signum() > 0
                        ? com.edelyne.restostock.model.enums.TypeMouvement.ENTREE_INVENTAIRE
                        : com.edelyne.restostock.model.enums.TypeMouvement.SORTIE_INVENTAIRE)
                .produit(produit)
                .quantite(ecart)
                .unite(produit.getUnite())
                .prixUnitaire(cmp)
                .valeurTotale(ecart.multiply(cmp))
                .dateMouvement(LocalDateTime.now())
                .responsable(responsable)
                .stockApres(nouveauStock)
                .commentaire(commentaire == null ? "Ajustement d'inventaire" : commentaire)
                .build();
        return mouvementRepository.save(mouvement);
    }

    /* ==========================================================
       LECTURES
       ========================================================== */
    @Transactional(readOnly = true)
    public List<Mouvement> derniersMouvements() {
        return mouvementRepository.findTop200ByOrderByDateMouvementDesc();
    }

    @Transactional(readOnly = true)
    public List<Lot> lotsARisque(int jours) {
        return lotRepository.trouverLotsProchesDeLaDlc(LocalDate.now().plusDays(jours));
    }

    private String genererNumeroLot(Produit produit) {
        long total = lotRepository.findByProduitIdOrderByDateEntreeAsc(produit.getId()).size() + 1;
        return String.format("LOT-%s-%03d", produit.getCode(), total);
    }
}
