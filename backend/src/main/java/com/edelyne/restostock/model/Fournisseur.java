package com.edelyne.restostock.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/** Fournisseur / prestataire. */
@Entity
@Table(name = "fournisseur")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Fournisseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String nom;

    @Column(length = 40)
    private String telephone;

    @Column(length = 100)
    private String email;

    @Column(length = 150)
    private String adresse;

    @Column(length = 60)
    private String contact;

    @Column(name = "delai_livraison_jours")
    private Integer delaiLivraisonJours;

    @Builder.Default
    private Boolean actif = true;

    @OneToMany(mappedBy = "fournisseur", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"fournisseur"})
    @Builder.Default
    private List<Produit> produits = new ArrayList<>();
}
