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
  if (quantidades.size === 0) {
    throw new ErroValidacaoPedido("Adicione pelo menos um produto ao pedido.", "produtos");
  }
  for (const quantidade of quantidades.values()) {
    if (!Number.isSafeInteger(quantidade) || quantidade < 1) {
      throw new ErroValidacaoPedido("Informe uma quantidade inteira maior que zero.", "produtos");
    }
  }
  return numeroMesa;
}
