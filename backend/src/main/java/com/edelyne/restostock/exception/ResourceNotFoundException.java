package com.edelyne.restostock.exception;

/** Exception levee lorsqu'une ressource demandee n'existe pas. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
