package com.edelyne.restostock.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Lot physique en magasin : tracabilite, DLC et sortie FIFO / FEFO. */
@Entity
@Table(name = "lot", indexes = {
        @Index(name = "idx_lot_produit", columnList = "produit_id"),
        @Index(name = "idx_lot_dlc", columnList = "dlc")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Lot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_lot", nullable = false, length = 40)
    private String numeroLot;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantiteInitiale;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantiteRestante;

    @Column(length = 30)
    private String unite;

    @Column(name = "prix_achat", precision = 14, scale = 2)
    private BigDecimal prixAchat;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    private LocalDate dlc;

    @Column(name = "numero_facture", length = 40)
    private String numeroFacture;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String statut = "DISPONIBLE"; // DISPONIBLE, EPUISE, PERIME

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Transient
    @JsonProperty("perime")
    public boolean isPerime() {
        return dlc != null && dlc.isBefore(LocalDate.now());
    }

    @Transient
    @JsonProperty("joursAvantDlc")
    public Long getJoursAvantDlc() {
        return dlc == null ? null : java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), dlc);
    }
}
