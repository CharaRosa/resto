package com.edelyne.restostock.controller;

import com.edelyne.restostock.model.Categorie;
import com.edelyne.restostock.model.Fournisseur;
import com.edelyne.restostock.repository.CategorieRepository;
import com.edelyne.restostock.repository.FournisseurRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReferentielController {

    private final CategorieRepository categorieRepository;
    private final FournisseurRepository fournisseurRepository;

    public ReferentielController(CategorieRepository categorieRepository,
                                 FournisseurRepository fournisseurRepository) {
        this.categorieRepository = categorieRepository;
        this.fournisseurRepository = fournisseurRepository;
    }

    @GetMapping("/categories")
    public List<Categorie> categories() {
        return categorieRepository.findByActifTrueOrderByOrdreAsc();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public Categorie creerCategorie(@Valid @RequestBody Categorie categorie) {
        return categorieRepository.save(categorie);
    }

    @GetMapping("/fournisseurs")
    public List<Fournisseur> fournisseurs() {
        return fournisseurRepository.findByActifTrueOrderByNomAsc();
    }

    @PostMapping("/fournisseurs")
    @ResponseStatus(HttpStatus.CREATED)
    public Fournisseur creerFournisseur(@Valid @RequestBody Fournisseur fournisseur) {
        return fournisseurRepository.save(fournisseur);
    }
}
