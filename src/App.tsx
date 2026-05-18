import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProcessBoard } from './components/process/ProcessBoard';
import { ProcessDetail } from './components/process/ProcessDetail';
import { ContractWizard } from './components/wizard/ContractWizard';
import { PeopleDirectory } from './components/people/PeopleDirectory';
import { ModuliLibrary } from './components/forms/ModuliLibrary';
import { MOCK_PROCESSES } from './data/mockData';
import type { ContractProcess, UserRole } from './types';

type View = 'dashboard' | 'process-board' | 'new-process' | 'people' | 'forms' | 'analytics';

export default function App() {
  const [view, setView]               = useState<View>('dashboard');
  const [sidebarCollapsed, setCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('gru');
  const [selectedProcessId, setSelectedProcessId] = useState<string | undefined>();
  const [processes, setProcesses]     = useState<ContractProcess[]>(MOCK_PROCESSES);

  const handleViewProcess = (id: string) => {
    setSelectedProcessId(id);
    setView('process-board');
  };

  const handleProcessSave = (p: ContractProcess) => {
    setProcesses(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = p; return next; }
      return [p, ...prev];
    });
    setSelectedProcessId(p.id);
    setView('process-board');
  };

  const handleCloseDetail = () => {
    setSelectedProcessId(undefined);
  };

  const handleUpdateProcess = (id: string, updates: Partial<ContractProcess>) => {
    setProcesses(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div className="app-layout">
      <Sidebar
        currentView={view}
        onViewChange={(v) => { setView(v); setSelectedProcessId(undefined); }}
        collapsed={sidebarCollapsed}
      />
      <div className="main-area">
        <Header
          currentView={view}
          collapsed={sidebarCollapsed}
          onToggle={() => setCollapsed(c => !c)}
          onRoleChange={setCurrentRole}
          currentRole={currentRole}
          processId={selectedProcessId}
          onDashboard={() => { setView('dashboard'); setSelectedProcessId(undefined); }}
        />
        <main className="main-content">
          {view === 'dashboard' && (
            <Dashboard
              onViewProcess={handleViewProcess}
              onNewProcess={() => setView('new-process')}
              onViewAll={() => setView('process-board')}
            />
          )}
          {view === 'process-board' && !selectedProcessId && (
            <ProcessBoard
              processes={processes}
              currentRole={currentRole}
              onViewProcess={(id) => setSelectedProcessId(id)}
              onNewProcess={() => setView('new-process')}
            />
          )}
          {view === 'process-board' && selectedProcessId && (
            <ProcessDetail
              process={processes.find(p => p.id === selectedProcessId)!}
              currentRole={currentRole}
              onBack={handleCloseDetail}
              onUpdate={(updates) => handleUpdateProcess(selectedProcessId, updates)}
            />
          )}
          {view === 'new-process' && (
            <ContractWizard
              currentRole={currentRole}
              onSave={handleProcessSave}
              onCancel={() => setView('process-board')}
              existingProcesses={processes}
            />
          )}
          {view === 'people' && (
            <PeopleDirectory onNewProcess={(resourceId) => {
              setView('new-process');
              // Could pass prefill via state if needed
            }} />
          )}
          {view === 'forms' && <ModuliLibrary />}
          {view === 'analytics' && (
            <div className="empty-state">
              <div className="empty-icon"><i className="bi bi-bar-chart-fill" /></div>
              <div className="empty-title">Analytics — In sviluppo</div>
              <div className="empty-desc">Dashboard di reportistica e analisi dati in arrivo presto</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
