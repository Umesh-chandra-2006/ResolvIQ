import { Features, Decision, Contribution, HardRule, Verdict, Route } from '../types';

type ScorecardWeight = {
  feature: keyof Features;
  weight: number;
  evidenceIds: string[];
};

const SCORECARD_WEIGHTS: ScorecardWeight[] = [
  { feature: 'delivery_scan_present', weight: -1.6, evidenceIds: ['E-1'] },
  { feature: 'delivery_signature_match', weight: -1.4, evidenceIds: ['E-1'] },
  { feature: 'device_fingerprint_match', weight: -0.9, evidenceIds: ['E-2'] },
  { feature: 'descriptor_mismatch', weight: 1.2, evidenceIds: ['E-2', 'E-4'] },
  { feature: 'member_dispute_rate_z', weight: -0.55, evidenceIds: ['E-3'] },
  { feature: 'merchant_dispute_rate_z', weight: 0.7, evidenceIds: ['E-2'] },
  { feature: 'prior_refund_attempt', weight: 0.45, evidenceIds: ['E-5'] },
  { feature: 'amount_vs_history_z', weight: -0.2, evidenceIds: ['E-4'] },
  { feature: 'merchant_response_completeness', weight: -1.0, evidenceIds: ['E-3'] },
  { feature: 'claim_evidence_contradiction', weight: -1.8, evidenceIds: ['E-4', 'E-5'] },
];

const INTERCEPT = 0.1;

// Calibration maps the scorecard margin |z| (distance from the decision
// boundary, in log-odds) to a verdict-certainty score. A case far from the
// boundary — for either side — is high-certainty; a case near it is low.
// Constants are fixed, fit to the seeded scenarios; production trains and
// calibrates on held-out synthetic cases per proposal §8.
const PLATT_A = 1.9;
const PLATT_B = -0.74;

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function plattCalibrate(margin: number): number {
  return sigmoid(PLATT_A * margin + PLATT_B);
}

function booleanToNumber(v: boolean): number {
  return v ? 1 : 0;
}

function computeScorecardZ(features: Features): number {
  let z = INTERCEPT;
  for (const sw of SCORECARD_WEIGHTS) {
    const val = features[sw.feature];
    const numVal = typeof val === 'boolean' ? booleanToNumber(val) : (val as number);
    z += sw.weight * numVal;
  }
  return z;
}

