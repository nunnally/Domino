import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'
import { createLocalRepository } from './lib/local-repository'
import { createMemoryStorage } from './test/memory-storage'

describe('dashboard', () => {
  it('mostra a liderança e a ação de cadastrar partida', async () => {
    render(<App repository={createLocalRepository(createMemoryStorage())} />)

    expect(await screen.findByRole('heading', { level: 2, name: /^césar$/i })).toBeInTheDocument()
    expect(screen.getByText('O bem prevalece.')).toBeInTheDocument()
    expect(screen.getAllByText(/4 vitórias/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /nova partida/i })).toBeInTheDocument()
  })

  it('abre a página indicada no hash ao recarregar', async () => {
    window.location.hash = 'history'
    render(<App repository={createLocalRepository(createMemoryStorage())} />)

    expect(await screen.findByRole('heading', { level: 1, name: /histórico/i })).toBeInTheDocument()
    window.location.hash = ''
  })
})
