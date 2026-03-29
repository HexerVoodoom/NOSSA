# 🏗️ Planta Baixa Detalhada: Arquitetura de Carreira

Este documento é o guia definitivo para a reconstrução total da aplicação. Ele descreve a interface, a lógica de dados e as regras de negócio com precisão técnica.

---

## 🎨 1. Identidade Visual e Design System (Tokens)

A aplicação utiliza uma base de **Tailwind CSS v4** com um sistema de design centralizado em `DesignSystem.tsx`.

### Tipografia (Font: Sans-serif/Inter)
*   **Hero:** `text-5xl font-black tracking-tighter` (Títulos de impacto).
*   **Título:** `text-4xl font-black tracking-tighter` (Nomes de seções).
*   **Card Title:** `text-lg font-bold text-slate-900`.
*   **Label:** `text-sm font-bold tracking-wider text-slate-500` (Letras maiúsculas para rótulos).

### Componentes de Interface
*   **Botão Primário:** Altura 44px (h-11), 24px de padding lateral, arredondamento 12px (rounded-xl), cor `slate-900` com texto branco.
*   **Cards:** Fundo branco, borda `slate-200`, arredondamento 24px (rounded-3xl), sombra suave (shadow-sm).
*   **Inputs:** Fundo `slate-50`, arredondamento 16px (rounded-2xl), borda `slate-200`. No foco: borda `slate-400` e fundo branco.
*   **Efeito Glassmorphism:** Aplicado na Home e Headers de Avaliação usando `backdrop-blur-md` com fundo `white/10` ou `slate-900/60`.

---

## 🏠 2. Página Inicial (HomePage.tsx)

### Layout
1.  **Header:** Altura fixa, logo à esquerda, título centralizado "Arquitetura de Carreira", botão "Manual" e "FileManager" (export/import) à direita.
2.  **Seção Hero (Background):** Imagem de fundo cobrindo toda a área sob o header, com um overlay de brilho.
3.  **Botão de Ação Principal (Nova Avaliação):** Card grande, ocupa largura total. Ícone de prédio (`Building2`) em destaque num quadrado branco à esquerda. Texto em negrito.
4.  **Botão de Atalho (Avaliações Salvas):** Card médio, logo abaixo do principal.
5.  **Grid de Gestão:** 3 colunas (Membros, Cargos, Competências). Cada card tem um ícone centralizado acima do texto.
6.  **Footer:** Faixa com gradiente `slate-200` para `slate-300`, logos da Tortola e NOSSA nas extremidades.

---

## 🚀 3. Fluxo de Configuração (EvaluationStart.tsx)

### Lógica de Seleção
*   **Passo 1:** Seleção de Cargo (Dropdown que carrega as competências vinculadas).
*   **Passo 2:** Seleção de Líder e de Associado (Filtro que impede selecionar a mesma pessoa).
*   **Passo 3 (Modalidade):** 3 Cards interativos para escolher o tipo de avaliação:
    *   *Tradicional:* Foco em afirmações objetivas (Likert: Nunca a Sempre).
    *   *Dialógica:* Foco em perguntas abertas e reflexão (Likert: Funcionou Pouco a Muito Bem).
    *   *Atividades:* Avaliação técnica de itens específicos do cargo (Likert: Insuficiente a Excepcional).

---

## ✍️ 4. Motor de Avaliação (CategoryQuestionFlow.tsx)

### Estrutura da Página
*   **Header de Progresso:** Nome da categoria (ex: "Fundação"), nome do avaliado e um contador (ex: "1/6").
*   **Barra de Navegação Inferior:** Fixa no rodapé (sticky). Botão "Voltar", indicador visual de progresso (dots) e botão "Próxima Seção/Finalizar".

### O Card de Pergunta
1.  **Tag de Competência:** Nome da competência em uma badge preta no topo.
2.  **Enunciado:** Texto grande (`text-2xl font-bold`).
3.  **Palavras-chave (Apenas Dialógica):** 3 inputs lado a lado para "Tópicos Principais".
4.  **Escala de Notas:** 5 botões numerados de 1 a 5. Ao selecionar, o botão fica preto (`slate-900`) e ganha um efeito de escala (zoom 1.05).
5.  **Observações:** Um campo de `textarea` ao final de cada bloco para comentários livres.

---

## 🏛️ 5. Visualização "A Obra" (DiamondMesh.tsx)

Este é o componente que transforma notas em arquitetura. Ele usa um Canvas invisível ou uma grade absoluta.

### Metáfora Arquitetônica (Notas -> SVGs)
As notas (1 a 5) selecionam qual variação de SVG será usada de cada categoria:
*   **Bloco 1 (Fundação):** Notas definem o tipo de **Piso/Base**.
*   **Bloco 2 (Estrutura):** Notas definem o estilo das **Colunas**.
*   **Bloco 3 (Fachada):** Notas definem a textura das **Paredes**.
*   **Bloco 4 (Horizonte):** Notas definem o modelo de **Portas**.
*   **Bloco 5 (Detalhes):** Notas definem o estilo de **Janelas**.
*   **Bloco 6 (Propósito):** Notas definem o formato do **Telhado**.

### Regras de Sobreposição (Z-Index)
1.  Pisos (Z-10) - Ao fundo.
2.  Paredes (Z-20).
3.  Colunas (Z-30).
4.  Portas/Janelas (Z-40/50).
5.  Telhado (Z-60) - À frente.

### Interação
*   **Drag-and-Drop:** Usuários podem arrastar cada elemento para compor a obra. A posição (X, Y) é salva no objeto da avaliação.
*   **Escalonamento:** Categorias como "Piso" são renderizadas com escala maior (2.0x), enquanto "Portas" são menores (0.25x).

---

## 📊 6. Relatórios e Gestão (WorkDetail.tsx)

### Visualização de Resultados
1.  **Lado Esquerdo:** O prédio montado (Renderização 2D).
2.  **Lado Direito:** Painel de dados com abas:
    *   *Notas:* Exibe a nota de cada competência com a cor do bloco correspondente.
    *   *Texto:* Exibe as palavras-chave e observações de cada seção.
    *   *Compromissos:* Lista os planos de ação definidos no final da avaliação.

### Ações de Saída
*   **Exportar PDF:** Gera um documento formatado com a imagem da obra e o relatório detalhado de notas e observações.
*   **Editar Obra:** Permite voltar ao modo de montagem para ajustar a posição dos elementos.

---

## 💾 7. Estrutura de Dados (JSON / LocalStorage)

### Objeto `Evaluation`
```json
{
  "id": "string",
  "roleId": "string",
  "leaderId": "string",
  "collaboratorId": "string",
  "evaluationType": "tradicional | dialogica | atividades",
  "responses": [
    {
      "questionId": "string",
      "rating": 1-5,
      "keywords": ["tag1", "tag2", "tag3"],
      "selectedElementId": "svg_code_id"
    }
  ],
  "sectionObservations": { "bloco1": "texto..." },
  "commitments": { "bloco1": "plano de ação..." },
  "assembledElements": [
    { "elementId": "id", "position": { "x": 0, "y": 0 } }
  ]
}
```

---
*Este guia define a integridade técnica do Arquitetura de Carreira. Qualquer alteração deve respeitar estas hierarquias de estilo e lógica.*
