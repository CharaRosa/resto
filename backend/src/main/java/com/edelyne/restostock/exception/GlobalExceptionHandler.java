package com.edelyne.restostock.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/** Transforme les exceptions en reponses JSON lisibles par le front-end. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> nonTrouve(ResourceNotFoundException ex) {
        return reponse(HttpStatus.NOT_FOUND, "Ressource introuvable", ex.getMessage());
    }

    @ExceptionHandler(RegleMetierException.class)
    public ResponseEntity<Map<String, Object>> regleMetier(RegleMetierException ex) {
        return reponse(HttpStatus.CONFLICT, "Operation refusee", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException ex) {
        Map<String, String> details = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> details.put(e.getField(), e.getDefaultMessage()));
        Map<String, Object> corps = new LinkedHashMap<>();
        corps.put("horodatage", LocalDateTime.now());
        corps.put("statut", 400);
        corps.put("erreur", "Donnees invalides");
        corps.put("details", details);
        return ResponseEntity.badRequest().body(corps);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> generique(Exception ex) {
        return reponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur interne", ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> reponse(HttpStatus statut, String erreur, String message) {
        Map<String, Object> corps = new LinkedHashMap<>();
        corps.put("horodatage", LocalDateTime.now());
        corps.put("statut", statut.value());
        corps.put("erreur", erreur);
        corps.put("message", message);
        return ResponseEntity.status(statut).body(corps);
    }
}
