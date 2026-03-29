import { useState, useEffect, useRef, useMemo } from 'react';
import { Evaluation, Question, QuestionResponse } from '../types';
import { storage } from '../lib/storage';
import { newBlocks as categories } from '../lib/newBlocks';
import { DS, Button, Card } from './DesignSystem';
import { ArrowLeft, ArrowRight, Check, MessageSquare, ClipboardList, ListChecks } from 'lucide-react';
import imgBackground from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";

interface CategoryQuestionFlowProps {
  evaluation: Evaluation;
  onComplete: (evaluation: Evaluation) => void;
  onBack: () => void;
}

const categoryShapes: Record<string, string[]> = {
  'bloco1': ['foundation-1', 'foundation-2', 'foundation-3', 'foundation-4', 'foundation-5', 'foundation-6', 'foundation-7', 'foundation-8', 'foundation-9', 'foundation-10'],
  'bloco2': ['structure-1', 'structure-2', 'structure-3', 'structure-4', 'structure-5', 'structure-6', 'structure-7', 'structure-8', 'structure-9', 'structure-10'],
  'bloco3': ['wall-1', 'wall-2', 'wall-3', 'wall-4', 'wall-5', 'wall-6', 'wall-7', 'wall-8', 'wall-9', 'wall-10'],
  'bloco4': ['door-1', 'door-2', 'door-3', 'door-4', 'door-5', 'door-6', 'door-7', 'door-8', 'door-9', 'door-10'],
  'bloco5': ['window-1', 'window-2', 'window-3', 'window-4', 'window-5', 'window-6', 'window-7', 'window-8', 'window-9', 'window-10'],
  'bloco6': ['roof-1', 'roof-2', 'roof-3', 'roof-4', 'roof-5', 'roof-6', 'roof-7', 'roof-8', 'roof-9', 'roof-10'],
};

