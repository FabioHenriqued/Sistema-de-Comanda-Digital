export function lerColecao(chave, criarExemplos) {
  const dados = localStorage.getItem(chave);
  if (dados !== null) {
    const colecao = JSON.parse(dados);
    if (!Array.isArray(colecao)) throw new Error("Coleção inválida.");
    return colecao;
  }

  const colecao = criarExemplos();
  salvarColecao(chave, colecao);
  return colecao;
}

export function salvarColecao(chave, colecao) {
  localStorage.setItem(chave, JSON.stringify(colecao));
}
