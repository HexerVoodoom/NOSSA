// Matchers de DOM (toBeInTheDocument, toHaveTextContent...) para os testes de
// componente. A variante `/vitest` registra em `expect` do vitest.
import '@testing-library/jest-dom/vitest';
import { beforeEach, afterEach, vi } from 'vitest';

// O localStorage do jsdom é compartilhado entre arquivos/testes do mesmo
// ambiente, então estado vaza de um teste para o outro e mascara bugs de
// inicialização ("já inicializado" por causa do teste anterior). Instalamos um
// mock novo, em memória, antes de CADA teste.
export interface MemoryStorage extends Storage {
  readonly store: Map<string, string>;
}

export function createMemoryStorage(): MemoryStorage {
  const store = new Map<string, string>();
  return {
    store,
    get length() {
      return store.size;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key: string) {
      return store.has(String(key)) ? (store.get(String(key)) as string) : null;
    },
    setItem(key: string, value: string) {
      store.set(String(key), String(value));
    },
    removeItem(key: string) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    },
  } as MemoryStorage;
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
  // storage.ts loga com console.log em DEV; silencia sem perder as chamadas.
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
