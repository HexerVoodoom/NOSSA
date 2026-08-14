import React from 'react';

export const DS = {
  typography: {
    hero: "text-5xl font-black tracking-tighter text-slate-900 leading-none",
    title: "text-4xl font-black tracking-tighter text-slate-900 leading-tight",
    section: "text-2xl font-bold tracking-tight text-slate-800",
    cardTitle: "text-lg font-bold text-slate-900",
    label: "text-sm font-bold tracking-wider text-slate-500",
    body: "text-sm font-normal text-slate-600 leading-relaxed",
    bodyEmphasis: "text-sm font-semibold text-slate-900",
    caption: "text-sm text-slate-400 font-medium italic",
  },
  buttons: {
    primary: "h-11 px-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all text-sm font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50",
    secondary: "h-11 px-6 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-all text-sm font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95",
    ghost: "p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-lg active:scale-90",
    danger: "h-11 px-6 rounded-xl bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all text-sm font-bold flex items-center justify-center gap-2 active:scale-95",
  },
  cards: {
    base: "bg-white border border-slate-200 rounded-3xl p-8 shadow-sm transition-all",
    interactive: "bg-white border border-slate-200 rounded-3xl p-8 shadow-sm transition-all hover:shadow-md hover:border-slate-300 cursor-pointer",
  },
  inputs: {
    base: "w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-2xl p-4 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400 font-normal",
    label: "text-sm font-bold tracking-wider text-slate-500 ml-1 mb-2 block",
  },
  layout: {
    maxWidth: "max-w-[1100px] mx-auto px-6",
    sectionGap: "space-y-16",
    itemGap: "space-y-6",
  }
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseClass = DS.buttons[variant];
  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

/**
 * Anel de foco padrão para alvos que não são <button>/<a> nativos.
 * Usa `focus-visible` (não `focus`): quem clica com o mouse não vê diferença
 * alguma, quem navega pelo teclado enxerga onde está.
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const NESTED_CONTROL_SELECTOR =
  'button, a[href], input, select, textarea, label, [role="button"], [role="radio"], [role="checkbox"], [role="link"]';

/**
 * Um card clicável costuma conter os próprios botões (exportar, excluir).
 * Sem esta guarda, acionar o botão interno dispararia TAMBÉM o handler do card
 * (duas ações por um clique). Não dependemos de `stopPropagation` em cada
 * chamador — a checagem fica no card, que é quem tem o problema.
 */
function isFromNestedControl(
  target: EventTarget | null,
  currentTarget: HTMLElement,
): boolean {
  if (!(target instanceof Element) || target === currentTarget) return false;
  const control = target.closest(NESTED_CONTROL_SELECTOR);
  return !!control && control !== currentTarget && currentTarget.contains(control);
}

/**
 * Semântica de botão para elementos que não são <button>: papel, foco por
 * teclado e ativação por Enter/Espaço. Espaço faz `preventDefault` para a
 * página não rolar. Usado pelo `Card interactive` e pelos cards de membro,
 * que têm layout próprio e não passam pelo `Card`.
 */
export function activationProps(onActivate: () => void) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      if (isFromNestedControl(e.target, e.currentTarget)) return;
      onActivate();
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      // Teclas digitadas dentro de um controle aninhado pertencem a ele.
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        onActivate();
      }
    },
  };
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, className = '', children, onClick, onKeyDown, ...props },
  ref,
) {
  const baseClass = interactive ? DS.cards.interactive : DS.cards.base;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive && isFromNestedControl(e.target, e.currentTarget)) return;
    onClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (!interactive || !onClick || e.defaultPrevented) return;
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  // `role`/`tabIndex` vêm antes de {...props} de propósito: quem precisa de
  // outra semântica (ex.: role="radio" num grupo) consegue sobrescrever.
  return (
    <div
      ref={ref}
      className={`${baseClass}${interactive ? ` ${focusRing}` : ''} ${className}`}
      {...(interactive ? { role: 'button', tabIndex: 0 } : {})}
      {...props}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={interactive || onKeyDown ? handleKeyDown : undefined}
    >
      {children}
    </div>
  );
});
