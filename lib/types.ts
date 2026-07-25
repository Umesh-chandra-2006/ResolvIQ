export type ReasonCode =
  | 'C08_goods_not_received'
  | 'C31_not_as_described'
  | 'F29_unrecognised_charge'
  | 'C05_cancelled_merchandise';

export type EvidenceItem = {
  id: string;
  source:
    | 'transaction_store'
    | 'carrier'
    | 'merchant_record'
    | 'member_history'
    | 'comms_log'
    | 'uploaded_document';
  label: string;
  payload: Record<string, unknown>;
  fetchedAt: string;
  sha256: string;
  side: 'member' | 'merchant' | 'neutral';
  mocked: boolean;
};

export type Features = {
  delivery_scan_present: boolean;
  delivery_signature_match: boolean;
  device_fingerprint_match: boolean;
  descriptor_mismatch: number;
  member_dispute_rate_z: number;
  merchant_dispute_rate_z: number;
  prior_refund_attempt: boolean;
  amount_vs_history_z: number;
  merchant_response_completeness: number;
  claim_evidence_contradiction: number;
};

export type Verdict = 'member' | 'merchant' | 'split';
export type Route = 'auto_resolve' | 'proposed_split' | 'human_escalation';

export type Contribution = {
  feature: string;
  value: number;
  evidenceIds: string[];
};

export type HardRule = {
  id: string;
  description: string;
  fired: boolean;
};

export type GuardClaim = {
  claim: string;
  tracedTo: string | null;
};

export type Decision = {
  verdict: Verdict;
  confidence: number;
  distribution: { member: number; merchant: number };
  contributions: Contribution[];
  hardRulesFired: string[];
  scorecardAgreement: boolean;
  route: Route;
  narration: string;
  guardReport: GuardClaim[];
};

export type LedgerEntry = {
  seq: number;
  caseId: string;
  ts: string;
  actor: string;
  action: string;
  payload: Record<string, unknown>;
  prevHash: string;
  entryHash: string;
};

export type DisputeCase = {
  id: string;
  reasonCode: ReasonCode;
  amount: number;
  merchantId: string;
  txnId: string;
  structuredClaim: string;
  status:
    | 'filed'
    | 'evidence_collected'
    | 'scoring'
    | 'narrated'
    | 'routed'
    | 'resolved'
    | 'escalated'
    | 'appealed';
  createdAt: string;
  updatedAt: string;
  evidence: EvidenceItem[];
  features: Features | null;
  decision: Decision | null;
  assignedAgent: string | null;
  regZ: {
    ackDeadline: string;
    resolveDeadline: string;
  };
};

export type MetricTile = {
  label: string;
  value: string | number;
  subtext?: string;
};
