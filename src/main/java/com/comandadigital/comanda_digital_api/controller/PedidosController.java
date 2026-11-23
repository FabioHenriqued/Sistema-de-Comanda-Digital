package com.comandadigital.comanda_digital_api.controller;

import com.comandadigital.comanda_digital_api.entity.EditarPedidoRequestDTO;
import com.comandadigital.comanda_digital_api.entity.Pedido;
import com.comandadigital.comanda_digital_api.entity.PedidoRequestDTO;
import com.comandadigital.comanda_digital_api.entity.PedidoResponseDTO;
import com.comandadigital.comanda_digital_api.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedido")
@RequiredArgsConstructor
public class PedidosController {
    private final PedidoService pedidoService;

    @PostMapping
    public PedidoResponseDTO cadastrarPedido(@RequestBody PedidoRequestDTO pedidoRequestDTO){
        return pedidoService.cadastrarPedido(pedidoRequestDTO);
    }

    @PutMapping("/{id}")
    public PedidoResponseDTO editarPedido(@PathVariable Integer id, @RequestBody EditarPedidoRequestDTO editarPedidoRequestDTO){
        return pedidoService.editarPedido(id, editarPedidoRequestDTO);
    }

    @GetMapping()
    public List<PedidoResponseDTO> listarPedidos(@RequestParam(required = false) Integer numeroMesa){
        return pedidoService.listarPedidos(numeroMesa);
    }

    @PatchMapping("/{id}/finalizar")
    public PedidoResponseDTO finalizarPedido(@PathVariable Integer id){
        return pedidoService.finalizarPedido(id);
    }

    @DeleteMapping("{id}")
    public void excluirPedido(@PathVariable Integer id){
        pedidoService.excluirPedido(id);
    }
}
