package com.edelyne.restostock.model;

import com.edelyne.restostock.model.enums.ServiceDemandeur;
import com.edelyne.restostock.model.enums.StatutBonCommande;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Bon de commande (reproduction numerique du document papier EDELYNE). */
@Entity
@Table(name = "bon_commande", uniqueConstraints = @UniqueConstraint(columnNames = "numero"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BonCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String numero;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_livraison_souhaitee")
    private LocalDate dateLivraisonSouhaitee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceDemandeur service;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutBonCommande statut = StatutBonCommande.BROUILLON;

    @Column(length = 80)
    private String responsable;

    @Column(name = "genere_automatiquement")
    @Builder.Default
    private Boolean genereAutomatiquement = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;

    @Column(name = "montant_estime", precision = 16, scale = 2)
    @Builder.Default
    private BigDecimal montantEstime = BigDecimal.ZERO;

    @Column(length = 255)
    private String observation;

    @OneToMany(mappedBy = "bonCommande", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<LigneBonCommande> lignes = new ArrayList<>();

    public void ajouterLigne(LigneBonCommande ligne) {
        ligne.setBonCommande(this);
        this.lignes.add(ligne);
    }

    public void recalculerMontant() {
        this.montantEstime = lignes.stream()
                .map(LigneBonCommande::getTotalLigne)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @PrePersist
    public void avantCreation() {
        if (this.dateCreation == null) this.dateCreation = LocalDateTime.now();
    }
}
