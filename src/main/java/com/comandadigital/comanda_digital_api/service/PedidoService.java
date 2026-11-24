package com.comandadigital.comanda_digital_api.service;

import com.comandadigital.comanda_digital_api.entity.*;
import com.comandadigital.comanda_digital_api.entity.requestdto.EditarPedidoRequestDTO;
import com.comandadigital.comanda_digital_api.entity.requestdto.ItemPedidoRequestDTO;
import com.comandadigital.comanda_digital_api.entity.requestdto.PedidoRequestDTO;
import com.comandadigital.comanda_digital_api.entity.responsedto.ItemPedidoResponseDTO;
import com.comandadigital.comanda_digital_api.entity.responsedto.PedidoResponseDTO;
import com.comandadigital.comanda_digital_api.exception.RecursoNaoEncontradoException;
import com.comandadigital.comanda_digital_api.exception.RegraNegocioException;
import com.comandadigital.comanda_digital_api.repository.PedidoRepository;

import com.comandadigital.comanda_digital_api.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {
    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;

    @Transactional
    public PedidoResponseDTO cadastrarPedido(PedidoRequestDTO requestDTO){
        if(requestDTO == null){
            throw new RegraNegocioException("Dados do pedido não informados");
        }

        if(requestDTO.numeroMesa() == null || requestDTO.numeroMesa() <= 0){
            throw new RegraNegocioException("Numero da mesa invalido");
        }

        boolean pedidoAberto = pedidoRepository.existsByNumeroMesaAndStatus(requestDTO.numeroMesa(), StatusPedido.EM_ABERTO);

        if(pedidoAberto) {
            throw new RegraNegocioException("Ja existe um pedido em aberto com essa mesa");
        }

        if(requestDTO.itens() == null || requestDTO.itens().isEmpty()){
            throw new RegraNegocioException("O pedido deve conter pelo menos um item");
        }

        Pedido pedido = new Pedido();

        pedido.setNumeroMesa(requestDTO.numeroMesa());
        pedido.setStatus(StatusPedido.EM_ABERTO);
        pedido.setHoraAbertura(LocalDateTime.now());

        BigDecimal valorTotal = BigDecimal.ZERO;

        for(ItemPedidoRequestDTO itemPedidoRequestDTO : requestDTO.itens()) {
            if(itemPedidoRequestDTO == null){
                throw new RegraNegocioException("Item do pedido inválido");
            }

            if(itemPedidoRequestDTO.produtoId() == null){
                throw new RegraNegocioException("ID do produto não informado");
            }

            if(itemPedidoRequestDTO.quantidade() == null || itemPedidoRequestDTO.quantidade() <= 0){
                throw new RegraNegocioException("Quantidade inválida");
            }

            Produto produto = produtoRepository.findById(itemPedidoRequestDTO.produtoId()).orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado"));

            if(produto.isExcluido()) {
                throw new RecursoNaoEncontradoException("Produto indisponivel");
            }

            ItemPedido item = new ItemPedido();

            item.setPedido(pedido);
            item.setProduto(produto);
            item.setQuantidade(itemPedidoRequestDTO.quantidade());
            item.setPrecoUnitario(produto.getPrecoUnitario());

            BigDecimal subTotal = produto.getPrecoUnitario().multiply(BigDecimal.valueOf(itemPedidoRequestDTO.quantidade()));

            valorTotal = valorTotal.add(subTotal);

            pedido.getItens().add(item);
        }

        pedido.setValorTotal(valorTotal);

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        return converterParaDTO(pedidoSalvo);
    }

    @Transactional
    public PedidoResponseDTO editarPedido(Integer id, EditarPedidoRequestDTO editarPedidoRequestDTO){
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado"));

        if(pedido.getStatus() == StatusPedido.FINALIZADO){
            throw new RegraNegocioException("Não é possivel editar pedido ja finalizado");
        }

        if(editarPedidoRequestDTO == null || editarPedidoRequestDTO.itens() == null || editarPedidoRequestDTO.itens().isEmpty()){
            throw new RegraNegocioException("O pedido deve conter pelo menos um item");
        }

        pedido.getItens().clear();

        BigDecimal valorTotal = BigDecimal.ZERO;

        for(ItemPedidoRequestDTO pedidoRequestDTO : editarPedidoRequestDTO.itens()){
            if(pedidoRequestDTO == null || pedidoRequestDTO.quantidade() == null || pedidoRequestDTO.quantidade() <= 0){
                throw new RegraNegocioException("Quantidade de item deve ser maior que 0");
            }

            if(pedidoRequestDTO.produtoId() == null){
                throw new RegraNegocioException("ID não informado");
            }

            Produto produto = produtoRepository.findById(pedidoRequestDTO.produtoId()).orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado"));

            if(produto.isExcluido()){
                throw new RegraNegocioException("Produto indisponivel");
            }

            ItemPedido itemPedido = new ItemPedido();

            itemPedido.setProduto(produto);
            itemPedido.setPedido(pedido);
            itemPedido.setQuantidade(pedidoRequestDTO.quantidade());
            itemPedido.setPrecoUnitario(produto.getPrecoUnitario());

            BigDecimal subTotal = produto.getPrecoUnitario().multiply(BigDecimal.valueOf(pedidoRequestDTO.quantidade()));

            valorTotal = valorTotal.add(subTotal);

            pedido.getItens().add(itemPedido);
        }

        pedido.setValorTotal(valorTotal);

        Pedido pedidoEditado = pedidoRepository.save(pedido);

        return converterParaDTO(pedidoEditado);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidos(Integer numeroMesa){
        List<Pedido> pedidosList;

        if(numeroMesa == null){
            pedidosList = pedidoRepository.findByStatusOrderByHoraAberturaAsc(StatusPedido.EM_ABERTO);
        } else {
            pedidosList = pedidoRepository.findByStatusAndNumeroMesa(StatusPedido.EM_ABERTO, numeroMesa);
        }

        return pedidosList.stream().map(this::converterParaDTO).toList();
    }

    @Transactional
    public PedidoResponseDTO finalizarPedido(Integer id) {
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado"));

        if(pedido.getStatus() != StatusPedido.EM_ABERTO){
            throw new RegraNegocioException("Pedido já finalizado");
        }

        pedido.setStatus(StatusPedido.FINALIZADO);
        pedido.setHoraFechamento(LocalDateTime.now());

        Pedido pedidoFinalizado = pedidoRepository.save(pedido);

        return converterParaDTO(pedidoFinalizado);
    }

    @Transactional
    public void excluirPedido(Integer id){
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado"));

        pedidoRepository.delete(pedido);
    }

    private PedidoResponseDTO converterParaDTO(Pedido pedido){
        List<ItemPedidoResponseDTO> itens = pedido.getItens().stream().map(item -> new ItemPedidoResponseDTO(item.getProduto().getId(), item.getProduto().getNome(), item.getQuantidade(), item.getPrecoUnitario())).toList();

        return new PedidoResponseDTO(pedido.getId(), pedido.getNumeroMesa(), pedido.getValorTotal(), pedido.getStatus(), itens);
    }
}
