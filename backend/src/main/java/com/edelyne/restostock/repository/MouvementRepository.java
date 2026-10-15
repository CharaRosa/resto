package com.edelyne.restostock.repository;

import com.edelyne.restostock.model.Mouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface MouvementRepository extends JpaRepository<Mouvement, Long> {

    List<Mouvement> findTop200ByOrderByDateMouvementDesc();

    List<Mouvement> findByProduitIdOrderByDateMouvementDesc(Long produitId);

    List<Mouvement> findByDateMouvementBetweenOrderByDateMouvementDesc(LocalDateTime debut, LocalDateTime fin);

    @Query("select coalesce(sum(m.valeurTotale),0) from Mouvement m where m.quantite < 0 and m.dateMouvement between :debut and :fin and m.type <> com.edelyne.restostock.model.enums.TypeMouvement.SORTIE_INVENTAIRE")
    BigDecimal totalConsommationPeriode(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("select coalesce(sum(m.valeurTotale),0) from Mouvement m where m.quantite > 0 and m.dateMouvement between :debut and :fin")
    BigDecimal totalApprovisionnementPeriode(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("select m.type, count(m), coalesce(sum(m.quantite),0) from Mouvement m group by m.type")
    List<Object[]> statistiquesParType();
}
