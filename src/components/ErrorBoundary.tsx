import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { DS, Button, Card } from './DesignSystem';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro não tratado na aplicação:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6"
      >
        <Card className="max-w-lg w-full text-center space-y-6">
          <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className={DS.typography.section}>Algo deu errado</h1>
            <p className={DS.typography.body}>
              Encontramos um problema inesperado ao exibir esta tela. Seus dados
              continuam salvos neste dispositivo. Recarregue a página para tentar
              novamente.
            </p>
          </div>

          {this.state.error?.message && (
            <p className="text-xs font-mono text-slate-400 break-words bg-slate-50 rounded-xl p-4 text-left">
              {this.state.error.message}
            </p>
          )}

          <div className="flex justify-center">
            <Button onClick={this.handleReload}>
              <RotateCw className="w-4 h-4" />
              Recarregar
            </Button>
          </div>
        </Card>
      </div>
    );
  }
}
