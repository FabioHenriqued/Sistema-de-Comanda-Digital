package com.comandadigital.comanda_digital_api.entity;

import java.math.BigDecimal;

public record ItemPedidoResponseDTO(Integer produtoId, String nomeProduto, Integer quantidade, BigDecimal precoUnitario) {
}
