package com.edelyne.restostock.controller;

import com.edelyne.restostock.dto.EntreeStockRequest;
import com.edelyne.restostock.dto.SortieStockRequest;
import com.edelyne.restostock.model.Lot;
import com.edelyne.restostock.model.Mouvement;
import com.edelyne.restostock.service.StockService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    /** Reception d'une livraison : cree un lot et incremente le stock. */
    @PostMapping("/entrees")
    @ResponseStatus(HttpStatus.CREATED)
    public Mouvement entree(@Valid @RequestBody EntreeStockRequest requete) {
        return stockService.enregistrerEntree(requete);
    }

    /** Sortie de stock (FIFO par defaut, FEFO si fefo=true). */
    @PostMapping("/sorties")
    @ResponseStatus(HttpStatus.CREATED)
    public Mouvement sortie(@Valid @RequestBody SortieStockRequest requete) {
        return stockService.enregistrerSortie(requete);
    }

    @PostMapping("/inventaire")
    public Mouvement inventaire(@RequestBody Map<String, Object> corps) {
        Long produitId = Long.valueOf(corps.get("produitId").toString());
        BigDecimal nouveauStock = new BigDecimal(corps.get("nouveauStock").toString());
        String responsable = corps.get("responsable") == null ? "Magasinier" : corps.get("responsable").toString();
        String commentaire = corps.get("commentaire") == null ? null : corps.get("commentaire").toString();
        return stockService.ajusterInventaire(produitId, nouveauStock, responsable, commentaire);
    }

    @GetMapping("/mouvements")
    public List<Mouvement> mouvements() {
        return stockService.derniersMouvements();
    }

    @GetMapping("/lots/a-surveiller")
    public List<Lot> lotsASurveiller(@RequestParam(defaultValue = "7") int jours) {
        return stockService.lotsARisque(jours);
    }
}
