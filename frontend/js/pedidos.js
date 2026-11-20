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

function calcularTotais(pedido) {
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

function carregarPedidos() {
  const dados = localStorage.getItem(storageKey);
  if (dados !== null) return JSON.parse(dados);

  const pedidos = pedidosDemonstrativos.map(calcularTotais);
  localStorage.setItem(storageKey, JSON.stringify(pedidos));
  return pedidos;
}

export async function listarPedidosEmAberto() {
  return carregarPedidos()
    .filter((pedido) => pedido.status === "EM_ABERTO")
    .sort((a, b) => Date.parse(a.abertoEm) - Date.parse(b.abertoEm))
    .map(calcularTotais);
}
