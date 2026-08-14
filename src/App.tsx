import { useState, useEffect, useRef } from 'react';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './components/HomePage';
import { TeamGallery } from './components/TeamGallery';
import { MembersView } from './components/MembersView';
import { MemberForm } from './components/MemberForm';
import { MemberDetail } from './components/MemberDetail';
import { RolesView } from './components/RolesView';
import { RoleEditor } from './components/RoleEditor';
import { EvaluationStart } from './components/EvaluationStart';
import { CategoryQuestionFlow } from './components/CategoryQuestionFlow';
import { ConstructionPreview } from './components/ConstructionPreview';
import { EvaluationSummary } from './components/EvaluationSummary';
import { AssemblyViewReadOnly } from './components/AssemblyViewReadOnly';
import { WorkDetail } from './components/WorkDetail';
import { CompetenciesView } from './components/CompetenciesView';
import { AccessManagement } from './components/AccessManagement';
import { ElementsLibrary } from './components/ElementsLibrary';
import { TutorialView } from './components/TutorialView';
import { Role, Member, Evaluation, SavedWork, EvaluationType } from './types';
import { ElementUploadView } from './components/ElementUploadView';
import { storage } from './lib/storage';
import { toast } from 'sonner';

type AppView = 
  | { type: 'home' }
  | { type: 'team-gallery' }
  | { type: 'elements-library' }
  | { type: 'element-upload' }
  | { type: 'competencies' }
  | { type: 'tutorial' }
  | { type: 'access-management' }
  | { type: 'role-editor'; role: Role }
  | { type: 'members' }
  | { type: 'member-form'; member: Member | null }
  | { type: 'member-detail'; memberId: string }
  | { type: 'roles' }
  | { type: 'evaluation-start' }
  | { type: 'evaluation'; evaluation: Evaluation }
  | { type: 'construction-preview'; evaluation: SavedWork }
  | { type: 'summary'; evaluation: Evaluation }
  | { type: 'assembly-readonly'; work: SavedWork }
  | { type: 'work-detail'; work: SavedWork };

// A troca de tela é uma SPA: nada no DOM anuncia que a navegação aconteceu.
// Sem isso, quem usa leitor de tela termina uma avaliação e não recebe nenhuma
// confirmação de que o resumo carregou. Um aria-live discreto resolve.
const VIEW_LABELS: Record<AppView['type'], string> = {
  'home': 'Início',
  'team-gallery': 'Avaliações salvas',
  'elements-library': 'Biblioteca de elementos',
  'element-upload': 'Upload de elementos',
  'competencies': 'Competências',
  'tutorial': 'Manual',
  'access-management': 'Quem pode acessar',
  'role-editor': 'Editor de cargo',
  'members': 'Equipe',
  'member-form': 'Cadastro de membro',
  'member-detail': 'Perfil do membro',
  'roles': 'Cargos',
  'evaluation-start': 'Nova avaliação',
  'evaluation': 'Questionário da avaliação',
  'construction-preview': 'Prévia da obra',
  'summary': 'Resumo da avaliação',
  'assembly-readonly': 'Obra montada',
  'work-detail': 'Detalhe da avaliação',
};

