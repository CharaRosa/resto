package com.edelyne.restostock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RestoStockApplication {
    public static void main(String[] args) {
        SpringApplication.run(RestoStockApplication.class, args);
        System.out.println("\n============================================================");
        System.out.println("  RestoStock Pro est demarre !");
        System.out.println("  API   : http://localhost:8080/api");
        System.out.println("  Test  : http://localhost:8080/api/dashboard");
        System.out.println("  Front : ouvrez frontend/index.html dans votre navigateur");
        System.out.println("============================================================\n");
    }
}
