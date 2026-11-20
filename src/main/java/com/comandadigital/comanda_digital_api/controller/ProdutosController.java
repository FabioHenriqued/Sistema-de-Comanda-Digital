package com.comandadigital.comanda_digital_api.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/produto")
public class ProdutosController {

    @PostMapping
    public static void cadastrarProduto(){}

    @PatchMapping
    public static void alterarProduto(){}

    @DeleteMapping
    public static void deletarProduto(){}

    @GetMapping
    public static void listarProduto(){}

}
