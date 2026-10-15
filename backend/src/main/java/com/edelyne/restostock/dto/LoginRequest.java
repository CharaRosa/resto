package com.edelyne.restostock.dto;

import jakarta.validation.constraints.NotBlank;

/** Connexion simple (sans Spring Security) : verifie le couple login / mot de passe. */
public record LoginRequest(
        @NotBlank(message = "Le login est obligatoire") String login,
        @NotBlank(message = "Le mot de passe est obligatoire") String motDePasse
) {
}
