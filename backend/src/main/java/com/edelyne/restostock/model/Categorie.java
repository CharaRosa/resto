package com.edelyne.restostock.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categorie", uniqueConstraints = @UniqueConstraint(columnNames = "code"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Categorie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 10)
    private String code;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String nom;

    @Column(length = 20)
    private String couleur;

    @Column(length = 10)
    private String icone;

    private Integer ordre;

    @Builder.Default
    private Boolean actif = true;

    @JsonIgnore
    @OneToMany(mappedBy = "categorie", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Produit> produits = new ArrayList<>();
}
