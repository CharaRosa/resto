package com.edelyne.restostock.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Fiche article du catalogue (base de produits PRD001 ... PRD068). */
@Entity
@Table(name = "produit",
        uniqueConstraints = @UniqueConstraint(columnNames = "code"),
        indexes = {
                @Index(name = "idx_produit_designation", columnList = "designation"),
                @Index(name = "idx_produit_categorie", columnList = "categorie_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 20)
    private String code;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String designation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @NotBlank
    @Column(nullable = false, length = 30)
    private String unite;

    @NotNull
    @Column(name = "stock_min", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal stockMin = BigDecimal.ZERO;

    @Column(name = "stock_cible", precision = 12, scale = 2)
    private BigDecimal stockCible;

    @Column(name = "stock_actuel", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal stockActuel = BigDecimal.ZERO;

    @Column(name = "prix_unitaire", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal prixUnitaire = BigDecimal.ZERO;

    @Column(name = "dernier_prix_achat", precision = 14, scale = 2)
    private BigDecimal dernierPrixAchat;

    @Column(name = "prix_moyen_pondere", precision = 14, scale = 4)
    @Builder.Default
    private BigDecimal prixMoyenPondere = BigDecimal.ZERO;

    @Column(name = "emplacement", length = 60)
    private String emplacement;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;

    @Builder.Default
    private Boolean actif = true;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @JsonIgnore
    @OneToMany(mappedBy = "produit", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Lot> lots = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "produit", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Mouvement> mouvements = new ArrayList<>();

    @PrePersist
    public void avantCreation() {
        this.dateCreation = LocalDateTime.now();
        if (this.stockActuel == null) this.stockActuel = BigDecimal.ZERO;
        if (this.stockMin == null) this.stockMin = BigDecimal.ZERO;
    }

    @PreUpdate
    public void avantModification() {
        this.dateModification = LocalDateTime.now();
    }

    @Transient
    @JsonProperty("enAlerte")
    public boolean isEnAlerte() {
        return stockActuel != null && stockMin != null && stockActuel.compareTo(stockMin) <= 0;
    }

    /** Valeur immobilisee de la ligne (FCFA). */
    @Transient
    @JsonProperty("valeurStock")
    public BigDecimal getValeurStock() {
        BigDecimal pu = (prixMoyenPondere != null && prixMoyenPondere.signum() > 0) ? prixMoyenPondere : prixUnitaire;
        if (pu == null || stockActuel == null) return BigDecimal.ZERO;
        return pu.multiply(stockActuel);
    }

    /** Quantite conseillee pour le reapprovisionnement. */
    @Transient
    @JsonProperty("quantiteACommander")
    public BigDecimal getQuantiteACommander() {
        if (!isEnAlerte()) return BigDecimal.ZERO;
        BigDecimal cible = (stockCible != null && stockCible.signum() > 0)
                ? stockCible
                : (stockMin == null ? BigDecimal.ZERO : stockMin.multiply(BigDecimal.valueOf(2)));
        BigDecimal qte = cible.subtract(stockActuel == null ? BigDecimal.ZERO : stockActuel);
        return qte.signum() > 0 ? qte : BigDecimal.ONE;
    }
}
