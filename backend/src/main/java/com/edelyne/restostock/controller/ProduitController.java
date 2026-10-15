package com.edelyne.restostock.controller;

import com.edelyne.restostock.dto.ProduitRequest;
import com.edelyne.restostock.model.Produit;
import com.edelyne.restostock.service.ProduitService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    private final ProduitService produitService;

    public ProduitController(ProduitService produitService) {
        this.produitService = produitService;
    }

    @GetMapping
    public List<Produit> lister(@RequestParam(required = false) String categorie,
                                @RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) return produitService.rechercher(q);
        if (categorie != null) return produitService.listerParCategorie(categorie);
        return produitService.listerTous();
    }

    @GetMapping("/alertes")
    public List<Produit> alertes() {
        return produitService.enAlerte();
    }

    @GetMapping("/{id}")
    public Produit detail(@PathVariable Long id) {
        return produitService.trouverParId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Produit creer(@Valid @RequestBody ProduitRequest requete) {
        return produitService.creer(requete);
    }

    @PutMapping("/{id}")
    public Produit modifier(@PathVariable Long id, @Valid @RequestBody ProduitRequest requete) {
        return produitService.modifier(id, requete);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactiver(@PathVariable Long id) {
        produitService.desactiver(id);
        return ResponseEntity.noContent().build();
    }
}
