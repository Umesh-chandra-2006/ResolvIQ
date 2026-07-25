import { Decision, EvidenceItem, GuardClaim } from '../types';
import {
  REASON_CODE_LABELS,
  CONTRIBUTION_LABELS,
  POLICY_TEXT,
} from '../fixtures/policy';
import { ReasonCode } from '../types';

type NarrationInput = {
  decision: Omit<Decision, 'narration' | 'guardReport'>;
  evidence: EvidenceItem[];
  reasonCode: ReasonCode;
};

function getEvidenceById(evidence: EvidenceItem[], id: string): EvidenceItem | undefined {
  return evidence.find((e) => e.id === id);
}

function buildNarration(input: NarrationInput): { narration: string; claims: string[] } {
  const { decision, evidence, reasonCode } = input;
  const claims: string[] = [];
  const sentences: string[] = [];

  const reasonLabel = REASON_CODE_LABELS[reasonCode];

  const verdictText =
    decision.verdict === 'member'
      ? 'resolved in favor of the cardmember'
      : decision.verdict === 'merchant'
        ? 'resolved in favor of the merchant'
        : `split between the cardmember (${decision.distribution.member}%) and merchant (${decision.distribution.merchant}%)`;

  const caseContext = decision.contributions.length > 0 && decision.contributions[0].evidenceIds.length > 0
    ? 'involving multiple pieces of evidence'
    : '';
  sentences.push(
    `This ${reasonLabel} dispute (${caseContext}) has been ${verdictText} with ${Math.round(decision.confidence * 100)}% confidence.`
  );
  claims.push(
    `This ${reasonLabel} dispute has been ${verdictText} with ${Math.round(decision.confidence * 100)}% confidence.`
  );

  const topContributions = decision.contributions.filter((c) => Math.abs(c.value) > 0.3).slice(0, 4);
  for (const contrib of topContributions) {
    const label = CONTRIBUTION_LABELS[contrib.feature] || contrib.feature;
    const direction = contrib.value > 0 ? 'in favor of the cardmember' : 'in favor of the merchant';
    const evidenceRef = contrib.evidenceIds.join(', ');
    const sentence = `${label} contributed ${Math.abs(contrib.value).toFixed(2)} points ${direction} (evidence ${evidenceRef}).`;
    sentences.push(sentence);
    claims.push(sentence);
  }

  if (decision.hardRulesFired.length > 0) {
    const ruleText =
      decision.hardRulesFired.length === 1
        ? `Hard rule ${decision.hardRulesFired[0]} was triggered`
        : `Hard rules ${decision.hardRulesFired.join(' and ')} were triggered`;
    const sentence = `${ruleText}, overriding the model assessment.`;
    sentences.push(sentence);
    claims.push(sentence);
  }

  if (decision.route === 'proposed_split') {
    const sentence = `A proposed split is offered for parties to review within 48 hours.`;
    sentences.push(sentence);
    claims.push(sentence);
  } else if (decision.route === 'auto_resolve') {
    const sentence = `This case is auto-resolved with a written decision issued to both parties.`;
    sentences.push(sentence);
    claims.push(sentence);
  } else {
    const sentence = `This case is escalated to human review with the full case file attached.`;
    sentences.push(sentence);
    claims.push(sentence);
  }

  const policy = POLICY_TEXT[reasonCode];
  const policySnippet = policy.substring(0, 120) + '...';
  sentences.push(
    `This decision follows American Express chargeback policy for code ${reasonCode}: ${policySnippet}`
  );
  claims.push(
    `This decision follows American Express chargeback policy for code ${reasonCode}.`
  );

  return { narration: sentences.join(' '), claims };
}

export function runFaithfulnessGuard(
  claims: string[],
  evidence: EvidenceItem[],
  contributions: { feature: string; evidenceIds: string[] }[]
): GuardClaim[] {
  const evidenceIds = new Set(evidence.map((e) => e.id));
  const featureIds = new Set(contributions.flatMap((c) => c.evidenceIds));

  return claims.map((claim) => {
    const evidenceRefs = claim.match(/E-\d+/g) || [];
    if (evidenceRefs.length > 0) {
      const allTraced = evidenceRefs.every((ref) => evidenceIds.has(ref));
      return { claim, tracedTo: allTraced ? evidenceRefs.join(', ') : null };
    }

    const featureContrib = contributions.find(
      (c) =>
        claim.toLowerCase().includes(c.feature.replace(/_/g, ' ')) ||
        claim.includes(CONTRIBUTION_LABELS[c.feature] || '')
    );
    if (featureContrib && featureContrib.evidenceIds.length > 0) {
      return { claim, tracedTo: featureContrib.evidenceIds.join(', ') };
    }

    if (claim.includes('hard rule') || claim.includes('Hard rule')) {
      return { claim, tracedTo: 'HR-rule-engine' };
    }

    if (claim.includes('split') || claim.includes('auto-resolve') || claim.includes('escalated') || claim.includes('auto-resolved')) {
      return { claim, tracedTo: 'scoring-engine' };
    }

    if (claim.includes('policy') || claim.includes('chargeback')) {
      return { claim, tracedTo: 'policy-text' };
    }

    return { claim, tracedTo: null };
  });
}

export function narrate(input: NarrationInput): {
  narration: string;
  guardReport: GuardClaim[];
} {
  const { narration, claims } = buildNarration(input);
  const guardReport = runFaithfulnessGuard(
    claims,
    input.evidence,
    input.decision.contributions
  );
  return { narration, guardReport };
}

export function narrateWithInjection(
  input: NarrationInput,
  injectUnfaithful: boolean
): {
  narration: string;
  guardReport: GuardClaim[];
} {
  const result = narrate(input);

  if (injectUnfaithful) {
    const unfaithfulClaim =
      'The internal investigation found that the cardmember purchased 47 identical items from this merchant in the past month, suggesting coordinated fraud.';
    result.narration += ' ' + unfaithfulClaim;
    result.guardReport.push({ claim: unfaithfulClaim, tracedTo: null });
  }

  return result;
}
