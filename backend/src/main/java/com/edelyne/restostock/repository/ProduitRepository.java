package com.edelyne.restostock.repository;

import com.edelyne.restostock.model.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProduitRepository extends JpaRepository<Produit, Long> {

    Optional<Produit> findByCode(String code);

    boolean existsByCode(String code);

    List<Produit> findByActifTrueOrderByCodeAsc();

    List<Produit> findByActifTrueAndCategorieCodeOrderByCodeAsc(String categorieCode);

    @Query("select p from Produit p where p.actif = true and lower(p.designation) like lower(concat('%', :q, '%')) order by p.designation")
    List<Produit> rechercherParDesignation(@Param("q") String q);

    /** Produits dont le stock a atteint ou franchi le seuil minimum. */
    @Query("select p from Produit p where p.actif = true and p.stockActuel <= p.stockMin order by (p.stockMin - p.stockActuel) desc, p.designation")
    List<Produit> trouverEnAlerte();

    @Query("select count(p) from Produit p where p.actif = true and p.stockActuel <= p.stockMin")
    long compterEnAlerte();

    @Query("select p from Produit p where p.actif = true and p.stockActuel > p.stockMin and p.stockMin > 0 and p.stockActuel <= (p.stockMin * 1.2)")
    List<Produit> trouverEnVigilance();
}
