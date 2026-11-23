export class ErroValidacaoPedido extends Error {
  constructor(mensagem, campo) {
    super(mensagem);
    this.campo = campo;
  }
}

export function validarNovoPedido(mesa, quantidades) {
  const texto = String(mesa ?? "").trim();
  const numeroMesa = Number(texto);
  if (!/^\d+$/.test(texto) || !Number.isSafeInteger(numeroMesa) || numeroMesa < 1) {
    throw new ErroValidacaoPedido("Informe um número de mesa válido.", "mesa");
  }
  validarQuantidadesPedido([...quantidades.values()]);
  return numeroMesa;
}

export function validarQuantidade(quantidade) {
  if (!Number.isSafeInteger(quantidade) || quantidade < 1) {
    throw new ErroValidacaoPedido("Informe uma quantidade inteira maior que zero.", "produtos");
  }
}

export function validarQuantidadesPedido(quantidades) {
  if (quantidades.length === 0) {
    throw new ErroValidacaoPedido("Adicione pelo menos um produto ao pedido.", "produtos");
  }
  quantidades.forEach(validarQuantidade);
}

export function validarTotaisPedido(pedido) {
  if (!Number.isSafeInteger(pedido.totalParcialCentavos) || !Number.isSafeInteger(pedido.quantidadeTotal)) {
    throw new ErroValidacaoPedido("O pedido excede o limite de valor ou de quantidade.");
  }
}
