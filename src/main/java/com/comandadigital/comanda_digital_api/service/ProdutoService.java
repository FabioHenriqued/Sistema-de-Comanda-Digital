package com.comandadigital.comanda_digital_api.service;

import com.comandadigital.comanda_digital_api.entity.Produto;
import com.comandadigital.comanda_digital_api.entity.responsedto.ProdutoResponseDTO;
import com.comandadigital.comanda_digital_api.exception.RecursoNaoEncontradoException;
import com.comandadigital.comanda_digital_api.exception.RegraNegocioException;
import com.comandadigital.comanda_digital_api.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProdutoService {
    private final ProdutoRepository produtoRepository;

    public ProdutoResponseDTO criarProduto(Produto produto){
        if(produto.getNome() == null || produto.getNome().isBlank()){
            throw new RegraNegocioException("O nome é obrigatório");
        }

        if(produto.getPrecoUnitario() == null || produto.getPrecoUnitario().compareTo(BigDecimal.ZERO) <= 0){
            throw new RegraNegocioException("O preço tem que ser maior que 0");
        }

        Produto produtoCriado = produtoRepository.save(produto);

        return converterParaDTO(produtoCriado);
    }

    public ProdutoResponseDTO editarProduto(Integer id, Produto produtoAtualizado){

        Produto produto = produtoRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado"));

        if(produtoAtualizado.getNome() == null || produtoAtualizado.getNome().isBlank()){
            throw new RegraNegocioException("O nome é obrigatório");
        }

        if(produtoAtualizado.getPrecoUnitario() == null || produtoAtualizado.getPrecoUnitario().compareTo(BigDecimal.ZERO) <= 0){
            throw new RegraNegocioException("O preço tem que ser maior que 0");
        }

        produto.setNome(produtoAtualizado.getNome());
        produto.setPrecoUnitario(produtoAtualizado.getPrecoUnitario());

        Produto produtoEditado = produtoRepository.save(produto);

        return converterParaDTO(produtoEditado);
    }

    public void excluirProduto(Integer id){
        Produto produto = produtoRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado"));

        produto.setExcluido(true);

        produtoRepository.save(produto);
    }

    public List<ProdutoResponseDTO> listarProduto(){
        return produtoRepository.findByExcluidoFalse().stream().map(this::converterParaDTO).toList();
    }

    private ProdutoResponseDTO converterParaDTO(Produto produto){
        return new ProdutoResponseDTO(produto.getId(), produto.getNome(), produto.getPrecoUnitario());
    }
}
