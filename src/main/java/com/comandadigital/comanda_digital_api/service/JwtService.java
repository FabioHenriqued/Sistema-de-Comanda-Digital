package com.comandadigital.comanda_digital_api.service;

import com.comandadigital.comanda_digital_api.entity.Usuario;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey secretKey;
    private final long expiracao = 86400000;

    public JwtService(@Value("${api.security.token.secret}")String secret){
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String gerarToken(Usuario usuario){
        Date agora = new Date();
        Date dataExpiracao = new Date(agora.getTime() + expiracao);

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("id", usuario.getId())
                .claim("tipo", usuario.getTipo().name())
                .issuedAt(agora)
                .expiration(dataExpiracao)
                .signWith(secretKey)
                .compact();
    }

    public String extrairEmail(String token){
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean tokenValido(String token){
        try{
            extrairEmail(token);
            return true;
        } catch (JwtException | IllegalArgumentException e){
            return false;
        }
    }

    public String extrairTipo(String token){
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("tipo", String.class);
    }
}

