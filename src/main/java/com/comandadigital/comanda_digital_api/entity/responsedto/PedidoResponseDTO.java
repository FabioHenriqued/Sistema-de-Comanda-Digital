package com.comandadigital.comanda_digital_api.entity.responsedto;

import com.comandadigital.comanda_digital_api.entity.StatusPedido;

import java.math.BigDecimal;
import java.util.List;

public record PedidoResponseDTO(Integer usuarioId, String nomeUsuario, Integer pedidoId, Integer numeroMesa, BigDecimal valorTotal, StatusPedido status, List<ItemPedidoResponseDTO> itens) {
}
