# 🕒 PontoBot

Uma solução robusta e moderna de **controle de ponto (registro de horas de serviço)** para servidores do Discord, composta por um Bot integrado e um Painel Web Administrativo.

O projeto é estruturado como um monorepo/multiserviço em TypeScript, utilizando **Discord.js (com suporte nativo a Components V2)** no bot, **Next.js (com Tailwind CSS e shadcn/ui)** no painel de controle, e banco de dados **PostgreSQL** orquestrado via **Prisma ORM**.

---

## 🚀 Funcionalidades Principais

### 🤖 Discord Bot (`apps/bot`)
*   **Bate-ponto Interativo:** Permite iniciar, pausar, retomar e encerrar expedientes de serviço por meio de botões e modais ricos.
*   **Discord Components V2:** Layout moderno utilizando os mais recentes recursos de exibição do Discord, incluindo `ContainerBuilder`, `SectionBuilder`, `SeparatorBuilder` e galerias de mídia.
*   **Registro Dinâmico de Presença:** Suporte para seleção de múltiplos participantes adicionais ao abrir ou fechar o ponto (com limite de até 10 membros).
*   **Metas Semanais Dinâmicas:** Exibição de barra de progresso visual através de emojis customizados e cálculo dinâmico de horas trabalhadas com frases motivacionais.
*   **Logs Automáticos:** Canais de logs configuráveis para quando um ponto for aberto ou fechado (com link direto para a mensagem gerada).
*   **Sistema de Auditoria:** Registro interno de alterações nas configurações globais do servidor e de metas de usuários.
*   **Painel Customizável:** Comando `/painel` para enviar o painel interativo utilizando templates pré-definidos via Dashboard Web.

### 🌐 Painel Web Dashboard (`apps/web`)
*   **Autenticação com Discord:** Login rápido e seguro utilizando NextAuth e Discord OAuth2.
*   **Gerenciamento Multisservidor:** Listagem de servidores onde o usuário é administrador ou dono e verificação de status do bot no servidor.
*   **Gerenciador de Ponto (PM):** Interface administrativa para acompanhamento em tempo real, visualização de sessões ativas e histórico detalhado.
*   **Customização de Templates:** Criação e edição de layouts customizados do painel que o bot envia nos canais.
*   **Configuração Centralizada:** Configuração intuitiva de metas de horas, canais de logs e permissões.
*   **Integração com Mercado Pago:** Gerenciamento de assinaturas e planos com checkout integrado para monetização dos serviços do bot.

---

## 📁 Estrutura do Workspace

O projeto está dividido dentro do diretório `apps/`:

```
pontobot/
├── apps/
│   ├── bot/       # Bot do Discord + API Interna Fastify
│   └── web/       # Painel Web Next.js (Dashboard administrativo)
├── .agents/       # Instruções e regras locais
└── README.md      # Documentação principal
```

---

## 🛠️ Tecnologias Utilizadas

### **Bot & Back-end (`apps/bot`)**
*   **Linguagem:** TypeScript
*   **SDK Discord:** Discord.js v14 + `@constatic/base` + `@magicyan/discord`
*   **Servidor de API:** Fastify (expõe rotas internas seguras para o front-end Next.js)
*   **Banco de Dados:** PostgreSQL com Prisma ORM
*   **Compilador:** Tsup & Tsx

### **Front-end Dashboard (`apps/web`)**
*   **Framework:** Next.js (React 19, App Router)
*   **Estilização:** Tailwind CSS v4 + `shadcn/ui` + Framer Motion (para micro-animações)
*   **Autenticação:** NextAuth.js (Discord provider)
*   **Gerenciamento de Estado:** TanStack React Query

---

## 📋 Pré-requisitos

*   **Node.js:** Versão `20.12` ou superior.
*   **PostgreSQL:** Banco de dados relacional configurado e rodando.
*   **Aplicação no Discord Developer Portal:** Necessário para obter o Token do Bot, ID da Aplicação (Client ID) e Client Secret para o OAuth2.

---

## 🔧 Configuração e Instalação

### 1. Clonar e Instalar Dependências
Navegue até a raiz do projeto e instale as dependências de cada aplicativo:

```bash
# Para o Bot
cd apps/bot
npm install

# Para o Dashboard Web
cd ../web
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` baseado nos arquivos `.env.example` de cada diretório.

#### Configurações do Bot (`apps/bot/.env`)
```ini
BOT_TOKEN=seu_token_do_bot_aqui
DATABASE_URL=postgresql://usuario:senha@localhost:5432/pontobot?schema=public
SERVER_PORT=3001 # Porta onde a API do Fastify rodará
FASTIFY_API_URL=http://localhost:3001
INTERNAL_API_SECRET=uma_chave_secreta_para_comunicacao_interna
FRONTEND_URL=http://localhost:3000
ENV=dev # dev ou prod
GUILD_ID=seu_servidor_de_testes_id # Opcional: para registrar comandos slash instantaneamente em um servidor específico
```

#### Configurações da Web (`apps/web/.env`)
```ini
# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=uma_chave_secreta_para_criptografia_da_sessao

# Discord OAuth
DISCORD_CLIENT_ID=seu_client_id_do_discord_aqui
DISCORD_CLIENT_SECRET=seu_client_secret_do_discord_aqui

# API Connection
FASTIFY_API_URL=http://localhost:3001
INTERNAL_API_SECRET=mesma_chave_secreta_configurada_no_bot
```

### 3. Banco de Dados e Migrações
Execute os comandos do Prisma na pasta `apps/bot` para gerar o cliente e aplicar as migrações:

```bash
cd apps/bot
npx prisma migrate dev
```

---

## ⚡ Executando o Projeto

Você pode iniciar o Bot e o Dashboard em paralelo durante o desenvolvimento.

### Iniciando o Bot
```bash
cd apps/bot
npm run dev
# Ou para rodar com auto-reload (watch mode):
npm run watch
```

### Iniciando o Dashboard Web
```bash
cd apps/web
npm run dev
```

Abra o navegador em [http://localhost:3000](http://localhost:3000) para acessar a interface administrativa.

---

## 🛠️ Comandos Slash Disponíveis (Discord)

*   `/info` - Mostra informações básicas sobre o bot, estatísticas do servidor ativo e lista de comandos.
*   `/status` - Exibe informações de diagnóstico sobre o sistema.
*   `/painel <canal> <template>` - Envia o painel de ponto eletrônico para um canal de texto específico. Requer permissão de Administrador.
*   `/configurar` - Configura canais de logs e metas semanais do servidor. Requer permissão de Administrador.

---

## 📄 Licença

Este projeto é de uso privado e de propriedade do seu desenvolvedor principal.
