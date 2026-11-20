const sessionKey = "comanda-digital:proprietaria";

// Contas fictícias para a demonstração. A integração substituirá esta lista e a sessão local.
const owners = [
  { id: "1", name: "Ana Souza", email: "ana@example.com", password: "DemoAna123!" },
  { id: "2", name: "Beatriz Lima", email: "beatriz@example.com", password: "DemoBia123!" },
];

export function signIn(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const owner = owners.find((account) =>
    account.email === normalizedEmail && account.password === password,
  );
  if (!owner) return false;

  sessionStorage.setItem(sessionKey, owner.id);
  return true;
}

export function getAuthenticatedUser() {
  const id = sessionStorage.getItem(sessionKey);
  const owner = owners.find((account) => account.id === id);
  return owner ? { id: owner.id, name: owner.name, email: owner.email } : null;
}

export function signOut() {
  sessionStorage.removeItem(sessionKey);
}
