import { Gavel, Scale, ScrollText, ShieldCheck } from 'lucide-react'

import { DominoTile } from '../../components/DominoTile'

const ministers = [
  {
    id: 'cesar',
    name: 'César',
    role: 'Ministro-presidente',
    note: 'O bem prevalece.',
    crop: '50% 29%',
  },
  {
    id: 'david',
    name: 'David',
    role: 'Ministro da Apuração',
    note: 'Conta fechada é conta respeitada.',
    crop: '75% 29%',
  },
  {
    id: 'emanoel',
    name: 'Emanoel',
    role: 'Ministro da Resenha',
    note: 'Toda mesa tem memória.',
    crop: '24% 29%',
  },
  {
    id: 'machilas',
    name: 'Máchilas (Marcello)',
    role: 'Ministro da Defesa',
    note: 'A dupla não abandona o barco.',
    crop: '100% 29%',
  },
  {
    id: 'vinicius',
    name: 'Vinícius',
    role: 'Ministro dos Recursos',
    note: 'Sempre cabe mais uma.',
    crop: '2% 29%',
  },
]

const rules = [
  {
    number: '01',
    title: 'Quatro na mesa',
    text: 'Toda partida tem dois vencedores e dois perdedores diferentes.',
  },
  {
    number: '02',
    title: 'A batida é lei',
    text: 'Quem bateu leva a vitória. A discussão acaba antes da próxima mão.',
  },
  {
    number: '03',
    title: 'Gabuada é sentença',
    text: 'A Gabuada pertence a um vencedor e entra na súmula no momento do registro.',
  },
  {
    number: '04',
    title: 'Sena não escolhe lado',
    text: 'Qualquer jogador pode receber Sena, vencedor ou perdedor, mas só existe uma por partida.',
  },
  {
    number: '05',
    title: 'A súmula vale mais que a memória',
    text: 'O histórico registrado é a fonte oficial para rankings, recordes e provocações.',
  },
]

const precedents = [
  {
    icon: ShieldCheck,
    title: 'Presunção de resenha',
    text: 'Toda derrota é temporária e toda revanche pode ser registrada.',
  },
  {
    icon: Gavel,
    title: 'Princípio do placar',
    text: 'Número lançado na mesa vale mais do que opinião pós-jogo.',
  },
  {
    icon: ScrollText,
    title: 'Rito da súmula',
    text: 'Nome, dupla e resultado entram juntos no arquivo da casa.',
  },
]

export function HouseRulesPage() {
  return (
    <section className="page-wrap inner-page house-rules-page">
      <header className="house-rules-hero">
        <div>
          <p className="eyebrow">Regimento oficial da mesa</p>

          <h1>Superior Tribunal do Dominó</h1>

          <p>
            O STD julga as grandes questões da rodada: quem bateu, quem levou e
            quem vai ter que ouvir a resenha.
          </p>
        </div>

        <div
          className="tribunal-seal"
          aria-label="Selo do Superior Tribunal do Dominó"
        >
          <Scale size={38} strokeWidth={2.5} />

          <strong>STD</strong>

          <span>Casa de leis da mesa</span>
        </div>
      </header>

      <figure className="tribunal-official-photo">
        <div className="tribunal-photo-heading">
          <div>
            <span className="section-kicker">Composição oficial</span>

            <strong>Plenário do STD</strong>
          </div>

          <span className="tribunal-photo-stamp">Registro oficial</span>
        </div>

        <div className="tribunal-photo-frame">
          <img
            src="/assets/ministros-std.jpeg"
            alt="Vinícius, Emanoel, César, David e Machilas reunidos no Superior Tribunal do Dominó"
          />
        </div>

        <figcaption className="tribunal-photo-caption">
          <div>
            <strong>Superior Tribunal do Dominó</strong>

            <span>Sessão solene da composição atual</span>
          </div>

          <p>Vinícius • Emanoel • César • David • Machilas</p>
        </figcaption>
      </figure>

      <section className="house-rules-manifesto">
        <div className="house-rules-manifesto-copy">
          <span className="sticker sticker-yellow">
            Constituição da mesa
          </span>

          <h2>
            Jogar bonito é opcional.
            <br />
            Registrar direito, não.
          </h2>

          <p>
            Este regimento organiza a rivalidade, protege a súmula e garante
            que cada rodada tenha a sua versão oficial.
          </p>
        </div>

        <DominoTile left={5} right={2} label="Peça cinco dois" />
      </section>

      <section
        className="house-rules-section"
        aria-labelledby="rules-title"
      >
        <div className="house-rules-section-heading">
          <span className="section-kicker">
            Artigos fundamentais
          </span>

          <h2 id="rules-title">
            As regras da casa
          </h2>
        </div>

        <ol className="house-rules-list">
          {rules.map((rule) => (
            <li key={rule.number}>
              <span className="house-rule-number">
                {rule.number}
              </span>

              <div>
                <h3>{rule.title}</h3>

                <p>{rule.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="ministers-section"
        aria-label="Ministros em exercício"
      >
        <div className="house-rules-section-heading">
          <span className="section-kicker">
            Composição atual
          </span>

          <h2>Ministros em exercício</h2>
        </div>

        <div className="ministers-grid">
          {ministers.map((minister) => (
            <article
              className={`minister-card minister-card-${minister.id}`}
              key={minister.id}
            >
              <div
                className="minister-photo-avatar"
                role="img"
                aria-label={`Foto de ${minister.name}`}
                style={{
                  backgroundPosition: minister.crop,
                }}
              />

              <div className="minister-card-copy">
                <h3>{minister.name}</h3>

                <span>{minister.role}</span>

                <p>“{minister.note}”</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="precedents-section"
        aria-labelledby="precedents-title"
      >
        <div className="house-rules-section-heading">
          <span className="section-kicker">
            Decisões que já valem
          </span>

          <h2 id="precedents-title">
            Jurisprudência da resenha
          </h2>
        </div>

        <div className="precedents-list">
          {precedents.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={25} />

              <h3>{title}</h3>

              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}