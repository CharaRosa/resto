package com.edelyne.restostock.repository;

import com.edelyne.restostock.model.BonCommande;
import com.edelyne.restostock.model.enums.StatutBonCommande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BonCommandeRepository extends JpaRepository<BonCommande, Long> {

    List<BonCommande> findAllByOrderByDateCreationDesc();

    List<BonCommande> findByStatutOrderByDateCreationDesc(StatutBonCommande statut);

    /** Dernier bon cree : sert a generer le numero suivant (BC-0001, BC-0002...). */
    Optional<BonCommande> findTopByOrderByIdDesc();

    long countByStatut(StatutBonCommande statut);
}
