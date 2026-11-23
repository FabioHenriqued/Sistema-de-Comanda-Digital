import "./layout.js";
import { createCard, createEmptyState, createSearchField, createStatus, showMessage } from "./components.js";
import { formatarAbertura, formatarCentavos, formatarMesa, listarPedidosEmAberto } from "./pedidos.js";

function filtrarPorMesa(pedidos, termo) {
  const numero = termo.trim().replace(/^0+(?=[0-9])/, "");
  return pedidos.filter(({ numeroMesa }) => String(numeroMesa).startsWith(numero));
}

function criarCartao(pedido) {
  const link = document.createElement("a");
  const destino = new URL("./detalhes-pedido.html", window.location.href);
  destino.searchParams.set("id", pedido.id);
  link.href = destino.href;
  link.className = "open-order";
  link.innerHTML = `
    <div class="open-order__heading"><h2></h2></div>
    <dl class="open-order__facts">
      <div><dt>Abertura</dt><dd><time></time></dd></div>
      <div><dt>Itens</dt><dd data-items></dd></div>
      <div><dt>Total parcial</dt><dd class="open-order__total"></dd></div>
    </dl>
    <span class="open-order__details">Ver detalhes <span aria-hidden="true">→</span></span>
  `;

  link.querySelector("h2").textContent = formatarMesa(pedido.numeroMesa);
  link.querySelector(".open-order__heading").append(createStatus("Em aberto", "success"));
  const abertura = link.querySelector("time");
  abertura.dateTime = pedido.abertoEm;
  abertura.textContent = formatarAbertura(pedido.abertoEm);
  link.querySelector("[data-items]").textContent = pedido.quantidadeTotal;
  link.querySelector(".open-order__total").textContent = formatarCentavos(pedido.totalParcialCentavos);

  const item = document.createElement("li");
  item.append(createCard(link));
  return item;
}

async function iniciarListagem() {
  const pesquisa = document.querySelector("#pesquisa-pedidos");
  const lista = document.querySelector("#lista-pedidos");
  const estado = document.querySelector("#estado-pedidos");
  const url = new URL(window.location.href);
  const confirmacoes = [
    ["pedidoCriado", "Pedido criado com sucesso"],
    ["pedidoAtualizado", "Pedido atualizado com sucesso"],
  ];
  const confirmacao = confirmacoes.find(([chave]) => url.searchParams.get(chave) === "1");
  if (confirmacao) {
    showMessage(document.querySelector("#confirmacao-pedido"), confirmacao[1]);
    url.searchParams.delete(confirmacao[0]);
    history.replaceState(history.state, "", url);
  }

  let pedidos;
  try {
    pedidos = await listarPedidosEmAberto();
  } catch {
    showMessage(estado, "Não foi possível carregar os pedidos.", "error");
    return;
  }

  const { field, input } = createSearchField("Pesquisar pelo número da mesa", {
    name: "mesa", placeholder: "Ex.: 03",
  });
  input.inputMode = "numeric";
  input.setAttribute("aria-controls", lista.id);
  pesquisa.append(field);

  function atualizarLista() {
    const resultados = filtrarPorMesa(pedidos, input.value);
    lista.hidden = resultados.length === 0;
    lista.replaceChildren(...resultados.map(criarCartao));

    if (resultados.length) {
      estado.replaceChildren();
      return;
    }

    const mensagem = pedidos.length
      ? "Nenhum pedido encontrado para o número de mesa informado"
      : "Nenhum pedido em aberto no momento";
    estado.replaceChildren(createCard(createEmptyState(mensagem)));
  }

  input.addEventListener("input", atualizarLista);
  atualizarLista();
}

if (!document.body.hidden) iniciarListagem();
