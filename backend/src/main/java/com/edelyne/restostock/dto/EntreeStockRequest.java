package com.edelyne.restostock.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Reception d'une livraison : cree un lot et incremente le stock. */
public record EntreeStockRequest(
        @NotNull(message = "Le produit est obligatoire") Long produitId,
        @NotNull(message = "La quantite est obligatoire")
        @DecimalMin(value = "0.01", message = "La quantite doit etre superieure a 0") BigDecimal quantite,
        BigDecimal prixAchat,
        LocalDate dlc,
        LocalDateTime dateEntree,
        String numeroLot,
        String numeroFacture,
        String responsable,
        String commentaire
) {
}
