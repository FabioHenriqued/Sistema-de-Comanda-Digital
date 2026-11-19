package com.comandadigital.comanda_digital_api.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
public class Produto {
    @Id
    @GeneratedValue
    private int id;
    private String nome;
    private BigDecimal precoUnitario;
    private boolean excluido;
}
