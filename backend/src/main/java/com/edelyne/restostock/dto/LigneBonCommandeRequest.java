package com.edelyne.restostock.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** Une ligne saisie dans un bon de commande. */
public record LigneBonCommandeRequest(
        @NotNull(message = "Le produit est obligatoire") Long produitId,
        @NotNull(message = "La quantite est obligatoire") BigDecimal quantite,
        BigDecimal prixUnitaire,
        String priorite,
        String observation
) {
}