export default function App() {
  const [view, setView] = useState<AppView>({ type: 'home' });
  
  // Inicializa e migra competências na primeira carga
  useEffect(() => {
    storage.initializeCompetencies();
  }, []);
  
  const handleStartEvaluation = () => {
    setView({ type: 'evaluation-start' });
  };
  
  const handleBeginEvaluation = (role: Role, leaderId: string, collaboratorId: string, evaluationType: EvaluationType) => {
    const members = storage.getMembers();
    const leader = members.find(m => m.id === leaderId);
    const collaborator = members.find(m => m.id === collaboratorId);
    
    // Nome completo tolerante a sobrenome ausente (lastName é opcional e o
    // import de JSON não valida nada): sem isso o nome vira "Ana undefined".
    const fullName = (m: Member | undefined) =>
      m ? `${m.firstName || ''} ${m.lastName || ''}`.trim() : '';

    const evaluation: Evaluation = {
      // Date.now() sozinho colide em dois cliques no mesmo milissegundo
      id: `eval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      roleId: role.id,
      roleName: role.name,
      leaderId,
      collaboratorId,
      leaderName: fullName(leader),
      collaboratorName: fullName(collaborator),
      responses: [],
      createdAt: new Date(),
      completed: false,
      // Cargos vindos do localStorage podem não ter questionIds
      questionIds: Array.isArray(role.questionIds) ? role.questionIds : [],
      evaluationType,
    };
    
    storage.saveCurrentEvaluation(evaluation);
    setView({ type: 'evaluation', evaluation });
  };
  
  const handleCompleteEvaluation = (evaluation: Evaluation) => {
    // Vai para a tela de resumo
    setView({ type: 'summary', evaluation });
  };
  
  const handleSaveWork = (work: SavedWork) => {
    // Marca a avaliação como completa e salva
    const completedWork: SavedWork = {
      ...work,
      completed: true,
    };
    
    // Cria backup automático antes de salvar nova avaliação
    storage.createBackup();
    
    // storage.saveEvaluation retorna false quando o localStorage falha (cota
    // cheia, modo privado). Sem checar, a tela navegava para a galeria e o
    // trabalho era perdido em silêncio.
    if (!storage.saveEvaluation(completedWork)) {
      toast.error('Não foi possível salvar a avaliação. Libere espaço e tente novamente.');
      return;
    }

    storage.clearCurrentEvaluation();
    setView({ type: 'team-gallery' });
  };
  
  const handleViewWork = (work: SavedWork) => {
    // Vai para o WorkDetail que mostra tudo
    setView({ type: 'work-detail', work });
  };
  
  const handleBackToHome = () => {
    setView({ type: 'home' });
  };
  
  const handleViewSavedWorks = () => {
    setView({ type: 'team-gallery' });
  };
  
  const handleEditRole = (role: Role) => {
    setView({ type: 'role-editor', role });
  };

  // Foco após troca de tela. Sem isto, o elemento acionado desaparece junto com
  // a tela antiga e o foco cai em document.body: verificado no browser em TODAS
  // as navegações (home -> nova avaliação, metodologia -> questionário,
  // questionário -> resumo, resumo -> galeria, galeria -> avaliação salva).
  // Quem usa teclado é largado no topo do documento e só volta ao conteúdo
  // tabulando por tudo de novo. Movemos o foco para a região da tela nova, que
  // é o começo natural dela. Não movemos na primeira carga — aí o foco já está
  // no lugar certo e roubá-lo atrapalharia o leitor de tela.
  const viewRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    viewRef.current?.focus();
  }, [view.type]);


  return (
    <div className="relative min-h-screen">
      <Toaster position="top-center" />
      {/* Anuncia a tela atual para leitores de tela; invisível para os demais. */}
      <div aria-live="polite" role="status" className="sr-only">
        {VIEW_LABELS[view.type]}
      </div>
      <div ref={viewRef} tabIndex={-1} className="outline-none">
      <ErrorBoundary>
      {view.type === 'home' && (
        <HomePage
          onStartEvaluation={handleStartEvaluation}
          onViewSaved={handleViewSavedWorks}
          onOpenSettings={() => setView({ type: 'elements-library' })}
          onViewMembers={() => setView({ type: 'members' })}
          onViewRoles={() => setView({ type: 'roles' })}
          onViewCondominium={() => setView({ type: 'team-gallery' })}
          onViewShapeLibrary={() => setView({ type: 'elements-library' })}
          onViewCompetencies={() => setView({ type: 'competencies' })}
          onViewElementUpload={() => setView({ type: 'element-upload' })}
          onViewTutorial={() => setView({ type: 'tutorial' })}
          onViewAccessManagement={() => setView({ type: 'access-management' })}
        />
      )}

      {view.type === 'access-management' && (
        <AccessManagement onBack={handleBackToHome} />
      )}
      
      {view.type === 'team-gallery' && (
        <TeamGallery
          onBack={handleBackToHome}
          onViewWork={handleViewWork}
          onStartEvaluation={handleStartEvaluation}
        />
      )}
      
      {view.type === 'elements-library' && (
        <ElementsLibrary
          onBack={handleBackToHome}
        />
      )}
      
      {view.type === 'element-upload' && (
        <ElementUploadView
          onBack={handleBackToHome}
        />
      )}
      
      {view.type === 'competencies' && (
        <CompetenciesView
          onBack={handleBackToHome}
        />
      )}
      
      {view.type === 'role-editor' && (
        <RoleEditor
          role={view.role}
          onBack={() => setView({ type: 'roles' })}
          onDelete={() => setView({ type: 'roles' })}
          onViewWork={(work) => setView({ type: 'work-detail', work })}
        />
      )}
      
      {view.type === 'members' && (
        <MembersView
          onBack={handleBackToHome}
          onViewMember={(memberId) => setView({ type: 'member-detail', memberId })}
          onEditMember={(member) => setView({ type: 'member-form', member })}
        />
      )}
      
      {view.type === 'member-form' && (
        <MemberForm
          member={view.member}
          onBack={() => setView({ type: 'members' })}
          onSave={() => setView({ type: 'members' })}
        />
      )}
      
      {view.type === 'member-detail' && (
        <MemberDetail
          memberId={view.memberId}
          onBack={() => setView({ type: 'members' })}
          onEditMember={(member) => setView({ type: 'member-form', member })}
          onViewWork={(workId) => {
            const works = storage.getEvaluations();
            const work = works.find(w => w.id === workId);
            if (work) {
              setView({ type: 'work-detail', work });
            }
          }}
        />
      )}
      
      {view.type === 'roles' && (
        <RolesView
          onBack={handleBackToHome}
          onViewRole={(roleId) => {
            const role = storage.getRoles().find(r => r.id === roleId);
            if (role) setView({ type: 'role-editor', role });
          }}
          onEditRole={(role) => setView({ type: 'role-editor', role })}
        />
      )}
      
      {view.type === 'evaluation-start' && (
        <EvaluationStart
          onStart={(role, leaderId, collaboratorId, evaluationType) => 
            handleBeginEvaluation(role, leaderId, collaboratorId, evaluationType)
          }
          onBack={handleBackToHome}
          onAddMember={() => setView({ type: 'member-form', member: null })}
        />
      )}
      
      {view.type === 'evaluation' && (
        <CategoryQuestionFlow
          evaluation={view.evaluation}
          onComplete={handleCompleteEvaluation}
          onBack={handleBackToHome}
        />
      )}
      
      {view.type === 'construction-preview' && (
        <ConstructionPreview
          evaluation={view.evaluation}
          onBack={() => {
            const evaluation: Evaluation = {
              ...view.evaluation,
              completed: false,
            };
            setView({ type: 'evaluation', evaluation });
          }}
          onCreateBuilding={() => setView({ type: 'assembly-readonly', work: view.evaluation })}
        />
      )}
      
      {view.type === 'summary' && (
        <EvaluationSummary
          evaluation={view.evaluation}
          onBack={() => setView({ type: 'home' })}
          onSave={handleSaveWork}
        />
      )}
      
      {view.type === 'assembly-readonly' && (
        <AssemblyViewReadOnly
          work={view.work}
          onBack={() => setView({ type: 'team-gallery' })}
        />
      )}
      
      {view.type === 'work-detail' && (
        <WorkDetail
          work={view.work}
          onBack={() => setView({ type: 'team-gallery' })}
          onViewAssembly={(work) => setView({ type: 'assembly-readonly', work })}
        />
      )}
      
      {view.type === 'tutorial' && (
        <TutorialView
          onBack={handleBackToHome}
        />
      )}
      </ErrorBoundary>
      </div>
    </div>
  );
}