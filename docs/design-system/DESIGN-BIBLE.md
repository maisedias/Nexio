# Nexio Design Bible

Status: fundação normativa 1.0  
Princípio: nenhuma tela nova ou redesenhada pode criar valores, componentes ou comportamentos fora deste documento.

## 1. Direção do produto

A Nexio deve transmitir clareza, segurança e progresso. O produto não é um painel administrativo: é um aplicativo financeiro pessoal premium. Cada tela precisa responder uma pergunta principal, apresentar uma ação dominante e esconder complexidade até que ela seja necessária.

Regras inegociáveis:

- Remover antes de adicionar.
- Uma tela, uma prioridade visual.
- No máximo três níveis de card: grande, médio e pequeno.
- No máximo uma ação primária por contexto.
- Informação secundária não compete com saldo, fluxo ou objetivo.
- Animação explica mudança de estado; nunca serve apenas como decoração.
- Todo valor visual vem de um token.

## 2. Assinatura Nexio

Toda superfície principal utiliza uma linha superior de 3px com o gradiente Nexio:

`azul → verde → amarelo → laranja → rosa`

Ela aparece uma vez por tela, no topo do workspace. Não deve ser repetida em cards, modais ou botões. É assinatura, não ornamento.

O azul continua sendo a cor de ação. Verde comunica entrada ou sucesso. Vermelho comunica saída, erro ou destruição. Roxo identifica transferências. Amarelo indica atenção, nunca erro.

## 3. Cores

### Base escura

| Token | Valor | Uso |
|---|---:|---|
| `--nx-bg` | `#0B111D` | Fundo da aplicação |
| `--nx-surface` | `#141C2A` | Cards, painéis e modais |
| `--nx-surface-raised` | `#192334` | Menus e superfícies elevadas |
| `--nx-surface-soft` | `#101824` | Campos e áreas discretas |
| `--nx-text` | `#F7F9FC` | Texto principal |
| `--nx-text-muted` | `#8F9CAF` | Texto secundário |
| `--nx-border` | `rgba(255,255,255,.06)` | Borda padrão |

### Semânticas

| Token | Valor | Uso |
|---|---:|---|
| `--nx-primary` | `#4F8FFF` | Ação, foco, seleção |
| `--nx-primary-hover` | `#6AA2FF` | Hover primário |
| `--nx-income` | `#4FD18B` | Receita, sucesso |
| `--nx-expense` | `#F06B78` | Despesa, erro |
| `--nx-transfer` | `#A78BFA` | Transferência |
| `--nx-warning` | `#F2B95F` | Atenção |
| `--nx-danger` | `#E65765` | Ação destrutiva |

Contraste mínimo: 4.5:1 para textos regulares e 3:1 para textos grandes e elementos de interface.

## 4. Tipografia

Família: Inter. Somente cinco tamanhos são permitidos.

| Estilo | Tamanho/linha | Peso | Uso |
|---|---|---:|---|
| Display | `56/60px` | 700 | Hero, saldo principal |
| Heading | `36/42px` | 700 | Título de página |
| Title | `26/32px` | 650 | Seções e cards grandes |
| Body | `16/24px` | 400–600 | Conteúdo e controles |
| Caption | `13/18px` | 500–650 | Metadados e labels |

No mobile, Display pode cair para 36px e Heading para 26px. Isso é adaptação responsiva, não um novo estilo.

Proibido:

- Tamanhos intermediários arbitrários.
- Texto em caixa alta além de captions curtas.
- Mais de três pesos na mesma tela.
- Cinza de baixo contraste para informação essencial.

## 5. Espaçamento

Escala única: `8, 12, 16, 24, 32, 48, 64px`.

- 8: relação imediata entre ícone e label.
- 12: elementos dentro de controles compactos.
- 16: grupos pequenos e gaps de grid.
- 24: padding interno padrão dos cards.
- 32: separação entre blocos relacionados.
- 48: separação entre seções.
- 64: respiro estrutural da página.

Nenhum `margin`, `padding` ou `gap` fora dessa escala é permitido, salvo dimensões matemáticas de componentes gráficos.

## 6. Grid e responsividade

