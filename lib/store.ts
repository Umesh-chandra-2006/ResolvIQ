import { create } from 'zustand';
import { DisputeCase, Decision, LedgerEntry, EvidenceItem } from './types';
import { INITIAL_CASES, SCENARIO_A, SCENARIO_B, SCENARIO_C, SCENARIO_D } from './fixtures/cases';
import { score } from './engine/score';
import { narrateWithInjection } from './engine/narrate';
import { globalLedger } from './engine/ledger';
import { ReasonCode } from './types';

type Role = 'cardmember' | 'merchant' | 'agent' | 'auditor';

type DemoSpeed = '1x' | '0.25x' | '0.5x';

type AppState = {
  cases: Record<string, DisputeCase>;
  currentRole: Role;
  activeCaseId: string | null;
  demoSpeed: DemoSpeed;
  injectUnfaithful: boolean;
  tamperedEntry: number | null;
  ledgerEntries: LedgerEntry[];
  pipelineRunning: boolean;
  pipelineStep: number;
  filterRoute: string | null;

  setRole: (role: Role) => void;
  setActiveCase: (caseId: string) => void;
  setDemoSpeed: (speed: DemoSpeed) => void;
  setInjectUnfaithful: (v: boolean) => void;
  setFilterRoute: (route: string | null) => void;

  jumpToScenario: (scenario: 'A' | 'B' | 'C' | 'D' | 'all') => void;
  resetAll: () => void;
  runPipeline: (caseId: string) => Promise<void>;
  fileDispute: (data: {
    txnId: string;
    reasonCode: ReasonCode;
    amount: number;
    merchantId: string;
    claim: string;
  }) => Promise<string>;
  addEvidence: (caseId: string, evidence: EvidenceItem) => void;
  appealCase: (caseId: string) => Promise<void>;
  tamperLedgerEntry: (index: number) => Promise<void>;
  resetLedgerTamper: () => Promise<void>;
  overrideDecision: (caseId: string, reason: string) => Promise<void>;
  acceptSplit: (caseId: string, party: 'member' | 'merchant') => Promise<void>;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDelay(): number {
  const speed = useAppStore.getState().demoSpeed;
  if (speed === '0.25x') return 250;
  if (speed === '0.5x') return 500;
  return 1000;
}

export const useAppStore = create<AppState>((set, get) => ({
  cases: { ...INITIAL_CASES },
  currentRole: 'cardmember',
  activeCaseId: null,
  demoSpeed: '1x',
  injectUnfaithful: false,
  tamperedEntry: null,
  ledgerEntries: [],
  pipelineRunning: false,
  pipelineStep: 0,
  filterRoute: null,

  setRole: (role) => set({ currentRole: role }),
  setActiveCase: (caseId) => set({ activeCaseId: caseId }),
  setDemoSpeed: (speed) => set({ demoSpeed: speed }),
  setInjectUnfaithful: (v) => set({ injectUnfaithful: v }),
  setFilterRoute: (route) => set({ filterRoute: route }),

  jumpToScenario: (scenario) => {
    const scenarioMap: Record<string, DisputeCase> = {
      A: { ...SCENARIO_A },
      B: { ...SCENARIO_B },
      C: { ...SCENARIO_C },
      D: { ...SCENARIO_D },
    };
    if (scenario === 'all') {
      set({
        cases: { ...INITIAL_CASES },
        activeCaseId: null,
        tamperedEntry: null,
      });
      globalLedger.reset();
      set({ ledgerEntries: [] });
      return;
    }
    const sc = scenarioMap[scenario];
    if (sc) {
      set((state) => ({
        cases: { ...state.cases, [sc.id]: { ...sc },
          ...Object.fromEntries(
            Object.values(scenarioMap)
              .filter((c) => c.id !== sc.id)
              .map((c) => [c.id, { ...c }])
          ),
        },
        activeCaseId: sc.id,
      }));
    }
  },

  resetAll: () => {
    globalLedger.reset();
    set({
      cases: { ...INITIAL_CASES },
      activeCaseId: null,
      tamperedEntry: null,
      ledgerEntries: [],
      pipelineRunning: false,
      pipelineStep: 0,
      filterRoute: null,
    });
  },

  fileDispute: async (data) => {
    const id = `D-2026-${String(Object.keys(get().cases).length + 847).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const created = new Date(now);
    const ack = new Date(created);
    ack.setDate(ack.getDate() + 30);
    const resolve = new Date(created);
    resolve.setDate(resolve.getDate() + 90);

    const newCase: DisputeCase = {
      id,
      reasonCode: data.reasonCode,
      amount: data.amount,
      merchantId: data.merchantId,
      txnId: data.txnId,
      structuredClaim: data.claim,
      status: 'filed',
      createdAt: now,
      updatedAt: now,
      evidence: [],
      features: null,
      decision: null,
      assignedAgent: null,
      regZ: { ackDeadline: ack.toISOString(), resolveDeadline: resolve.toISOString() },
    };

    await globalLedger.append(id, 'member', 'case_opened', { reasonCode: data.reasonCode, amount: data.amount });
    const entries = globalLedger.getEntries();

    set((state) => ({
      cases: { ...state.cases, [id]: newCase },
      activeCaseId: id,
      ledgerEntries: entries,
    }));

    return id;
  },

  addEvidence: (caseId, evidence) => {
    set((state) => {
      const c = state.cases[caseId];
      if (!c) return state;
      return {
        cases: {
          ...state.cases,
          [caseId]: { ...c, evidence: [...c.evidence, evidence], updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  runPipeline: async (caseId) => {
    const state = get();
    const c = state.cases[caseId];
    if (!c) return;

    set({ pipelineRunning: true, pipelineStep: 1 });

    await delay(getDelay());

    set((s) => ({
      cases: {
        ...s.cases,
        [caseId]: { ...s.cases[caseId], status: 'evidence_collected' },
      },
      pipelineStep: 2,
    }));
    await globalLedger.append(caseId, 'system', 'evidence_collected', {
      evidenceCount: c.evidence.length,
    });

    await delay(getDelay());

    if (!c.features) {
      set({ pipelineStep: 0, pipelineRunning: false });
      return;
    }

    const decisionWithoutNarration = score(c.features, c.amount, c.reasonCode);

    await delay(getDelay());

    set((s) => ({
      cases: {
        ...s.cases,
        [caseId]: { ...s.cases[caseId], status: 'scoring' },
      },
      pipelineStep: 3,
    }));
    await globalLedger.append(caseId, 'system:scorer', 'verdict_issued', {
      verdict: decisionWithoutNarration.verdict,
      confidence: decisionWithoutNarration.confidence,
      route: decisionWithoutNarration.route,
      hardRulesFired: decisionWithoutNarration.hardRulesFired,
    });

    await delay(getDelay());

    const { narration, guardReport } = narrateWithInjection(
      { decision: decisionWithoutNarration, evidence: c.evidence, reasonCode: c.reasonCode },
      get().injectUnfaithful
    );

    const fullDecision: Decision = {
      ...decisionWithoutNarration,
      narration,
      guardReport,
    };

    set((s) => ({
      cases: {
        ...s.cases,
        [caseId]: {
          ...s.cases[caseId],
          decision: fullDecision,
          status: 'routed',
          assignedAgent:
            fullDecision.route === 'human_escalation' ? 'Agent-1042' : null,
          updatedAt: new Date().toISOString(),
        },
      },
      pipelineStep: 4,
    }));

    await delay(getDelay());

    if (fullDecision.route === 'auto_resolve') {
      set((s) => ({
        cases: {
          ...s.cases,
          [caseId]: { ...s.cases[caseId], status: 'resolved' },
        },
      }));
      await globalLedger.append(caseId, 'system', 'auto_resolved', { verdict: fullDecision.verdict });
    } else if (fullDecision.route === 'human_escalation') {
      await globalLedger.append(caseId, 'system', 'escalated_to_human', { reason: fullDecision.hardRulesFired });
    } else {
      await globalLedger.append(caseId, 'system', 'proposed_split_offered', { distribution: fullDecision.distribution });
    }

    set({
      pipelineRunning: false,
      pipelineStep: 0,
      ledgerEntries: globalLedger.getEntries(),
    });
  },

  appealCase: async (caseId) => {
    await globalLedger.append(caseId, 'member', 'appeal_filed', {});
    set((s) => ({
      cases: {
        ...s.cases,
        [caseId]: { ...s.cases[caseId], status: 'appealed' },
      },
      ledgerEntries: globalLedger.getEntries(),
    }));
  },

  tamperLedgerEntry: async (index: number) => {
    globalLedger.tamper(index, { tampered: true, original: 'mutated' });
    set({ tamperedEntry: index, ledgerEntries: globalLedger.getEntries() });
  },

  resetLedgerTamper: async () => {
    const state = get();
    globalLedger.reset();
    for (const entry of state.ledgerEntries) {
      if (entry.payload.tampered) continue;
    }
    set({ tamperedEntry: null, ledgerEntries: globalLedger.getEntries() });
  },

  overrideDecision: async (caseId, reason) => {
    await globalLedger.append(caseId, 'agent:1042', 'override_decision', { reason });
    set((s) => ({
      cases: {
        ...s.cases,
        [caseId]: { ...s.cases[caseId], status: 'resolved' },
      },
      ledgerEntries: globalLedger.getEntries(),
    }));
  },

  acceptSplit: async (caseId, party) => {
    await globalLedger.append(caseId, party, 'split_accepted', {});
    set((s) => ({
      cases: {
        ...s.cases,
        [caseId]: { ...s.cases[caseId], status: 'resolved' },
      },
      ledgerEntries: globalLedger.getEntries(),
    }));
  },
}));
