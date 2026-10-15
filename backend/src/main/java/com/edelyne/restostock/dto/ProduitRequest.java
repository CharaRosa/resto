package com.edelyne.restostock.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** Creation / modification d'une fiche produit. */
public record ProduitRequest(
        @NotBlank(message = "Le code est obligatoire") String code,
        @NotBlank(message = "La designation est obligatoire") String designation,
        Long categorieId,
        @NotBlank(message = "L'unite est obligatoire") String unite,
        @NotNull(message = "Le stock minimum est obligatoire") BigDecimal stockMin,
        BigDecimal stockCible,
        BigDecimal prixUnitaire,
        String emplacement,
        Long fournisseurId,
        Boolean actif
) {
}