export function CategoryQuestionFlow({ evaluation, onComplete, onBack }: CategoryQuestionFlowProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>(evaluation.responses);
  const [sectionObservations, setSectionObservations] = useState<Record<string, string>>(evaluation.sectionObservations || {});
  const containerRef = useRef<HTMLDivElement>(null);
  
  const role = storage.getRoles().find(r => r.id === evaluation.roleId);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [currentCategoryIndex]);
  
  const getQuestions = (): (Question & { competencyName?: string })[] => {
    if (evaluation.evaluationType === 'atividades') {
      const roleActivities = role?.activities || [];
      return roleActivities.map(activity => ({
        id: activity.id,
        categoryId: 'activities-block',
        text: activity.text,
        order: activity.order,
        type: 'activity',
        evaluationType: 'atividades',
        competencyName: 'Atividades do Cargo'
      }));
    }

    const competencies = storage.getCompetencies();
    const allQuestions: (Question & { competencyName?: string })[] = [];
    competencies.forEach(comp => {
      comp.questions.forEach(q => {
        allQuestions.push({ ...q, competencyName: comp.name });
      });
    });
    
    return allQuestions.filter(q => {
      if (evaluation.evaluationType === 'dialogica' && q.type === 'dialogic' && !q.parentQuestionId) {
        const comp = competencies.find(c => c.name === q.competencyName);
        return comp ? comp.questions.some(cq => evaluation.questionIds.includes(cq.id)) : false;
      }
      return evaluation.questionIds.includes(q.id);
    });
  };
  
  const questions = getQuestions();
  const categoriesWithQuestions = evaluation.evaluationType === 'atividades'
    ? [{ id: 'activities-block', name: 'Avaliação de Atividades', order: 1, color: '#10b981', description: 'Avalie o desempenho técnico em cada uma das atividades específicas.' }]
    : categories.filter(cat => questions.some(q => q.categoryId === cat.id));
  
  useEffect(() => {
    if (categoriesWithQuestions.length === 0) onComplete(evaluation);
  }, [categoriesWithQuestions.length, evaluation, onComplete]);
  
  if (categoriesWithQuestions.length === 0) return null;
  
  const currentCategory = categoriesWithQuestions[currentCategoryIndex];
  const categoryQuestions = questions.filter(q => q.categoryId === currentCategory.id);
  
  const [questionData, setQuestionData] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const data: any = {};
    categoryQuestions.forEach(q => {
      const existingResponse = responses.find(r => r.questionId === q.id);
      data[q.id] = {
        keywords: existingResponse?.keywords || ['', '', ''],
        rating: existingResponse?.rating || 1,
        selectedImageIndex: existingResponse?.selectedImageIndex ?? (existingResponse?.rating ? existingResponse.rating - 1 : 0),
      };
    });
    setQuestionData(data);
  }, [currentCategoryIndex]);
  
  const updateQuestionData = (questionId: string, field: string, value: any) => {
    setQuestionData(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value }
    }));
  };
  
  const handleSaveAndMove = (direction: 'next' | 'prev') => {
    const newResponses = [...responses.filter(r => !categoryQuestions.some(q => q.id === r.questionId))];
    categoryQuestions.forEach(q => {
      const qd = questionData[q.id];
      const rating = qd?.rating || 1;
      const shapes = categoryShapes[currentCategory.id] || [];
      const imageIdx = qd?.selectedImageIndex ?? (rating - 1);
      
      newResponses.push({
        questionId: q.id,
        keywords: qd?.keywords || ['', '', ''],
        rating: rating,
        selectedElementId: shapes[imageIdx] || '',
        selectedImageIndex: imageIdx,
      });
    });
    
    setResponses(newResponses);
    const updatedEval = { ...evaluation, responses: newResponses, sectionObservations };
    storage.saveCurrentEvaluation(updatedEval);
    
    if (direction === 'next') {
      if (currentCategoryIndex < categoriesWithQuestions.length - 1) setCurrentCategoryIndex(prev => prev + 1);
      else onComplete(updatedEval);
    } else {
      if (currentCategoryIndex > 0) setCurrentCategoryIndex(prev => prev - 1);
      else onBack();
    }
  };
  
  return (
    <div ref={containerRef} className="min-h-screen bg-[#fafafa] pb-32">
      <header className="relative h-80 overflow-hidden flex items-end">
        <img src={imgBackground} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <div className={DS.layout.maxWidth + " relative pb-12 w-full"}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                {evaluation.evaluationType === 'dialogica' ? <MessageSquare /> : evaluation.evaluationType === 'tradicional' ? <ClipboardList /> : <ListChecks />}
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter">{currentCategory.name}</h1>
                <p className="text-white/60 text-sm font-bold tracking-widest">{evaluation.collaboratorName} • Ciclo 2026</p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold">
              {currentCategoryIndex + 1} / {categoriesWithQuestions.length}
            </div>
          </div>
          {currentCategory.description && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 max-w-3xl">
              <p className="text-white/90 text-sm italic leading-relaxed">"{currentCategory.description}"</p>
            </div>
          )}
        </div>
      </header>

      <main className={DS.layout.maxWidth + " py-12"}>
        <div className="space-y-8">
          {categoryQuestions
            .filter(q => {
              if (evaluation.evaluationType === 'tradicional') return q.type === 'statement' || !q.type;
              if (evaluation.evaluationType === 'atividades') return q.type === 'activity';
              if (evaluation.evaluationType === 'dialogica') return q.type === 'dialogic' && !q.parentQuestionId;
              return true;
            })
            .map((question, qIndex) => {
              const qd = questionData[question.id] || { keywords: ['', '', ''], rating: 1 };
              const isDialogic = question.type === 'dialogic';
              
              return (
                <Card key={question.id} className="border-l-8 border-l-slate-900 p-10 space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-300 tabular-nums">Pergunta {String(qIndex + 1).padStart(2, '0')}</span>
                      <div className="h-[1px] flex-1 bg-slate-100" />
                      {question.competencyName && (
                        <span className="px-3 py-1 rounded-lg bg-slate-900 text-white text-sm font-bold tracking-wider">
                          {question.competencyName}
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-slate-900 leading-tight">{question.text}</p>
                  </div>
                  
                  {isDialogic && (
                    <div className="space-y-4">
                      <label className={DS.typography.label}>Principais Tópicos / Palavras-chave</label>
                      <div className="grid md:grid-cols-3 gap-4">
                        {[0, 1, 2].map(idx => (
                          <input
                            key={idx}
                            type="text"
                            value={qd.keywords[idx]}
                            onChange={(e) => {
                              const kw = [...qd.keywords];
                              kw[idx] = e.target.value;
                              updateQuestionData(question.id, 'keywords', kw);
                            }}
                            placeholder={`Tópico ${idx + 1}...`}
                            className={DS.inputs.base}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      {(evaluation.evaluationType === 'tradicional' ? [
                        { val: 1, label: 'Nunca' },
                        { val: 2, label: 'Raramente' },
                        { val: 3, label: 'Às vezes' },
                        { val: 4, label: 'Frequentemente' },
                        { val: 5, label: 'Sempre' }
                      ] : evaluation.evaluationType === 'atividades' ? [
                        { val: 1, label: 'Insuficiente' },
                        { val: 2, label: 'Regular' },
                        { val: 3, label: 'Bom' },
                        { val: 4, label: 'Muito Bom' },
                        { val: 5, label: 'Excepcional' }
                      ] : [
                        { val: 1, label: 'Quase não funcionou' },
                        { val: 2, label: 'Funcionou pouco' },
                        { val: 3, label: 'Funcionou em parte' },
                        { val: 4, label: 'Funcionou bem' },
                        { val: 5, label: 'Funcionou muito bem' }
                      ]).map((item) => (
                        <button
                          key={item.val}
                          onClick={() => updateQuestionData(question.id, 'rating', item.val)}
                          className={`flex-1 min-w-[120px] p-4 rounded-2xl border border-slate-200 transition-all flex flex-col items-center gap-2 ${
                            qd.rating === item.val 
                              ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-105' 
                              : 'bg-white text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xl font-bold">{item.val}</span>
                          <span className="text-sm font-bold text-center tracking-tighter leading-none">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          
          <div className="pt-8">
            <label className={DS.inputs.label + " mb-4"}>Observações da Seção</label>
            <textarea
              value={sectionObservations[currentCategory.id] || ''}
              onChange={(e) => setSectionObservations(prev => ({ ...prev, [currentCategory.id]: e.target.value }))}
              placeholder="Adicione comentários adicionais sobre este bloco de competências..."
              className={DS.inputs.base + " min-h-[120px]"}
            />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t-2 border-slate-100 py-6 z-50">
        <div className={DS.layout.maxWidth + " flex items-center justify-between"}>
          <Button variant="secondary" onClick={() => handleSaveAndMove('prev')}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          
          <div className="flex flex-col items-center">
            <div className="flex gap-1 mb-2">
              {categoriesWithQuestions.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentCategoryIndex ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'}`} />
              ))}
            </div>
            <span className={DS.typography.caption}>Seção {currentCategoryIndex + 1} de {categoriesWithQuestions.length}</span>
          </div>
          
          <Button onClick={() => handleSaveAndMove('next')}>
            {currentCategoryIndex < categoriesWithQuestions.length - 1 ? (
              <>Próxima Seção <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Finalizar Avaliação <Check className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}