- Desktop: 12 colunas, gutter 24px, conteúdo máximo 1440px.
- Tablet: 8 colunas, gutter 16px.
- Mobile: 4 colunas, gutter 16px, margem lateral 16px.
- Uma seção nunca mistura mais de três larguras de card.
- Conteúdo principal segue a ordem: cabeçalho, resumo, gráfico, conteúdo, insights.
- Ações secundárias migram para menus ou rodapé de seção em telas estreitas.

Breakpoints oficiais: 480, 768, 1024 e 1280px.

## 7. Cards

Existe uma única base visual:

```css
border-radius: 18px;
padding: 24px;
border: 1px solid rgba(255,255,255,.06);
background: #141C2A;
box-shadow: 0 15px 40px rgba(0,0,0,.18);
```

Tamanhos permitidos:

- Grande: destaque da tela; ocupa 6–12 colunas.
- Médio: informação comparável; ocupa 3–6 colunas.
- Pequeno: insight ou apoio; ocupa 2–4 colunas.

O tamanho muda; a pele não. Glassmorphism, gradientes internos e cores de categoria só podem aparecer como detalhe sem alterar a base.

Hover: `translateY(-2px)`. Clique: `scale(.97)`. Transição: 250ms. Cards informativos não clicáveis não recebem hover.

## 8. Botões

Existem apenas quatro variantes.

### Primário

Azul sólido, texto branco. Uma unidade por contexto. Altura 48px; raio 14px.

### Secundário

Fundo escuro elevado, borda padrão, texto principal.

### Ghost

Sem fundo e sem sombra. Hover usa apenas uma superfície discreta.

### Danger

Vermelho, reservado a ações destrutivas confirmadas.

Estados obrigatórios: default, hover, pressed, focus, disabled, loading e success. Loading troca o ícone por spinner; success troca por check por 900ms. Nenhuma nova variante pode ser criada para resolver layout.

## 9. Ícones

- Biblioteca exclusiva: Lucide.
- Tamanho padrão: 20px.
- `stroke-width: 1.8`.
- Ícones não são preenchidos.
- Um ícone decorativo usa `aria-hidden="true"`.
- Botão somente com ícone exige nome acessível e área mínima de 44×44px.
- Cores semânticas são aplicadas ao contêiner, não mudando o desenho.

## 10. Formulários

- Altura de input: 52px.
- Raio: 14px.
- Label sempre visível; placeholder não substitui label.
- Foco: borda primária e halo de 3px com 14% de opacidade.
- Erro: mensagem abaixo do campo, ícone de alerta e borda vermelha.
- Ajuda contextual usa Caption e nunca compete com a label.
- Máscaras não podem impedir colar, editar ou usar teclado móvel.
- Formulários longos são divididos em etapas ou seções, não em múltiplos cards concorrentes.

## 11. Navegação

- Sidebar contém no máximo sete destinos principais.
- Página ativa usa fundo discreto, ícone primário e indicador lateral.
- Header contém contexto, busca quando necessária e no máximo duas ações visíveis.
- Breadcrumb só aparece em hierarquias com três ou mais níveis.
- Voltar preserva filtros, scroll e seleção.

## 12. Dashboard

O primeiro viewport responde apenas:

1. Quanto tenho?
2. Quanto entrou?
3. Quanto saiu?

Ordem obrigatória:

1. Saldo atual, com maior hierarquia.
2. Receitas e despesas como comparação.
3. Gráfico de fluxo.
4. Movimentações recentes.
5. Metas e insights abaixo da dobra.

Pendências, exportação, criação de perfil e configurações não competem com os três números principais.

## 13. Gráficos

- Linha principal: 3px.
- Grid: no máximo quatro linhas horizontais com baixa opacidade.
- Área: gradiente discreto abaixo da série principal.
- Legenda só aparece quando existem duas ou mais séries ambíguas.
- Tooltip apresenta período, valor e comparação; nunca repete a legenda inteira.
- Filtros atualizam dados sem recriar o canvas.
- Entrada desenha linha em 700–1000ms.
- Zoom no hover é proibido; interação destaca o ponto ou intervalo.
- Cor nunca é o único meio de diferenciar séries.

