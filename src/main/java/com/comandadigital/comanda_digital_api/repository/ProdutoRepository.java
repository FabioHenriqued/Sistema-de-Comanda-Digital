package com.comandadigital.comanda_digital_api.repository;

import com.comandadigital.comanda_digital_api.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
    List<Produto> findByExcluidoFalse();
}
