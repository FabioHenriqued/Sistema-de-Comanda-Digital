import "./layout.js";
import { obterNomeProprietaria } from "./auth.js";
import { createButton, createField, createModal, createStatus, showMessage } from "./components.js";
import {
  atualizarPedido, calcularTotais, formatarAbertura, formatarCentavos, formatarMesa, obterPedido, prepararItemPedido,
} from "./pedidos.js";
import { listarProdutosAtivos } from "./produtos.js";
import { ErroValidacaoPedido, validarQuantidade } from "./validacao-pedido.js";

function mostrarFalha(elemento, erro, mensagemPadrao) {
  showMessage(elemento, erro instanceof ErroValidacaoPedido ? erro.message : mensagemPadrao, "error");
}

async function abrirCatalogo(incluirItem, precoRegistrado) {
  const form = document.createElement("form");
  form.className = "order-details__picker";
  form.noValidate = true;

  const campo = document.createElement("label");
  campo.className = "field";
  const rotulo = document.createElement("span");
  rotulo.className = "field__label";
  rotulo.textContent = "Produto";
  const seletor = document.createElement("select");
  seletor.className = "field__input";
  seletor.required = true;
  seletor.append(new Option("Selecione um produto", ""));
  campo.append(rotulo, seletor);

  const { field, input } = createField("Quantidade", { required: true });
  input.inputMode = "numeric";
  input.value = "1";
  const estado = document.createElement("div");
  estado.setAttribute("role", "alert");
  estado.textContent = "Carregando produtos…";
  const modal = createModal("Adicionar Produto", form);
  const acoes = modal.querySelector(".modal__actions");
  const fechar = acoes.querySelector("button");
  const adicionar = createButton("Adicionar ao pedido", { type: "submit" });
  adicionar.disabled = true;
  acoes.append(adicionar);
  form.append(campo, field, estado, acoes);

  modal.addEventListener("close", () => modal.remove(), { once: true });
  modal.addEventListener("cancel", (evento) => {
    if (fechar.disabled) evento.preventDefault();
  });
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (adicionar.disabled) return;
    adicionar.disabled = fechar.disabled = true;
    estado.textContent = "";

    try {
      if (!seletor.value) {
        seletor.focus();
        throw new ErroValidacaoPedido("Selecione um produto.");
      }
      const texto = input.value.trim();
      const quantidade = /^\d+$/.test(texto) ? Number(texto) : NaN;
      const item = await prepararItemPedido(seletor.value, quantidade);
      incluirItem(item);
      modal.close();
    } catch (erro) {
      mostrarFalha(estado, erro, "Não foi possível adicionar o produto.");
    } finally {
      adicionar.disabled = fechar.disabled = false;
    }
  });

  document.body.append(modal);
  modal.showModal();
  try {
    const produtos = await listarProdutosAtivos();
    if (!modal.open) return;
    seletor.append(...produtos.map(({ id, nome, precoUnitarioCentavos }) => {
      const preco = precoRegistrado(id);
      const atual = formatarCentavos(precoUnitarioCentavos);
      const registrado = preco === undefined || preco === precoUnitarioCentavos
        ? ""
        : ` · ${formatarCentavos(preco)} no pedido`;
      return new Option(`${nome} · ${atual}${registrado}`, id);
    }));
    estado.textContent = produtos.length ? "" : "Nenhum produto disponível.";
    adicionar.disabled = produtos.length === 0;
  } catch (erro) {
    mostrarFalha(estado, erro, "Não foi possível carregar os produtos.");
  }
}

function criarLinha(item, editavel, alterarQuantidade) {
  const linha = document.createElement("li");
  linha.className = "order-details__item";
  linha.innerHTML = `
    <h3></h3>
    <dl class="open-order__facts">
      <div><dt>Preço unitário</dt><dd data-preco></dd></div>
      <div><dt>Quantidade</dt><dd data-quantidade></dd></div>
      <div><dt>Subtotal</dt><dd data-subtotal></dd></div>
    </dl>
  `;
  linha.querySelector("h3").textContent = item.nome;
  linha.querySelector("[data-preco]").textContent = formatarCentavos(item.precoUnitarioCentavos);
  linha.querySelector("[data-quantidade]").textContent = item.quantidade;
  linha.querySelector("[data-subtotal]").textContent = formatarCentavos(item.subtotalCentavos);

  if (editavel) {
    const controles = document.createElement("div");
    controles.className = "order-details__actions";
    const acoes = [
      ["diminuir", "−", "Diminuir quantidade de", "secondary", item.quantidade - 1],
      ["aumentar", "+", "Aumentar quantidade de", "secondary", item.quantidade + 1],
      ["remover", "Remover", "Remover", "danger", 0],
    ];
    for (const [acao, texto, rotulo, variant, quantidade] of acoes) {
      const botao = createButton(texto, {
        variant,
        onClick: () => alterarQuantidade(item.produtoId, quantidade, acao),
      });
      botao.dataset.acao = acao;
      botao.setAttribute("aria-label", `${rotulo} ${item.nome}`);
      botao.disabled = !Number.isSafeInteger(quantidade);
      controles.append(botao);
    }
    linha.append(controles);
  }
  return linha;
}

