---
name: "Dominó Zaaaap"
description: "O placar neo-brutalista das rivalidades da mesa."
colors:
  canvas: "#FFFDF5"
  surface: "#FFFFFF"
  ink: "#000000"
  hot-red: "#FF6B6B"
  vivid-yellow: "#FFD93D"
  soft-violet: "#C4B5FD"
  success: "#1F8A4C"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  none: "0px"
  tile: "6px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.hot-red}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 20px"
  button-secondary:
    backgroundColor: "{colors.vivid-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
---

# Design System: Dominó Zaaaap

## 1. Overview

**Creative North Star: "O cartaz da mesa de bar"**

Dominó Zaaaap parece um placar físico montado com cartazes, etiquetas e peças de dominó. O neo-brutalismo entrega a energia de uma disputa entre amigos: contornos pretos grossos, sombras sólidas, blocos de cor e pequenos desalinhamentos tornam cada ação tátil.

A estrutura nunca perde para a decoração. Números, nomes e tabelas permanecem alinhados; rotações e padrões ficam restritos a cabeçalhos, selos e peças decorativas. O sistema rejeita dashboard corporativo genérico de SaaS, minimalismo cinza, dark mode neon, glassmorphism, gradientes suaves, visual infantil e excesso de emojis.

**Key Characteristics:**

- Tema claro único com tela de papel quase branca.
- Estrutura preta espessa e sombras duras sem desfoque.
- Vermelho, amarelo e violeta como blocos funcionais.
- Interações mecânicas de pressionar e levantar.
- Peças de dominó recortadas nos cantos, nunca espalhadas por toda a tela.

## 2. Colors

A paleta parece tinta serigráfica sobre um cartaz claro: poucos tons, saturados e separados por preto puro.

### Primary

- **Vermelho da Rodada** (`#FF6B6B`): ações principais, destaques de liderança e confirmação de vencedores.

### Secondary

- **Amarelo da Mesa** (`#FFD93D`): filtros ativos, selos, avisos informais e chamadas secundárias.

### Tertiary

- **Violeta da Dupla** (`#C4B5FD`): rankings de duplas, superfícies alternadas e destaques menos urgentes.
- **Verde da Vitória** (`#1F8A4C`): texto e ícones de resultado positivo; nunca como preenchimento dominante.

### Neutral

- **Papel Claro** (`#FFFDF5`): tela principal.
- **Peça Branca** (`#FFFFFF`): cartões, campos e superfícies elevadas.
- **Tinta Preta** (`#000000`): texto, bordas, ícones e sombras.

### Named Rules

**The Hard Ink Rule.** Toda estrutura importante usa preto puro; cinzas sutis não substituem bordas ou texto.

**The Color Block Rule.** Cor comunica agrupamento e ênfase. Nunca criar gradientes ou colorir cada item sem motivo.

## 3. Typography

**Display Font:** Space Grotesk (com `system-ui, sans-serif`)
**Body Font:** Space Grotesk (com `system-ui, sans-serif`)

**Character:** Uma única família geométrica mantém os números claros e deixa os títulos pesados parecerem impressos. Pesos 700 e 900 carregam personalidade; corpo usa 500 para não cansar.

### Hierarchy

- **Display** (900, 48 px, 0.95): marca e grandes destaques, limitado a uma ocorrência por tela.
- **Headline** (900, 36 px, 1): títulos principais.
- **Title** (900, 28 px, 1.05): seções e cards importantes.
- **Body** (500, 16 px, 1.5): conteúdo e instruções, máximo de 70 caracteres por linha.
- **Label** (700, 12 px, `0.08em`, uppercase): estados, filtros e metadados curtos.

### Named Rules

**The One Shout Rule.** Apenas um elemento por região pode usar caixa alta grande; o restante preserva hierarquia.

## 4. Elevation

Profundidade é estrutural, não atmosférica. Sombras são blocos pretos deslocados para baixo e à direita, sempre com zero desfoque. Elementos pressionados deslocam-se sobre a própria sombra.

### Shadow Vocabulary

- **Click** (`4px 4px 0 #000000`): botões, chips e campos focados.
- **Card** (`8px 8px 0 #000000`): painéis principais e cards de ranking.
- **Hero** (`12px 12px 0 #000000`): somente um destaque por tela ampla.

### Named Rules

**The No Fog Rule.** Sombras suaves, glow, blur e glassmorphism são proibidos.

## 5. Components

### Buttons

- **Shape:** retangular e afiada (`0px`); pills apenas para filtros compactos.
- **Primary:** Vermelho da Rodada, borda preta de 3 px, sombra Click e altura mínima de 48 px.
- **Hover / Focus:** hover levanta 2 px; active avança 4 px e remove a sombra; foco usa contorno preto com offset amarelo.
- **Secondary / Ghost:** amarelo sólido ou branco com borda preta; nunca sem indicação de foco.

### Chips

- **Style:** pill apenas para períodos, status e amostra pequena; borda preta de 2 px.
- **State:** selecionado usa Amarelo da Mesa; não selecionado usa Peça Branca.

### Cards / Containers

- **Corner Style:** cantos retos (`0px`).
- **Background:** Peça Branca ou um bloco de cor funcional.
- **Shadow Strategy:** Card apenas nos painéis de primeira hierarquia.
- **Border:** 3 px preto; 2 px em linhas internas.
- **Internal Padding:** 16 px no celular e 24 px no desktop.

### Inputs / Fields

- **Style:** fundo branco, borda preta de 3 px, cantos retos e altura mínima de 48 px.
- **Focus:** fundo Amarelo da Mesa e sombra Click.
- **Error / Disabled:** mensagem textual explícita; disabled reduz contraste e mantém o contorno.

### Navigation

Barra superior simples no desktop e navegação inferior no celular. Item ativo recebe bloco amarelo e contorno preto. A ação “Nova partida” usa vermelho e permanece sempre alcançável.

### Domino Corner

Peça retangular dividida ao meio, com pontos reais de dominó. Pode ser parcialmente cortada pelo canto de um cabeçalho ou painel, com rotação de até 8 graus. Nunca interfere em texto ou alvos de toque.

## 6. Do's and Don'ts

### Do:

- **Do** usar bordas pretas de 2–4 px e sombras sem blur.
- **Do** manter estatísticas e tabelas geometricamente alinhadas.
- **Do** limitar rotações a selos, títulos curtos e peças decorativas.
- **Do** usar peças de dominó em alguns cantos como assinatura da marca.
- **Do** respeitar alvos de 44 px, foco visível e redução de movimento.

### Don't:

- **Don't** produzir um “dashboard corporativo genérico de SaaS”.
- **Don't** usar “minimalismo cinza, silencioso e sem personalidade”.
- **Don't** usar “dark mode neon, glassmorphism e gradientes suaves”.
- **Don't** criar “caos visual que dificulta a leitura das estatísticas”.
- **Don't** cair em “visual infantil ou excesso de emojis”.
- **Don't** usar sombras borradas, cards arredondados ou padrões em todas as superfícies.

