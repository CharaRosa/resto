package com.edelyne.restostock.exception;

/** Exception metier : stock insuffisant, regle de gestion non respectee, etc. */
public class RegleMetierException extends RuntimeException {
    public RegleMetierException(String message) {
        super(message);
    }
}
