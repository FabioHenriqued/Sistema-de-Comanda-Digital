export function validarProduto(nome, preco) {
  const nomeNormalizado = nome.trim();
  const partes = /^(-?)(\d+)(?:[,.](\d{1,2}))?$/.exec(preco.trim());
  const centavos = partes ? Number(partes[2] + (partes[3] ?? "").padEnd(2, "0")) : 0;

  let erroPreco = "";
  if (!partes) {
    erroPreco = "Informe um preço válido com até duas casas decimais.";
  } else if (partes[1] || centavos === 0) {
    erroPreco = "O preço deve ser maior que zero.";
  } else if (!Number.isSafeInteger(centavos)) {
    erroPreco = "O preço excede o valor máximo permitido.";
  }

  return {
    erros: { nome: nomeNormalizado ? "" : "Informe o nome do produto.", preco: erroPreco },
    dados: { nome: nomeNormalizado, precoUnitarioCentavos: centavos },
  };
}
