package com.edelyne.restostock.controller;

import com.edelyne.restostock.dto.BonCommandeRequest;
import com.edelyne.restostock.model.BonCommande;
import com.edelyne.restostock.model.enums.StatutBonCommande;
import com.edelyne.restostock.service.BonCommandeService;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bons-commande")
public class BonCommandeController {

    private final BonCommandeService service;

    public BonCommandeController(BonCommandeService service) {
        this.service = service;
    }

    @GetMapping
    public List<BonCommande> lister() {
        return service.listerTous();
    }

    @GetMapping("/{id}")
    public BonCommande detail(@PathVariable Long id) {
        return service.trouver(id);
    }

    /** Cree un bon : automatique (alertes) ou manuel (lignes fournies). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BonCommande creer(@Valid @RequestBody BonCommandeRequest requete) {
        return service.creer(requete);
    }

    @PatchMapping("/{id}/statut")
    public BonCommande changerStatut(@PathVariable Long id, @RequestParam StatutBonCommande statut) {
        return service.changerStatut(id, statut);
    }

    @PatchMapping("/{id}/lignes/{ligneId}/visa")
    public BonCommande viserLigne(@PathVariable Long id, @PathVariable Long ligneId,
                                  @RequestBody Map<String, String> corps) {
        return service.viserLigne(id, ligneId, corps.getOrDefault("visa", "VU"));
    }

    /** Export CSV du bon de commande (format document papier EDELYNE). */
    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exporter(@PathVariable Long id) {
        List<String[]> lignes = service.lignesPourExport(id);
        StringBuilder sb = new StringBuilder();

        BonCommande bon = service.trouver(id);
        sb.append("EDELYNE COFFEE HOUSE & RESTAURANT\n");
        sb.append("BON DE COMMANDE ").append(bon.getNumero()).append("\n");
        sb.append("DATE : ").append(bon.getDateCreation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).append("\n");
        sb.append("SERVICE : ").append(bon.getService()).append("\n");
        sb.append("RESPONSABLE : ").append(bon.getResponsable() == null ? "" : bon.getResponsable()).append("\n\n");

        for (String[] ligne : lignes) {
            sb.append(String.join(";", ligne)).append("\n");
        }
        sb.append("\nMONTANT ESTIME ;").append(bon.getMontantEstime()).append(" FCFA\n");
        sb.append("\nLE GERANT\n");

        byte[] contenu = sb.toString().getBytes(StandardCharsets.UTF_8);

        HttpHeaders entetes = new HttpHeaders();
        entetes.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        entetes.setContentDisposition(ContentDisposition.attachment()
                .filename(bon.getNumero() + ".csv", StandardCharsets.UTF_8).build());
        return new ResponseEntity<>(contenu, entetes, HttpStatus.OK);
    }
}
