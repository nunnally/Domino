# Perfis e comparação de jogadores Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar perfis individuais com evolução de score e uma comparação de até quatro jogadores na área Jogadores.

**Architecture:** Manter o hash-router atual, adicionando as subrotas `players/<id>` e `players/compare`. Concentrar timeline, relacionamentos e confrontos em `src/lib/stats.ts`; páginas e componentes apenas apresentam os dados derivados, sem nova persistência.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, lucide-react e SVG nativo para gráficos.

**Spec:** `docs/superpowers/specs/2026-09-10-jogadores-perfis-comparacao-design.md`

## Global Constraints

- Convidado não aparece em perfis, comparação ou cálculos de relacionamento.
- O score do gráfico usa a mesma fórmula do ranking, com escala fixa de 0 a 100 e penalidade de 0,05 por sena perdida.
- A seleção de comparação aceita no máximo quatro jogadores reais.
- Não adicionar dependências de gráficos nem colunas novas ao Supabase.
- Toda tela nova deve ser responsiva, acessível e compatível com `prefers-reduced-motion`.

---

### Task 1: Cálculos de timeline e relacionamentos

**Files:**
- Modify: `src/lib/stats.ts`
- Modify: `src/lib/types.ts`
- Test: `src/lib/stats.test.ts`

**Interfaces:**
- Produz `PlayerScorePoint`, `PlayerRelationship`, `PlayerRelationships` conforme a especificação.
- Produz `getPlayerScoreTimeline(players, games, playerId): PlayerScorePoint[]`.
- Produz `getPlayerRelationships(players, games, playerId): PlayerRelationships`.
- Produz `getHeadToHeadBetweenPlayers(players, games, playerIds): Record<string, Record<string, number>>`.

- [ ] **Step 1: Escrever testes de timeline e relações que falham**

Adicionar ao fixture existente jogos cronológicos com vitória, derrota, sena perdida, parceiros e adversários. Cobrir:

```ts
it('calcula pontos de score em ordem cronológica e marca o resultado', () => {
  const points = getPlayerScoreTimeline(seedPlayers, games, cesarId)
  expect(points.map(point => point.result)).toEqual(['win', 'loss'])
  expect(points[1].score).toBeLessThanOrEqual(100)
  expect(points[1].sena).toBe(true)
})

it('retorna parceiros e adversários com empate completo', () => {
  const result = getPlayerRelationships(seedPlayers, games, cesarId)
  expect(result.mostWinsWith.map(player => player.name)).toEqual(['Vinícius'])
  expect(result.mostWinsAgainst[0].wins).toBe(2)
})

it('monta matriz de confrontos sem Convidado', () => {
  const matrix = getHeadToHeadBetweenPlayers(seedPlayers, games, [cesarId, viniciusId])
  expect(matrix[cesarId][viniciusId]).toBe(1)
  expect(matrix[viniciusId][viniciusId]).toBe(0)
})
```

- [ ] **Step 2: Rodar os testes para confirmar a falha**

Run: `npm test -- --run src/lib/stats.test.ts`
Expected: FAIL informando que as funções/tipos ainda não existem.

- [ ] **Step 3: Implementar os cálculos mínimos**

Reutilizar `compareChronologically`, `scoreFromRecord` e `isGuestPlayer`. Para cada participação do jogador, atualizar vitórias/derrotas e emitir um ponto após a partida. Para relações, contar parceiro quando o jogador está no mesmo time e adversário quando está no time oposto; ordenar por contagem, depois nome em `pt-BR`; excluir Convidado.

- [ ] **Step 4: Rodar os testes de domínio**

Run: `npm test -- --run src/lib/stats.test.ts`
Expected: PASS nos testes existentes e novos.

- [ ] **Step 5: Commitar o domínio**

```bash
git add src/lib/stats.ts src/lib/types.ts src/lib/stats.test.ts
git commit -m "feat: adiciona analises individuais de jogadores"
```

### Task 2: Gráfico SVG reutilizável

**Files:**
- Create: `src/features/players/PlayerScoreChart.tsx`
- Modify: `src/index.css`
- Test: `src/features/players/PlayerScoreChart.test.tsx`