## 14. Tabelas e listas

- Cabeçalho fixo apenas quando a lista ultrapassa o viewport.
- Linhas usam altura mínima de 56px.
- Ações ficam ocultas até hover/foco ou dentro de menu contextual.
- Mobile converte a linha em item empilhado; não força tabela horizontal.
- Seleção múltipla introduz uma barra de ações contextual.
- Paginação usa no máximo anterior, páginas essenciais e próximo.

## 15. Modais, drawers e FAB

- Modal: confirmação ou tarefa curta; largura máxima 560px.
- Drawer: detalhes, edição contextual ou histórico; largura 420–520px.
- FAB: apenas para a principal ação criativa da tela.
- Um modal não abre outro modal.
- Fechar restaura foco ao elemento que abriu.
- Escape fecha superfícies não destrutivas.

## 16. Feedback e estados

- Salvar: botão mostra check por 900ms e toast opcional.
- Excluir: item executa shake curto antes da confirmação visual.
- Sincronizar: spinner de 16–20px, texto de status e horário final.
- Erro: explicar o que ocorreu e como resolver.
- Toast: uma linha, uma ação opcional, duração de 4s.
- Estado vazio: ícone, título, uma frase e uma ação. Nada além.
- Skeleton reproduz a geometria final e não usa shimmer agressivo.

## 17. Movimento

Tempos permitidos:

- 150ms: feedback imediato.
- 250ms: hover, press e controles.
- 400ms: entrada de componente.
- 700ms: transição de página ou gráfico.

Curvas:

- Padrão: `cubic-bezier(.2,.8,.2,1)`.
- Entrada: `cubic-bezier(.16,1,.3,1)`.

Micro UX:

- Hover: elevação de 2px.
- Press: escala 0.97.
- Salvar: check.
- Excluir: shake.
- Sincronizar: spinner.

Respeitar `prefers-reduced-motion`. Nunca animar simultaneamente mais de uma área grande da tela.

## 18. Loading e skeleton

- Skeleton aparece após 150ms para evitar flash.
- Conteúdo substitui o skeleton sem salto de layout.
- Cards carregam primeiro; gráficos depois; listas por último.
- Spinner é reservado a ações locais e botões.
- Página inteira não usa spinner central se sua estrutura já é conhecida.

## 19. Notificações

- Sucesso: verde, sem linguagem celebratória excessiva.
- Informação: azul.
- Atenção: amarelo.
- Erro: vermelho.
- Notificações persistentes pertencem a uma central; toast é efêmero.
- Badges mostram `99+` como limite.

## 20. Onboarding

- Uma pergunta por etapa.
- Progresso sempre visível.
- Voltar preserva respostas.
- Campos apresentam efeito imediato em uma prévia quando isso reduz incerteza.
- Importação e login não bloqueiam experimentação local.
- A conclusão leva diretamente ao produto e materializa os dados informados.

## 21. Acessibilidade

- Navegação integral por teclado.
- Foco visível em todo elemento interativo.
- Ordem de foco acompanha a ordem visual.
- Área de toque mínima: 44×44px.
- Labels, nomes acessíveis e regiões vivas para feedback assíncrono.
- Conteúdo não depende apenas de cor, posição ou animação.
- Zoom de 200% não perde funcionalidade.
- Contraste validado nos dois temas.

## 22. Governança

Antes de implementar uma tela:

1. Declarar a pergunta principal da tela.
2. Inventariar componentes atuais.
3. Remover duplicações e conteúdo sem ação.
4. Produzir wireframe em baixa fidelidade.
5. Mapear cada elemento para um componente desta Bible.
6. Validar desktop, tablet, mobile, teclado e redução de movimento.
7. Só então escrever CSS e JavaScript.

Critério de revisão:

- Zero valor visual arbitrário.
- Zero nova variante de botão.
- Zero novo tamanho tipográfico.
- Uma prioridade visual inequívoca.
- No máximo três níveis de card.
- Estados completos, não apenas o cenário ideal.

Qualquer exceção precisa ser registrada em uma decisão de design, com problema, alternativas e prazo para revisão.
