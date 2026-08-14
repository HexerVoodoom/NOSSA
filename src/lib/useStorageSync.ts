import { useEffect } from 'react';

/**
 * O evento nativo `storage` só dispara em OUTRAS abas/janelas quando o
 * localStorage muda — nunca na aba que fez a escrita. Sem isso, uma tela
 * (Membros, Cargos, Detalhe do Membro) deixada aberta em uma aba não via uma
 * competência/cargo editado em outra aba até um F5 manual.
 */
export function useStorageSync(keys: string[], onChange: () => void) {
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === null || keys.includes(e.key)) onChange();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join(','), onChange]);
}
