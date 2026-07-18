# Auditoria do redesign Nexio V2

## Diagnóstico inicial

- A folha principal acumulava mais de 13 mil linhas e múltiplas gerações de overrides.
- Havia dezenas de tamanhos tipográficos e raios sem função semântica clara.
- O header exibia ações demais e ultrapassava a função de orientação.
- Cards competiam por atenção com sombras, gradientes e movimentos distintos.
- A tela de transações comprimida em duas colunas tornava o cadastro administrativo.
- O sino de notificações funcionava apenas como atalho para pendências.

## Decisões aplicadas

- Tokens oficiais conectados antes de uma camada V2 isolada.
- Card unificado: superfície, borda, raio 18px, padding 24px e sombra suave.
- Quatro famílias de ação: primária, secundária, ghost e danger.
- Header reduzido a 69px com título, busca, notificações, perfil e ação principal.
- Sidebar reduzida para 260px, sem alterar seus destinos.
- Assinatura Nexio aplicada como linha global de 3px.
- Dashboard reorganizado em resumo, gráfico/contas, atividades e metas/insights.
- Gráficos limitados a 360px e sem zoom no hover.
- Transações organizadas em sequência de decisão, com categorias em bloco separado.
- Central de Notificações criada com dados reais e navegação contextual.
- Breakpoints verificados sem overflow horizontal no mobile.

## Funcionalidades preservadas

- Autenticação e modo local.
- Perfis e troca de perfil.
- Transações, parcelas, categorias, filtros e ações em lote.
- Fluxo de caixa e seus períodos.
- Metas, contribuições e histórico.
- Configurações, importação, exportação e backup.
- FAB e atalhos existentes.

## Próxima redução segura

A camada V2 estabiliza o produto sem apagar regras antigas. A próxima manutenção técnica deve migrar uma tela por vez e remover os seletores legados que ela substitui. A remoção deve ocorrer somente após comparação visual e testes funcionais, evitando um refactor destrutivo em uma única entrega.
