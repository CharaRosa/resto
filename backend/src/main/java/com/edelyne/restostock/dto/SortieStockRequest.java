package com.edelyne.restostock.dto;

import com.edelyne.restostock.model.enums.ServiceDemandeur;
import com.edelyne.restostock.model.enums.TypeMouvement;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** Sortie de stock (consommation, perte, casse) avec deduction FIFO ou FEFO. */
public record SortieStockRequest(
        @NotNull(message = "Le produit est obligatoire") Long produitId,
        @NotNull(message = "La quantite est obligatoire")
        @DecimalMin(value = "0.01", message = "La quantite doit etre superieure a 0") BigDecimal quantite,
        @NotNull(message = "Le type de mouvement est obligatoire") TypeMouvement type,
        ServiceDemandeur service,
        String responsable,
        String commentaire,
        /** true = sortir par date de peremption (FEFO), false / null = FIFO par date d'entree. */
        Boolean fefo
) {
}
