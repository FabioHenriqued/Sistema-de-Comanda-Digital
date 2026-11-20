package com.comandadigital.comanda_digital_api.controller;

import com.comandadigital.comanda_digital_api.entity.Produto;
import com.comandadigital.comanda_digital_api.service.ProdutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/produto")
@RequiredArgsConstructor
public class ProdutosController {

    private final ProdutoService produtoService;

    @PostMapping
    public Produto cadastrarProduto(@RequestBody Produto produto){
        return produtoService.criarProduto(produto);
    }

    @PutMapping("/{id}")
    public Produto editarProduto(@PathVariable Integer id, @RequestBody Produto produto){
        return produtoService.editarProduto(id, produto);
    }

    @DeleteMapping("/{id}")
    public void deletarProduto(@PathVariable Integer id){
        produtoService.excluirProduto(id);
    }

    @GetMapping
    public List<Produto> listarProduto(){
        return produtoService.listarProduto();
    }

}
