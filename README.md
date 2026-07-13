# 🤖 PontoBot — Discord App

Esta é a aplicação do bot do Discord do **PontoBot**, responsável por interagir diretamente com os usuários nos servidores, gerenciar as sessões de ponto e expor uma API Fastify interna para o painel web.

O bot foi construído utilizando a base modular do [Constatic](https://constatic-docs.vercel.app/docs/discord/start) e implementa a especificação de **Discord Components V2**.

---

## 🌟 Funcionalidades e Fluxos

### 1. Sistema de Bate-ponto (Ponto Eletrônico)
O fluxo de ponto é completamente interativo e utiliza as novidades de **Components V2** do Discord:
*   **Iniciar Serviço (`/point/open`):** Abre um modal para o usuário selecionar outros participantes iniciais (até 10 membros, ideal para atividades em grupo) e inserir observações ou anotações iniciais.
*   **Pausar Serviço (`/point/pause`):** Permite registrar uma pausa temporária, abrindo um modal para preenchimento obrigatório do motivo da pausa.
*   **Retomar Serviço (`/point/resume`):** Retoma o cronômetro do expediente ativo.
*   **Encerrar Serviço (`/point/close`):** Finaliza a sessão ativa. Abre um modal permitindo registrar participantes adicionais que entraram no decorrer da atividade e um relatório/resumo final do que foi feito.
*   **Atualizar Painel (`/point/refresh`):** Atualiza de forma efêmera e em tempo real as informações de tempo trabalhado e status no painel de controle do usuário.

### 2. Painel Pessoal do Usuário (Painel de Serviço)
Ao clicar no botão "Painel de Serviço", o bot responde com uma mensagem efêmera contendo:
*   **Status Atual:** Exibição clara do status (🔴 Fora de Serviço, 🟢 Em Serviço, 🟡 Pausado).
*   **Estatísticas Pessoais:** Total de sessões, tempo acumulado histórico, média diária de horas e data/hora do último expediente.
*   **Meta Semanal:** Uma barra de progresso visual baseada em emojis de porcentagem (`0%`, `25%`, `50%`, `75%`, `100%`) mostrando o progresso da meta de horas da semana atual, tempo restante e uma frase motivacional.

### 3. Logs de Expediente
Se configurado nas opções do servidor, o bot envia embeds detalhados em canais específicos de texto contendo:
*   **Logs de Abertura:** Quem abriu, horário de início, participantes iniciais, canal de voz conectado e anotações iniciais.
*   **Logs de Fechamento:** Duração total ativa (descontando as pausas), resumo das pausas realizadas, participantes finais e o relatório descritivo final.
*   O banco de dados armazena o link direto dessas mensagens de log no Discord (`messageOpenLink` e `messageCloseLink`).

---

## 🛠️ Comandos Slash (Chat Input)

*   **`/info`** - Mostra detalhes técnicos do bot (versão, número de servidores ativos, tempo online) e links rápidos de suporte.
*   **`/status`** - Comando público para verificação de diagnóstico rápido do sistema.
*   **`/configurar`** *(Admin)* - Permite definir as configurações do servidor, tais como:
    *   Canal de logs para abertura de ponto.
    *   Canal de logs para fechamento de ponto.
    *   Definição e status da meta de horas semanal global.
*   **`/painel`** *(Admin)* - Envia a mensagem fixa com os botões principais de ponto ("Painel de Serviço", "Ranking Semanal" e "Ranking Global") em um canal selecionado. Permite escolher entre o **Template Padrão** ou templates customizados criados via Dashboard Web.

---

## 🔌 API Fastify Integrada
Para se comunicar com o Dashboard Web de forma rápida e segura, o bot roda em segundo plano um servidor web utilizando **Fastify v5**.

*   Exponde endpoints internos como `/guilds` para o dashboard consultar servidores ativos e estatísticas de membros.
*   Utiliza autenticação via cabeçalhos customizados seguros (`X-Internal-Secret`) para garantir a integridade dos dados compartilhados.

---

## 💾 Modelagem de Banco de Dados (Prisma)
As tabelas principais do banco de dados relacionadas ao bot estão em `prisma/models/`:
*   `Guild`: Servidores que utilizam o bot.
*   `Settings`: Configurações globais de metas semanais e canais de log de cada servidor.
*   `Member`: Associação de usuários do Discord aos servidores, controlando metas específicas individuais e o status de banimento interno.
*   `PointSession`: Registro de cada expediente de serviço iniciado, com início, fim, canais de voz, notas, participantes iniciais e finais, e duração final ativa.
*   `Pause`: Registro de pausas em cada sessão de ponto, contendo o início, fim, duração e motivo da pausa.
*   `Audit`: Log de auditoria registrando alterações manuais de metas e canais de logs feitas por administradores.

---

## 📦 Scripts de Execução

No diretório `apps/bot`, os seguintes scripts estão disponíveis:

*   `npm run dev` — Executa o bot em modo de desenvolvimento usando `tsx` com carregamento do `.env`.
*   `npm run watch` — Executa o bot em modo de desenvolvimento com hot-reload ativo (`--watch`).
*   `npm run build` — Compila todo o código TypeScript para JavaScript otimizado na pasta `build` utilizando `tsup`.
*   `npm run start` — Executa o bot compilado a partir da pasta `build`.
*   `npm run check` — Executa o validador do TypeScript (`tsc --noEmit`) para checagem de erros de tipagem.

---

## ☁️ Implantação (Deployment)

### Discloud
O bot está pronto para ser hospedado no [Discloud](https://discloud.app/).
Os arquivos de configuração necessários já estão inclusos:
*   `discloud.config`: Define o nome (`pontobot`), RAM alocada (100MB), build script (`npm run build`) e start script (`npm run start`).
*   `.discloudignore`: Lista de arquivos ignorados no upload para economizar recursos.

### Deploy Automático (CI/CD)
O repositório possui uma GitHub Action configurada em `.github/workflows/sync-bot-branch.yml`. 
Toda vez que há um push na branch `main` com alterações dentro de `apps/bot/**`, o GitHub Action faz um split do repositório enviando apenas a pasta `apps/bot` para a branch isolada `bot-deploy`, que pode ser conectada diretamente à Discloud para deploy automatizado.
