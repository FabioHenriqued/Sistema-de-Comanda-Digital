package com.comandadigital.comanda_digital_api.entity.responsedto;

import com.comandadigital.comanda_digital_api.entity.TipoUsuario;

public record UsuarioResponseDTO(Integer id, String nome, String email, TipoUsuario tipoUsuario) {
}
