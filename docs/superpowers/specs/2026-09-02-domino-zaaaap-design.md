# Dominó Zaaaap — Especificação do MVP

## Objetivo

Criar uma aplicação web responsiva e divertida para registrar partidas de dominó entre amigos e derivar rankings individuais, rankings de duplas, confrontos diretos, melhores e piores desempenhos.

## Arquitetura

O frontend será uma SPA em React, Vite e TypeScript, publicada no GitHub Pages. A aplicação usará uma camada de repositório: quando `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` existirem, dados serão persistidos no Supabase; sem essas variáveis, o mesmo contrato usará `localStorage`, mantendo o aplicativo funcional durante desenvolvimento e demonstração.

Rankings não serão armazenados. Jogadores e partidas formam a fonte da verdade, e funções puras derivam todas as estatísticas. A navegação usará estado e hash, evitando incompatibilidade de rotas no GitHub Pages.

## Modelo de dados

### Player

- `id`: UUID/texto.
- `name`: nome canônico e único sem diferenciar maiúsculas/minúsculas.
- `photoUrl`: URL estática; avatares ilustrados provisórios serão usados até a troca.
- `active`: jogadores arquivados continuam no histórico.
- `createdAt`: ISO 8601.

### Game

- `id`: UUID/texto.
- `playedAt`: ISO 8601.
- `winnerIds`: exatamente dois jogadores distintos.
- `loserIds`: exatamente dois jogadores distintos e diferentes dos vencedores.
- `winnerScore` e `loserScore`: opcionais e reservados para estatísticas futuras.
- `createdAt`: ISO 8601.

## Dados iniciais

Seis jogadores: César, Vinícius, Machilas, Gustavo, David e Emanoel. Sete partidas reproduzem exatamente a lista fornecida pelo usuário. O seed deve gerar César com 4–1, Vinícius com 4–2, Machilas e Gustavo com 3–2, David com 0–3 e Emanoel com 0–4.

## Estatísticas

- Individual: jogos, vitórias, derrotas e aproveitamento.
- Duplas: jogos, vitórias, derrotas e aproveitamento, com chave canônica independente da ordem dos nomes.
- Confrontos: resultados agregados de dupla contra dupla.
- Ranking primário: vitórias; desempate por aproveitamento, menos derrotas e nome.
- “Pior dupla”: menor aproveitamento entre duplas com pelo menos três jogos; duplas abaixo disso recebem “amostra pequena”.
- Períodos: hoje, últimos 30 dias e histórico completo.
- Todas as telas exibem números absolutos junto do aproveitamento.

## Telas e fluxos

### Início

Cabeçalho com marca, filtro de período e ação “Nova partida”. Mostra líder individual, dupla líder, total de partidas, ranking resumido, mão quente, lanterna e confrontos em destaque. Últimas partidas fecham a página.

### Nova partida

Fluxo de uma tela: selecionar quatro jogadores sem repetição, organizar vencedores e perdedores, informar data e placar opcional e confirmar. A aplicação valida quatro participantes únicos e impede placar perdedor maior ou igual ao vencedor quando ambos forem preenchidos.

### Rankings

Abas para individual e duplas. Cada linha mostra posição, foto(s), nome(s), jogos, vitórias, derrotas e aproveitamento. Empates reais compartilham posição visual.

### Confrontos

Lista os confrontos entre duplas, placar agregado e dupla dominante. Textos “carrasco” e “freguesia” aparecem somente quando houve pelo menos dois confrontos.

### Jogadores

Lista jogadores ativos e arquivados. Com o modo de edição desbloqueado, qualquer pessoa pode cadastrar nome e URL de foto, editar ou arquivar. Exclusão física não faz parte do MVP.

### Histórico

Partidas em ordem decrescente, com data, duplas e placar quando disponível.

## PIN informal

O botão de cadastro solicita `VITE_SHARED_PIN`, com fallback de desenvolvimento `1234`. A validação acontece apenas no frontend e libera a sessão atual. O texto da interface deixa claro que é uma trava informal. Leituras são públicas; no Supabase, escritas também poderão ser públicas no MVP.

## Design e responsividade

Seguir `DESIGN.md`. O tema é neo-brutalista claro único: papel `#FFFDF5`, superfícies brancas, preto puro, vermelho `#FF6B6B`, amarelo `#FFD93D` e violeta `#C4B5FD`. Contornos de 2–4 px, sombras duras e poucos elementos rotacionados. Peças de dominó aparecem nos cantos do cabeçalho e de painéis especiais.

No celular, navegação inferior fixa, ações de 44 px ou mais, tabelas convertidas em linhas compactas e formulário em uma coluna. No desktop, conteúdo limitado a 1200 px e navegação superior. `prefers-reduced-motion` remove movimento contínuo e encurta transições.

## Falhas e estados

- Loading: esqueletos geométricos sem spinner central.
- Vazio: explicar como cadastrar a primeira partida.
- Erro de leitura: manter dados locais quando possível e oferecer tentar novamente.
- Erro de escrita: preservar o formulário e mostrar mensagem junto da ação.
- Imagem inválida: fallback de iniciais.

## Testes e aceite

- Funções de estatística cobertas por Vitest com os sete jogos reais.
- Validação de partidas cobre jogadores repetidos e placar inválido.
- Repositório local cobre seed e persistência.
- Teste de componente cobre cadastro de uma partida.
- `npm test`, `npm run lint` e `npm run build` terminam sem falhas.
- QA visual em aproximadamente 360 px e 1280 px confirma ausência de overflow, navegação utilizável e contraste legível.

