package com.comandadigital.comanda_digital_api.service;

import com.comandadigital.comanda_digital_api.entity.Produto;
import com.comandadigital.comanda_digital_api.repository.ProdutoRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

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

    public Produto editarProduto(int id, Produto produtoAtualizado){

        Produto produto = produtoRepository.findById(id).orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if(produtoAtualizado.getNome() == null || produtoAtualizado.getNome().isBlank()){
            throw new IllegalArgumentException("O nome é obrigatório");
        }

        if(produtoAtualizado.getPrecoUnitario() == null || produtoAtualizado.getPrecoUnitario().compareTo(BigDecimal.ZERO) <= 0){
            throw new IllegalArgumentException("O preço tem que ser maior que 0");
        }

        produto.setNome(produtoAtualizado.getNome());
        produto.setPrecoUnitario(produtoAtualizado.getPrecoUnitario());

        return produtoRepository.save(produto);
    }

    public void excluirProduto(int id){
        Produto produto = produtoRepository.findById(id).orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        produto.setExcluido(true);

        produtoRepository.save(produto);
    }

    public List<Produto> listarProduto(){
        return produtoRepository.findByExcluidoFalse();
    }
}
