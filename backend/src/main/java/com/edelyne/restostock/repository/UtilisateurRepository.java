package com.edelyne.restostock.repository;

import com.edelyne.restostock.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByLogin(String login);
    List<Utilisateur> findByActifTrueOrderByNomCompletAsc();
}
