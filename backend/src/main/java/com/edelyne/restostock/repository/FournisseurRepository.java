package com.edelyne.restostock.repository;

import com.edelyne.restostock.model.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FournisseurRepository extends JpaRepository<Fournisseur, Long> {
    List<Fournisseur> findByActifTrueOrderByNomAsc();
}
