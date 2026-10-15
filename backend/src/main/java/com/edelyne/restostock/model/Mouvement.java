package com.edelyne.restostock.model;

import com.edelyne.restostock.model.enums.ServiceDemandeur;
import com.edelyne.restostock.model.enums.TypeMouvement;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Mouvement de stock signe : + entree, - sortie. */
@Entity
@Table(name = "mouvement", indexes = {
        @Index(name = "idx_mvt_produit", columnList = "produit_id"),
        @Index(name = "idx_mvt_date", columnList = "date_mouvement"),
        @Index(name = "idx_mvt_type", columnList = "type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Mouvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TypeMouvement type;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id")
    private Lot lot;

    /** Quantite signee (positive en entree, negative en sortie). */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantite;

    @Column(length = 30)
    private String unite;

    @Column(name = "prix_unitaire", precision = 14, scale = 2)
    private BigDecimal prixUnitaire;

    @Column(name = "valeur_totale", precision = 16, scale = 2)
    private BigDecimal valeurTotale;

    @Column(name = "date_mouvement", nullable = false)
    private LocalDateTime dateMouvement;

    @Column(length = 80)
    private String responsable;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ServiceDemandeur service;

    @Column(name = "stock_apres", precision = 12, scale = 2)
    private BigDecimal stockApres;

    @Column(length = 255)
    private String commentaire;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bon_commande_id")
    private BonCommande bonCommande;

    @PrePersist
    public void avantCreation() {
        if (this.dateMouvement == null) this.dateMouvement = LocalDateTime.now();
    }
}