**Interfaces:**
- Consumes `PlayerScoreChartProps = { points?: PlayerScorePoint[]; series?: PlayerScoreSeries[]; label: string }`, onde `PlayerScoreSeries = { id: string; label: string; photoUrl: string; points: PlayerScorePoint[]; color: string }`.
- Produz `<svg role="img">` com linhas, pontos, legenda e resumo textual equivalente.

- [ ] **Step 1: Escrever teste de acessibilidade e estado vazio**

```tsx
it('renderiza resumo textual e pontos da série', () => {
  render(<PlayerScoreChart points={points} label="Evolução de César" />)
  expect(screen.getByRole('img', { name: 'Evolução de César' })).toBeInTheDocument()
  expect(screen.getByText(/score inicial/i)).toBeInTheDocument()
})

it('mostra estado vazio quando não há partidas', () => {
  render(<PlayerScoreChart points={[]} label="Evolução" />)
  expect(screen.getByText(/ainda não há partidas/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `npm test -- --run src/features/players/PlayerScoreChart.test.tsx`
Expected: FAIL porque o componente ainda não existe.

- [ ] **Step 3: Implementar SVG fixo de 0 a 100**

Mapear `score` para a altura do viewBox, desenhar eixos simples, linha com `polyline`, pontos com `<circle>`, tooltip nativo via `<title>` e uma lista textual com data, resultado e score. Não usar escala automática que dificulte comparação.

- [ ] **Step 4: Estilizar estados desktop/mobile**

Adicionar classes para superfície, legenda, cores semânticas e rolagem horizontal apenas quando várias séries excederem a largura móvel. Desativar transições do gráfico em `prefers-reduced-motion`.

- [ ] **Step 5: Rodar o teste e commitar**

Run: `npm test -- --run src/features/players/PlayerScoreChart.test.tsx`
Expected: PASS.

```bash
git add src/features/players/PlayerScoreChart.tsx src/features/players/PlayerScoreChart.test.tsx src/index.css
git commit -m "feat: cria grafico de evolucao de score"
```

### Task 3: Perfil individual

**Files:**
- Create: `src/features/players/PlayerProfilePage.tsx`
- Modify: `src/index.css`
- Test: `src/features/players/PlayerProfilePage.test.tsx`

**Interfaces:**
- Consumes `player: Player`, `players: Player[]`, `games: Game[]`, `onBack: () => void`, `onCompare: (playerId: string) => void`.
- Usa `getIndividualStats`, `getPlayerScoreTimeline` e `getPlayerRelationships`.

- [ ] **Step 1: Escrever testes de perfil**

Cobrir renderização do nome/avatar/score, cards de “Mais vitórias com”, “Mais derrotas com”, “Mais vitórias contra”, estado sem partidas e callbacks de voltar/comparar.

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `npm test -- --run src/features/players/PlayerProfilePage.test.tsx`
Expected: FAIL porque a página ainda não existe.

- [ ] **Step 3: Implementar a página**

Criar cabeçalho com botão voltar, avatar, frase e botão comparar; resumo de métricas; `PlayerScoreChart`; três blocos de relações e uma lista curta das últimas partidas. Nunca renderizar Convidado.

- [ ] **Step 4: Adicionar estilos responsivos**

Usar os tokens existentes, manter hierarquia neo-brutalista e transformar a grade em coluna no celular. Garantir foco visível e texto alternativo.

- [ ] **Step 5: Rodar testes e commitar**

Run: `npm test -- --run src/features/players/PlayerProfilePage.test.tsx`
Expected: PASS.

```bash
git add src/features/players/PlayerProfilePage.tsx src/features/players/PlayerProfilePage.test.tsx src/index.css
git commit -m "feat: adiciona perfil individual de jogador"
```

### Task 4: Seleção e comparação de jogadores

**Files:**
- Create: `src/features/players/PlayerComparePage.tsx`
- Modify: `src/index.css`
- Test: `src/features/players/PlayerComparePage.test.tsx`

**Interfaces:**
- Consumes `players`, `games`, `initialPlayerIds: string[]`, `onBack`, `onOpenProfile`.
- Usa `getIndividualStats` e `getHeadToHeadBetweenPlayers`.

- [ ] **Step 1: Escrever testes de seleção e limite**

```tsx
it('seleciona jogadores e bloqueia o quinto', async () => {
  const user = userEvent.setup()
  render(<PlayerComparePage players={fivePlayers} games={[]} initialPlayerIds={[]} onBack={vi.fn()} onOpenProfile={vi.fn()} />)
  await user.click(screen.getByRole('checkbox', { name: /césar/i }))
  await user.click(screen.getByRole('checkbox', { name: /david/i }))
  await user.click(screen.getByRole('checkbox', { name: /emanoel/i }))
  await user.click(screen.getByRole('checkbox', { name: /machilas/i }))
  expect(screen.getByRole('checkbox', { name: /quinto jogador/i })).toBeDisabled()
})

