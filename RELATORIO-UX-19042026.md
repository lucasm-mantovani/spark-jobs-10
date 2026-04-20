# RELATÓRIO DE ANÁLISE UX/PRODUTO — SAFIE Hire
**Elaborado por:** Expert Dev com especialização em UX e Gestão de Pessoas
**Data da análise:** 19/04/2026
**Plataforma:** https://safie-hire.lovable.app
**Objetivo:** Identificar bugs, falhas de UX e oportunidades de desenvolvimento para tornar a plataforma completa para todos os processos de contratação da SAFIE.

---

## SUMÁRIO EXECUTIVO

A SAFIE Hire é uma plataforma ATS (Applicant Tracking System) em estágio embrionário, com estrutura básica funcional, mas que ainda carece de features essenciais para um processo de R&S profissional. Foram identificados **6 bugs críticos**, **14 problemas de UX/UI** e **23 features ausentes** que são padrão de mercado em ferramentas de seleção.

---

## PARTE 1 — BUGS CRÍTICOS (Prioridade P0)

### BUG-01 | Campos duplicados no formulário público de candidatura
**Localização:** `/formulario/[id]`
**Descrição:** O formulário público exibe os campos nativos (Nome completo, Telefone, Currículo) e em seguida repete os mesmos campos como perguntas numeradas (1. Nome, 2. Telefone, 3. Currículo). O candidato é obrigado a preencher as mesmas informações duas vezes.
**Causa provável:** As perguntas do tipo "nome", "telefone" e "currículo" estão sendo geradas pela IA e salvas como perguntas customizadas, mas o formulário já renderiza esses campos fixos nativos independentemente.
**Impacto:** Experiência ruim para o candidato, dados redundantes no banco, possível confusão sobre qual campo é o oficial.
**Correção:** Remover as perguntas geradas automaticamente que duplicam os campos fixos OR criar lógica para que o formulário não exiba campos fixos se uma pergunta customizada do mesmo tipo já existir. A solução ideal é tornar as perguntas "Nome", "Telefone" e "Currículo" campos padrão fixos e não-editáveis, separados do bloco de perguntas customizadas.

### BUG-02 | Página em branco durante carregamento de rotas
**Localização:** `/candidatos` e `/configuracoes` ao navegar diretamente pela URL
**Descrição:** Ao navegar para essas rotas, a aplicação renderiza uma tela completamente em branco (sem header, sem conteúdo, sem spinner de loading) por 2-3 segundos antes de renderizar o conteúdo.
**Impacto:** O usuário não sabe se a página carregou ou travou. Causa sensação de aplicação quebrada.
**Correção:** Implementar skeleton screen ou spinner de loading global. O estado intermediário entre a autenticação ser verificada e o conteúdo ser renderizado precisa exibir feedback visual.

### BUG-03 | Rota `/pipeline` não redireciona e não exibe conteúdo
**Localização:** `/pipeline`
**Descrição:** A rota existe no roteador (não retorna 404), mas renderiza completamente em branco — nem o header da aplicação é exibido. Indica uma rota cadastrada mas sem componente associado ou com erro silencioso.
**Impacto:** Se algum usuário acessar essa URL, verá tela branca sem nenhum feedback.
**Correção:** Ou implementar a página de pipeline (recomendado) ou redirecionar para `/vagas` com mensagem de "em breve".

### BUG-04 | Botões de ação do card de vaga em layout quebrado
**Localização:** `/vagas` (card da vaga)
**Descrição:** Em telas menores (inclusive em viewport padrão redimensionado), os botões "Formulário", "Editar" e "Desativar" do card de vaga ficam distribuídos em duas linhas (2 na primeira, 1 na segunda), em vez de ficarem na mesma linha. O layout não usa `flex-wrap: nowrap` ou não tem largura mínima adequada.
**Impacto:** Inconsistência visual e uso ineficiente do espaço no card.
**Correção:** Ajustar o container dos botões para flex com nowrap, ou usar um menu dropdown de contexto (três pontos) para as ações secundárias.

### BUG-05 | Ausência de página 404 com navegação funcional
**Localização:** Rotas inválidas como `/perfil`, `/candidato/1`, `/vagas/1`, `/register`
**Descrição:** A página 404 existe e exibe "Oops! Page not found" com botão "Return to Home", mas não mantém o header de navegação da aplicação, quebrando a experiência de usuário logado.
**Impacto:** Usuário logado que digita uma URL errada perde todo o contexto de navegação.
**Correção:** Encapsular o componente de 404 dentro do layout autenticado (com header/navbar) quando o usuário estiver logado.

### BUG-06 | Página de criação de conta sem confirmação de senha
**Localização:** `/login` (tela de "Criar Conta")
**Descrição:** O formulário de criação de conta possui apenas os campos Nome, Email e Senha — sem campo de confirmação de senha. Isso abre margem para cadastro com senha digitada incorretamente.
**Impacto:** Usuários podem criar conta com senha errada e não conseguir fazer login depois.
**Correção:** Adicionar campo "Confirmar Senha" com validação de match em tempo real.

---

## PARTE 2 — PROBLEMAS DE UX/UI (Prioridade P1)

