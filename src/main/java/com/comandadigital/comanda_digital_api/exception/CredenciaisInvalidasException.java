package com.comandadigital.comanda_digital_api.exception;

public class CredenciaisInvalidasException extends RuntimeException{
    public CredenciaisInvalidasException(String mensagem){
        super(mensagem);
    }
}
