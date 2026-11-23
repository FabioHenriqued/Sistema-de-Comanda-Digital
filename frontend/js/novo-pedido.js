import "./layout.js";
import { showMessage } from "./components.js";
import { calcularTotais, criarPedido, formatarCentavos } from "./pedidos.js";
import { listarProdutosAtivos } from "./produtos.js";
import { ErroValidacaoPedido } from "./validacao-pedido.js";

function iniciarFormulario() {
  const formulario = document.querySelector("#novo-pedido");
  const mesa = formulario.elements.mesa;
  const salvar = formulario.querySelector("button[type=submit]");
  const catalogo = document.querySelector("#catalogo-pedido");
  const estado = document.querySelector("#estado-catalogo");
  const tituloProdutos = document.querySelector("#titulo-produtos");
  const resumo = document.querySelector("#itens-pedido");
  const resumoVazio = document.querySelector("#resumo-vazio");
  const total = document.querySelector("#total-pedido");
  const erro = document.querySelector("#erro-pedido");
  const quantidades = new Map();
  let produtos = [];
  let salvando = false;

  function atualizarResumo() {
    const selecionados = produtos.filter(({ id }) => quantidades.has(id));
    const pedido = calcularTotais({
      itens: selecionados.map((produto) => ({ ...produto, quantidade: quantidades.get(produto.id) })),
    });
    resumoVazio.hidden = pedido.itens.length > 0;
    resumo.replaceChildren(...pedido.itens.map((item) => {
      const linha = document.createElement("li");
      const nome = document.createElement("span");
      const subtotal = document.createElement("strong");
      nome.textContent = `${item.quantidade} × ${item.nome}`;
      subtotal.textContent = formatarCentavos(item.subtotalCentavos);
      linha.append(nome, subtotal);
      return linha;
    }));
    total.textContent = formatarCentavos(pedido.totalParcialCentavos);
  }

  function criarLinhaProduto(produto) {
    const linha = document.createElement("li");
    linha.innerHTML = `
      <div><strong></strong><small></small></div>
      <div class="new-order__quantity">
        <button class="button button--secondary" type="button" disabled>−</button>
        <output>0</output>
        <button class="button button--secondary" type="button">+</button>
      </div>
    `;
    linha.querySelector("strong").textContent = produto.nome;
    linha.querySelector("small").textContent = formatarCentavos(produto.precoUnitarioCentavos);
    const [menos, mais] = linha.querySelectorAll("button");
    const quantidade = linha.querySelector("output");
    menos.setAttribute("aria-label", `Diminuir quantidade de ${produto.nome}`);
    mais.setAttribute("aria-label", `Aumentar quantidade de ${produto.nome}`);
    quantidade.setAttribute("aria-label", `Quantidade de ${produto.nome}`);

    function alterarQuantidade(variacao) {
      if (salvando) return;
      const nova = Math.max(0, (quantidades.get(produto.id) ?? 0) + variacao);
      if (nova > 0) quantidades.set(produto.id, nova);
      else quantidades.delete(produto.id);
      quantidade.value = nova;
      if (nova === 0 && document.activeElement === menos) mais.focus();
      menos.disabled = nova === 0;
      atualizarResumo();
    }

    menos.addEventListener("click", () => alterarQuantidade(-1));
    mais.addEventListener("click", () => alterarQuantidade(1));
    return linha;
  }

  async function carregarCatalogo() {
    try {
      produtos = await listarProdutosAtivos();
      catalogo.replaceChildren(...produtos.map(criarLinhaProduto));
      estado.textContent = produtos.length
        ? ""
        : "Nenhum produto disponível. Cadastre um produto antes de criar um pedido.";
      salvar.disabled = false;
    } catch {
      showMessage(estado, "Não foi possível carregar os produtos.", "error");
    }
  }

  mesa.addEventListener("input", () => mesa.removeAttribute("aria-invalid"));
  formulario.querySelector(".new-order__actions a").addEventListener("click", (event) => {
    if (salvando) event.preventDefault();
  });
  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (salvando || salvar.disabled) return;
    salvando = true;
    salvar.disabled = true;
    erro.replaceChildren();
    mesa.removeAttribute("aria-invalid");

    try {
      await criarPedido({ mesa: mesa.value, quantidades: new Map(quantidades) });
      window.location.replace("./pedidos-em-aberto.html?pedidoCriado=1");
    } catch (falha) {
      showMessage(erro, falha instanceof ErroValidacaoPedido
        ? falha.message
        : "Não foi possível salvar o pedido. Tente novamente.", "error");
      salvando = false;
      salvar.disabled = false;
      if (falha.campo === "mesa") {
        mesa.setAttribute("aria-invalid", "true");
        mesa.focus();
      } else if (falha.campo === "produtos") {
        tituloProdutos.focus();
      }
    }
  });

  carregarCatalogo();
}

if (!document.body.hidden) iniciarFormulario();
