import { Building2, Users, Briefcase, GraduationCap, BookOpen, Archive, Plus } from 'lucide-react';
import { storage } from '../lib/storage';
import { FileManager } from './FileManager';
import { DS, Button } from './DesignSystem';
import imgBackground from "figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png";
import imgLogoTortola from "figma:asset/0049d96aabf7ea4e2a663d5f83ebd360cb225dfd.png";
import imgLogoNOSSA from "figma:asset/d08376795895de90a85e101961d369a69979dcc3.png";
import imgIconNOSSA from "figma:asset/59bd61ee57b1d1995ade3564db5bcf01cca3ad34.png";

interface HomePageProps {
  onStartEvaluation: () => void;
  onViewSaved: () => void;
  onOpenSettings: () => void;
  onViewMembers: () => void;
  onViewRoles: () => void;
  onViewCondominium: () => void;
  onViewShapeLibrary?: () => void;
  onViewCompetencies: () => void;
  onViewElementUpload?: () => void;
  onViewTutorial: () => void;
}

export function HomePage({ 
  onStartEvaluation, 
  onViewSaved, 
  onViewMembers, 
  onViewRoles, 
  onViewCompetencies, 
  onViewTutorial 
}: HomePageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={imgLogoTortola} 
              alt="Luis Tortola" 
              className="h-20 w-auto object-contain"
            />
          </div>
          
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-slate-900 text-2xl font-bold">
            Arquitetura de Carreira
          </h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onViewTutorial}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700 text-sm font-medium flex items-center gap-2"
              aria-label="Tutorial de Navegação"
            >
              <BookOpen className="w-4 h-4" />
              Manual
            </button>
            <FileManager />
          </div>
        </div>
      </header>

      {/* Main Content with Background */}
      <main className="flex-1 relative">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={imgBackground} 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/10" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          {/* Primary Action - Nova Avaliação */}
          <button
            onClick={onStartEvaluation}
            className="w-full group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-white hover:bg-white hover:shadow-lg transition-all duration-200 mb-6"
          >
            <div className="p-12 flex items-center gap-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-300 flex-shrink-0">
                <Building2 className="w-10 h-10 text-slate-900" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h2 className="text-slate-900 text-xl font-bold mb-2">
                  Nova Avaliação
                </h2>
                <p className="text-slate-700">
                  Inicie uma nova avaliação de desempenho
                </p>
              </div>
            </div>
          </button>

          {/* Secondary Action - Avaliações Salvas */}
          <button
            onClick={onViewSaved}
            className="w-full group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-white hover:bg-white hover:shadow-lg transition-all duration-200 mb-6"
          >
            <div className="p-8 flex items-center gap-5">
              <div className="p-3 rounded-xl bg-white border border-slate-300 flex-shrink-0">
                <Archive className="w-7 h-7 text-slate-900" strokeWidth={2} />
              </div>
              <div className="text-left">
                <h3 className="text-slate-900 font-bold mb-1">
                  Avaliações Salvas
                </h3>
                <p className="text-slate-700 text-sm">
                  Visualize e gerencie avaliações concluídas
                </p>
              </div>
            </div>
          </button>

          {/* Navigation Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={onViewMembers}
              className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-white hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <div className="p-6 flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-slate-900" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <h3 className="text-slate-900 font-bold mb-2">
                    Membros
                  </h3>
                  <p className="text-slate-700 text-sm">
                    Gerencie associados(as) e líderes
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={onViewRoles}
              className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-white hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <div className="p-6 flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-slate-900" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <h3 className="text-slate-900 font-bold mb-2">
                    Cargos
                  </h3>
                  <p className="text-slate-700 text-sm">
                    Configure cargos e perguntas
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={onViewCompetencies}
              className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-white hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <div className="p-6 flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-slate-900" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <h3 className="text-slate-900 font-bold mb-2">
                    Competências
                  </h3>
                  <p className="text-slate-700 text-sm">
                    Gerencie competências e habilidades
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-200/40 to-slate-300/40 border-t border-slate-300">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={imgLogoNOSSA} 
                alt="NOSSA" 
                className="h-24 w-auto object-contain opacity-75"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-slate-600">
                <p className="font-bold">Ferramenta de Avaliação de Desempenho</p>
                <p>desenvolvido por NOSSA Pessoas & Empresas</p>
              </div>
              <img 
                src={imgIconNOSSA} 
                alt="NOSSA Icon" 
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
