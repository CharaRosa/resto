package com.edelyne.restostock.service;

import com.edelyne.restostock.dto.ProduitRequest;
import com.edelyne.restostock.exception.RegleMetierException;
import com.edelyne.restostock.exception.ResourceNotFoundException;
import com.edelyne.restostock.model.Categorie;
import com.edelyne.restostock.model.Fournisseur;
import com.edelyne.restostock.model.Produit;
import com.edelyne.restostock.repository.CategorieRepository;
import com.edelyne.restostock.repository.FournisseurRepository;
import com.edelyne.restostock.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ProduitService {

    private final ProduitRepository produitRepository;
    private final CategorieRepository categorieRepository;
    private final FournisseurRepository fournisseurRepository;

    public ProduitService(ProduitRepository produitRepository,
                          CategorieRepository categorieRepository,
                          FournisseurRepository fournisseurRepository) {
        this.produitRepository = produitRepository;
        this.categorieRepository = categorieRepository;
        this.fournisseurRepository = fournisseurRepository;
    }

    @Transactional(readOnly = true)
    public List<Produit> listerTous() {
        return produitRepository.findByActifTrueOrderByCodeAsc();
    }

    @Transactional(readOnly = true)
    public List<Produit> listerParCategorie(String categorieCode) {
        if (categorieCode == null || categorieCode.isBlank() || "TOUTES".equalsIgnoreCase(categorieCode)) {
            return listerTous();
        }
        return produitRepository.findByActifTrueAndCategorieCodeOrderByCodeAsc(categorieCode);
    }

    @Transactional(readOnly = true)
    public List<Produit> rechercher(String terme) {
        if (terme == null || terme.isBlank()) return listerTous();
        return produitRepository.rechercherParDesignation(terme.trim());
    }

    @Transactional(readOnly = true)
    public List<Produit> enAlerte() {
        return produitRepository.trouverEnAlerte();
    }

    @Transactional(readOnly = true)
    public Produit trouverParId(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable : " + id));
    }

    @Transactional(readOnly = true)
    public Produit trouverParCode(String code) {
        return produitRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable : " + code));
    }

    public Produit creer(ProduitRequest requete) {
        if (produitRepository.existsByCode(requete.code().trim().toUpperCase())) {
            throw new RegleMetierException("Ce code produit existe deja : " + requete.code());
        }
        Produit produit = Produit.builder()
                .code(requete.code().trim().toUpperCase())
                .designation(requete.designation().trim())
                .unite(requete.unite())
                .stockMin(requete.stockMin())
                .stockCible(requete.stockCible())
                .stockActuel(BigDecimal.ZERO)
                .prixUnitaire(requete.prixUnitaire() == null ? BigDecimal.ZERO : requete.prixUnitaire())
                .prixMoyenPondere(BigDecimal.ZERO)
                .emplacement(requete.emplacement())
                .actif(requete.actif() == null || requete.actif())
                .build();

        if (requete.categorieId() != null) {
            Categorie cat = categorieRepository.findById(requete.categorieId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categorie introuvable : " + requete.categorieId()));
            produit.setCategorie(cat);
        }
        if (requete.fournisseurId() != null) {
            Fournisseur f = fournisseurRepository.findById(requete.fournisseurId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fournisseur introuvable : " + requete.fournisseurId()));
            produit.setFournisseur(f);
        }
        return produitRepository.save(produit);
    }

    public Produit modifier(Long id, ProduitRequest requete) {
        Produit produit = trouverParId(id);
        if (!produit.getCode().equalsIgnoreCase(requete.code().trim())
                && produitRepository.existsByCode(requete.code().trim().toUpperCase())) {
            throw new RegleMetierException("Ce code produit est deja utilise : " + requete.code());
        }
        produit.setCode(requete.code().trim().toUpperCase());
        produit.setDesignation(requete.designation().trim());
        produit.setUnite(requete.unite());
        produit.setStockMin(requete.stockMin());
        produit.setStockCible(requete.stockCible());
        if (requete.prixUnitaire() != null) produit.setPrixUnitaire(requete.prixUnitaire());
        produit.setEmplacement(requete.emplacement());
        if (requete.actif() != null) produit.setActif(requete.actif());
        if (requete.categorieId() != null) {
            produit.setCategorie(categorieRepository.findById(requete.categorieId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categorie introuvable")));
        }
        if (requete.fournisseurId() != null) {
            produit.setFournisseur(fournisseurRepository.findById(requete.fournisseurId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fournisseur introuvable")));
        }
        return produitRepository.save(produit);
    }

    public void desactiver(Long id) {
        Produit produit = trouverParId(id);
        produit.setActif(false);
        produitRepository.save(produit);
    }
}
