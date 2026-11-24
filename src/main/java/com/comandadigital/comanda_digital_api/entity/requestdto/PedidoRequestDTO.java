package com.comandadigital.comanda_digital_api.entity.requestdto;

import java.util.List;

public record PedidoRequestDTO(Integer numeroMesa, List<ItemPedidoRequestDTO> itens) {
}
