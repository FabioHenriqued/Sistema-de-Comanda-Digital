import { createEmptyState } from "./components.js";

const pages = [
  ["pedidos-em-aberto", "Pedidos em Aberto"],
  ["novo-pedido", "Novo Pedido"],
  ["produtos", "Produtos"],
  ["historico", "Histórico"],
];

const currentPage = document.body.dataset.page;
const base = currentPage ? "../" : "./";
const shell = document.querySelector("#app-shell");

shell.innerHTML = `
  <header class="app-header">
    <div class="app-header__inner">
      <button class="menu-toggle" type="button" aria-label="Abrir menu"
        aria-haspopup="dialog" aria-controls="menu-lateral" aria-expanded="false">
        <span class="menu-icon" aria-hidden="true"></span>
      </button>
      <a class="brand" href="${base}index.html">
        <span class="brand__icon" aria-hidden="true"><span class="receipt-icon"></span></span>
        <span><strong>Comanda Digital</strong><small>Lanchonete</small></span>
      </a>
    </div>
  </header>
  <div class="app-sidebar"></div>
  <dialog id="menu-lateral" class="menu-drawer" aria-labelledby="menu-title">
    <div class="menu-drawer__header">
      <strong id="menu-title">Menu</strong>
      <button class="button button--secondary menu-close" type="button" aria-label="Fechar menu" autofocus>×</button>
    </div>
  </dialog>
`;

const navigation = document.createElement("nav");
navigation.className = "navigation";
navigation.setAttribute("aria-label", "Navegação principal");
navigation.innerHTML = `
  <ul>
    ${pages.map(([id, label]) => `
      <li><a href="${base}pages/${id}.html"${id === currentPage ? ' aria-current="page"' : ""}>${label}</a></li>
    `).join("")}
    <li class="navigation__exit"><a href="${base}index.html">Sair</a></li>
  </ul>
`;

const drawer = shell.querySelector(".menu-drawer");
const sidebar = shell.querySelector(".app-sidebar");
const toggle = shell.querySelector(".menu-toggle");
const wideScreen = matchMedia("(min-width: 56rem)");

function placeNavigation() {
  if (wideScreen.matches && drawer.open) {
    drawer.close();
  }
  (wideScreen.matches ? sidebar : drawer).append(navigation);
}

toggle.addEventListener("click", () => {
  drawer.showModal();
  toggle.setAttribute("aria-expanded", "true");
});

shell.querySelector(".menu-close").addEventListener("click", () => drawer.close());
drawer.addEventListener("close", () => toggle.setAttribute("aria-expanded", "false"));
drawer.addEventListener("click", (event) => {
  if (event.target !== drawer) return;
  const { left, right, top, bottom } = drawer.getBoundingClientRect();
  if (event.clientX < left || event.clientX >= right || event.clientY < top || event.clientY >= bottom) {
    drawer.close();
  }
});

wideScreen.addEventListener("change", placeNavigation);
placeNavigation();

document.querySelector("[data-placeholder]")?.append(
  createEmptyState("Em desenvolvimento"),
);
