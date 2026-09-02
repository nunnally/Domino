# Dominó Zaaaap

Placar divertido e responsivo para registrar partidas de dominó, acompanhar rankings individuais e de duplas, confrontos diretos, lanternas e histórico.

## Rodar agora

Requer Node.js 22 ou mais recente.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sem configurar o Supabase, o projeto já funciona por completo no navegador e salva tudo em `localStorage`. Os sete jogos iniciais são carregados automaticamente. O PIN padrão para cadastrar partidas e editar jogadores é `1234`.

## Usar Supabase Free

1. Crie um projeto no Supabase.
2. Abra o **SQL Editor**, copie todo o conteúdo de [`supabase/migrations/202609020001_initial_schema.sql`](supabase/migrations/202609020001_initial_schema.sql) e execute uma vez.
3. Em **Project Settings → API**, copie a URL do projeto e a chave pública/publishable.
4. Preencha `.env.local`:

```env
VITE_SHARED_PIN=troque-este-pin
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

As políticas do banco são deliberadamente abertas para leitura e cadastro, pois este é um projeto informal. O PIN também está no frontend: ele evita alterações acidentais, mas não é segurança real.

## Fotos e novos jogadores

Cada jogador aceita uma URL estática de foto. Se a URL ficar vazia, o app gera automaticamente um avatar pelo DiceBear. Depois de informar o PIN em **Nova partida**, a tela **Jogadores** libera cadastro, arquivamento e reativação.

## Verificar a aplicação

```bash
npm test
npm run lint
npm run build
npm run preview
```

## Publicar no GitHub Pages

O workflow em `.github/workflows/deploy.yml` publica automaticamente cada push na branch `main`.

No repositório do GitHub:

1. Em **Settings → Pages**, escolha **GitHub Actions** como source.
2. Em **Settings → Secrets and variables → Actions**, cadastre os secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Opcionalmente, crie a variável `VITE_SHARED_PIN`; sem ela, o deploy usa `1234`.
4. Faça push para `main` e acompanhe o workflow **Deploy GitHub Pages**.

O app usa navegação por hash e caminhos relativos, portanto funciona em um subdiretório do GitHub Pages sem configuração adicional.
