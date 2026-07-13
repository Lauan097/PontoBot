# 🌐 PontoBot — Painel Web Dashboard

Este é o painel de controle administrativo do **PontoBot**, desenvolvido como uma aplicação web moderna em **Next.js** (React 19) e estilizado com **Tailwind CSS v4** e **shadcn/ui**.

A web app permite que os administradores e donos de servidores do Discord visualizem registros de ponto, configurem metas de horas, criem templates de mensagens e gerenciem assinaturas.

---

## 🗺️ Estrutura de Rotas e Telas

O painel é estruturado com o **Next.js App Router** e contém as seguintes rotas principais:

### 1. Página de Login / Seleção de Servidor (`/`)
*   **Aparência Moderna:** Tela de login premium com animação interativa de partículas utilizando `@tsparticles` e animações de entrada com Framer Motion.
*   **OAuth2 Discord:** Login rápido e seguro via NextAuth.
*   **Seleção de Servidor:** Após autenticado, o usuário vê um grid com os servidores do Discord que ele gerencia, indicando se o bot já está instalado (online) ou precisa ser adicionado (offline).

### 2. Visão Geral do Servidor (`/[guildId]`)
*   Painel principal de controle de um servidor específico.
*   Mostra métricas gerais de uso, quantidade de membros ativos em serviço e estatísticas rápidas.

### 3. Gerenciador de Ponto — PM (`/[guildId]/pm`)
*   Interface voltada para a visualização detalhada de sessões de ponto ativas e finalizadas.
*   Acesso aos históricos de expedientes, relatórios preenchidos pelos usuários, pausas realizadas (e seus motivos) e participantes extras adicionados nas sessões.

### 4. Configurações do Servidor (`/[guildId]/settings`)
*   **Metas de Horas:** Controle do status e duração da meta semanal de horas global do servidor ou metas específicas por usuário.
*   **Canais de Log:** Configuração dos canais do Discord para onde o bot enviará as mensagens automáticas de logs de início e fim de ponto.
*   **Templates de Painel:** Editor/criador para customizar o conteúdo e estrutura das mensagens de controle de ponto enviadas pelo bot.

---

## 🛠️ Tecnologias Utilizadas

*   **Framework:** Next.js (App Router, React 19)
*   **Autenticação:** NextAuth.js com provedor do Discord (OAuth2)
*   **Estilização:** Tailwind CSS v4, `shadcn/ui` (Radix UI)
*   **Animações:** Framer Motion (transições suaves e micro-interações)
*   **Requisições e Cache:** TanStack React Query v5
*   **Ícones:** Lucide React & React Icons
*   **Partículas de Fundo:** `@tsparticles/react` & `@tsparticles/slim`

---

## ⚙️ Variáveis de Ambiente (`.env`)

Para rodar a aplicação web, configure as seguintes chaves no seu arquivo `.env`:

```ini
# Next Auth Config
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=uma_chave_secreta_longa_e_aleatoria

# Aplicação Discord (OAuth2)
DISCORD_CLIENT_ID=seu_client_id_do_discord
DISCORD_CLIENT_SECRET=seu_client_secret_do_discord

# Comunicação com a API do Bot
FASTIFY_API_URL=http://localhost:3001
INTERNAL_API_SECRET=mesmo_token_secreto_configurado_no_bot
```

---

## 📦 Scripts de Execução

No diretório `apps/web`, você pode executar os seguintes comandos:

*   `npm run dev` — Inicia o servidor de desenvolvimento local em `http://localhost:3000`.
*   `npm run build` — Compila a aplicação Next.js para produção.
*   `npm run start` — Inicia a aplicação Next.js já compilada.
*   `npm run lint` — Executa o verificador do ESLint para análise de código e validações estáticas.

---

## ☁️ Implantação (Deployment)

### GitHub Actions (Deploy Automático)
O projeto conta com um workflow automatizado em `.github/workflows/sync-web-branch.yml`. 

Sempre que alterações na pasta `apps/web/**` são enviadas para a branch `main`, o GitHub Action isola automaticamente a pasta `apps/web` e a envia para a branch `web-deploy`. Essa branch pode ser vinculada diretamente a serviços como Vercel, Netlify, Zeabur ou Discloud para deploy automatizado e contínuo.