function computeContributions(features: Features): Contribution[] {
  const contribs: Contribution[] = [];
  for (const sw of SCORECARD_WEIGHTS) {
    const val = features[sw.feature];
    const numVal = typeof val === 'boolean' ? booleanToNumber(val) : (val as number);
    contribs.push({
      feature: sw.feature,
      value: sw.weight * numVal,
      evidenceIds: sw.evidenceIds,
    });
  }
  return contribs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

function monotonicTree(features: Features): number {
  let score = 0.5;
  if (features.delivery_scan_present) score -= 0.25;
  if (features.delivery_signature_match) score -= 0.2;
  if (features.device_fingerprint_match) score -= 0.1;
  score += features.descriptor_mismatch * 0.2;
  score += features.merchant_dispute_rate_z * 0.05;
  score -= features.member_dispute_rate_z * 0.03;
  score -= features.merchant_response_completeness * 0.15;
  score -= features.claim_evidence_contradiction * 0.3;
  return Math.max(0, Math.min(1, score));
}

export type HardRuleDef = {
  id: string;
  description: string;
  evaluate: (features: Features, amount: number, reasonCode: string) => boolean;
};

export const HARD_RULES: HardRuleDef[] = [
  {
    id: 'HR-1',
    description:
      'Delivery signature and device fingerprint both consistent with receipt — blocks auto-resolve',
    evaluate: (f, _a, rc) =>
      rc === 'C08_goods_not_received' &&
      f.delivery_signature_match &&
      f.device_fingerprint_match,
  },
  {
    id: 'HR-2',
    description: 'Amount exceeds $2,500 — never auto-resolve',
    evaluate: (_f, a) => a > 2500,
  },
  {
    id: 'HR-3',
    description: 'Member dispute rate z-score > 3.0 — never auto-credit without human review',
    evaluate: (f) => f.member_dispute_rate_z > 3.0,
  },
  {
    id: 'HR-4',
    description: 'Model-scorecard disagreement exceeds threshold — escalation required',
    evaluate: () => false,
  },
];

export function evaluateHardRules(
  features: Features,
  amount: number,
  reasonCode: string,
  pModel: number,
  pScorecard: number
): HardRule[] {
  return HARD_RULES.map((hr) => {
    if (hr.id === 'HR-4') {
      return {
        id: hr.id,
        description: hr.description,
        fired: Math.abs(pModel - pScorecard) > 0.25,
      };
    }
    return {
      id: hr.id,
      description: hr.description,
      fired: hr.evaluate(features, amount, reasonCode),
    };
  });
}

function computeDistribution(
  verdict: Verdict,
  contributions: Contribution[]
): { member: number; merchant: number } {
  if (verdict === 'member') return { member: 100, merchant: 0 };
  if (verdict === 'merchant') return { member: 0, merchant: 100 };

  const memberPositive = contributions
    .filter((c) => c.value > 0)
    .reduce((sum, c) => sum + c.value, 0);
  const merchantNegative = contributions
    .filter((c) => c.value < 0)
    .reduce((sum, c) => sum + Math.abs(c.value), 0);
  const total = memberPositive + merchantNegative;
  if (total === 0) return { member: 50, merchant: 50 };
  const memberPct = Math.round((memberPositive / total) * 100);
  return { member: memberPct, merchant: 100 - memberPct };
}

function determineVerdict(
  pScorecard: number,
  hardRulesFired: string[],
  route: Route
): Verdict {
  // HR-1 blocks any automated credit to the member.
  if (hardRulesFired.includes('HR-1')) return 'merchant';
  // A proposed split is, by definition, a split verdict.
  if (route === 'proposed_split') return 'split';
  return pScorecard >= 0.5 ? 'member' : 'merchant';
}

function determineRoute(
  confidence: number,
  hardRulesFired: string[],
  scorecardAgreement: boolean
): Route {
  const hasBlockingRule = hardRulesFired.some((r) => r === 'HR-1' || r === 'HR-2' || r === 'HR-3' || r === 'HR-4');
  if (confidence >= 0.85 && !hasBlockingRule && scorecardAgreement) {
    return 'auto_resolve';
  }
  if (confidence >= 0.55 && confidence < 0.85) {
    return 'proposed_split';
  }
  return 'human_escalation';
}

export function score(
  features: Features,
  amount: number,
  reasonCode: string
): Omit<Decision, 'narration' | 'guardReport'> {
  const z = computeScorecardZ(features);
  const pScorecard = sigmoid(z);
  const pModel = monotonicTree(features);
  const hardRules = evaluateHardRules(features, amount, reasonCode, pModel, pScorecard);
  const hardRulesFired = hardRules.filter((r) => r.fired).map((r) => r.id);

  // Confidence = calibrated certainty of the verdict, derived from the margin
  // |z| (distance from the decision boundary). A strong case for either side
  // yields high confidence; a case near the boundary yields low confidence.
  const margin = Math.abs(z);
  const confidence = plattCalibrate(margin);

  const contributions = computeContributions(features);
  const scorecardAgreement = Math.abs(pModel - pScorecard) <= 0.25;

  const route = determineRoute(confidence, hardRulesFired, scorecardAgreement);
  const verdict = determineVerdict(pScorecard, hardRulesFired, route);

  const distribution = computeDistribution(verdict, contributions);

  return {
    verdict,
    confidence: Math.round(confidence * 100) / 100,
    distribution,
    contributions,
    hardRulesFired,
    scorecardAgreement,
    route,
  };
}

export function assertScenario(
  name: string,
  features: Features,
  amount: number,
  reasonCode: string,
  expected: { verdict?: Verdict; route?: Route; confApprox?: number }
) {
  const result = score(features, amount, reasonCode);
  const errors: string[] = [];
  if (expected.verdict && result.verdict !== expected.verdict) {
    errors.push(`verdict: expected ${expected.verdict}, got ${result.verdict}`);
  }
  if (expected.route && result.route !== expected.route) {
    errors.push(`route: expected ${expected.route}, got ${result.route}`);
  }
  if (expected.confApprox !== undefined) {
    const diff = Math.abs(result.confidence - expected.confApprox);
    if (diff > 0.1) {
      errors.push(`confidence: expected ~${expected.confApprox}, got ${result.confidence}`);
    }
  }
  if (errors.length > 0) {
    console.error(`FAIL ${name}:`, errors.join('; '));
  } else {
    console.log(`PASS ${name}`);
  }
  return result;
}
