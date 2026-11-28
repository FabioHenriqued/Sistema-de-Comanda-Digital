package com.comandadigital.comanda_digital_api.service;

import com.comandadigital.comanda_digital_api.entity.Usuario;
import com.comandadigital.comanda_digital_api.entity.requestdto.LoginRequestDTO;
import com.comandadigital.comanda_digital_api.entity.responsedto.LoginResponseDTO;
import com.comandadigital.comanda_digital_api.exception.CredenciaisInvalidasException;
import com.comandadigital.comanda_digital_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponseDTO login(LoginRequestDTO requestDTO){
        if (requestDTO == null || requestDTO.email() == null || requestDTO.email().isBlank() || requestDTO.senha() == null || requestDTO.senha().isBlank()) {
            throw new CredenciaisInvalidasException("E-mail ou senha inválidos");
        }

        String email = requestDTO.email().trim().toLowerCase(Locale.ROOT);

        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow(() -> new CredenciaisInvalidasException("E-mail ou senha inválidos"));

        if(!passwordEncoder.matches(requestDTO.senha(), usuario.getSenhaHash())){
            throw new CredenciaisInvalidasException("E-mail ou senha inválidos");
        }

        String token = jwtService.gerarToken(usuario);

        return new LoginResponseDTO(token, usuario.getTipo().name(), usuario.getId(), usuario.getNome());
    }
}
