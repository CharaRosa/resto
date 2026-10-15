package com.edelyne.restostock.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/** Ligne d'un bon de commande : Code / Designation / Unite / Quantite / Visa. */
@Entity
@Table(name = "ligne_bon_commande")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LigneBonCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bon_commande_id", nullable = false)
    private BonCommande bonCommande;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantite;

    @Column(length = 30)
    private String unite;

    @Column(name = "prix_unitaire", precision = 14, scale = 2)
    private BigDecimal prixUnitaire;

    @Column(name = "stock_au_moment", precision = 12, scale = 2)
    private BigDecimal stockAuMoment;

    @Column(name = "priorite", length = 10)
    @Builder.Default
    private String priorite = "NORMALE";

    @Column(name = "quantite_recue", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal quantiteRecue = BigDecimal.ZERO;

    @Column(length = 60)
    private String visa;

    @Column(length = 255)
    private String observation;

    @Transient
    @JsonProperty("totalLigne")
    public BigDecimal getTotalLigne() {
        if (quantite == null || prixUnitaire == null) return BigDecimal.ZERO;
        return quantite.multiply(prixUnitaire);
    }
}
