import { getAuthenticatedUser } from "./auth.js";
import { listarProdutosAtivos } from "./produtos.js";
import { lerColecao, salvarColecao } from "./storage.js";
import {
  ErroValidacaoPedido, validarNovoPedido, validarQuantidade, validarQuantidadesPedido, validarTotaisPedido,
} from "./validacao-pedido.js";

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
const timeZone = "America/Fortaleza";
const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone });
const hora = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short", timeZone });

export function formatarAbertura(abertoEm) {
  const instante = new Date(abertoEm);
  return `${data.format(instante)} às ${hora.format(instante)}`;
}

export function formatarMesa(numeroMesa) {
  return `Mesa ${String(numeroMesa).padStart(2, "0")}`;
}

export function formatarCentavos(centavos) {
  const fracao = centavos % 100;
  return moeda.formatToParts((centavos - fracao) / 100)
    .map(({ type, value }) => type === "fraction" ? String(fracao).padStart(2, "0") : value)
    .join("");
}

function montarItem(produtos, produtoId, quantidade) {
  const produto = produtos.find(({ id }) => id === produtoId);
  if (!produto) throw new ErroValidacaoPedido("Um dos produtos selecionados está indisponível.");
  return { produtoId, nome: produto.nome, quantidade, precoUnitarioCentavos: produto.precoUnitarioCentavos };
}

export async function prepararItemPedido(produtoId, quantidade) {
  validarQuantidade(quantidade);
  return montarItem(await listarProdutosAtivos(), produtoId, quantidade);
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
    const itens = Array.from(quantidades, ([produtoId, quantidade]) => montarItem(produtos, produtoId, quantidade));

    const pedido = calcularTotais({
      id: crypto.randomUUID(),
      numeroMesa,
      abertoEm: new Date().toISOString(),
      proprietariaId: proprietaria.id,
      status: "EM_ABERTO",
      itens,
    });
    validarTotaisPedido(pedido);

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

export async function obterPedido(id) {
  const pedido = carregarPedidos().find((registro) => String(registro.id) === id);
  return pedido ? calcularTotais(pedido) : null;
}

export async function atualizarPedido(id, itensEditados, itensOriginais) {
  validarQuantidadesPedido(itensEditados.map(({ quantidade }) => quantidade));

  return navigator.locks.request(storageKey, async () => {
    if (!getAuthenticatedUser()) throw new ErroValidacaoPedido("Entre novamente para editar o pedido.");

    const pedidos = carregarPedidos();
    const indice = pedidos.findIndex((pedido) => String(pedido.id) === id);
    const pedido = pedidos[indice];
    if (!pedido) throw new ErroValidacaoPedido("Pedido não encontrado.");
    if (pedido.status !== "EM_ABERTO") throw new ErroValidacaoPedido("Este pedido já não está em aberto.");

    const atuais = calcularTotais(pedido).itens;
    if (JSON.stringify(atuais) !== JSON.stringify(itensOriginais)) {
      throw new ErroValidacaoPedido("O pedido foi alterado em outra aba. Reabra os detalhes para continuar.");
    }

    const IDs = new Set(itensEditados.map(({ produtoId }) => produtoId));
    if (IDs.size !== itensEditados.length) throw new ErroValidacaoPedido("O pedido contém produtos duplicados.");

    const anteriores = new Map(atuais.map((item) => [item.produtoId, item]));
    const novos = itensEditados.filter(({ produtoId }) => !anteriores.has(produtoId));
    if (novos.length) {
      const ativos = new Set((await listarProdutosAtivos()).map(({ id }) => id));
      if (novos.some(({ produtoId }) => !ativos.has(produtoId))) {
        throw new ErroValidacaoPedido("Remova os novos produtos que ficaram indisponíveis no cadastro.");
      }
    }

    const itens = itensEditados.map((item) => {
      const { produtoId, quantidade } = item;
      const { nome, precoUnitarioCentavos } = anteriores.get(produtoId) ?? item;
      if (!Number.isSafeInteger(precoUnitarioCentavos) || precoUnitarioCentavos <= 0) {
        throw new ErroValidacaoPedido("O pedido contém um preço unitário inválido.");
      }
      return { produtoId, nome, precoUnitarioCentavos, quantidade };
    });
    const atualizado = calcularTotais({ ...pedido, itens });
    validarTotaisPedido(atualizado);
    pedidos[indice] = atualizado;
    salvarColecao(storageKey, pedidos);
    return atualizado;
  });
}
