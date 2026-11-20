import { getAuthenticatedUser, signIn } from "./auth.js";
import { showMessage } from "./components.js";

const ordersPage = "./pages/pedidos-em-aberto.html";
const form = document.querySelector(".login-form");
const email = form.elements.email;
const password = form.elements.senha;
const message = form.querySelector("#login-message");
const toggle = form.querySelector(".password-toggle");

function redirectIfAuthenticated() {
  if (!getAuthenticatedUser()) return;
  window.location.replace(ordersPage);
}

function clearError() {
  message.textContent = "";
  for (const input of [email, password]) {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  }
}

function showError(text, ...inputs) {
  for (const input of inputs) {
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", message.id);
  }
  showMessage(message, text, "error");
  inputs[0]?.focus();
}

function setPasswordVisible(visible) {
  password.type = visible ? "text" : "password";
  toggle.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
}

function restoreLogin(event) {
  if (event.persisted) {
    password.value = "";
    setPasswordVisible(false);
    clearError();
  }
  redirectIfAuthenticated();
}

window.addEventListener("pageshow", restoreLogin);
redirectIfAuthenticated();

toggle.addEventListener("click", () => setPasswordVisible(password.type === "password"));
form.addEventListener("input", clearError);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const emptyFields = [email, password].filter((input) => input.validity.valueMissing);
  if (emptyFields.length) {
    showError("Preencha os campos obrigatórios.", ...emptyFields);
    return;
  }

  if (email.validity.typeMismatch) {
    showError("Informe um e-mail válido.", email);
    return;
  }

  if (!signIn(email.value, password.value)) {
    showError("E-mail ou senha inválidos", email, password);
    return;
  }

  password.value = "";
  window.location.replace(ordersPage);
});

toggle.disabled = false;
form.querySelector('[type="submit"]').disabled = false;
