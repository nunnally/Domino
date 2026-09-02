# Dominó Zaaaap MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma SPA responsiva que registra partidas e jogadores, calcula rankings e funciona com localStorage ou Supabase.

**Architecture:** Funções puras em `src/lib/stats.ts` derivam estatísticas a partir de jogadores e partidas. `src/lib/repository.ts` expõe um contrato único implementado por localStorage e Supabase; hooks React consomem esse contrato sem conhecer o backend.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS 4, Supabase JS 2, Vitest, Testing Library e Lucide React.

**Spec:** `docs/superpowers/specs/2026-09-02-domino-zaaaap-design.md`

## Global Constraints

- Tema claro único conforme `DESIGN.md`; nenhuma versão dark.
- Partidas sempre têm dois vencedores e dois perdedores distintos.
- Rankings são derivados, nunca persistidos.
- Sem credenciais Supabase, o app deve funcionar integralmente com localStorage.
- Navegação compatível com GitHub Pages e telas a partir de 320 px.
- PIN é apenas uma trava informal no frontend.

---

### Task 1: Domínio de partidas e estatísticas

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/seed.ts`
- Create: `src/lib/stats.ts`
- Test: `src/lib/stats.test.ts`

**Interfaces:**
- Produces: `Player`, `Game`, `PeriodFilter`, `getIndividualStats`, `getPairStats`, `getHeadToHeadStats`, `filterGamesByPeriod`.

- [ ] **Step 1: Write the failing tests** com fixture literal dos sete jogos e expectativas independentes:

```ts
import { describe, expect, it } from 'vitest'
import { seedGames, seedPlayers } from './seed'
import { getHeadToHeadStats, getIndividualStats, getPairStats } from './stats'

describe('estatísticas do seed', () => {
  it('calcula o histórico individual de César', () => {
    const cesar = getIndividualStats(seedPlayers, seedGames).find((row) => row.name === 'César')
    expect(cesar).toMatchObject({ games: 5, wins: 4, losses: 1, winRate: 80 })
  })

  it('calcula a dupla César e Vinícius', () => {
    const pair = getPairStats(seedPlayers, seedGames).find((row) => row.label === 'César & Vinícius')
    expect(pair).toMatchObject({ games: 5, wins: 4, losses: 1, winRate: 80 })
  })

  it('calcula o confronto com Machilas e Gustavo', () => {
    const match = getHeadToHeadStats(seedPlayers, seedGames).find((row) =>
      row.pairLabels.includes('César & Vinícius') && row.pairLabels.includes('Gustavo & Machilas'))
    expect(match?.scoreByPair['César & Vinícius']).toBe(2)
    expect(match?.scoreByPair['Gustavo & Machilas']).toBe(1)
  })
})
```
- [ ] **Step 2: Run `npm test -- src/lib/stats.test.ts`** e confirmar falha por módulos ausentes.
- [ ] **Step 3: Implement types, seed and pure aggregations** com chaves canônicas de dupla ordenadas por ID.
- [ ] **Step 4: Run `npm test -- src/lib/stats.test.ts`** e confirmar todos os casos verdes.
- [ ] **Step 5: Commit** `test: define domino ranking rules`.

### Task 2: Validação e persistência

**Files:**
- Create: `src/lib/validation.ts`
- Create: `src/lib/repository.ts`
- Create: `src/lib/local-repository.ts`
- Create: `src/lib/supabase-repository.ts`
- Create: `src/lib/repository.test.ts`
- Create: `src/lib/validation.test.ts`

**Interfaces:**
- Consumes: `Player`, `Game`, seed exports.
- Produces: `validateGameDraft(draft): Record<string,string>`, `DominoRepository`, `createRepository()`.

- [ ] **Step 1: Write failing tests** para quatro jogadores únicos, placar válido, seed automático e persistência após nova instância:

```ts
it('rejeita participante repetido', () => {
  expect(validateGameDraft({
    winnerIds: ['cesar', 'cesar'], loserIds: ['david', 'emanoel'], playedAt: '2026-09-02'
  })).toHaveProperty('players')
})

it('persiste uma partida para outra instância', async () => {
  const storage = createMemoryStorage()
  const first = createLocalRepository(storage)
  await first.addGame(validGame)
  const second = createLocalRepository(storage)
  expect((await second.listGames()).some((game) => game.id === validGame.id)).toBe(true)
})
```
- [ ] **Step 2: Run `npm test -- src/lib/validation.test.ts src/lib/repository.test.ts`** e confirmar falhas esperadas.
- [ ] **Step 3: Implement minimal validation and repository contract** usando armazenamento injetável para teste.
- [ ] **Step 4: Implement Supabase adapter** mapeando `players` e `games`; selecionar adapter apenas quando as duas variáveis existirem.
- [ ] **Step 5: Run the focused tests** e confirmar zero falhas.
- [ ] **Step 6: Commit** `feat: add local and supabase persistence`.

### Task 3: Shell e dashboard

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `src/components/AppShell.tsx`
- Create: `src/components/DominoTile.tsx`
- Create: `src/features/rankings/Dashboard.tsx`
- Create: `src/features/rankings/RankingTable.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: repository and statistics functions.
- Produces: app navigation and dashboard surfaces.