it('exibe orientação com menos de dois selecionados', () => {
  render(<PlayerComparePage players={players} games={[]} initialPlayerIds={[cesarId]} onBack={vi.fn()} onOpenProfile={vi.fn()} />)
  expect(screen.getByText(/selecione mais um jogador/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Rodar o teste para confirmar a falha**

Run: `npm test -- --run src/features/players/PlayerComparePage.test.tsx`
Expected: FAIL porque a página ainda não existe.

- [ ] **Step 3: Implementar seleção e resultado**

Renderizar opções reais com avatar/nome/score, controlar `selectedIds`, impedir o quinto, mostrar tabela comparativa, linhas SVG por jogador via `PlayerScoreChart` e matriz de confrontos. Usar rolagem horizontal somente nos blocos densos.

- [ ] **Step 4: Implementar estados vazios e acessibilidade**

Descrever seleção nos labels, manter botões de voltar/perfil, exibir “—” na diagonal/empate e “0” para ausência de jogos. O Convidado nunca deve aparecer.

- [ ] **Step 5: Rodar testes e commitar**

Run: `npm test -- --run src/features/players/PlayerComparePage.test.tsx`
Expected: PASS.

```bash
git add src/features/players/PlayerComparePage.tsx src/features/players/PlayerComparePage.test.tsx src/index.css
git commit -m "feat: adiciona comparacao de jogadores"
```

### Task 5: Rotas e integração com Jogadores

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/features/players/PlayersPage.tsx`
- Modify: `src/features/players/PlayersPage.test.tsx`

**Interfaces:**
- `App` interpreta `#players`, `#players/<id>` e `#players/compare`.
- `PlayersPage` recebe callbacks `onOpenProfile` e `onCompare`.

- [ ] **Step 1: Escrever testes de navegação**

Adicionar teste que aciona “Ver perfil” e confirma o callback com o id; adicionar teste que aciona “Comparar jogadores”. Testar que uma rota inválida retorna à lista.

- [ ] **Step 2: Implementar parsing de hash e renderização condicional**

Manter `PageId` em `players` e derivar o subtipo/`playerId` a partir do hash. Atualizar `navigate` para preservar ids; `AppShell` marca Jogadores ativo em qualquer `players/*`.

- [ ] **Step 3: Integrar ações nos cards**

Adicionar botão acessível “Ver perfil de <nome>” em cada jogador real e ação “Comparar jogadores” na toolbar. Não alterar o fluxo existente de edição/PIN.

- [ ] **Step 4: Rodar testes de integração**

Run: `npm test -- --run src/features/players/PlayersPage.test.tsx`
Expected: PASS com os testes existentes e novos.

- [ ] **Step 5: Commitar a integração**

```bash
git add src/App.tsx src/components/AppShell.tsx src/features/players/PlayersPage.tsx src/features/players/PlayersPage.test.tsx
git commit -m "feat: integra perfis e comparacao na navegacao"
```

### Task 6: Verificação final

**Files:**
- Verify: todos os arquivos das tarefas anteriores.

- [ ] **Step 1: Rodar a suíte completa**

Run: `npm test -- --run`
Expected: todos os testes passando.

- [ ] **Step 2: Verificar lint e build**

Run: `npm run lint && npm run build`
Expected: ESLint sem erros e build Vite concluído.

- [ ] **Step 3: Conferir o fluxo no navegador**

Abrir `http://127.0.0.1:5173/#players`, abrir um perfil, voltar, selecionar quatro jogadores e conferir o gráfico/matriz em viewport desktop e mobile.

- [ ] **Step 4: Revisar diff e commitar ajustes finais**

```bash
git diff --check
git status --short
```

Corrigir qualquer erro de formatação antes do commit final de ajustes.