### UX-01 | Strings plurais com sufixo "(s)" em vez de lógica de plural real
### UX-02 | Navegação sem indicador de rota ativa no mobile
### UX-03 | Card de vaga sem link direto para candidatos daquela vaga
### UX-04 | Formulário de criação/edição de vaga em modal (inadequado para conteúdo extenso)
### UX-05 | Ausência de busca e filtros na listagem de vagas
### UX-06 | Ausência de estados "empty state" com orientação ao usuário
### UX-07 | Botão "Desativar" sem confirmação e sem indicação de reversibilidade
### UX-08 | Link/URL do formulário não é visível nem copiável na listagem de vagas
### UX-09 | Configurações limitadas demais para uma plataforma corporativa
### UX-10 | Dashboard sem gráficos ou métricas de tempo
### UX-11 | Tabela de candidatos sem ações inline
### UX-12 | Roles de usuário insuficientes para estrutura corporativa real
### UX-13 | Ausência de breadcrumb e histórico de navegação
### UX-14 | Sem feedback visual de ações bem-sucedidas (toast notifications)

---

## PARTE 3 — FEATURES AUSENTES (Prioridade P1 e P2)

### FEAT-01 | Página de detalhe da vaga com pipeline Kanban (P1)
### FEAT-02 | Perfil completo do candidato (P1)
### FEAT-03 | Sistema de notas e comentários por candidato (P1)
### FEAT-04 | Agendamento de entrevistas integrado (P1)
### FEAT-05 | Comunicação com candidatos por email (P1)
### FEAT-06 | Reordenação de perguntas no formulário — drag & drop (P1)
### FEAT-07 | Preview do formulário público antes de publicar (P1)
### FEAT-08 | Dashboard analítico completo (P1)
### FEAT-09 | Exportação de candidatos CSV/Excel (P1)
### FEAT-10 | Banco de talentos (P2)
### FEAT-11 | Customização das etapas do pipeline por vaga (P2)
### FEAT-12 | Integração com LinkedIn, Indeed e portais de vagas (P2)
### FEAT-13 | Avaliação e scoring de entrevistas — scorecards (P2)
### FEAT-14 | Testes e assessments online (P2)
### FEAT-15 | Indicação/referral de candidatos (P2)
### FEAT-16 | Personalização visual do formulário público — branding (P2)
### FEAT-17 | Campos adicionais no formulário padrão (LinkedIn, PCD, pretensão salarial…) (P1)
### FEAT-18 | Hierarquia de permissões mais granular — RBAC (P2)
### FEAT-19 | Histórico de auditoria — audit log (P2)
### FEAT-20 | Módulo de admissão/DP após contratação (P1 — diferencial SAFIE)
### FEAT-21 | Notificações em tempo real in-app e por email (P1)
### FEAT-22 | Templates de vagas (P2)
### FEAT-23 | Compartilhamento de vagas em redes sociais (P3)

---

## PARTE 4 — ARQUITETURA DE INFORMAÇÃO

### AI-01 | Hierarquia de navegação inadequada para fluxo real de trabalho
### AI-02 | Candidatos desvinculados das vagas no menu principal

---

## PARTE 5 — COMPLIANCE E LGPD

### COMP-01 | Ausência de campo PCD (Lei de Cotas — Lei 8.213/91) — risco legal alto
### COMP-02 | Ausência de política de privacidade e consentimento LGPD no formulário público — risco legal alto
### COMP-03 | Sem registro de etapa/responsável por decisões de contratação — risco médio

---

## PARTE 6 — PLANO DE PRIORIZAÇÃO SUGERIDO

### Sprint 1 — Bugs Críticos e Base Funcional (semanas 1-2)
BUG-01, BUG-02, BUG-04, BUG-06, UX-01, UX-07, UX-08, FEAT-17 (campos + PCD), COMP-02 (LGPD)

### Sprint 2 — Core do ATS (semanas 3-5)
FEAT-01 (Kanban), FEAT-02 (Perfil candidato), FEAT-03 (Notas), FEAT-06 (reordenação perguntas), FEAT-07 (preview formulário), UX-03, UX-04

### Sprint 3 — Comunicação e Dashboard (semanas 6-8)
FEAT-05 (emails), FEAT-08 (dashboard analítico), FEAT-21 (notificações), FEAT-09 (exportação), UX-05, UX-06, UX-10

### Sprint 4 — Diferenciação e Escala (semanas 9-12)
FEAT-04, FEAT-11, FEAT-13, FEAT-16, FEAT-18, FEAT-20 (admissão DP), UX-09

### Sprint 5 — Features Premium (semanas 13+)
FEAT-10, FEAT-12, FEAT-14, FEAT-15, FEAT-19, FEAT-22, FEAT-23

---

## RESUMO QUANTITATIVO

| Categoria | Quantidade |
|---|---|
| Bugs Críticos (P0) | 6 |
| Problemas de UX/UI (P1) | 14 |
| Features Ausentes | 23 |
| Problemas de Compliance/Legal | 3 |
| Problemas de Arquitetura de Informação | 2 |
| **TOTAL** | **48 pontos de melhoria** |
