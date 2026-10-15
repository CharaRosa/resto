package com.edelyne.restostock.repository;

import com.edelyne.restostock.model.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    Optional<Categorie> findByCode(String code);
    List<Categorie> findByActifTrueOrderByOrdreAsc();
}
