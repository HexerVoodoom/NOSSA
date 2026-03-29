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

export function Card({ interactive = false, className = '', children, ...props }: { interactive?: boolean; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  const baseClass = interactive ? DS.cards.interactive : DS.cards.base;
  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
