package com.comandadigital.comanda_digital_api.repository;

import com.comandadigital.comanda_digital_api.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
}
