import React, { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
type ModuloBadge = 'Non Subordinato' | 'Subordinato' | 'Onboarding' | 'Scientifico';

interface ModuloSection {
  title: string;
  fields?: string[];
}

interface Modulo {
  id: string;
  code: string;
  title: string;
  badge: ModuloBadge;
  description: string;
  sections: ModuloSection[];
  fieldCount?: number;
}

// ── Badge color map ───────────────────────────────────────────────────────────
const BADGE_CLASS: Record<ModuloBadge, string> = {
  'Non Subordinato': 'tag-amber',
  'Subordinato':     'tag-blue',
  'Onboarding':      'tag-green',
  'Scientifico':     'tag-purple',
};

const FILTER_TABS: Array<ModuloBadge | 'Tutti'> = [
  'Tutti', 'Non Subordinato', 'Subordinato', 'Onboarding', 'Scientifico',
];

// ── Moduli data ───────────────────────────────────────────────────────────────
const MODULI: Modulo[] = [
  {
    id: 'MOD09',
    code: 'MOD09',
    title: 'Richiesta Contratto Non Subordinato',
    badge: 'Non Subordinato',
    description: 'Modulo per richiesta di collaborazione CoCoCo, borse di studio, tirocini e consulenze.',
    fieldCount: 15,
    sections: [
      { title: 'Dati Richiedente', fields: ['Responsabile di struttura', 'Unità', 'Centro di costo', 'Progetto / Codice progetto'] },
      { title: 'Tipo Collaborazione', fields: ['Tipologia (CoCoCo / Borsa / Tirocinio / Consulenza)', 'Nominativo collaboratore', 'Codice fiscale', 'Partita IVA (se applicabile)'] },
      { title: 'Oggetto Prestazione', fields: ['Descrizione attività', 'Deliverable attesi', 'Riferisce a'] },
      { title: 'Durata e Compenso', fields: ['Data inizio', 'Data fine', 'Compenso lordo mensile/totale', 'Modalità pagamento'] },
      { title: 'Modalità Esecuzione', fields: ['Luogo svolgimento', 'Strumenti forniti', 'Esclusività'] },
    ],
  },
  {
    id: 'MOD10',
    code: 'MOD10',
    title: 'Richiesta Contratto Subordinato',
    badge: 'Subordinato',
    description: 'Modulo per assunzione a tempo determinato o indeterminato (Terziario Confcommercio).',
    fieldCount: 18,
    sections: [
      { title: 'Inquadramento', fields: ['CCNL applicato', 'Livello', 'Qualifica professionale', 'Profilo'] },
      { title: 'Dati Economici', fields: ['RAL (€/anno)', 'Part-time %', 'Eventuali benefit'] },
      { title: 'Durata', fields: ['Data inizio', 'Data fine', 'Tempo indeterminato (sì/no)'] },
      { title: 'Attività', fields: ['Descrizione mansioni', 'Luogo lavoro', 'Distaccato estero (sì/no)', 'Paese estero'] },
      { title: 'Note', fields: ['Note aggiuntive', 'Documenti allegati'] },
    ],
  },
  {
    id: 'MOD10BIS',
    code: 'MOD10BIS',
    title: 'Proroga / Integrazione Contratto Subordinato',
    badge: 'Subordinato',
    description: 'Variante per proroga, integrazione salariale o di progetto per contratti subordinati.',
    sections: [
      { title: 'Riferimento Contratto', fields: ['ID contratto esistente', 'Nominativo', 'Tipo operazione (Proroga / Integrazione / Modifica)'] },
      { title: 'Modifica Durata', fields: ['Nuova data fine', 'Motivazione proroga'] },
      { title: 'Modifica Economica', fields: ['Nuovo livello CCNL', 'Nuova RAL', 'Decorrenza modifica'] },
      { title: 'Note', fields: ['Note aggiuntive'] },
    ],
  },
  {
    id: 'MOD13',
    code: 'MOD13',
    title: 'Anagrafica Dipendente / Collaboratore',
    badge: 'Onboarding',
    description: 'Raccolta dati anagrafici, residenza, domicilio e coordinate bancarie del collaboratore.',
    fieldCount: 22,
    sections: [
      { title: 'Dati Personali', fields: ['Nome', 'Cognome', 'Codice fiscale', 'Data di nascita', 'Luogo di nascita', 'Nazionalità', 'Sesso', 'Telefono', 'Email'] },
      { title: 'Residenza', fields: ['Via/Piazza', 'Numero civico', 'CAP', 'Comune', 'Provincia', 'Paese'] },
      { title: 'Domicilio', fields: ['Domicilio diverso da residenza (sì/no)', 'Indirizzo domicilio'] },
      { title: 'Dati Bancari', fields: ['IBAN', 'Intestatario conto', 'Banca / Istituto', 'Titolo di studio', 'Specializzazione'] },
    ],
  },
  {
    id: 'MOD138',
    code: 'MOD138',
    title: 'Lettera di Presentazione Personale Scientifico',
    badge: 'Scientifico',
    description: 'Lettera formale di presentazione per personale scientifico, compilata dal Responsabile di Struttura.',
    sections: [
      { title: 'Destinatario', fields: ['Ente / Istituzione destinataria', 'Data lettera', 'Istituto CMCC mittente'] },
      { title: 'Dati Candidato', fields: ['Nome e cognome candidato', 'Email candidato', 'Qualifica proposta'] },
      { title: 'Attività di Ricerca', fields: ['Oggetto della ricerca', 'Breve bio / curriculum sintetico'] },
      { title: 'Produzione Scientifica', fields: ['Pubblicazione 1 (titolo, rivista, anno)', 'Pubblicazione 2', 'Pubblicazione 3'] },
      { title: 'Referenze', fields: ['Referenza 1 (nome, email, ente)', 'Referenza 2'] },
    ],
  },
  {
    id: 'MOD14',
    code: 'MOD14',
    title: 'Dichiarazione Detrazioni Fiscali',
    badge: 'Subordinato',
    description: 'Dichiarazione per il calcolo delle detrazioni IRPEF (carichi familiari, situazione lavorativa).',
    sections: [
      { title: 'Dati Contribuente', fields: ['Cognome e nome', 'Codice fiscale', 'Data di nascita'] },
      { title: 'Situazione Familiare', fields: ['Coniuge a carico (sì/no)', 'Numero figli a carico', 'Primo figlio < 3 anni (sì/no)', 'Altri familiari a carico'] },
      { title: 'Detrazioni Richieste', fields: ['Tipologia lavoratore (dipendente / CoCoCo)', 'Reddito presunto annuo', 'Richiesta detrazione lavoro dipendente', 'Richiesta detrazione carichi familiari'] },
      { title: 'Firma', fields: ['Data dichiarazione', 'Firma del dichiarante'] },
    ],
  },
  {
    id: 'MOD102',
    code: 'MOD102',
    title: 'Informativa Lavoratori CoCoCo',
    badge: 'Non Subordinato',
    description: 'Informativa ex D.L. 104/2022 per collaboratori coordinati e continuativi, con firma per presa visione.',
    sections: [
      { title: 'Informativa', fields: ['Testo informativo D.L. 104/2022', 'Diritti e tutele del collaboratore'] },
      { title: 'Dati Collaboratore', fields: ['Nome e cognome', 'Codice fiscale', 'Tipo collaborazione'] },
      { title: 'Accettazione', fields: ['Data presa visione', 'Firma collaboratore'] },
    ],
  },
];

// ── Modal: MOD09 ──────────────────────────────────────────────────────────────
function ModalMOD09({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    rs: '', unit: '', costCenter: '', project: '',
    collabType: '', name: '', cf: '', piva: '',
    activityDesc: '', deliverables: '', reportTo: '',
    startDate: '', endDate: '', compensation: '', paymentMode: 'mensile',
    location: '', tools: '', exclusive: false,
  });

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header-cmcc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className={`tag tag-amber me-2`}>Non Subordinato</span>
            <strong>MOD09 — Richiesta Contratto Non Subordinato</strong>
          </div>
          <button className="btn-cmcc-ghost" onClick={onClose} style={{ fontSize: 20, padding: '2px 8px' }}>&times;</button>
        </div>
        <div className="modal-body-cmcc" style={{ overflowY: 'auto', flex: 1 }}>
          {/* Dati Richiedente */}
          <div className="summary-section">
            <div className="summary-section-header">Dati Richiedente</div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Responsabile di struttura</label>
                <input className="form-control" value={form.rs} onChange={e => update('rs', e.target.value)} placeholder="Es. Prof. Andrea Bianchi" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Unità</label>
                <select className="form-select" value={form.unit} onChange={e => update('unit', e.target.value)}>
                  <option value="">Seleziona...</option>
                  {['ICR','IESP','EIEE','IAFES','REMHI','ASC'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Centro di costo</label>
                <input className="form-control" value={form.costCenter} onChange={e => update('costCenter', e.target.value)} placeholder="Es. EU-HA01" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Progetto / Codice progetto</label>
                <input className="form-control" value={form.project} onChange={e => update('project', e.target.value)} placeholder="Es. EU-HORIZON-2024-01" />
              </div>
            </div>
          </div>
          {/* Tipo Collaborazione */}
          <div className="summary-section">
            <div className="summary-section-header">Tipo Collaborazione</div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Tipologia</label>
                <select className="form-select" value={form.collabType} onChange={e => update('collabType', e.target.value)}>
                  <option value="">Seleziona...</option>
                  <option>CoCoCo</option>
                  <option>Borsa di Studio</option>
                  <option>Tirocinio</option>
                  <option>Consulenza Italiana</option>
                  <option>Consulenza Estera</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Nominativo collaboratore</label>
                <input className="form-control" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Cognome Nome" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Codice Fiscale</label>
                <input className="form-control" value={form.cf} onChange={e => update('cf', e.target.value.toUpperCase())} placeholder="RSSMRA80A01H501Z" maxLength={16} style={{ fontFamily: 'monospace' }} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Partita IVA (se applicabile)</label>
                <input className="form-control" value={form.piva} onChange={e => update('piva', e.target.value)} placeholder="Solo se professionista" />
              </div>
            </div>
          </div>
          {/* Oggetto */}
          <div className="summary-section">
            <div className="summary-section-header">Oggetto Prestazione</div>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Descrizione attività</label>
                <textarea className="form-control" rows={3} value={form.activityDesc} onChange={e => update('activityDesc', e.target.value)} placeholder="Descrivere dettagliatamente l'oggetto della prestazione..." />
              </div>
              <div className="col-12">
                <label className="form-label">Deliverable attesi</label>
                <textarea className="form-control" rows={2} value={form.deliverables} onChange={e => update('deliverables', e.target.value)} placeholder="Report, dataset, articoli scientifici..." />
              </div>
              <div className="col-md-6">
                <label className="form-label">Riferisce a (tutor/supervisore)</label>
                <input className="form-control" value={form.reportTo} onChange={e => update('reportTo', e.target.value)} placeholder="Nome responsabile scientifico" />
              </div>
            </div>
          </div>
          {/* Durata e Compenso */}
          <div className="summary-section">
            <div className="summary-section-header">Durata e Compenso</div>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Data inizio</label>
                <input type="date" className="form-control" value={form.startDate} onChange={e => update('startDate', e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Data fine</label>
                <input type="date" className="form-control" value={form.endDate} onChange={e => update('endDate', e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Compenso lordo (€)</label>
                <input type="number" className="form-control" value={form.compensation} onChange={e => update('compensation', e.target.value)} placeholder="2800" min={0} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Modalità pagamento</label>
                <select className="form-select" value={form.paymentMode} onChange={e => update('paymentMode', e.target.value)}>
                  <option value="mensile">Mensile</option>
                  <option value="trimestrale">Trimestrale</option>
                  <option value="saldo">A saldo</option>
                </select>
              </div>
            </div>
          </div>
          {/* Modalità esecuzione */}
          <div className="summary-section">
            <div className="summary-section-header">Modalità Esecuzione</div>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Luogo svolgimento</label>
                <input className="form-control" value={form.location} onChange={e => update('location', e.target.value)} placeholder="Es. Bologna, Remoto..." />
              </div>
              <div className="col-md-4">
                <label className="form-label">Strumenti forniti da CMCC</label>
                <input className="form-control" value={form.tools} onChange={e => update('tools', e.target.value)} placeholder="HPC, PC, Software..." />
              </div>
              <div className="col-md-4">
                <label className="form-label">Esclusività</label>
                <div className="form-check mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="exclusive09"
                    checked={form.exclusive}
                    onChange={e => update('exclusive', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="exclusive09">Rapporto esclusivo</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer-cmcc" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-cmcc-secondary" onClick={onClose}>Chiudi</button>
          <button className="btn-cmcc-ghost" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-printer me-1" />Stampa PDF
          </button>
          <button className="btn-cmcc-primary" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-file-earmark-pdf me-1" />Salva come PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: MOD13 ──────────────────────────────────────────────────────────────
function ModalMOD13({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    nome: '', cognome: '', cf: '', dataNascita: '', luogoNascita: '', nazionalita: '',
    sesso: '', telefono: '', email: '',
    via: '', civico: '', cap: '', comune: '', provincia: '', paese: 'ITALIA',
    domDiverso: false, domVia: '', domCivico: '', domCap: '', domComune: '', domProvincia: '',
    iban: '', intestatario: '', banca: '',
    titoloDiStudio: '', specializzazione: '',
  });

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header-cmcc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="tag tag-green me-2">Onboarding</span>
            <strong>MOD13 — Anagrafica Dipendente / Collaboratore</strong>
          </div>
          <button className="btn-cmcc-ghost" onClick={onClose} style={{ fontSize: 20, padding: '2px 8px' }}>&times;</button>
        </div>
        <div className="modal-body-cmcc" style={{ overflowY: 'auto', flex: 1 }}>
          {/* Dati Personali */}
          <div className="summary-section">
            <div className="summary-section-header">Dati Personali</div>
            <div className="row g-3">
              <div className="col-md-4"><label className="form-label">Nome</label><input className="form-control" value={form.nome} onChange={e => update('nome', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Cognome</label><input className="form-control" value={form.cognome} onChange={e => update('cognome', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Codice Fiscale</label><input className="form-control" value={form.cf} onChange={e => update('cf', e.target.value.toUpperCase())} style={{ fontFamily: 'monospace' }} maxLength={16} /></div>
              <div className="col-md-4"><label className="form-label">Data di nascita</label><input type="date" className="form-control" value={form.dataNascita} onChange={e => update('dataNascita', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Luogo di nascita</label><input className="form-control" value={form.luogoNascita} onChange={e => update('luogoNascita', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Nazionalità</label><input className="form-control" value={form.nazionalita} onChange={e => update('nazionalita', e.target.value)} placeholder="Es. ITALIANA" /></div>
              <div className="col-md-4">
                <label className="form-label">Sesso</label>
                <select className="form-select" value={form.sesso} onChange={e => update('sesso', e.target.value)}>
                  <option value="">Seleziona...</option>
                  <option value="M">Maschile</option>
                  <option value="F">Femminile</option>
                </select>
              </div>
              <div className="col-md-4"><label className="form-label">Telefono</label><input className="form-control" type="tel" value={form.telefono} onChange={e => update('telefono', e.target.value)} placeholder="+39 ..." /></div>
              <div className="col-md-4"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
            </div>
          </div>

          {/* Residenza */}
          <div className="summary-section">
            <div className="summary-section-header">Residenza</div>
            <div className="row g-3">
              <div className="col-md-5"><label className="form-label">Via / Piazza</label><input className="form-control" value={form.via} onChange={e => update('via', e.target.value)} /></div>
              <div className="col-md-2"><label className="form-label">Civico</label><input className="form-control" value={form.civico} onChange={e => update('civico', e.target.value)} /></div>
              <div className="col-md-2"><label className="form-label">CAP</label><input className="form-control" value={form.cap} onChange={e => update('cap', e.target.value)} maxLength={5} /></div>
              <div className="col-md-3"><label className="form-label">Comune</label><input className="form-control" value={form.comune} onChange={e => update('comune', e.target.value)} /></div>
              <div className="col-md-2"><label className="form-label">Provincia</label><input className="form-control" value={form.provincia} onChange={e => update('provincia', e.target.value)} maxLength={2} /></div>
              <div className="col-md-4"><label className="form-label">Paese</label><input className="form-control" value={form.paese} onChange={e => update('paese', e.target.value)} /></div>
            </div>
          </div>

          {/* Domicilio */}
          <div className="summary-section">
            <div className="summary-section-header">Domicilio</div>
            <div className="row g-3">
              <div className="col-12">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="domDiverso" checked={form.domDiverso} onChange={e => update('domDiverso', e.target.checked)} />
                  <label className="form-check-label" htmlFor="domDiverso">Il domicilio è diverso dalla residenza</label>
                </div>
              </div>
              {form.domDiverso && (
                <>
                  <div className="col-md-5"><label className="form-label">Via / Piazza</label><input className="form-control" value={form.domVia} onChange={e => update('domVia', e.target.value)} /></div>
                  <div className="col-md-2"><label className="form-label">Civico</label><input className="form-control" value={form.domCivico} onChange={e => update('domCivico', e.target.value)} /></div>
                  <div className="col-md-2"><label className="form-label">CAP</label><input className="form-control" value={form.domCap} onChange={e => update('domCap', e.target.value)} maxLength={5} /></div>
                  <div className="col-md-3"><label className="form-label">Comune</label><input className="form-control" value={form.domComune} onChange={e => update('domComune', e.target.value)} /></div>
                  <div className="col-md-2"><label className="form-label">Provincia</label><input className="form-control" value={form.domProvincia} onChange={e => update('domProvincia', e.target.value)} maxLength={2} /></div>
                </>
              )}
            </div>
          </div>

          {/* Dati Bancari */}
          <div className="summary-section">
            <div className="summary-section-header">Dati Bancari</div>
            <div className="row g-3">
              <div className="col-md-5"><label className="form-label">IBAN</label><input className="form-control" value={form.iban} onChange={e => update('iban', e.target.value.toUpperCase())} placeholder="IT60 X054 2811 1010 0000 0123 456" style={{ fontFamily: 'monospace' }} /></div>
              <div className="col-md-4"><label className="form-label">Intestatario conto</label><input className="form-control" value={form.intestatario} onChange={e => update('intestatario', e.target.value)} /></div>
              <div className="col-md-3"><label className="form-label">Banca / Istituto</label><input className="form-control" value={form.banca} onChange={e => update('banca', e.target.value)} /></div>
              <div className="col-md-5"><label className="form-label">Titolo di studio</label>
                <select className="form-select" value={form.titoloDiStudio} onChange={e => update('titoloDiStudio', e.target.value)}>
                  <option value="">Seleziona...</option>
                  <option>Diploma di scuola superiore</option>
                  <option>Laurea Triennale</option>
                  <option>Laurea Magistrale / Specialistica</option>
                  <option>PHD / Dottorato di Ricerca</option>
                  <option>Master</option>
                </select>
              </div>
              <div className="col-md-7"><label className="form-label">Specializzazione / Indirizzo di studi</label><input className="form-control" value={form.specializzazione} onChange={e => update('specializzazione', e.target.value)} placeholder="Es. Fisica dell'atmosfera, Economia ambientale..." /></div>
            </div>
          </div>
        </div>
        <div className="modal-footer-cmcc" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-cmcc-secondary" onClick={onClose}>Chiudi</button>
          <button className="btn-cmcc-ghost" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-printer me-1" />Stampa PDF
          </button>
          <button className="btn-cmcc-primary" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-file-earmark-pdf me-1" />Salva come PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: MOD138 ─────────────────────────────────────────────────────────────
function ModalMOD138({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    destinatario: '', data: '', istituto: 'CMCC',
    nomeCandidato: '', emailCandidato: '', qualificaProposta: '',
    oggettoRicerca: '', bio: '',
    pub1: '', pub2: '', pub3: '',
    ref1Nome: '', ref1Email: '', ref1Ente: '',
    ref2Nome: '', ref2Email: '', ref2Ente: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header-cmcc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="tag tag-purple me-2">Scientifico</span>
            <strong>MOD138 — Lettera di Presentazione Personale Scientifico</strong>
          </div>
          <button className="btn-cmcc-ghost" onClick={onClose} style={{ fontSize: 20, padding: '2px 8px' }}>&times;</button>
        </div>
        <div className="modal-body-cmcc" style={{ overflowY: 'auto', flex: 1 }}>
          {/* Destinatario */}
          <div className="summary-section">
            <div className="summary-section-header">Destinatario</div>
            <div className="row g-3">
              <div className="col-md-5"><label className="form-label">Ente / Istituzione destinataria</label><input className="form-control" value={form.destinatario} onChange={e => update('destinatario', e.target.value)} placeholder="Università / Fondazione / Ministero..." /></div>
              <div className="col-md-3"><label className="form-label">Data lettera</label><input type="date" className="form-control" value={form.data} onChange={e => update('data', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Istituto CMCC mittente</label>
                <select className="form-select" value={form.istituto} onChange={e => update('istituto', e.target.value)}>
                  {['ICR','IESP','EIEE','IAFES','REMHI','ASC'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Dati Candidato */}
          <div className="summary-section">
            <div className="summary-section-header">Dati Candidato</div>
            <div className="row g-3">
              <div className="col-md-5"><label className="form-label">Nome e cognome candidato</label><input className="form-control" value={form.nomeCandidato} onChange={e => update('nomeCandidato', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Email candidato</label><input type="email" className="form-control" value={form.emailCandidato} onChange={e => update('emailCandidato', e.target.value)} /></div>
              <div className="col-md-3"><label className="form-label">Qualifica proposta</label><input className="form-control" value={form.qualificaProposta} onChange={e => update('qualificaProposta', e.target.value)} placeholder="Es. POST DOC" /></div>
            </div>
          </div>

          {/* Attività */}
          <div className="summary-section">
            <div className="summary-section-header">Attività di Ricerca</div>
            <div className="row g-3">
              <div className="col-12"><label className="form-label">Oggetto della ricerca</label><textarea className="form-control" rows={3} value={form.oggettoRicerca} onChange={e => update('oggettoRicerca', e.target.value)} placeholder="Descrivere il tema di ricerca del candidato..." /></div>
              <div className="col-12"><label className="form-label">Breve bio / curriculum sintetico</label><textarea className="form-control" rows={4} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Presentazione accademica e professionale del candidato..." /></div>
            </div>
          </div>

          {/* Produzione Scientifica */}
          <div className="summary-section">
            <div className="summary-section-header">Produzione Scientifica (fino a 3 pubblicazioni)</div>
            <div className="row g-3">
              <div className="col-12"><label className="form-label">Pubblicazione 1</label><input className="form-control" value={form.pub1} onChange={e => update('pub1', e.target.value)} placeholder="Titolo, Rivista, Anno, DOI..." /></div>
              <div className="col-12"><label className="form-label">Pubblicazione 2</label><input className="form-control" value={form.pub2} onChange={e => update('pub2', e.target.value)} placeholder="Titolo, Rivista, Anno, DOI..." /></div>
              <div className="col-12"><label className="form-label">Pubblicazione 3</label><input className="form-control" value={form.pub3} onChange={e => update('pub3', e.target.value)} placeholder="Titolo, Rivista, Anno, DOI..." /></div>
            </div>
          </div>

          {/* Referenze */}
          <div className="summary-section">
            <div className="summary-section-header">Referenze (fino a 2)</div>
            <div className="row g-3">
              <div className="col-12" style={{ fontWeight: 600, fontSize: 13, color: 'var(--cmcc-text-muted)', paddingBottom: 0 }}>Referenza 1</div>
              <div className="col-md-4"><label className="form-label">Nome e cognome</label><input className="form-control" value={form.ref1Nome} onChange={e => update('ref1Nome', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Email</label><input type="email" className="form-control" value={form.ref1Email} onChange={e => update('ref1Email', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Ente / Istituzione</label><input className="form-control" value={form.ref1Ente} onChange={e => update('ref1Ente', e.target.value)} /></div>
              <div className="col-12" style={{ fontWeight: 600, fontSize: 13, color: 'var(--cmcc-text-muted)', paddingBottom: 0 }}>Referenza 2</div>
              <div className="col-md-4"><label className="form-label">Nome e cognome</label><input className="form-control" value={form.ref2Nome} onChange={e => update('ref2Nome', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Email</label><input type="email" className="form-control" value={form.ref2Email} onChange={e => update('ref2Email', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Ente / Istituzione</label><input className="form-control" value={form.ref2Ente} onChange={e => update('ref2Ente', e.target.value)} /></div>
            </div>
          </div>
        </div>
        <div className="modal-footer-cmcc" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-cmcc-secondary" onClick={onClose}>Chiudi</button>
          <button className="btn-cmcc-ghost" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-printer me-1" />Stampa PDF
          </button>
          <button className="btn-cmcc-primary" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-file-earmark-pdf me-1" />Salva come PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: MOD14 ──────────────────────────────────────────────────────────────
function ModalMOD14({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    cognomeNome: '', cf: '', dataNascita: '',
    tipoLavoratore: 'dipendente',
    coniuge: false, nFigli: '0', primoFiglioMenoreTre: false, altriCarichi: '',
    redditoPresunto: '', detLavoroDipendente: true, detCarichiFamily: false,
    dataFirma: '', firma: '',
  });

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header-cmcc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="tag tag-blue me-2">Subordinato</span>
            <strong>MOD14 — Dichiarazione Detrazioni Fiscali</strong>
          </div>
          <button className="btn-cmcc-ghost" onClick={onClose} style={{ fontSize: 20, padding: '2px 8px' }}>&times;</button>
        </div>
        <div className="modal-body-cmcc" style={{ overflowY: 'auto', flex: 1 }}>
          {/* Info box */}
          <div className="alert-cmcc info" style={{ marginBottom: 16 }}>
            <i className="bi bi-info-circle me-2" />
            Dichiarazione ai sensi dell'art. 23 del D.P.R. n. 600/1973 per il calcolo delle ritenute d'acconto IRPEF.
          </div>

          {/* Dati Contribuente */}
          <div className="summary-section">
            <div className="summary-section-header">Dati Contribuente</div>
            <div className="row g-3">
              <div className="col-md-5"><label className="form-label">Cognome e Nome</label><input className="form-control" value={form.cognomeNome} onChange={e => update('cognomeNome', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Codice Fiscale</label><input className="form-control" value={form.cf} onChange={e => update('cf', e.target.value.toUpperCase())} maxLength={16} style={{ fontFamily: 'monospace' }} /></div>
              <div className="col-md-3"><label className="form-label">Data di nascita</label><input type="date" className="form-control" value={form.dataNascita} onChange={e => update('dataNascita', e.target.value)} /></div>
              <div className="col-md-5">
                <label className="form-label">Tipologia lavoratore</label>
                <select className="form-select" value={form.tipoLavoratore} onChange={e => update('tipoLavoratore', e.target.value)}>
                  <option value="dipendente">Lavoratore dipendente</option>
                  <option value="cococo">Collaboratore CoCoCo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Situazione Familiare */}
          <div className="summary-section">
            <div className="summary-section-header">Situazione Familiare</div>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Coniuge a carico</label>
                <div className="form-check mt-2">
                  <input type="checkbox" className="form-check-input" id="coniuge14" checked={form.coniuge} onChange={e => update('coniuge', e.target.checked)} />
                  <label className="form-check-label" htmlFor="coniuge14">Sì, coniuge a carico</label>
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label">N. figli a carico</label>
                <input type="number" className="form-control" min={0} max={20} value={form.nFigli} onChange={e => update('nFigli', e.target.value)} />
              </div>
              {parseInt(form.nFigli) > 0 && (
                <div className="col-md-4">
                  <label className="form-label">Primo figlio &lt; 3 anni</label>
                  <div className="form-check mt-2">
                    <input type="checkbox" className="form-check-input" id="fig3anni" checked={form.primoFiglioMenoreTre} onChange={e => update('primoFiglioMenoreTre', e.target.checked)} />
                    <label className="form-check-label" htmlFor="fig3anni">Sì, primo figlio sotto i 3 anni</label>
                  </div>
                </div>
              )}
              <div className="col-md-6">
                <label className="form-label">Altri familiari a carico</label>
                <input className="form-control" value={form.altriCarichi} onChange={e => update('altriCarichi', e.target.value)} placeholder="Es. genitore, fratello..." />
              </div>
            </div>
          </div>

          {/* Detrazioni */}
          <div className="summary-section">
            <div className="summary-section-header">Detrazioni Richieste</div>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Reddito presunto annuo (€)</label>
                <input type="number" className="form-control" min={0} value={form.redditoPresunto} onChange={e => update('redditoPresunto', e.target.value)} placeholder="Es. 35000" />
              </div>
              <div className="col-12">
                <div className="form-check mb-2">
                  <input type="checkbox" className="form-check-input" id="detLav" checked={form.detLavoroDipendente} onChange={e => update('detLavoroDipendente', e.target.checked)} />
                  <label className="form-check-label" htmlFor="detLav">Richiedo la detrazione per lavoro dipendente / CoCoCo (art. 13 TUIR)</label>
                </div>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="detFam" checked={form.detCarichiFamily} onChange={e => update('detCarichiFamily', e.target.checked)} />
                  <label className="form-check-label" htmlFor="detFam">Richiedo la detrazione per carichi familiari (art. 12 TUIR)</label>
                </div>
              </div>
            </div>
          </div>

          {/* Firma */}
          <div className="summary-section">
            <div className="summary-section-header">Firma</div>
            <div className="row g-3">
              <div className="col-md-3"><label className="form-label">Data dichiarazione</label><input type="date" className="form-control" value={form.dataFirma} onChange={e => update('dataFirma', e.target.value)} /></div>
              <div className="col-md-5">
                <label className="form-label">Firma del dichiarante (testo)</label>
                <input className="form-control" value={form.firma} onChange={e => update('firma', e.target.value)} placeholder="Cognome Nome per firma digitale simulata" />
              </div>
            </div>
            <div className="alert-cmcc warning" style={{ marginTop: 12 }}>
              <i className="bi bi-exclamation-triangle me-2" />
              Il dichiarante attesta che le informazioni fornite sono veritiere e aggiornate. Dati falsi comportano responsabilità penale.
            </div>
          </div>
        </div>
        <div className="modal-footer-cmcc" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-cmcc-secondary" onClick={onClose}>Chiudi</button>
          <button className="btn-cmcc-ghost" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-printer me-1" />Stampa PDF
          </button>
          <button className="btn-cmcc-primary" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-file-earmark-pdf me-1" />Salva come PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: MOD102 ─────────────────────────────────────────────────────────────
function ModalMOD102({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    nomeCognome: '', cf: '', tipoCollab: 'CoCoCo',
    dataVisione: '', firma: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header-cmcc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="tag tag-amber me-2">Non Subordinato</span>
            <strong>MOD102 — Informativa Lavoratori CoCoCo</strong>
          </div>
          <button className="btn-cmcc-ghost" onClick={onClose} style={{ fontSize: 20, padding: '2px 8px' }}>&times;</button>
        </div>
        <div className="modal-body-cmcc" style={{ overflowY: 'auto', flex: 1 }}>
          {/* Informativa */}
          <div className="summary-section">
            <div className="summary-section-header">Informativa D.L. 104/2022</div>
            <div style={{ background: 'var(--cmcc-bg)', borderRadius: 8, padding: 16, fontSize: 13, lineHeight: 1.7, color: 'var(--cmcc-text)' }}>
              <p><strong>Ai sensi del Decreto Legislativo 27 giugno 2022, n. 104</strong> (attuazione della Direttiva UE 2019/1152 relativa a condizioni di lavoro trasparenti e prevedibili nell'Unione Europea), la <strong>Fondazione CMCC – Centro Euro-Mediterraneo sui Cambiamenti Climatici</strong> fornisce al collaboratore coordinato e continuativo le seguenti informazioni:</p>
              <ul>
                <li><strong>Identità delle parti:</strong> Fondazione CMCC (C.F. 02487600754), con sede in Viterbo, Via Augusto Imperatore 16.</li>
                <li><strong>Luogo di lavoro:</strong> come indicato nel contratto di collaborazione individuale.</li>
                <li><strong>Natura del rapporto:</strong> collaborazione coordinata e continuativa ex art. 409 c.p.c., parasubordinata, non assimilabile a lavoro subordinato.</li>
                <li><strong>Durata:</strong> il rapporto ha durata determinata come specificata nel contratto.</li>
                <li><strong>Compenso:</strong> il corrispettivo lordo è indicato nel contratto individuale e soggetto a ritenuta d'acconto IRPEF del 20%.</li>
                <li><strong>Orario e organizzazione:</strong> il collaboratore gestisce autonomamente tempi e modalità di esecuzione della prestazione, coordinandosi con il Responsabile di struttura.</li>
                <li><strong>Ferie e assenze:</strong> non si applicano istituti del CCNL. Il collaboratore può sospendere l'attività previo accordo con il referente.</li>
                <li><strong>Formazione:</strong> la Fondazione può mettere a disposizione percorsi formativi secondo disponibilità.</li>
                <li><strong>Previdenza:</strong> il collaboratore è iscritto alla Gestione Separata INPS (art. 2, co. 26, L. 335/1995). L'aliquota contributiva è ripartita tra Fondazione (2/3) e collaboratore (1/3).</li>
                <li><strong>Diritti:</strong> il collaboratore ha diritto a condizioni di salute e sicurezza adeguate ai sensi del D.Lgs. 81/2008 ove applicabile.</li>
              </ul>
              <p>Per qualsiasi informazione relativa al rapporto di collaborazione, il collaboratore può rivolgersi all'Ufficio Gestione Risorse Umane: <a href="mailto:hr@cmcc.it" style={{ color: 'var(--cmcc-blue)' }}>hr@cmcc.it</a>.</p>
            </div>
          </div>

          {/* Dati Collaboratore */}
          <div className="summary-section">
            <div className="summary-section-header">Dati Collaboratore</div>
            <div className="row g-3">
              <div className="col-md-5"><label className="form-label">Nome e Cognome</label><input className="form-control" value={form.nomeCognome} onChange={e => update('nomeCognome', e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Codice Fiscale</label><input className="form-control" value={form.cf} onChange={e => update('cf', e.target.value.toUpperCase())} maxLength={16} style={{ fontFamily: 'monospace' }} /></div>
              <div className="col-md-3">
                <label className="form-label">Tipo collaborazione</label>
                <select className="form-select" value={form.tipoCollab} onChange={e => update('tipoCollab', e.target.value)}>
                  <option>CoCoCo</option>
                  <option>Borsa di Studio</option>
                  <option>Tirocinio</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accettazione */}
          <div className="summary-section">
            <div className="summary-section-header">Accettazione</div>
            <div className="row g-3">
              <div className="col-md-4"><label className="form-label">Data presa visione</label><input type="date" className="form-control" value={form.dataVisione} onChange={e => update('dataVisione', e.target.value)} /></div>
              <div className="col-md-5"><label className="form-label">Firma collaboratore (conferma testo)</label><input className="form-control" value={form.firma} onChange={e => update('firma', e.target.value)} placeholder="Inserire nome e cognome per conferma" /></div>
            </div>
            <div className="alert-cmcc info" style={{ marginTop: 12 }}>
              <i className="bi bi-check-circle me-2" />
              Confermando la firma, il collaboratore dichiara di aver letto e compreso tutte le informazioni contenute nella presente informativa.
            </div>
          </div>
        </div>
        <div className="modal-footer-cmcc" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-cmcc-secondary" onClick={onClose}>Chiudi</button>
          <button className="btn-cmcc-ghost" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-printer me-1" />Stampa PDF
          </button>
          <button className="btn-cmcc-primary" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-file-earmark-pdf me-1" />Salva come PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Generic modal for MOD10 / MOD10BIS ───────────────────────────────────────
function ModalGeneric({ modulo, onClose }: { modulo: Modulo; onClose: () => void }) {
  const badgeClass = BADGE_CLASS[modulo.badge];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header-cmcc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className={`tag ${badgeClass} me-2`}>{modulo.badge}</span>
            <strong>{modulo.code} — {modulo.title}</strong>
          </div>
          <button className="btn-cmcc-ghost" onClick={onClose} style={{ fontSize: 20, padding: '2px 8px' }}>&times;</button>
        </div>
        <div className="modal-body-cmcc" style={{ overflowY: 'auto', flex: 1 }}>
          <p style={{ color: 'var(--cmcc-text-muted)', marginBottom: 20 }}>{modulo.description}</p>
          {modulo.sections.map(sec => (
            <div className="summary-section" key={sec.title}>
              <div className="summary-section-header">{sec.title}</div>
              <div className="row g-3">
                {(sec.fields ?? []).map(field => (
                  <div className="col-md-6" key={field}>
                    <label className="form-label">{field}</label>
                    <input className="form-control" placeholder={field} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="modal-footer-cmcc" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-cmcc-secondary" onClick={onClose}>Chiudi</button>
          <button className="btn-cmcc-ghost" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-printer me-1" />Stampa PDF
          </button>
          <button className="btn-cmcc-primary" onClick={() => alert('Funzionalità disponibile nella versione completa con backend')}>
            <i className="bi bi-file-earmark-pdf me-1" />Salva come PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal dispatcher ──────────────────────────────────────────────────────────
function ModuloModal({ modulo, onClose }: { modulo: Modulo; onClose: () => void }) {
  switch (modulo.id) {
    case 'MOD09':    return <ModalMOD09 onClose={onClose} />;
    case 'MOD13':    return <ModalMOD13 onClose={onClose} />;
    case 'MOD138':   return <ModalMOD138 onClose={onClose} />;
    case 'MOD14':    return <ModalMOD14 onClose={onClose} />;
    case 'MOD102':   return <ModalMOD102 onClose={onClose} />;
    default:         return <ModalGeneric modulo={modulo} onClose={onClose} />;
  }
}

// ── Modulo Card ───────────────────────────────────────────────────────────────
interface ModuloCardProps {
  modulo: Modulo;
  onCompila: (m: Modulo) => void;
}

function ModuloCard({ modulo, onCompila }: ModuloCardProps) {
  const [expanded, setExpanded] = useState(false);
  const badgeClass = BADGE_CLASS[modulo.badge];

  return (
    <div className="card-cmcc" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
        <div>
          <span className={`tag ${badgeClass}`} style={{ marginRight: 6 }}>{modulo.badge}</span>
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--cmcc-text-muted)', fontWeight: 600 }}>
            {modulo.code}
          </span>
        </div>
        {modulo.fieldCount !== undefined && (
          <span className="tag tag-gray" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
            {modulo.fieldCount} campi
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }}>
        {modulo.title}
      </div>

      {/* Description */}
      <div style={{ color: 'var(--cmcc-text-muted)', fontSize: 13, marginBottom: 12, lineHeight: 1.5, flex: 1 }}>
        {modulo.description}
      </div>

      {/* Sections collapsible */}
      {modulo.sections.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button
            className="btn-cmcc-ghost"
            style={{ fontSize: 12, padding: '4px 10px', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            onClick={() => setExpanded(prev => !prev)}
          >
            <span>
              <i className="bi bi-list-ul me-1" />
              {modulo.sections.length} sezioni
            </span>
            <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`} />
          </button>

          {expanded && (
            <div style={{ marginTop: 8, paddingLeft: 4 }}>
              {modulo.sections.map((sec, idx) => (
                <div key={idx} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--cmcc-text)', marginBottom: 3 }}>
                    <i className="bi bi-chevron-right me-1" style={{ color: 'var(--cmcc-blue)', fontSize: 10 }} />
                    {sec.title}
                  </div>
                  {sec.fields && sec.fields.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 11, color: 'var(--cmcc-text-muted)' }}>
                      {sec.fields.map((f, fi) => <li key={fi}>{f}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button
          className="btn-cmcc-primary"
          style={{ flex: 1, fontSize: 13 }}
          onClick={() => onCompila(modulo)}
        >
          <i className="bi bi-pencil-square me-1" />
          Compila Ora
        </button>
        <button
          className="btn-cmcc-ghost"
          style={{ fontSize: 13, padding: '6px 12px' }}
          onClick={() => alert(`Funzionalità disponibile nella versione completa con backend`)}
          title="Informazioni modulo"
        >
          <i className="bi bi-info-circle" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ModuliLibrary() {
  const [activeFilter, setActiveFilter] = useState<ModuloBadge | 'Tutti'>('Tutti');
  const [openModulo, setOpenModulo] = useState<Modulo | null>(null);

  const filtered = activeFilter === 'Tutti'
    ? MODULI
    : MODULI.filter(m => m.badge === activeFilter);

  return (
    <div>
      {/* Page heading */}
      <div className="page-heading">
        <h1 className="page-title">Moduli HR</h1>
        <p className="page-subtitle">
          Biblioteca dei moduli digitalizzati del processo contratti &nbsp;&middot;&nbsp;
          <span className="tag tag-blue" style={{ fontSize: 11 }}>Sistema Helios</span>
        </p>
      </div>

      {/* Filter tabs */}
      <div className="filter-bar" style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            className={`filter-chip ${activeFilter === tab ? 'active' : ''}`}
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
            {tab !== 'Tutti' && (
              <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.8 }}>
                ({MODULI.filter(m => m.badge === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{ marginBottom: 16, color: 'var(--cmcc-text-muted)', fontSize: 13 }}>
        <strong style={{ color: 'var(--cmcc-text)' }}>{filtered.length}</strong> moduli disponibili
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><i className="bi bi-file-earmark-x" style={{ fontSize: 40 }} /></div>
          <div className="empty-title">Nessun modulo trovato</div>
          <div className="empty-desc">Seleziona un'altra categoria.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map(m => (
            <ModuloCard key={m.id} modulo={m} onCompila={setOpenModulo} />
          ))}
        </div>
      )}

      {/* Modal */}
      {openModulo && (
        <ModuloModal modulo={openModulo} onClose={() => setOpenModulo(null)} />
      )}
    </div>
  );
}
