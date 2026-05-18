import type { ProcessDocument } from '../../../types';
import type { WizardState } from '../ContractWizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const NON_SUBORDINATO_TYPES = ['cococo', 'borsa-studio', 'tirocinio', 'consulenza-it', 'consulenza-es'];

export function getRequiredDocs(
  contractType: string,
  isNewResource: boolean,
  isEU: boolean
): ProcessDocument[] {
  const modLabel = NON_SUBORDINATO_TYPES.includes(contractType) ? 'MOD09' : 'MOD10';

  const docs: ProcessDocument[] = [
    {
      id: 'd1',
      name: `Modulo ${modLabel} — Richiesta Contratto`,
      type: 'modulo-richiesta',
      required: true,
      status: 'attesa',
    },
    {
      id: 'd2',
      name: 'Curriculum Vitae aggiornato',
      type: 'cv',
      required: true,
      status: 'attesa',
    },
  ];

  if (isNewResource) {
    docs.push({
      id: 'd3',
      name: 'Documento di identità in corso di validità',
      type: 'documento-identita',
      required: true,
      status: 'attesa',
    });
    docs.push({
      id: 'd4',
      name: 'Codice Fiscale',
      type: 'codice-fiscale',
      required: true,
      status: 'attesa',
    });
    if (!isEU) {
      docs.push({
        id: 'd5',
        name: 'Permesso di soggiorno',
        type: 'permesso-soggiorno',
        required: true,
        status: 'attesa',
      });
      docs.push({
        id: 'd6',
        name: 'Visto di lavoro',
        type: 'visto',
        required: true,
        status: 'attesa',
      });
    }
  }

  if (contractType === 'subordinato-td' || contractType === 'subordinato-ti') {
    docs.push({
      id: 'd7',
      name: 'Dichiarazione detrazioni (MOD14)',
      type: 'mod14',
      required: true,
      status: 'attesa',
    });
  }

  if (contractType === 'cococo') {
    docs.push({
      id: 'd8',
      name: 'Informativa lavoratori CoCoCo (MOD102)',
      type: 'mod102',
      required: true,
      status: 'attesa',
    });
  }

  return docs;
}

function docIcon(type: string): string {
  switch (type) {
    case 'documento-identita': return '🪪';
    case 'codice-fiscale':     return '🪪';
    case 'modulo-richiesta':   return '📋';
    case 'mod14':              return '📋';
    case 'mod102':             return '📋';
    case 'cv':                 return '📄';
    case 'permesso-soggiorno': return '🛂';
    case 'visto':              return '✈️';
    default:                   return '📄';
  }
}

function docStatusBadge(status: ProcessDocument['status']) {
  switch (status) {
    case 'caricato':
      return <span className="tag tag-green">Caricato</span>;
    case 'verificato':
      return <span className="tag tag-blue">Verificato</span>;
    default:
      return <span className="tag tag-gray">In attesa</span>;
  }
}

export function Step5Documenti({ state, onChange }: Props) {
  const isEU = state.resource?.isEU ?? true;
  const requiredDocs = getRequiredDocs(state.contractType, state.isNewResource, isEU);

  // Inizializza documenti se vuoti
  const documents: ProcessDocument[] =
    state.documents.length > 0
      ? state.documents
      : requiredDocs;

  const loaded = documents.filter(d => d.status !== 'attesa').length;
  const total = documents.length;
  const progressPct = total > 0 ? Math.round((loaded / total) * 100) : 0;

  const simulateUpload = (id: string) => {
    const updated = documents.map(d =>
      d.id === id ? { ...d, status: 'caricato' as const, uploadedAt: new Date().toISOString() } : d
    );
    onChange({ documents: updated });
  };

  const removeUpload = (id: string) => {
    const updated = documents.map(d =>
      d.id === id ? { ...d, status: 'attesa' as const, uploadedAt: undefined } : d
    );
    onChange({ documents: updated });
  };

  // Sync docs into state on first render
  if (state.documents.length === 0 && documents.length > 0) {
    onChange({ documents });
  }

  return (
    <div>
      <div className="alert-cmcc info mb-4">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <i className="bi bi-info-circle-fill" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Gestione Documenti</div>
            I documenti elencati di seguito sono richiesti per il tipo di contratto selezionato.
            In questa fase puoi simulare il caricamento per indicare la disponibilità dei documenti.
            Il caricamento definitivo avverrà attraverso il portale GRU.
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
            Documenti disponibili
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#295fa9' }}>
            {loaded} / {total}
          </span>
        </div>
        <div className="progress-bar-cmcc">
          <div
            className="progress-fill"
            style={{
              width: `${progressPct}%`,
              background: progressPct === 100 ? '#16a34a' : '#295fa9',
            }}
          />
        </div>
        {progressPct === 100 && (
          <div className="alert-cmcc success mt-2" style={{ padding: '8px 12px', fontSize: 12 }}>
            <i className="bi bi-check-circle me-2" />
            Tutti i documenti sono stati indicati come disponibili.
          </div>
        )}
      </div>

      {/* Lista documenti */}
      <div>
        {documents.map(doc => (
          <div key={doc.id} className="doc-item">
            <div className="doc-icon">{docIcon(doc.type)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="doc-name">{doc.name}</div>
              {doc.uploadedAt && (
                <div className="doc-meta">
                  Caricato il {new Date(doc.uploadedAt).toLocaleDateString('it-IT')}
                </div>
              )}
              {!doc.uploadedAt && (
                <div className="doc-meta">In attesa di caricamento</div>
              )}
            </div>
            {doc.required && (
              <span className="tag tag-amber" style={{ flexShrink: 0 }}>
                Obbligatorio
              </span>
            )}
            <div style={{ flexShrink: 0 }}>
              {docStatusBadge(doc.status)}
            </div>
            <div style={{ flexShrink: 0 }}>
              {doc.status === 'attesa' ? (
                <button
                  type="button"
                  className="btn btn-cmcc-secondary"
                  style={{ padding: '4px 12px', fontSize: 12 }}
                  onClick={() => simulateUpload(doc.id)}
                >
                  <i className="bi bi-upload me-1" />
                  Simula Caricamento
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-cmcc-ghost"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={() => removeUpload(doc.id)}
                >
                  <i className="bi bi-x me-1" />
                  Rimuovi
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {state.contractType === 'cococo' && (
        <div className="alert-cmcc warning mt-3">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>CO.CO.CO.:</strong> sarà richiesta la compilazione di MOD13 e MOD102 dopo la firma del contratto.
        </div>
      )}

      {(state.contractType === 'subordinato-td' || state.contractType === 'subordinato-ti') && (
        <div className="alert-cmcc warning mt-3">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Contratto Subordinato:</strong> il MOD14 (dichiarazione detrazioni) deve essere firmato prima dell'avvio del rapporto.
        </div>
      )}
    </div>
  );
}
