package com.comandadigital.comanda_digital_api.service;

import com.comandadigital.comanda_digital_api.entity.Produto;
import com.comandadigital.comanda_digital_api.repository.ProdutoRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@AllArgsConstructor
public class ProdutoService {
    private final ProdutoRepository produtoRepository;

    public Produto criarProduto(Produto produto){
        if(produto.getNome() == null || produto.getNome().isBlank()){
            throw new IllegalArgumentException("O nome é obrigatório");
        }

        if(produto.getPrecoUnitario() == null || produto.getPrecoUnitario().compareTo(BigDecimal.ZERO) <= 0){
            throw new IllegalArgumentException("O preço tem que ser maior que 0");
        }

        return produtoRepository.save(produto);
    }
}
