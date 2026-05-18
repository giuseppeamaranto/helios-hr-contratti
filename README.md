# Helios HR — Processo Contratti

Web app per la gestione del **Processo Contratti HR** della **Fondazione CMCC** (Centro Euro-Mediterraneo sui Cambiamenti Climatici).

## Descrizione

Applicazione React/Bootstrap che digitalizza l'intero flusso del processo contratti HR del CMCC, dalla richiesta iniziale al caricamento su Zucchetti.

### Funzionalità principali

- **Dashboard** — KPI, processi recenti, pipeline visuale
- **Board Processi** — vista tabella con filtri per unità, tipo operazione, stato
- **Wizard Nuovo Contratto** — 6 step guidati per avviare un processo contrattuale
- **Dettaglio Processo** — timeline, approvazioni, documenti, storia completa
- **Rubrica CMCC** — directory delle risorse con filtri avanzati (fonte: Helios/Zucchetti)
- **Moduli Digitalizzati** — MOD09, MOD10, MOD13, MOD138, MOD14, MOD102

### Stakeholder e ruoli

| Ruolo | Responsabilità |
|-------|---------------|
| **Responsabile di Struttura (RS)** | Avvia la richiesta, prima approvazione |
| **Direttore** | Seconda approvazione |
| **GRU** (HR) | Verifica, elaborazione, coordinamento |
| **AMM** (Amministrazione) | Predispone il contratto, carica su Zucchetti |

### Tipi di contratto gestiti

- CO.CO.CO. (Collaborazione Coordinata e Continuativa) → MOD09
- Borsa di Studio, Tirocinio, Consulenza → MOD09
- Subordinato TD/TI (Terziario Confcommercio) → MOD10

## Stack tecnologico

- **React 18** + TypeScript
- **Bootstrap 5** + Bootstrap Icons
- **Vite** (bundler)
- Dati mockup basati su MongoDB `Helios_TEST.DossierRisorse` (4065 risorse CMCC)

## Avvio locale

```bash
npm install
npm run dev
```

Apri [http://localhost:5174](http://localhost:5174)

## Build

```bash
npm run build
npm run preview
```

## Struttura progetto

```
src/
├── components/
│   ├── layout/        # Sidebar, Header
│   ├── dashboard/     # Dashboard principale
│   ├── process/       # ProcessBoard, ProcessDetail
│   ├── wizard/        # ContractWizard + 6 step
│   ├── people/        # PeopleDirectory (Rubrica CMCC)
│   ├── forms/         # ModuliLibrary
│   └── ui/            # Componenti condivisi (StatusBadge)
├── data/              # Mock data da MongoDB DossierRisorse
├── styles/            # CSS custom (design system CMCC)
└── types/             # TypeScript types
```

## Note

- Il simulatore di ruolo nell'header permette di testare l'app nei panni di RS, Direttore, GRU o AMM
- I dati mockup includono 15 risorse reali da `DossierRisorse` e 6 processi in vari stati
- La connessione MongoDB e il backend (API REST) sono prerequisiti per la versione production

---

*Sviluppato per Fondazione CMCC — Sistema Helios HR*
