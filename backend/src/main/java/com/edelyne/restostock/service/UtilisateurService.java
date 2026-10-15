package com.edelyne.restostock.service;

import com.edelyne.restostock.dto.LoginRequest;
import com.edelyne.restostock.exception.RegleMetierException;
import com.edelyne.restostock.model.Utilisateur;
import com.edelyne.restostock.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Authentification simple (pas de Spring Security) : adaptee a un usage local.
 * Le mot de passe est stocke en clair ici pour la simplicite du POC ;
 * en production, utiliser BCrypt (spring-security-crypto).
 */
@Service
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    public UtilisateurService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    public Map<String, Object> connecter(LoginRequest requete) {
        Utilisateur u = utilisateurRepository.findByLogin(requete.login().trim())
                .orElseThrow(() -> new RegleMetierException("Login inconnu"));
        if (!Boolean.TRUE.equals(u.getActif())) {
            throw new RegleMetierException("Ce compte est desactive");
        }
        if (!u.getMotDePasse().equals(requete.motDePasse())) {
            throw new RegleMetierException("Mot de passe incorrect");
        }
        u.setDerniereConnexion(LocalDateTime.now());
        utilisateurRepository.save(u);

        Map<String, Object> reponse = new LinkedHashMap<>();
        reponse.put("id", u.getId());
        reponse.put("login", u.getLogin());
        reponse.put("nomComplet", u.getNomComplet());
        reponse.put("role", u.getRole());
        reponse.put("token", "local-" + u.getId() + "-" + System.currentTimeMillis());
        return reponse;
    }

    @Transactional(readOnly = true)
    public java.util.List<Utilisateur> lister() {
        return utilisateurRepository.findByActifTrueOrderByNomCompletAsc();
    }
}
