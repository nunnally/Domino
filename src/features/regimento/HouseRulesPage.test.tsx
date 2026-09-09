import { render, screen, within } from '@testing-library/react'

import { describe, expect, it } from 'vitest'

import { HouseRulesPage } from './HouseRulesPage'

describe('HouseRulesPage', () => {
  it('apresenta o regimento e os cinco ministros da casa', () => {
    render(<HouseRulesPage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /superior tribunal do dominó/i,
      }),
    ).toBeInTheDocument()

    const ministers = screen.getByRole('region', {
      name: /ministros em exercício/i,
    })

    expect(
      within(ministers).getByText('César'),
    ).toBeInTheDocument()

    expect(
      within(ministers).getByText('David'),
    ).toBeInTheDocument()

    expect(
      within(ministers).getByText('Emanoel'),
    ).toBeInTheDocument()

    expect(
      within(ministers).getByText('Máchilas (Marcello)'),
    ).toBeInTheDocument()

    expect(
      within(ministers).getByText('Vinícius'),
    ).toBeInTheDocument()
  })

  it('mostra as regras fundamentais da mesa', () => {
    render(<HouseRulesPage />)

    expect(
      screen.getByText('Constituição da mesa'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        /dois vencedores e dois perdedores diferentes/i,
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        /a súmula vale mais que a memória/i,
      ),
    ).toBeInTheDocument()
  })

  it('mostra os retratos dos cinco ministros', () => {
    render(<HouseRulesPage />)

    const ministers = screen.getByRole('region', {
      name: /ministros em exercício/i,
    })

    expect(
      within(ministers).getByRole('img', {
        name: /foto de césar/i,
      }),
    ).toBeInTheDocument()

    expect(
      within(ministers).getByRole('img', {
        name: /foto de david/i,
      }),
    ).toBeInTheDocument()

    expect(
      within(ministers).getByRole('img', {
        name: /foto de emanoel/i,
      }),
    ).toBeInTheDocument()

    expect(
      within(ministers).getByRole('img', {
        name: /foto de máchilas/i,
      }),
    ).toBeInTheDocument()

    expect(
      within(ministers).getByRole('img', {
        name: /foto de vinícius/i,
      }),
    ).toBeInTheDocument()
  })
})