function exibirPedido(pedido) {
  const titulo = document.querySelector("#mesa-pedido");
  const abertura = document.querySelector("#abertura-pedido");
  const lista = document.querySelector("#detalhes-itens");
  const vazio = document.querySelector("#detalhes-itens-vazios");
  const total = document.querySelector("#detalhes-total");
  const erro = document.querySelector("#erro-edicao");
  const adicionar = document.querySelector("#adicionar-produto");
  const salvar = document.querySelector("#salvar-alteracoes");
  const editavel = pedido.status === "EM_ABERTO";
  const originais = new Map(pedido.itens.map((item) => [item.produtoId, item]));
  const rascunho = new Map(originais);
  let salvando = false;

  titulo.textContent = formatarMesa(pedido.numeroMesa);
  const status = editavel ? "Em aberto" : pedido.status === "FINALIZADO" ? "Finalizado" : pedido.status;
  document.querySelector("#status-pedido").append(createStatus(status, editavel ? "success" : "neutral"));
  abertura.dateTime = pedido.abertoEm;
  abertura.textContent = formatarAbertura(pedido.abertoEm);
  document.querySelector("#proprietaria-pedido").textContent =
    obterNomeProprietaria(pedido.proprietariaId) ?? `ID ${pedido.proprietariaId}`;

  function renderizarItens() {
    const { itens, totalParcialCentavos } = calcularTotais({ itens: [...rascunho.values()] });
    lista.replaceChildren(...itens.map((item) => criarLinha(item, editavel, alterarQuantidade)));
    vazio.hidden = itens.length > 0;
    total.textContent = formatarCentavos(totalParcialCentavos);
  }

  function alterarQuantidade(id, quantidade, acao) {
    if (salvando) return;
    const indice = [...rascunho.keys()].indexOf(id);
    if (quantidade === 0) rascunho.delete(id);
    else rascunho.set(id, { ...rascunho.get(id), quantidade });
    erro.textContent = "";
    renderizarItens();
    const proximaAcao = quantidade === 0 ? "diminuir" : acao;
    const linha = lista.children[Math.min(indice, lista.children.length - 1)];
    (linha?.querySelector(`[data-acao="${proximaAcao}"]:enabled`) ?? adicionar).focus();
  }

  if (editavel) {
    adicionar.hidden = document.querySelector("#acoes-edicao").hidden = false;
    adicionar.addEventListener("click", () => {
      abrirCatalogo((item) => {
        const existente = rascunho.get(item.produtoId);
        const registrado = existente ?? originais.get(item.produtoId) ?? item;
        const quantidade = (existente?.quantidade ?? 0) + item.quantidade;
        validarQuantidade(quantidade);
        rascunho.set(item.produtoId, { ...registrado, quantidade });
        erro.textContent = "";
        renderizarItens();
      }, (id) => (rascunho.get(id) ?? originais.get(id))?.precoUnitarioCentavos);
    });
    salvar.addEventListener("click", async () => {
      if (salvando) return;
      salvando = salvar.disabled = adicionar.disabled = true;
      erro.textContent = "";
      try {
        await atualizarPedido(String(pedido.id), [...rascunho.values()], pedido.itens);
        window.location.replace("./pedidos-em-aberto.html?pedidoAtualizado=1");
      } catch (falha) {
        mostrarFalha(erro, falha, "Não foi possível salvar as alterações. Tente novamente.");
        salvando = salvar.disabled = adicionar.disabled = false;
      }
    });
    document.querySelectorAll(".open-orders-back, #acoes-edicao a").forEach((link) => {
      link.addEventListener("click", (evento) => {
        if (salvando) evento.preventDefault();
      });
    });
  }

  renderizarItens();
  document.querySelector("#detalhes-pedido").hidden = false;
}

async function iniciarDetalhes() {
  const estado = document.querySelector("#estado-detalhes");
  const id = new URLSearchParams(window.location.search).get("id");
  try {
    const pedido = id ? await obterPedido(id) : null;
    if (!pedido) {
      showMessage(estado, "Pedido não encontrado.", "error");
      return;
    }
    exibirPedido(pedido);
    estado.textContent = "";
  } catch {
    showMessage(estado, "Não foi possível carregar o pedido.", "error");
  }
}

if (!document.body.hidden) iniciarDetalhes();
