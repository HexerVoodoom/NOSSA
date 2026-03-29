import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
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
import { ElementsLibrary } from './components/ElementsLibrary';
import { TutorialView } from './components/TutorialView';
import { Role, Member, Evaluation, SavedWork, EvaluationType } from './types';
import { ElementUploadView } from './components/ElementUploadView';
import { storage } from './lib/storage';

type AppView = 
  | { type: 'home' }
  | { type: 'team-gallery' }
  | { type: 'elements-library' }
  | { type: 'element-upload' }
  | { type: 'competencies' }
  | { type: 'tutorial' }
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
    
    const evaluation: Evaluation = {
      id: `eval-${Date.now()}`,
      roleId: role.id,
      roleName: role.name,
      leaderId,
      collaboratorId,
      leaderName: leader ? `${leader.firstName} ${leader.lastName}` : '',
      collaboratorName: collaborator ? `${collaborator.firstName} ${collaborator.lastName}` : '',
      responses: [],
      createdAt: new Date(),
      completed: false,
      questionIds: role.questionIds,
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
    
    storage.saveEvaluation(completedWork);
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
  
  return (
    <div className="relative min-h-screen">
      <Toaster position="top-center" />
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
        />
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
    </div>
  );
}