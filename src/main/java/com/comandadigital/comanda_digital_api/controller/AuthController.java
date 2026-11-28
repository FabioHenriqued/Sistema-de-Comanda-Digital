package com.comandadigital.comanda_digital_api.controller;

import com.comandadigital.comanda_digital_api.entity.requestdto.LoginRequestDTO;
import com.comandadigital.comanda_digital_api.entity.responsedto.LoginResponseDTO;
import com.comandadigital.comanda_digital_api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO requestDTO){
        return authService.login(requestDTO);
    }
}
