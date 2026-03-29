import html2pdf from 'html2pdf.js';
import { SavedWork, Member, Role } from '../types';
import { storage } from './storage';
import { newBlocks } from './newBlocks';
import { getAllQuestionsFromCompetencies } from './competencyHelpers';

// Imagens para o PDF
import imgLogoTortola from "figma:asset/0049d96aabf7ea4e2a663d5f83ebd360cb225dfd.png";
import imgLogoNOSSA from "figma:asset/d08376795895de90a85e101961d369a69979dcc3.png";

export function exportToPDF(work: SavedWork, collaborator: Member | null) {
  const roles = storage.getRoles();
  const role = roles.find(r => r.id === work.roleId);
  const allQuestions = getAllQuestionsFromCompetencies();
  const categories = newBlocks;

  // Criar container
  const container = document.createElement('div');
  container.style.cssText = `
    padding: 30px;
    background-color: white;
    font-family: 'Inter', 'Arial', sans-serif;
    color: #0f172a;
    font-size: 12px;
    line-height: 1.6;
  `;

  let html = '';

  // Cabeçalho com Outline e Logos
  html += `
    <div style="border: 2px solid #6155f5; padding: 25px; border-radius: 12px; margin-bottom: 30px; position: relative; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 10;">
        <img src="${imgLogoTortola}" style="height: 50px; width: auto;" />
        
        <div style="text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #6155f5; letter-spacing: -0.5px; font-weight: 800;">ARQUITETURA DE CARREIRA</h1>
          <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Relatório de Desempenho</p>
        </div>

        <img src="${imgLogoNOSSA}" style="height: 45px; width: auto;" />
      </div>
    </div>
  `;

  // Informações Gerais em Grid
  html += `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
      <div>
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold;">Colaborador(a)</p>
        <p style="margin: 2px 0 10px 0; font-size: 14px; font-weight: 600;">${work.collaboratorName || 'Não informado'}</p>
        
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold;">Líder Responsável</p>
        <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600;">${work.leaderName || 'Não informado'}</p>
      </div>
      <div>
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold;">Cargo / Função</p>
        <p style="margin: 2px 0 10px 0; font-size: 14px; font-weight: 600;">${role?.name || work.roleName}</p>
        
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold;">Data da Avaliação</p>
        <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600;">${new Date(work.createdAt).toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  `;

  // Calcular estatísticas por categoria
  const categoryStats = (work.evaluationType === 'atividades'
    ? [{ id: 'activities-block', name: 'Avaliação de Atividades', order: 1, color: '#34d399' }]
    : categories
  ).map(category => {
    const responsesInCategory = work.responses.filter(r => {
      // Para atividades
      if (work.evaluationType === 'atividades') {
        const activity = role?.activities?.find(a => a.id === r.questionId);
        return activity !== undefined && category.id === 'activities-block';
      }

      const question = allQuestions.find(q => q.id === r.questionId) ||
                      role?.customQuestions?.find(q => q.id === r.questionId);
      
      if (!question || question.categoryId !== category.id) return false;

      // Filtrar baseado no tipo de avaliação
      if (work.evaluationType === 'tradicional' && question.type === 'dialogic') return false;
      if (work.evaluationType === 'dialogica' && question.type === 'statement') return false;

      return true;
    });
    
    const totalRating = responsesInCategory.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = responsesInCategory.length > 0 ? totalRating / responsesInCategory.length : 0;
    
    return {
      category,
      totalQuestions: responsesInCategory.length,
      averageRating: parseFloat(averageRating.toFixed(2)),
      responses: responsesInCategory,
    };
  }).filter(stat => stat.totalQuestions > 0);

  // Média Geral em destaque
  const overallAverage = categoryStats.length > 0 
    ? parseFloat((categoryStats.reduce((sum, stat) => sum + stat.averageRating, 0) / categoryStats.length).toFixed(2))
    : 0;

  const getEvaluationTypeLabel = (type?: string) => {
    switch (type) {
      case 'tradicional': return 'Tradicional (Escala Likert)';
      case 'dialogica': return 'Dialógica';
      case 'atividades': return 'Avaliação de Atividades';
      default: return 'Não informado';
    }
  };

  // Função para obter os rótulos corretos baseado no tipo de avaliação
  const getRatingLabel = (rating: number, evaluationType?: string): string => {
    if (evaluationType === 'tradicional') {
      const labels = [
        'Não atendeu ao desempenho esperado',
        'Atendeu parcialmente, precisando aprimorar muito',
        'Atendeu parcialmente, precisando aprimorar pouco',
        'Atendeu plenamente',
        'Superou as expectativas'
      ];
      return labels[Math.max(0, Math.min(4, Math.round(rating) - 1))];
    } else if (evaluationType === 'dialogica') {
      const labels = ['Quase não funcionou', 'Funcionou pouco', 'Funcionou em parte', 'Funcionou bem', 'Funcionou muito bem'];
      return labels[Math.max(0, Math.min(4, Math.round(rating) - 1))];
    } else if (evaluationType === 'atividades') {
      const labels = ['Insuficiente', 'Regular', 'Bom', 'Muito Bom', 'Excepcional'];
      return labels[Math.max(0, Math.min(4, Math.round(rating) - 1))];
    }
    // Fallback
    return 'Não avaliado';
  };

  // Função para obter rótulo de contribuição para médias por categoria
  const getContributionLabel = (rating: number): string => {
    const labels = [
      'As ações quase não contribuíram para o projeto',
      'As ações contribuíram pouco para o projeto',
      'As ações contribuíram moderadamente para o projeto',
      'As ações contribuíram bastante para o projeto',
      'As ações contribuíram expressivamente para o projeto'
    ];
    return labels[Math.max(0, Math.min(4, Math.round(rating) - 1))];
  };

  // Função para obter label de média (usa escala de desempenho para tradicional, contribuição para outras)
  const getAverageLabel = (rating: number, evaluationType?: string): string => {
    if (evaluationType === 'tradicional') {
      return getRatingLabel(rating, 'tradicional');
    }
    return getContributionLabel(rating);
  };

  html += `
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 40px; border-left: 6px solid #6155f5;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="margin: 0; color: #475569; font-weight: bold;">MÉDIA GERAL DE DESEMPENHO</p>
          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 11px;">Tipo: ${getEvaluationTypeLabel(work.evaluationType)}</p>
        </div>
        <div style="font-size: 36px; font-weight: 800; color: #6155f5;">${overallAverage.toFixed(1)}<span style="font-size: 14px; color: #94a3b8; font-weight: 400;">/5.0</span></div>
      </div>
    </div>
  `;

  // Respostas por categoria com BOXES e OUTLINES
  html += `<h2 style="font-size: 18px; margin-bottom: 20px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">DETALHAMENTO POR BLOCO</h2>`;
  
  categoryStats.forEach((stat) => {
    const catColor = stat.category.color || '#6155f5';
    
    // Obter labels corretos baseados no tipo de avaliação
    const getLabelsForEvalType = (evaluationType?: string) => {
      if (evaluationType === 'tradicional') {
        return ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'];
      } else if (evaluationType === 'dialogica') {
        return ['Quase não funcionou', 'Funcionou pouco', 'Funcionou em parte', 'Funcionou bem', 'Funcionou muito bem'];
      } else if (evaluationType === 'atividades') {
        return ['Insuficiente', 'Regular', 'Bom', 'Muito Bom', 'Excepcional'];
      }
      return ['1', '2', '3', '4', '5'];
    };

    const labels = getLabelsForEvalType(work.evaluationType);

    html += `
      <div style="margin-bottom: 30px; page-break-inside: avoid;">
        <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid ${catColor}40; padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 8px; height: 8px; border-radius: 2px; background-color: ${catColor};"></div>
            <h3 style="margin: 0; color: ${catColor}; font-size: 14px; text-transform: uppercase; font-weight: 800;">${stat.category.name}</h3>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: 900; color: ${catColor}; line-height: 1;">${stat.averageRating.toFixed(1)}</div>
            <div style="font-size: 9px; font-weight: 700; color: #475569; text-transform: none; margin-top: 2px;">
              ${getAverageLabel(stat.averageRating, work.evaluationType)}
            </div>
          </div>
        </div>
    `;
    
    stat.responses.forEach((response, idx) => {
      const questionText = work.evaluationType === 'atividades'
        ? role?.activities?.find(a => a.id === response.questionId)?.text
        : (allQuestions.find(q => q.id === response.questionId) ||
           role?.customQuestions?.find(q => q.id === response.questionId))?.text;
      
      if (!questionText) return;
      
      html += `
        <div class="no-split" style="border: 1.5px solid ${catColor}; border-radius: 8px; padding: 15px; margin-bottom: 12px; background-color: transparent;">
          <p style="margin: 0 0 10px 0; font-weight: 500; font-size: 13px;">${idx + 1}. ${questionText}</p>
          
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 20px; font-weight: 900; color: ${catColor}; line-height: 1;">
              ${response.rating}
            </div>
            <span style="font-size: 11px; font-weight: 600; color: #475569;">
              ${labels[(response.rating || 1) - 1]}
            </span>
          </div>

          ${response.keywords && response.keywords.filter(k => k).length > 0 ? `
            <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; align-items: center;">
              ${response.keywords.filter(k => k).map(k => `
                <span style="border: 1px solid ${catColor}60; background-color: ${catColor}08; color: ${catColor}; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;">
                  ${k}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    });

    // Observações da Seção se existirem
    if (work.sectionObservations && work.sectionObservations[stat.category.id]) {
      html += `
        <div style="margin-top: 10px; padding: 12px; border: 1px dashed ${catColor}; border-radius: 8px; background-color: #f8fafc;">
          <p style="margin: 0 0 5px 0; font-size: 10px; font-weight: bold; color: ${catColor}; text-transform: uppercase;">Observações da Seção:</p>
          <p style="margin: 0; font-size: 12px; color: #475569; font-style: italic;">"${work.sectionObservations[stat.category.id]}"</p>
        </div>
      `;
    }

    // Combinados / Comprometimentos
    if (work.categoryCommitments && work.categoryCommitments[stat.category.id]) {
      const label = stat.averageRating >= 4.0 
        ? "O que aconteceu para ter essa pontuação? O que fazer para que minha entrega seja excelente?"
        : "O que posso fazer para melhorar nesse aspecto?";
        
      html += `
        <div class="no-split" style="margin-top: 15px; padding: 18px; border: 1.5px solid ${catColor}; border-radius: 8px; background-color: ${catColor}05;">
          <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: bold; color: ${catColor}; text-transform: uppercase;">COMBINADOS E PLANO DE AÇÃO:</p>
          <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; color: #1e293b; line-height: 1.4;">${label}</p>
          <div style="min-height: 40px; margin-bottom: 20px; font-size: 12px; color: #334155; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
            ${work.categoryCommitments[stat.category.id]}
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 15px;">
            <div style="text-align: center;">
              <div style="border-top: 0.5px solid #94a3b8; width: 100%; margin-bottom: 4px;"></div>
              <p style="margin: 0; font-size: 8px; color: #94a3b8; text-transform: uppercase;">Assinatura Associado(a)</p>
            </div>
            <div style="text-align: center;">
              <div style="border-top: 0.5px solid #94a3b8; width: 100%; margin-bottom: 4px;"></div>
              <p style="margin: 0; font-size: 8px; color: #94a3b8; text-transform: uppercase;">Assinatura Líder</p>
            </div>
          </div>
        </div>
      `;
    }

    html += `</div>`;
  });

  // Área de Assinaturas Final
  html += `
    <div style="margin-top: 40px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc; page-break-inside: avoid;">
      <p style="margin: 0 0 40px 0; font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; text-align: center;">CIÊNCIA E CONCORDÂNCIA FINAL</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px;">
        <div style="text-align: center;">
          <div style="border-top: 1.5px solid #0f172a; width: 100%; margin-bottom: 8px;"></div>
          <p style="margin: 0; font-size: 11px; font-weight: bold; color: #0f172a;">${work.collaboratorName}</p>
          <p style="margin: 0; font-size: 9px; color: #64748b;">Associado(a)</p>
        </div>
        <div style="text-align: center;">
          <div style="border-top: 1.5px solid #0f172a; width: 100%; margin-bottom: 8px;"></div>
          <p style="margin: 0; font-size: 11px; font-weight: bold; color: #0f172a;">${work.leaderName}</p>
          <p style="margin: 0; font-size: 9px; color: #64748b;">Líder Avaliador</p>
        </div>
      </div>
    </div>
  `;

  // Footer com data e página
  html += `
    <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
      <span>Gerado em: ${new Date().toLocaleString('pt-BR')}</span>
      <span>Arquitetura de Carreira</span>
    </div>
  `;

  container.innerHTML = html;

  // Configurações do PDF
  const opt = {
    margin: [15, 12, 15, 12],
    filename: `avaliacao-${work.collaboratorName?.replace(/\s+/g, '-').toLowerCase() || 'obra-viva'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'], avoid: '.no-split' }
  };

  // Gerar PDF
  html2pdf().set(opt).from(container).save().catch((error: Error) => {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF: ' + error.message);
  });
}

// Export Role to PDF (Também atualizando para consistência)
export function exportRoleToPDF(role: Role, selectedQuestionIds?: string[]) {
  const competencies = storage.getCompetencies();
  const allQuestions = [...(competencies?.flatMap(c => c.questions) || []), ...(role.customQuestions || [])];
  const roleQuestions = selectedQuestionIds 
    ? allQuestions.filter(q => selectedQuestionIds.includes(q.id))
    : allQuestions.filter(q => role.questionIds.includes(q.id) || role.customQuestions?.some(cq => cq.id === q.id));
  const categories = newBlocks;

  const container = document.createElement('div');
  container.style.cssText = `padding: 30px; background-color: white; font-family: sans-serif; color: #0f172a; font-size: 12px;`;

  let html = `
    <div style="background-color: #0f172a; padding: 25px; border-radius: 12px; color: white; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 22px;">ESTRUTURA DE CARGO: ${role.name.toUpperCase()}</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.8;">Modelo de Competências e Critérios de Avaliação</p>
    </div>
  `;

  // Campos de Cabeçalho para Preenchimento
  html += `
    <div style="margin-bottom: 25px; padding: 20px; border: 2px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
      <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #1e293b; text-transform: uppercase; font-weight: bold;">Dados da Avaliação</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <p style="margin: 0 0 5px 0; font-size: 10px; color: #64748b; font-weight: bold;">Nome do Avaliando:</p>
          <div style="border-bottom: 1px solid #94a3b8; min-height: 20px;"></div>
        </div>
        <div>
          <p style="margin: 0 0 5px 0; font-size: 10px; color: #64748b; font-weight: bold;">Nome do Avaliador:</p>
          <div style="border-bottom: 1px solid #94a3b8; min-height: 20px;"></div>
        </div>
        <div>
          <p style="margin: 0 0 5px 0; font-size: 10px; color: #64748b; font-weight: bold;">Data da Avaliação:</p>
          <div style="border-bottom: 1px solid #94a3b8; min-height: 20px;"></div>
        </div>
        <div>
          <p style="margin: 0 0 5px 0; font-size: 10px; color: #64748b; font-weight: bold;">Número da Avaliação:</p>
          <div style="border-bottom: 1px solid #94a3b8; min-height: 20px;"></div>
        </div>
        <div style="grid-column: 1 / -1;">
          <p style="margin: 0 0 5px 0; font-size: 10px; color: #64748b; font-weight: bold;">Data de Entrada na Empresa:</p>
          <div style="border-bottom: 1px solid #94a3b8; min-height: 20px;"></div>
        </div>
      </div>
    </div>
  `;

  // Função helper para renderizar checkbox
  const renderCheckbox = (value: number) => `
    <div style="display: inline-flex; flex-direction: column; align-items: center; gap: 4px; margin: 0 4px;">
      <div style="width: 16px; height: 16px; border: 2px solid #64748b; border-radius: 3px; background-color: white;"></div>
      <span style="font-size: 10px; font-weight: 600; color: #64748b;">${value}</span>
    </div>
  `;

  // Função helper para renderizar escala Likert horizontal
  const renderLikertScaleHeader = (type: 'statement' | 'dialogic' | 'activity') => {
    const labels = type === 'activity' 
      ? ['Insuficiente', 'Regular', 'Bom', 'Muito Bom', 'Excepcional']
      : [
          'Não atendeu ao desempenho esperado', 
          'Atendeu parcialmente, precisando aprimorar muito', 
          'Atendeu parcialmente, precisando aprimorar pouco', 
          'Atendeu plenamente', 
          'Superou as expectativas'
        ];

    return `
      <div style="margin-bottom: 20px; padding: 15px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: #1e293b;">ESCALA DE AVALIAÇÃO:</p>
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
          ${labels.map((label, i) => `
            <div style="flex: 1; text-align: center;">
              <div style="margin-bottom: 5px;">
                <div style="width: 16px; height: 16px; border: 2px solid #64748b; border-radius: 3px; background-color: white; margin: 0 auto;"></div>
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 3px;">${i + 1}</div>
              <div style="font-size: 8px; color: #64748b; line-height: 1.3;">${label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  // Perguntas por categoria
  categories.forEach((category) => {
    const categoryQuestions = roleQuestions.filter(q => q.categoryId === category.id);
    if (categoryQuestions.length === 0) return;

    html += `
      <div style="margin-bottom: 30px; border: 1.5px solid ${category.color}; border-radius: 12px; padding: 20px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 15px 0; color: ${category.color}; font-size: 14px; text-transform: uppercase;">${category.name}</h3>
    `;

    // Renderizar escala no cabeçalho da categoria
    const firstQuestion = categoryQuestions[0];
    html += renderLikertScaleHeader(firstQuestion.type === 'dialogic' ? 'dialogic' : 'statement');

    html += `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${categoryQuestions.map((q, i) => `
            <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; background-color: white;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
                <p style="margin: 0; font-size: 12px; color: #334155; font-weight: 500; flex: 1;"><strong>${i + 1}.</strong> ${q.text}</p>
                <div style="display: flex; gap: 8px; flex-shrink: 0;">
                  ${[1, 2, 3, 4, 5].map(num => renderCheckbox(num)).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  // Atividades específicas do cargo
  if (role.activities && role.activities.length > 0) {
    html += `
      <div style="margin-bottom: 25px; border: 1.5px solid #34d399; border-radius: 12px; padding: 20px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 15px 0; color: #34d399; font-size: 14px; text-transform: uppercase;">ATIVIDADES ESPECÍFICAS DO CARGO</h3>
    `;

    // Renderizar escala para atividades
    html += renderLikertScaleHeader('activity');

    html += `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${role.activities.map((activity, i) => `
            <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; background-color: white;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
                <p style="margin: 0; font-size: 12px; color: #334155; font-weight: 500; flex: 1;"><strong>${i + 1}.</strong> ${activity.text}</p>
                <div style="display: flex; gap: 8px; flex-shrink: 0;">
                  ${[1, 2, 3, 4, 5].map(num => renderCheckbox(num)).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  const opt = {
    margin: 10,
    filename: `estrutura-cargo-${role.name.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(container).save().catch((error: Error) => {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF. Por favor, tente novamente.');
  });
}