package com.comandadigital.comanda_digital_api.service;

import com.comandadigital.comanda_digital_api.entity.Usuario;
import com.comandadigital.comanda_digital_api.entity.requestdto.UsuarioRequestDTO;
import com.comandadigital.comanda_digital_api.entity.responsedto.UsuarioResponseDTO;
import com.comandadigital.comanda_digital_api.exception.RecursoNaoEncontradoException;
import com.comandadigital.comanda_digital_api.exception.RegraNegocioException;
import com.comandadigital.comanda_digital_api.repository.PedidoRepository;
import com.comandadigital.comanda_digital_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioResponseDTO cadastrarUsuario(UsuarioRequestDTO requestDTO){
        if(requestDTO == null){
            throw new RegraNegocioException("Dados não informado");
        }

        if(requestDTO.nome() == null || requestDTO.nome().isBlank()){
            throw new RegraNegocioException("Nome inválido");
        }

        if(requestDTO.email() == null || requestDTO.email().isBlank()){
            throw new RegraNegocioException("E-mail inválido");
        }

        if(requestDTO.senha() == null || requestDTO.senha().isBlank()){
            throw new RegraNegocioException("Senha Inválida");
        }

        String email = requestDTO.email().trim().toLowerCase();

        if(usuarioRepository.existsByEmail(email)){
            throw new RegraNegocioException("E-mail já cadastrado");
        }

        Usuario usuario = new Usuario();

        usuario.setNome(requestDTO.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(requestDTO.senha()));

        Usuario usuarioCadastrado = usuarioRepository.save(usuario);

        return converterParaDTO(usuarioCadastrado);
    }

    public UsuarioResponseDTO editarUsuario(Integer id, UsuarioRequestDTO requestDTO){
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Usuario não encontrado"));

        if(requestDTO == null){
            throw new RegraNegocioException("Dados não informado");
        }

        if(requestDTO.nome() == null || requestDTO.nome().isBlank()){
            throw new RegraNegocioException("Nome inválido");
        }

        if(requestDTO.email() == null || requestDTO.email().isBlank()){
            throw new RegraNegocioException("E-mail inválido");
        }

        if(requestDTO.senha() == null || requestDTO.senha().isBlank()){
            throw new RegraNegocioException("Senha Inválida");
        }

        String email = requestDTO.email().trim().toLowerCase();

        if (usuarioRepository.existsByEmailAndIdNot(email, id)) {
            throw new RegraNegocioException("E-mail já cadastrado");
        }

        usuario.setNome(requestDTO.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(requestDTO.senha()));

        Usuario usuarioEditato = usuarioRepository.save(usuario);

        return converterParaDTO(usuarioEditato);
    }

    public List<UsuarioResponseDTO> listarUsuario(){
        return usuarioRepository.findAll().stream().map(this::converterParaDTO).toList();
    }

    public UsuarioResponseDTO buscarUsuario(Integer id){
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Usuario não encontrado"));

        return converterParaDTO(usuario);
    }

    public void excluirUsuario(Integer id){
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        if(pedidoRepository.existsByUsuario_Id(id)){
            throw new RegraNegocioException("Não é possivel excluir um usuário que possui pedidos associados");
        }

        usuarioRepository.delete(usuario);
    }

    private UsuarioResponseDTO converterParaDTO(Usuario usuario){
        return new UsuarioResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail());
    }
}
