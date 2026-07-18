# Plano de migração visual da Nexio

Este plano evita um big bang visual. Cada tela será auditada, simplificada e migrada para a Design Bible sem remover funcionalidades.

## Fase 0 — Inventário

- Catalogar todos os cards, botões, fontes, espaçamentos, ícones e animações existentes.
- Identificar componentes duplicados e variações sem função.
- Medir densidade de cada tela e registrar os 30% candidatos à remoção.
- Criar uma matriz `componente atual → componente oficial`.

Saída: relatório de dívida visual, sem mudança de interface.

## Fase 1 — Fundação técnica

- Vincular `tokens.css` antes da folha principal.
- Mapear variáveis legadas para tokens Nexio.
- Criar as quatro variantes de botão.
- Criar base única de card e os três tamanhos.
- Padronizar input, select, switch, tooltip e focus ring.
- Normalizar Lucide em 20px e stroke 1.8.

Saída: biblioteca base isolada e página de teste de componentes.

## Fase 2 — Dashboard

Pergunta principal: qual é minha situação financeira agora?

Hierarquia:

1. Saldo atual.
2. Entradas e saídas.
3. Gráfico de fluxo.
4. Movimentações.
5. Metas e insights.

Remover ou deslocar abaixo da dobra qualquer ação que compita com as três respostas principais.

## Fase 3 — Transações e fluxo de caixa

- Unificar filtros em uma barra progressiva.
- Reduzir ações visíveis por linha.
- Padronizar lista, tabela, detalhes e drawer.
- Simplificar gráficos e remover grades/legendas redundantes.

## Fase 4 — Metas e perfis

Perfis:

1. Saldo consolidado.
2. Gráfico.
3. Perfis.
4. Ações.

Metas:

1. Progresso geral.
2. Meta principal.
3. Demais metas.
4. Histórico e projeções sob demanda.

## Fase 5 — Configurações e autenticação

- Configurações vira navegação por categorias com conteúdo progressivo.
- Login e onboarding adotam tokens oficiais sem perder a narrativa premium.
- Ações perigosas recebem área separada e confirmação consistente.

## Fase 6 — Estados e qualidade

- Loading, skeleton, vazio, erro, offline e sucesso.
- Teclado, leitor de tela, contraste e redução de movimento.
- 320px, 480px, 768px, 1024px, 1280px e 1440px.
- Auditoria de performance e remoção de CSS legado.

## Definition of Done por tela

- Wireframe aprovado antes do CSS.
- Uma prioridade visual.
- No máximo três níveis de card.
- Apenas quatro variantes de botão.
- Tipografia e espaçamento exclusivamente por tokens.
- Ícones Lucide 20/1.8.
- Hover -2px e press .97.
- Estados loading, vazio, erro e sucesso.
- Responsividade e acessibilidade verificadas.
- CSS legado da tela removido, não apenas sobrescrito.
