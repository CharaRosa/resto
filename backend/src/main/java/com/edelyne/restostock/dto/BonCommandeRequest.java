package com.edelyne.restostock.dto;

import com.edelyne.restostock.model.enums.ServiceDemandeur;

import java.time.LocalDate;
import java.util.List;

/** Creation d'un bon de commande (manuel ou automatique). */
public record BonCommandeRequest(
        ServiceDemandeur service,
        String responsable,
        LocalDate dateLivraisonSouhaitee,
        Long fournisseurId,
        String observation,
        /** true = generer les lignes automatiquement depuis les articles en alerte. */
        Boolean automatique,
        List<LigneBonCommandeRequest> lignes
) {
}
