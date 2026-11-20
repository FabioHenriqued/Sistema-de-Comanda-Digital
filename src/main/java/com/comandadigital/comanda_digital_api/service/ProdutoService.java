package com.comandadigital.comanda_digital_api.service;

import com.comandadigital.comanda_digital_api.repository.ProdutoRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ProdutoService {
    private final ProdutoRepository produtoRepository;


}
