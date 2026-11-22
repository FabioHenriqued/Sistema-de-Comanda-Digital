package com.comandadigital.comanda_digital_api.service;

import com.comandadigital.comanda_digital_api.entity.*;
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
    public Pedido cadastrarPedido(PedidoRequestDTO requestDTO){
        if(requestDTO.numeroMesa() <= 0 || requestDTO.numeroMesa() == null){
            throw new RuntimeException("Numero da mesa invalido");
        }

        boolean pedidoAberto = pedidoRepository.existsByNumeroMesaAndStatus(requestDTO.numeroMesa(), StatusPedido.EM_ABERTO);

        if(pedidoAberto) {
            throw new RuntimeException("Ja existe um pedido em aberto com essa mesa");
        }

        if(requestDTO.itens() == null || requestDTO.itens.isEmpty()){
            throw new RuntimeException("O pedido deve conter pelo menos um item");
        }

        Pedido pedido = new Pedido();

        pedido.setNumeroMesa(requestDTO.numeroMesa());
        pedido.setStatus(StatusPedido.EM_ABERTO);
        pedido.setHoraAbertura(LocalDateTime.now());

        BigDecimal valorTotal = BigDecimal.ZERO;

        for(ItemPedidoRequestDTO itemPedidoRequestDTO : requestDTO.itens()) {
            if(itemPedidoRequestDTO.quantidade() <= 0 || itemPedidoRequestDTO.quantidade() == null){
                throw new RuntimeException("Quantidade inválida");
            }

            Produto produto = produtoRepository.findById(itemPedidoRequestDTO.produtoId()).orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            if(produto.isExcluido()) {
                throw new RuntimeException("Produto indisponivel");
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

        return pedidoRepository.save(pedido);
    }

    public List<Pedido> listarPedidos(Integer numeroMesa){
        if(numeroMesa == null){
            return pedidoRepository.findByStatusOrderByHoraAberturaAsc(StatusPedido.EM_ABERTO);
        }

        return pedidoRepository.findByStatusAndNumeroMesa(StatusPedido.EM_ABERTO, numeroMesa);
    }

    public Pedido finalizarPedido(Integer id) {
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if(pedido.getStatus() != StatusPedido.EM_ABERTO){
            throw new RuntimeException("Pedido já finalizado");
        }

        pedido.setStatus(StatusPedido.FINALIZADO);
        pedido.setHoraFechamento(LocalDateTime.now());

        return pedidoRepository.save(pedido);
    }

    public void excluirPedido(Integer id){
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        pedidoRepository.delete(pedido);
    }
}
