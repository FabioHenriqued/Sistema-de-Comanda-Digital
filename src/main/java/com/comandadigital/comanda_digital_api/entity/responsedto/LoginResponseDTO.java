package com.comandadigital.comanda_digital_api.entity.responsedto;

public record LoginResponseDTO(String token, String tipo, Integer usuarioId, String nome) {
}
