# PROMPT DE RECONSTRUÇÃO: Arquitetura de Carreira

**Contexto:** Você é um desenvolvedor especialista em React e Tailwind CSS. Sua tarefa é criar a aplicação "Arquitetura de Carreira", uma ferramenta de avaliação de desempenho para associados autônomos. A aplicação transforma notas em uma representação visual de uma construção arquitetônica (prédio).

---

## 🏗️ 1. PILARES TÉCNICOS
- **Framework:** React com Hooks (useState, useEffect, useRef).
- **Estilização:** Tailwind CSS v4 (Design System consistente).
- **Ícones:** Lucide-react.
- **Animações:** Motion (framer-motion).
- **Persistência:** LocalStorage centralizado em um arquivo `storage.ts`.
- **Funcionalidades Extras:** Exportação para PDF, Importação/Exportação de JSON (Backup).

---

## 🎨 2. IDENTIDADE VISUAL & DESIGN SYSTEM
- **Estilo Geral:** Página inicial com Glassmorphism (efeitos de desfoque, transparência e bordas brancas sutis). Páginas internas com Design System limpo usando a paleta `Slate` (Slate-50 a Slate-900).
- **Componentes Base:**
    - **Cards:** Arredondamento de 24px (rounded-3xl), borda slate-200.
    - **Botões:** Altura de 44px, arredondamento de 12px, fontes em negrito.
    - **Inputs:** Arredondamento de 16px, fundo slate-50.
- **Navegação:** Roteador interno baseado em estado (AppView) para transições suaves entre telas.

---

## 📂 3. MÓDULOS E FUNCIONALIDADES

### A. GESTÃO DE DADOS (CRUD)
1.  **Membros:** Cadastro de nome, sobrenome, cargo e histórico de avaliações.
2.  **Cargos:** Definição de competências por cargo e lista de "Atividades Técnicas".
3.  **Competências:** Estrutura modular em 6 blocos: Fundação, Pilares, Fachada, Horizonte, Detalhes e Propósito. Cada uma tem afirmações (Likert) e uma pergunta dialógica principal.

### B. MOTOR DE AVALIAÇÃO (O FLUXO)
- **Setup:** Escolha do avaliado, avaliador e modalidade.
- **Modalidades:** 
    1. **Tradicional:** Escala Likert (Nunca a Sempre).
    2. **Dialógica:** Perguntas abertas com 3 inputs para palavras-chave por competência. Escala: "Não funcionou" a "Funcionou muito bem".
    3. **Atividades:** Avaliação de tarefas técnicas (Insuficiente a Excepcional).
- **Interface:** Navegação por blocos com barra de progresso visual no topo e controles de navegação fixos no rodapé.

### C. VISUALIZADOR ARQUITETÔNICO (DiamondMesh)
- Transformação de dados: A média das notas de cada um dos 6 blocos seleciona um SVG específico (ex: Nota 5 no Bloco 1 = Piso luxuoso; Nota 1 = Piso rachado).
- **Z-Index:** Ordem de renderização: Piso > Paredes > Colunas > Portas > Janelas > Telhado.
- **Interatividade:** Drag-and-drop para posicionar elementos na tela. Salvar coordenadas X/Y de cada peça.

### D. GALERIA E RELATÓRIOS
- **Galeria:** Grade visual exibindo miniaturas de todas as "obras" concluídas.
- **WorkDetail:** Página dividida entre a visualização 2D da obra e um relatório detalhado com notas, palavras-chave e planos de ação (Comprometimentos).

---

## 🛠️ 4. ESTRUTURA DE ARQUIVOS SUGERIDA
- `/App.tsx`: Roteador central.
- `/components/DesignSystem.tsx`: Componentes UI padronizados.
- `/components/DiamondMesh.tsx`: Lógica de montagem visual.
- `/components/CategoryQuestionFlow.tsx`: Interface do questionário.
- `/lib/storage.ts`: Lógica de LocalStorage e persistência.
- `/lib/pdfExport.ts`: Função de geração de relatório PDF.

---

## 📝 5. REGRAS DE NEGÓCIO CRÍTICAS
1. Cada cargo deve poder ser editado para remover ou adicionar perguntas.
2. A aplicação deve permitir importar um JSON para restaurar todas as avaliações e membros.
3. Ao finalizar a avaliação, o sistema deve exigir a redação de "Comprometimentos" para cada bloco.
4. O componente `DiamondMesh` deve centralizar a obra automaticamente no modo de leitura (readonly).

---
**Instrução para a IA:** Comece criando o Design System e o arquivo de persistência (storage). Em seguida, implemente a HomePage e o fluxo de avaliação, finalizando com a lógica visual de montagem do prédio.
