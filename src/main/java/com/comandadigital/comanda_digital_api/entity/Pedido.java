package com.comandadigital.comanda_digital_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Pedido {
    @Id
    @GeneratedValue
    private int id;
    private int numeroMesa;

    @ManyToOne
    @JoinColumn(name = "usuario.id")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    private StatusPedido status;
    private LocalDateTime horaAbertura;
    private LocalDateTime horaFechamento;
    private BigDecimal valorTotal;
}
