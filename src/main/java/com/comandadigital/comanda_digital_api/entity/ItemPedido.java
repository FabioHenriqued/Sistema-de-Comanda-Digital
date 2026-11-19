package com.comandadigital.comanda_digital_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
public class ItemPedido {
    @Id
    @GeneratedValue
    private int id;
    @ManyToOne
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produtoId;
    private int quantidade;
    private BigDecimal precoUnitario;
}
