import { getAuthenticatedUser } from "./auth.js";
import { listarProdutosAtivos } from "./produtos.js";
import { lerColecao, salvarColecao } from "./storage.js";
import { validarNovoPedido, ErroValidacaoPedido } from "./validacao-pedido.js";

const storageKey = "comanda-digital:pedidos";

const pedidosDemonstrativos = [
  {
    id: "104", numeroMesa: 12, abertoEm: "2026-11-20T11:05:00-03:00",
    status: "EM_ABERTO", proprietariaId: "2",
    itens: [{ produtoId: "4", nome: "Misto quente", quantidade: 2, precoUnitarioCentavos: 1050 }],
  },
  {
    id: "101", numeroMesa: 3, abertoEm: "2026-11-20T10:18:00-03:00",
    status: "EM_ABERTO", proprietariaId: "1",
    itens: [
      { produtoId: "1", nome: "X-salada", quantidade: 2, precoUnitarioCentavos: 1750 },
      { produtoId: "2", nome: "Suco de laranja", quantidade: 1, precoUnitarioCentavos: 700 },
    ],
  },
  {
    id: "102", numeroMesa: 5, abertoEm: "2026-11-20T10:32:00-03:00",
    status: "FINALIZADO", proprietariaId: "2",
    itens: [{ produtoId: "2", nome: "Suco de laranja", quantidade: 2, precoUnitarioCentavos: 700 }],
  },
  {
    id: "103", numeroMesa: 7, abertoEm: "2026-11-20T10:46:00-03:00",
    status: "EM_ABERTO", proprietariaId: "1",
    itens: [
      { produtoId: "3", nome: "Batata frita", quantidade: 1, precoUnitarioCentavos: 1290 },
      { produtoId: "2", nome: "Suco de laranja", quantidade: 2, precoUnitarioCentavos: 700 },
    ],
  },
];

export function calcularTotais(pedido) {
  const itens = pedido.itens.map((item) => ({
    ...item,
    subtotalCentavos: item.quantidade * item.precoUnitarioCentavos,
  }));

  return {
    ...pedido,
    itens,
    quantidadeTotal: itens.reduce((total, item) => total + item.quantidade, 0),
    totalParcialCentavos: itens.reduce((total, item) => total + item.subtotalCentavos, 0),
  };
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarCentavos(centavos) {
  return moeda.format(centavos / 100);
}

export async function criarPedido({ mesa, quantidades }) {
  const numeroMesa = validarNovoPedido(mesa, quantidades);

  return navigator.locks.request(storageKey, async () => {
    const proprietaria = getAuthenticatedUser();
    if (!proprietaria) throw new ErroValidacaoPedido("Entre novamente para criar um pedido.");

    const pedidos = carregarPedidos();
    if (pedidos.some((pedido) => Number(pedido.numeroMesa) === numeroMesa && pedido.status === "EM_ABERTO")) {
      throw new ErroValidacaoPedido("Já existe um pedido em aberto para esta mesa.", "mesa");
    }

    const produtos = await listarProdutosAtivos();
    const itens = Array.from(quantidades, ([produtoId, quantidade]) => {
      const produto = produtos.find(({ id }) => id === produtoId);
      if (!produto) throw new ErroValidacaoPedido("Um dos produtos selecionados está indisponível.");
      return { produtoId, nome: produto.nome, quantidade, precoUnitarioCentavos: produto.precoUnitarioCentavos };
    });

    const pedido = calcularTotais({
      id: crypto.randomUUID(),
      numeroMesa,
      abertoEm: new Date().toISOString(),
      proprietariaId: proprietaria.id,
      status: "EM_ABERTO",
      itens,
    });
    if (!Number.isSafeInteger(pedido.totalParcialCentavos) || !Number.isSafeInteger(pedido.quantidadeTotal)) {
      throw new ErroValidacaoPedido("O pedido excede o limite de valor ou de quantidade.");
    }

    salvarColecao(storageKey, [...pedidos, pedido]);
    return pedido;
  });
}

function carregarPedidos() {
  return lerColecao(storageKey, () => pedidosDemonstrativos.map(calcularTotais));
}

export async function listarPedidosEmAberto() {
  return carregarPedidos()
    .filter((pedido) => pedido.status === "EM_ABERTO")
    .sort((a, b) => Date.parse(a.abertoEm) - Date.parse(b.abertoEm))
    .map(calcularTotais);
}
