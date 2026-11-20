let modalCount = 0;

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createButton(label, { variant = "primary", type = "button", onClick } = {}) {
  const button = element("button", `button button--${variant}`, label);
  button.type = type;
  if (onClick) button.addEventListener("click", onClick);
  return button;
}

export function createCard(...content) {
  const card = element("div", "card");
  card.append(...content);
  return card;
}

export function createField(label, { name, type = "text", placeholder = "", required = false } = {}) {
  const field = element("label", "field");
  const input = element("input", "field__input");
  input.type = type;
  if (name) input.name = name;
  input.placeholder = placeholder;
  input.required = required;
  field.append(element("span", "field__label", label), input);
  return { field, input };
}

export function createSearchField(label = "Pesquisar", options = {}) {
  const result = createField(label, { ...options, type: "search" });
  result.field.classList.add("field--search");
  return result;
}

export function createStatus(label, tone = "neutral") {
  return element("span", `status status--${tone}`, label);
}

export function showMessage(container, text, tone = "success") {
  container.classList.remove("message--success", "message--error");
  container.classList.add("message", `message--${tone}`);
  container.textContent = text;
}

export function createEmptyState(title, description) {
  const icon = element("span", "empty-state__icon");
  icon.setAttribute("aria-hidden", "true");
  icon.append(element("span", "receipt-icon"));
  const empty = element("div", "empty-state");
  empty.append(icon, element("h2", "empty-state__title", title));
  if (description) empty.append(element("p", "empty-state__description", description));
  return empty;
}

export function createModal(title, ...content) {
  const dialog = element("dialog", "modal");
  const heading = element("h2", "modal__title", title);
  heading.id = `modal-${++modalCount}`;
  dialog.setAttribute("aria-labelledby", heading.id);
  const close = createButton("Fechar", { variant: "secondary", onClick: () => dialog.close() });
  const actions = element("div", "modal__actions");
  actions.append(close);
  dialog.append(heading, ...content, actions);
  return dialog;
}
