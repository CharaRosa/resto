package com.edelyne.restostock.model;

import com.edelyne.restostock.model.enums.RoleUtilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

/** Utilisateur de l'application (gestion simple des droits, sans Spring Security). */
@Entity
@Table(name = "utilisateur", uniqueConstraints = @UniqueConstraint(columnNames = "login"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String login;

    @JsonIgnore
    @Column(nullable = false, length = 120)
    private String motDePasse;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String nomComplet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoleUtilisateur role;

    @Builder.Default
    private Boolean actif = true;

    @Column(name = "derniere_connexion")
    private LocalDateTime derniereConnexion;
}
