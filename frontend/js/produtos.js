import { lerColecao, salvarColecao } from "./storage.js";
import { validarProduto } from "./validacao-produto.js";

const chave = "comanda-digital:produtos";

// Os IDs correspondem aos produtos referenciados pelos pedidos demonstrativos.
const exemplos = [
  { id: "1", nome: "X-salada", precoUnitarioCentavos: 1750 },
  { id: "2", nome: "Suco de laranja", precoUnitarioCentavos: 700 },
  { id: "3", nome: "Batata frita", precoUnitarioCentavos: 1290 },
  { id: "4", nome: "Misto quente", precoUnitarioCentavos: 1050 },
];

function carregarProdutos() {
  return lerColecao(chave, () => exemplos.map((produto) => ({ ...produto, excluido: false })));
}

export function listarProdutosAtivos() {
  return navigator.locks.request(chave, () => carregarProdutos().filter((produto) => !produto.excluido));
}

function alterarProdutos(alterar) {
  // Serializa alterações do catálogo entre abas da mesma origem.
  return navigator.locks.request(chave, () => {
    const produtos = carregarProdutos();
    alterar(produtos);
    salvarColecao(chave, produtos);
  });
}

function localizarAtivo(produtos, id) {
  const produto = produtos.find((item) => item.id === id && !item.excluido);
  if (!produto) throw new Error("Produto indisponível.");
  return produto;
}

export async function salvarProduto({ nome, preco }, id) {
  const { erros, dados } = validarProduto(nome, preco);
  if (erros.nome || erros.preco) throw new Error("Dados do produto inválidos.");

  await alterarProdutos((produtos) => {
    if (id === undefined) {
      produtos.push({ id: crypto.randomUUID(), ...dados, excluido: false });
    } else {
      Object.assign(localizarAtivo(produtos, id), dados);
    }
  });
}

export function excluirProduto(id) {
  return alterarProdutos((produtos) => {
    localizarAtivo(produtos, id).excluido = true;
  });
}
