package com.comandadigital.comanda_digital_api.controller;

import com.comandadigital.comanda_digital_api.entity.Usuario;
import com.comandadigital.comanda_digital_api.entity.requestdto.UsuarioRequestDTO;
import com.comandadigital.comanda_digital_api.entity.responsedto.UsuarioResponseDTO;
import com.comandadigital.comanda_digital_api.service.UsuarioService;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuario")
@RequiredArgsConstructor
public class UsuarioController {
    private final UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioResponseDTO> listarUsuario(){
        return usuarioService.listarUsuario();
    }

    @PostMapping
    public UsuarioResponseDTO cadastrarUsuario(@RequestBody UsuarioRequestDTO requestDTO){
        return usuarioService.cadastrarUsuario(requestDTO);
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO buscarUsuario(@PathVariable Integer id){
        return usuarioService.buscarUsuario(id);
    }

    @PutMapping("{id}")
    public UsuarioResponseDTO editarUsuario(@PathVariable Integer id, @RequestBody UsuarioRequestDTO requestDTO){
        return usuarioService.editarUsuario(id, requestDTO);
    }

    @DeleteMapping("{id}")
    public void excluirUsuario(@PathVariable Integer id){
        usuarioService.excluirUsuario(id);
    }
}
