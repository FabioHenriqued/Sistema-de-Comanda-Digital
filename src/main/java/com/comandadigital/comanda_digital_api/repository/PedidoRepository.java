package com.comandadigital.comanda_digital_api.repository;

import com.comandadigital.comanda_digital_api.entity.Pedido;
import com.comandadigital.comanda_digital_api.entity.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    boolean existsByNumeroMesaAndStatus(
            Integer numeroMesa,
            StatusPedido status
    );

    List<Pedido> findByStatusOrderByHoraAberturaAsc(StatusPedido statusPedido);

    List<Pedido> findByStatusAndNumeroMesa(StatusPedido statusPedido, Integer numeroMesa);
}
