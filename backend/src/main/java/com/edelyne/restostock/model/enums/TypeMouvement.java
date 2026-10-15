package com.edelyne.restostock.model.enums;

/** Nature d'un mouvement de stock. */
public enum TypeMouvement {
    ENTREE_LIVRAISON("Entree livraison"),
    ENTREE_RETOUR("Retour en stock"),
    ENTREE_INVENTAIRE("Ajustement inventaire (+)"),
    SORTIE_CUISINE("Sortie cuisine"),
    SORTIE_BAR("Sortie bar"),
    SORTIE_PATISSERIE("Sortie patisserie"),
    PERTE_PERIMEE("Perte / perime"),
    CASSE_DEGRADATION("Casse / degradation"),
    SORTIE_INVENTAIRE("Ajustement inventaire (-)");

    private final String libelle;

    TypeMouvement(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }

    public boolean estEntree() {
        return name().startsWith("ENTREE");
    }
}
