import "./layout.js";
import { createButton, createCard, createEmptyState, createField, createModal, showMessage } from "./components.js";
import { excluirProduto, listarProdutosAtivos, salvarProduto } from "./produtos.js";
import { validarProduto } from "./validacao-produto.js";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function precoEmPartes(centavos) {
  const fracao = centavos % 100;
  return [(centavos - fracao) / 100, String(fracao).padStart(2, "0")];
}

function formatarPreco(centavos) {
  const [reais, fracao] = precoEmPartes(centavos);
  return moeda.formatToParts(reais)
    .map(({ type, value }) => type === "fraction" ? fracao : value)
    .join("");
}

function criarCampo(rotulo, nome) {
  const { field, input } = createField(rotulo, { name: nome, required: true });
  const erro = document.createElement("span");
  erro.id = `erro-produto-${nome}`;
  erro.className = "product-field-error";
  erro.setAttribute("aria-live", "polite");
  input.setAttribute("aria-describedby", erro.id);
  field.append(erro);
  return {
    field,
    input,
    mostrarErro(mensagem) {
      erro.textContent = mensagem;
      input.setAttribute("aria-invalid", String(Boolean(mensagem)));
    },
  };
}

function iniciarProdutos() {
  const novo = document.querySelector("#novo-produto");
  const lista = document.querySelector("#lista-produtos");
  const estado = document.querySelector("#estado-produtos");
  const mensagem = document.querySelector("#mensagem-produtos");

  function criarCartao(produto) {
    const item = document.createElement("li");
    const nome = document.createElement("h2");
    nome.textContent = produto.nome;
    const preco = document.createElement("p");
    preco.textContent = formatarPreco(produto.precoUnitarioCentavos);

    const editar = createButton("Editar", {
      variant: "secondary", onClick: () => abrirEditor(produto),
    });
    const excluir = createButton("Excluir", {
      variant: "danger", onClick: () => abrirConfirmacao(produto),
    });
    editar.setAttribute("aria-label", `Editar ${produto.nome}`);
    excluir.setAttribute("aria-label", `Excluir ${produto.nome}`);
    const acoes = document.createElement("div");
    acoes.className = "product-actions";
    acoes.append(editar, excluir);

    item.append(createCard(nome, preco, acoes));
    return item;
  }

  async function atualizarLista() {
    try {
      const produtos = await listarProdutosAtivos();
      lista.replaceChildren(...produtos.map(criarCartao));
      estado.replaceChildren();
      if (!produtos.length) {
        estado.append(createCard(createEmptyState("Nenhum produto cadastrado")));
      }
    } catch {
      showMessage(estado, "Não foi possível carregar os produtos.", "error");
    }
  }

  function abrirModal({ titulo, conteudo, foco, acao, variante, executar, sucesso }) {
    const form = document.createElement("form");
    form.noValidate = true;
    form.append(...conteudo);
    const dialog = createModal(titulo, form);
    dialog.classList.add("product-modal");

    const erro = document.createElement("div");
    erro.setAttribute("role", "alert");
    const acoes = dialog.querySelector(".modal__actions");
    const cancelar = acoes.querySelector("button");
    cancelar.textContent = "Cancelar";
    const confirmar = createButton(acao, { variant: variante, type: "submit" });
    acoes.append(confirmar);
    form.append(erro, acoes);

    dialog.addEventListener("cancel", (evento) => {
      if (confirmar.disabled) evento.preventDefault();
    });
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      if (confirmar.disabled) return;
      confirmar.disabled = cancelar.disabled = true;
      erro.textContent = "";

      try {
        if (!await executar()) return;
        dialog.close();
        showMessage(mensagem, sucesso);
        await atualizarLista();
        novo.focus();
      } catch {
        showMessage(erro, "Não foi possível concluir a operação. Tente novamente.", "error");
      } finally {
        confirmar.disabled = cancelar.disabled = false;
      }
    });

    document.body.append(dialog);
    dialog.showModal();
    (foco ?? cancelar).focus();
  }

  function abrirEditor(produto) {
    const nome = criarCampo("Nome do Produto", "nome");
    const preco = criarCampo("Preço Unitário", "preco");
    preco.input.inputMode = "decimal";
    preco.input.placeholder = "Ex.: 15,00";
    if (produto) {
      nome.input.value = produto.nome;
      preco.input.value = precoEmPartes(produto.precoUnitarioCentavos).join(",");
    }

    abrirModal({
      titulo: produto ? "Editar Produto" : "Novo Produto",
      conteudo: [nome.field, preco.field],
      foco: nome.input,
      acao: "Salvar Produto",
      sucesso: produto ? "Produto atualizado com sucesso" : "Produto cadastrado com sucesso",
      async executar() {
        const valores = { nome: nome.input.value, preco: preco.input.value };
        const { erros } = validarProduto(valores.nome, valores.preco);
        nome.mostrarErro(erros.nome);
        preco.mostrarErro(erros.preco);
        if (erros.nome || erros.preco) {
          (erros.nome ? nome.input : preco.input).focus();
          return false;
        }
        await salvarProduto(valores, produto?.id);
        return true;
      },
    });
  }

  function abrirConfirmacao(produto) {
    const pergunta = document.createElement("p");
    pergunta.textContent = "Deseja realmente excluir este produto?";
    const nome = document.createElement("strong");
    nome.textContent = produto.nome;
    abrirModal({
      titulo: "Excluir Produto",
      conteudo: [pergunta, nome],
      acao: "Excluir Produto",
      variante: "danger",
      sucesso: "Produto excluído com sucesso",
      async executar() {
        await excluirProduto(produto.id);
        return true;
      },
    });
  }

  novo.addEventListener("click", () => abrirEditor());
  atualizarLista();
}

if (!document.body.hidden) iniciarProdutos();
