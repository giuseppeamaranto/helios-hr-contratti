import { useMemo } from 'react';
import { SEDI, UNITS } from '../../../data/mockData';
import type { WizardState } from '../ContractWizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const COLLABORATION_TYPES = [
  'Ricerca scientifica',
  'Sviluppo software',
  'Consulenza tecnica',
  'Formazione',
  'Comunicazione',
  'Supporto amministrativo',
  'Altro',
];

const WORK_LOCATIONS = [
  ...SEDI,
  'Remoto',
  'Misto (presenza/remoto)',
];

export function Step4Mod09({ state, onChange }: Props) {
  const mod09 = state.mod09;

  const update = (field: string, value: unknown) => {
    onChange({ mod09: { ...mod09, [field]: value } });
  };

  // Calcolo totale lordo automatico
  const totalGross = useMemo(() => {
    if (!mod09.startDate || !mod09.endDate || !mod09.grossCompensation) return null;
    const start = new Date(mod09.startDate);
    const end = new Date(mod09.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return null;
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      (end.getDate() >= start.getDate() ? 0 : -1) + 1;
    return Math.max(0, months) * (mod09.grossCompensation ?? 0);
  }, [mod09.startDate, mod09.endDate, mod09.grossCompensation]);

  const directorOptions = UNITS.map(u => `${u.director} (${u.code})`);

  return (
    <div>
      {/* ── Sezione 1: Dati Generali ── */}
      <div className="form-section-title">
        <i className="bi bi-file-text" />
        1 — Dati Generali
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">
            Tipo di Collaborazione <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={mod09.collaborationType ?? ''}
            onChange={e => update('collaborationType', e.target.value)}
          >
            <option value="">— Seleziona —</option>
            {COLLABORATION_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Report a</label>
          <select
            className="form-select"
            value={mod09.reportTo ?? ''}
            onChange={e => update('reportTo', e.target.value)}
          >
            <option value="">— Seleziona responsabile —</option>
            {directorOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <label className="form-label">
            Oggetto della Prestazione <span className="required">*</span>
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Descrivi dettagliatamente le attività oggetto della collaborazione..."
            value={mod09.activityObject ?? ''}
            onChange={e => update('activityObject', e.target.value)}
          />
        </div>

        <div className="col-12">
          <label className="form-label">Deliverable Attesi</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Report, articoli, dataset, codice sorgente..."
            value={mod09.deliverables ?? ''}
            onChange={e => update('deliverables', e.target.value)}
          />
        </div>
      </div>

      {/* ── Sezione 2: Durata e Compenso ── */}
      <div className="form-section-title">
        <i className="bi bi-calendar-range" />
        2 — Durata e Compenso
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <label className="form-label">
            Data Inizio <span className="required">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={mod09.startDate ?? ''}
            onChange={e => update('startDate', e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">
            Data Fine <span className="required">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={mod09.endDate ?? ''}
            min={mod09.startDate ?? ''}
            onChange={e => update('endDate', e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">
            Compenso Lordo Mensile (€) <span className="required">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text">€</span>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              min={0}
              step={50}
              value={mod09.grossCompensation ?? ''}
              onChange={e => update('grossCompensation', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Totale calcolato */}
        {totalGross !== null && (
          <div className="col-12">
            <div
              className="alert-cmcc info"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span>
                <i className="bi bi-calculator me-2" />
                <strong>Totale Lordo Stimato:</strong> compenso mensile × mesi di contratto
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1d4ed8' }}>
                € {totalGross.toLocaleString('it-IT')}
              </span>
            </div>
          </div>
        )}

        <div className="col-md-6">
          <label className="form-label">Modalità di Pagamento</label>
          <select
            className="form-select"
            value={mod09.paymentSchedule ?? 'mensile'}
            onChange={e => update('paymentSchedule', e.target.value)}
          >
            <option value="mensile">Mensile</option>
            <option value="trimestrale">Trimestrale</option>
            <option value="saldo">A Saldo</option>
          </select>
        </div>

        <div className="col-md-6 d-flex align-items-end">
          <div>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="vatRequired"
                checked={mod09.vatRequired ?? false}
                onChange={e => update('vatRequired', e.target.checked)}
              />
              <label className="form-check-label fw-600" htmlFor="vatRequired" style={{ fontSize: 13 }}>
                Titolare di Partita IVA
              </label>
            </div>
            {mod09.vatRequired && (
              <input
                type="text"
                className="form-control mt-2"
                placeholder="Numero P.IVA"
                value={mod09.vatNumber ?? ''}
                onChange={e => update('vatNumber', e.target.value)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Sezione 3: Modalità Esecuzione ── */}
      <div className="form-section-title">
        <i className="bi bi-geo-alt" />
        3 — Modalità di Esecuzione
      </div>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Luogo di Lavoro</label>
          <select
            className="form-select"
            value={mod09.workLocation ?? ''}
            onChange={e => update('workLocation', e.target.value)}
          >
            <option value="">— Seleziona —</option>
            {WORK_LOCATIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6 d-flex align-items-end">
          <div style={{ width: '100%' }}>
            <label className="form-label">Esclusività</label>
            <div className="d-flex gap-3" style={{ paddingTop: 8 }}>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  id="exclusiveYes"
                  name="exclusive"
                  checked={mod09.isExclusive === true}
                  onChange={() => update('isExclusive', true)}
                />
                <label className="form-check-label" htmlFor="exclusiveYes" style={{ fontSize: 13 }}>
                  Sì — Esclusivo
                </label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  id="exclusiveNo"
                  name="exclusive"
                  checked={mod09.isExclusive === false}
                  onChange={() => update('isExclusive', false)}
                />
                <label className="form-check-label" htmlFor="exclusiveNo" style={{ fontSize: 13 }}>
                  No — Non Esclusivo
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <label className="form-label">Strumenti Forniti dal CMCC</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Es. laptop, accesso HPC, software specifici..."
            value={mod09.tools ?? ''}
            onChange={e => update('tools', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
