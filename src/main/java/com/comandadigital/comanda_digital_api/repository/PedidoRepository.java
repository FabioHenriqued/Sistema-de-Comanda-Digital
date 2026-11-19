package com.comandadigital.comanda_digital_api.repository;

import com.comandadigital.comanda_digital_api.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
}
