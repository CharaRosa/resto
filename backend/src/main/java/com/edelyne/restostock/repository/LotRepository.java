package com.edelyne.restostock.repository;

import com.edelyne.restostock.model.Lot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LotRepository extends JpaRepository<Lot, Long> {

    List<Lot> findByProduitIdOrderByDateEntreeAsc(Long produitId);

    @Query("select l from Lot l where l.produit.id = :produitId and l.quantiteRestante > 0 order by l.dateEntree asc")
    List<Lot> trouverLotsDisponiblesFifo(@Param("produitId") Long produitId);

    @Query("select l from Lot l where l.produit.id = :produitId and l.quantiteRestante > 0 and l.dlc is not null order by l.dlc asc, l.dateEntree asc")
    List<Lot> trouverLotsDisponiblesFefo(@Param("produitId") Long produitId);

    @Query("select l from Lot l where l.quantiteRestante > 0 and l.dlc is not null and l.dlc <= :limite order by l.dlc asc")
    List<Lot> trouverLotsProchesDeLaDlc(@Param("limite") LocalDate limite);

    @Query("select l from Lot l where l.quantiteRestante > 0 order by l.dateEntree asc")
    List<Lot> trouverTousLesLotsDisponibles();

    @Query("select count(l) from Lot l where l.quantiteRestante > 0 and l.dlc is not null and l.dlc < :aujourdhui")
    long compterLotsPerimes(@Param("aujourdhui") LocalDate aujourdhui);
}
