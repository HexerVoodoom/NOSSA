import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

function Boom({ message = 'explodiu na renderização' }: { message?: string }): JSX.Element {
  throw new Error(message);
}

describe('ErrorBoundary', () => {
  it('renderiza os filhos quando nada quebra', () => {
    render(
      <ErrorBoundary>
        <p>conteúdo normal</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('conteúdo normal')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('captura um filho que estoura e mostra o fallback em vez de tela branca', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    // A mensagem técnica é exibida para dar contexto ao suporte.
    expect(screen.getByText('explodiu na renderização')).toBeInTheDocument();
    // O erro é logado (console.error está mockado no setup global).
    expect(console.error).toHaveBeenCalled();
  });

  it('o botão Recarregar dispara window.location.reload', () => {
    const reload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload },
      configurable: true,
      writable: true,
    });

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    screen.getByRole('button', { name: /Recarregar/ }).click();
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
