package com.comandadigital.comanda_digital_api.entity.responsedto;

import java.math.BigDecimal;

public record ProdutoResponseDTO(Integer id, String nome, BigDecimal valorUnitario) {
}
