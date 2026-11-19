package com.comandadigital.comanda_digital_api.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedido")
public class PedidosController {
    @PostMapping
    public static void cadastrarPedido(){}

    @PatchMapping
    public static void alterarPedido(){}

    @DeleteMapping
    public static void excluirPedido(){}
}
