import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProcessBoard } from './components/process/ProcessBoard';
import { ProcessDetail } from './components/process/ProcessDetail';
import { ContractWizard, type WizardSeed } from './components/wizard/ContractWizard';
import { WizardEntry } from './components/wizard/WizardEntry';
import { PeopleDirectory } from './components/people/PeopleDirectory';
import { ModuliLibrary } from './components/forms/ModuliLibrary';
import { MOCK_PROCESSES, RESOURCES } from './data/mockData';
import type { ContractProcess, UserRole } from './types';

type View = 'dashboard' | 'process-board' | 'wizard-entry' | 'new-process' | 'people' | 'forms' | 'analytics';

export default function App() {
  const [view, setView]               = useState<View>('dashboard');
  const [sidebarCollapsed, setCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('gru');
  const [selectedProcessId, setSelectedProcessId] = useState<string | undefined>();
  const [processes, setProcesses]     = useState<ContractProcess[]>(MOCK_PROCESSES);
  // Seed alimentato dall'intent picker o da PeopleDirectory.
  const [wizardSeed, setWizardSeed]   = useState<WizardSeed | undefined>(undefined);

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
    setWizardSeed(undefined);
  };

  const handleCloseDetail = () => {
    setSelectedProcessId(undefined);
  };

  const handleUpdateProcess = (id: string, updates: Partial<ContractProcess>) => {
    setProcesses(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Avvio wizard "fresco" (Nuovo Processo dalla dashboard / sidebar) → intent picker
  const startNewProcess = () => {
    setWizardSeed(undefined);
    setView('wizard-entry');
  };

  // Da PeopleDirectory: l'utente preme "Nuovo Processo" su una scheda risorsa.
  // Passiamo la risorsa direttamente al wizard come seed, saltando l'intent picker.
  const startFromResource = (resourceId: string) => {
    const r = RESOURCES.find(x => x.idSubject === resourceId);
    if (!r) { startNewProcess(); return; }
    setWizardSeed({ resource: r });
    setView('new-process');
  };

  return (
    <div className="app-layout">
      <Sidebar
        currentView={view}
        onViewChange={(v) => {
          setView(v);
          setSelectedProcessId(undefined);
          setWizardSeed(undefined);
        }}
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
          onDashboard={() => { setView('dashboard'); setSelectedProcessId(undefined); setWizardSeed(undefined); }}
        />
        <main className="main-content">
          {view === 'dashboard' && (
            <Dashboard
              onViewProcess={handleViewProcess}
              onNewProcess={startNewProcess}
              onViewAll={() => setView('process-board')}
            />
          )}
          {view === 'process-board' && !selectedProcessId && (
            <ProcessBoard
              processes={processes}
              currentRole={currentRole}
              onViewProcess={(id) => setSelectedProcessId(id)}
              onNewProcess={startNewProcess}
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
          {view === 'wizard-entry' && (
            <WizardEntry
              onPickRecruiting={(c) => {
                setWizardSeed({ recruitingCandidate: c });
                setView('new-process');
              }}
              onPickExisting={(r) => {
                setWizardSeed({ resource: r });
                setView('new-process');
              }}
              onBlankStart={() => {
                setWizardSeed(undefined);
                setView('new-process');
              }}
              onCancel={() => { setWizardSeed(undefined); setView('process-board'); }}
            />
          )}
          {view === 'new-process' && (
            <ContractWizard
              currentRole={currentRole}
              onSave={handleProcessSave}
              onCancel={() => { setWizardSeed(undefined); setView('process-board'); }}
              existingProcesses={processes}
              seed={wizardSeed}
            />
          )}
          {view === 'people' && (
            <PeopleDirectory onNewProcess={startFromResource} />
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
