package com.comandadigital.comanda_digital_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Usuario {
    @Id
    @GeneratedValue
    private Integer id;
    @Column(nullable = false)
    private String nome;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String senhaHash;
    @OneToMany(mappedBy = "usuario")
    private List<Pedido> pedido = new ArrayList<>();
}
