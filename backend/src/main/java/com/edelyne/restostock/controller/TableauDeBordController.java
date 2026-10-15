package com.edelyne.restostock.controller;

import com.edelyne.restostock.dto.LoginRequest;
import com.edelyne.restostock.model.Utilisateur;
import com.edelyne.restostock.service.TableauDeBordService;
import com.edelyne.restostock.service.UtilisateurService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TableauDeBordController {

    private final TableauDeBordService tableauDeBordService;
    private final UtilisateurService utilisateurService;

    public TableauDeBordController(TableauDeBordService tableauDeBordService,
                                   UtilisateurService utilisateurService) {
        this.tableauDeBordService = tableauDeBordService;
        this.utilisateurService = utilisateurService;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> tableauDeBord() {
        return tableauDeBordService.indicateurs();
    }

    @GetMapping("/utilisateurs")
    public List<Utilisateur> utilisateurs() {
        return utilisateurService.lister();
    }

    @PostMapping("/auth/login")
    public Map<String, Object> connexion(@Valid @RequestBody LoginRequest requete) {
        return utilisateurService.connecter(requete);
    }
}