- [ ] **Step 1: Write a failing component test** que renderiza os dados e a ação principal:

```tsx
render(<App repository={createLocalRepository(createMemoryStorage())} />)
expect(await screen.findByText('César')).toBeInTheDocument()
expect(screen.getByText(/4 vitórias/i)).toBeInTheDocument()
expect(screen.getByRole('button', { name: /nova partida/i })).toBeInTheDocument()
```
- [ ] **Step 2: Run `npm test -- src/App.test.tsx`** e confirmar falha por componente ausente.
- [ ] **Step 3: Implement app data hook, shell, period filter and dashboard** seguindo os tokens de `DESIGN.md`.
- [ ] **Step 4: Run the component test** e confirmar verde.
- [ ] **Step 5: Commit** `feat: build neo brutalist rankings dashboard`.

### Task 4: Cadastro de partida e PIN

**Files:**
- Create: `src/features/games/GameForm.tsx`
- Create: `src/features/games/PinGate.tsx`
- Test: `src/features/games/GameForm.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `validateGameDraft`, active players and `repository.addGame`.
- Produces: validated game creation and session unlock state.

- [ ] **Step 1: Write a failing interaction test** que escolhe quatro jogadores e salva:

```tsx
const user = userEvent.setup()
const onSave = vi.fn()
render(<GameForm players={seedPlayers} onSave={onSave} onCancel={() => {}} />)
await user.selectOptions(screen.getByLabelText('Vencedor 1'), 'cesar')
await user.selectOptions(screen.getByLabelText('Vencedor 2'), 'vinicius')
await user.selectOptions(screen.getByLabelText('Perdedor 1'), 'david')
await user.selectOptions(screen.getByLabelText('Perdedor 2'), 'emanoel')
await user.click(screen.getByRole('button', { name: /salvar partida/i }))
expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
  winnerIds: ['cesar', 'vinicius'], loserIds: ['david', 'emanoel']
}))
```
- [ ] **Step 2: Run the focused test** e confirmar falha por formulário ausente.
- [ ] **Step 3: Implement PIN gate and one-screen form** preservando valores quando houver erro.
- [ ] **Step 4: Run focused and full tests** e confirmar zero falhas.
- [ ] **Step 5: Commit** `feat: add quick match registration`.

### Task 5: Rankings completos, confrontos, jogadores e histórico

**Files:**
- Create: `src/features/rankings/RankingsPage.tsx`
- Create: `src/features/rankings/HeadToHeadPage.tsx`
- Create: `src/features/players/PlayersPage.tsx`
- Create: `src/features/games/HistoryPage.tsx`
- Modify: `src/App.tsx`
- Test: `src/features/rankings/RankingsPage.test.tsx`

**Interfaces:**
- Consumes: all stats, repository CRUD and unlock state.
- Produces: remaining MVP screens.

- [ ] **Step 1: Write a failing ranking screen test** para números e amostra mínima:

```tsx
render(<RankingsPage players={seedPlayers} games={seedGames} />)
expect(screen.getByRole('row', { name: /césar.*4.*1.*80%/i })).toBeInTheDocument()
await userEvent.click(screen.getByRole('tab', { name: /duplas/i }))
expect(screen.getByText('Emanoel & Vinícius')).toBeInTheDocument()
expect(screen.getByText(/amostra pequena/i)).toBeInTheDocument()
```
- [ ] **Step 2: Run it and confirm expected failure.**
- [ ] **Step 3: Implement pages and responsive rows** sem tabelas com overflow no celular.
- [ ] **Step 4: Run full tests** e confirmar verde.
- [ ] **Step 5: Commit** `feat: complete rivalry and player views`.

### Task 6: Supabase schema, tooling and production verification

**Files:**
- Create: `supabase/migrations/202609020001_initial_schema.sql`
- Create: `.env.example`
- Create: `README.md`
- Create: `.github/workflows/deploy.yml`
- Modify: `package.json`

**Interfaces:**
- Consumes: runtime adapter contract and deployment requirements.
- Produces: reproducible database and GitHub Pages deployment.

- [ ] **Step 1: Add SQL tables, constraints, public RLS policies and seed data** matching `src/lib/seed.ts`. The migration creates `players` and `games`, uses UUID primary keys, `text[]` arrays constrained to cardinality two, enables RLS and grants `select/insert/update` to `anon` and `authenticated` through explicit `using (true)` / `with check (true)` MVP policies.
- [ ] **Step 2: Document local run, PIN and Supabase environment variables** with exact commands.
- [ ] **Step 3: Run `npm test`, `npm run lint` and `npm run build`.**
- [ ] **Step 4: Start preview and inspect at 360 px and 1280 px**; fix overflow, focus and layout defects.
- [ ] **Step 5: Re-run all verification commands** after visual fixes.
- [ ] **Step 6: Commit** `chore: prepare domino zaaaap deployment`.
