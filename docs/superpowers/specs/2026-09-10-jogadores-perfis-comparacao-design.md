# Perfis e comparação de jogadores — Especificação

## Objetivo

Transformar a página **Jogadores** em uma porta de entrada para análises individuais e comparações rápidas. Cada jogador real poderá abrir um perfil com sua evolução de score e seus principais parceiros/adversários. Também será possível selecionar até quatro jogadores para comparar os números e os confrontos em uma única tela.

## Escopo

### Incluído

- Perfil individual acessível a partir de um jogador na página **Jogadores**.
- Gráfico de score acumulado ao longo das partidas, em ordem cronológica.
- Resumo de vitórias, derrotas, jogos, aproveitamento, score, sequências, gabuadas e senas.
- Relações derivadas do histórico:
  - **Mais vitórias com**: parceiro com quem o jogador venceu mais partidas.
  - **Mais derrotas com**: parceiro com quem o jogador perdeu mais partidas.
  - **Mais vitórias contra**: jogador adversário presente no time derrotado com maior número de vitórias do jogador contra ele.
- Comparação de até quatro jogadores reais.
- Tabela comparativa e gráfico de score sobreposto.
- Matriz de confrontos diretos entre os jogadores selecionados quando houver histórico.
- Rotas com hash para permitir abrir/compartilhar uma tela específica sem backend novo.

### Fora do escopo

- Alteração de tabelas ou colunas no Supabase.
- Edição de partidas ou jogadores dentro do perfil.
- Inclusão de Convidado em rankings, perfis ou comparação.
- Biblioteca externa de gráficos; o gráfico será um SVG leve e responsivo.

## Rotas e navegação

As rotas continuam usando o hash já adotado pelo aplicativo:

- `#players`: lista atual de jogadores.
- `#players/<playerId>`: perfil individual.
- `#players/compare`: comparação.

O `AppShell` considera todas as rotas `players/*` como item ativo **Jogadores**. Um jogador inválido na URL retorna para `#players` e exibe uma mensagem curta de não encontrado. O botão de voltar do perfil/comparação retorna para a lista sem recarregar os dados.

## Perfil individual

### Cabeçalho

- Avatar circular, nome, frase cadastrada e estado ativo/inativo.
- Ação de retorno para Jogadores.
- Ação “Comparar” que pré-seleciona este jogador na tela de comparação.

### Resumo

Exibir os valores já derivados pelo domínio, sem percentuais ambíguos:

- Score
- Jogos
- Vitórias
- Derrotas
- Aproveitamento
- Maior sequência de vitórias
- Maior sequência de derrotas
- Gabuadas
- Senas

Jogadores sem partidas continuam acessíveis, mas mostram estado vazio no gráfico e nos relacionamentos.

### Evolução de score

O gráfico usa os jogos em ordem cronológica (`playedAt`, depois `createdAt`, depois `id`). Cada ponto representa o score do jogador após sua participação naquela partida, calculado pela mesma fórmula do ranking atual:

```text
adjustedWinRate = clamp((wins - 0.05 × senasPerdidas) / jogos, 0, 1)
z = (adjustedWinRate - 0.5) / sqrt(0.25 / jogos)
score = clamp(50 + 10 × z, 0, 100)
```

O ponto recebe a data, resultado (vitória/derrota), adversários e indicação de sena/gabuada para tooltip acessível e leitura textual. A linha usa escala fixa de 0 a 100 para permitir comparação visual honesta entre jogadores.

### Relacionamentos

Três blocos compactos mostram o nome, avatar e quantidade de partidas da relação. Empates usam todos os nomes empatados, ordenados alfabeticamente. Relações sem ocorrência exibem estado vazio curto, sem inventar um líder.

## Comparação

### Seleção

- A página mostra jogadores reais em uma grade de opções com avatar, nome e score.
- Convidado não aparece.
- Até quatro jogadores podem ser selecionados; ao atingir o limite, as demais opções ficam desabilitadas com indicação visual.
- A seleção atual permanece na URL e no estado local ao navegar entre a lista e a comparação.
- Com menos de dois selecionados, a tela orienta a selecionar mais um jogador.

### Resultado

- Tabela com uma coluna por jogador e linhas para score, jogos, vitórias, derrotas, aproveitamento, maior sequência de vitórias, maior sequência de derrotas, gabuadas e senas.
- Gráfico SVG com uma linha por jogador, legenda com avatar/nome e escala comum de 0 a 100.
- Matriz de confrontos: cada célula mostra vitórias do jogador da linha contra o jogador da coluna; diagonal fica vazia.
- Em empate, a célula usa “—”; em ausência de partidas, usa “0” sem destaque de vitória.
- Layout mobile permite rolagem horizontal apenas na tabela/matriz, preservando o cabeçalho e os controles.

## Dados e interfaces

Os cálculos serão adicionados à camada de domínio (`src/lib/stats.ts`) e consumidos por páginas sem duplicar regra:

```ts
interface PlayerScorePoint {
  gameId: string
  playedAt: string
  score: number
  result: 'win' | 'loss'
  opponentNames: string[]
  partnerName?: string
  gabuada: boolean
  sena: boolean
}

interface PlayerRelationship {
  playerId: string
  name: string
  photoUrl: string
  games: number
  wins: number
  losses: number
}

interface PlayerRelationships {
  mostWinsWith: PlayerRelationship[]
  mostLossesWith: PlayerRelationship[]
  mostWinsAgainst: PlayerRelationship[]
}
```

Funções públicas planejadas:

- `getPlayerScoreTimeline(players, games, playerId): PlayerScorePoint[]`
- `getPlayerRelationships(players, games, playerId): PlayerRelationships`
- `getHeadToHeadBetweenPlayers(players, games, playerIds): Record<string, Record<string, number>>`

As funções ignoram Convidado e usam a ordenação cronológica existente. O cálculo do score deve compartilhar o helper atual para evitar divergência entre ranking e gráfico.

## Componentes e arquivos

- `src/App.tsx`: reconhecer rotas dinâmicas `players/<id>` e `players/compare`, encaminhando os dados atuais.
- `src/components/AppShell.tsx`: manter Jogadores ativo em subrotas.
- `src/features/players/PlayersPage.tsx`: adicionar ações de abrir perfil e iniciar comparação.
- `src/features/players/PlayerProfilePage.tsx`: novo perfil individual.
- `src/features/players/PlayerComparePage.tsx`: nova seleção e resultado comparativo.
- `src/features/players/PlayerScoreChart.tsx`: novo SVG de evolução, reutilizado no perfil e comparação.
- `src/lib/stats.ts`: timeline, relacionamentos e matriz de confrontos.
- `src/index.css`: estilos responsivos seguindo os tokens neo-brutalistas existentes.

## Estados e acessibilidade

- Estado vazio para jogador sem jogos, comparação sem seleção e relações ausentes.
- URL inválida não quebra a aplicação.
- Botões e opções de seleção terão nomes acessíveis com nome do jogador e estado selecionado.
- Gráficos terão resumo textual equivalente para leitores de tela.
- Respeitar `prefers-reduced-motion` e não depender apenas de cor para indicar resultado.

## Verificação

- Testes de domínio para timeline, penalidade de sena perdida, desempates e matriz de confrontos.
- Testes de página para abrir perfil, voltar, limitar seleção a quatro e renderizar estado vazio.
- `npm test -- --run`, `npm run lint` e `npm run build` ao final.

