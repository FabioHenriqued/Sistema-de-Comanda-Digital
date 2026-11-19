# 🍔 Comanda Digital

<p align="center">
  Sistema web para gerenciamento de pedidos de uma lanchonete.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-Framework-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Status-Em%20desenvolvimento-yellow?style=for-the-badge" />
</p>

---

## 📌 Sobre o projeto

O **Comanda Digital** é um sistema web desenvolvido com o objetivo de facilitar e organizar o gerenciamento de pedidos em uma lanchonete.

A aplicação busca substituir processos manuais por uma solução digital, permitindo que os atendentes gerenciem produtos, criem pedidos, adicionem itens e acompanhem o andamento dos pedidos de maneira simples e intuitiva.

O sistema contará com uma interface responsiva, priorizando a experiência de uso em dispositivos móveis.

## ✨ Funcionalidades

- [ ] 🔐 Autenticação de usuários
- [ ] 🍔 Cadastro e gerenciamento de produtos
- [ ] 📝 Criação de pedidos por mesa
- [ ] ➕ Adição de produtos aos pedidos
- [ ] ✏️ Edição de pedidos em aberto
- [ ] 🗑️ Remoção de pedidos
- [ ] 💰 Cálculo automático do valor total
- [ ] ✅ Finalização de pedidos
- [ ] 📋 Listagem de pedidos em aberto
- [ ] 🔎 Filtro de pedidos por mesa
- [ ] 📚 Histórico de pedidos (versão futura)

## 🛠️ Tecnologias

As tecnologias utilizadas no desenvolvimento do projeto são:

### Backend

- **Java** — Linguagem de programação.
- **Spring Boot** — Framework para desenvolvimento da API REST.
- **Spring Data JPA** — Persistência e gerenciamento de dados.
- **Spring Security** — Autenticação e segurança.
- **Maven** — Gerenciamento de dependências e build.

### Banco de dados

- **PostgreSQL** — Banco de dados relacional.

### Frontend

- Em definição.

## 🏗️ Arquitetura

O backend segue uma arquitetura em camadas, buscando manter a organização, separação de responsabilidades e facilidade de manutenção.

```text
backend/
└── src/
    └── main/
        └── java/
            └── br/com/comandadigital/
                ├── controller/
                ├── service/
                ├── repository/
                ├── entity/
                ├── enums/
                └── config/
```

| Camada | Responsabilidade |
|---|---|
| Controller | Receber e responder às requisições HTTP |
| Service | Implementar as regras de negócio |
| Repository | Realizar operações no banco de dados |
| Entity | Representar as entidades do sistema |
| Enums | Definir valores e estados predefinidos |
| Config | Centralizar configurações da aplicação |

## 🚀 Como executar

As instruções de instalação e execução serão adicionadas após a configuração completa do ambiente de desenvolvimento.

## 🎯 Objetivo acadêmico

Este projeto está sendo desenvolvido como parte de uma atividade acadêmica, com o propósito de aplicar conhecimentos de engenharia de software, programação orientada a objetos, desenvolvimento web, APIs REST e persistência de dados.

## 👥 Equipe

| Integrante | GitHub |
|---|---|
| **Fábio Henrique Duarte de Oliveira** | [@FabioHenriqued](https://github.com/FabioHenriqued) |
| **Venancio Borges Neto** | [@venancioborges](https://github.com/venancioborges) |
| **Ennio Ryan Alexandre Bobô** | [@ennioryan](https://github.com/ennioryan) |

---

<p align="center">
  Desenvolvido com ☕ e dedicação.
</p>
