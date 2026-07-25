import { DisputeCase, Features, ReasonCode } from '../types';

function regZDates(createdAt: string) {
  const created = new Date(createdAt);
  const ack = new Date(created);
  ack.setDate(ack.getDate() + 30);
  const resolve = new Date(created);
  resolve.setDate(resolve.getDate() + 90);
  return {
    ackDeadline: ack.toISOString(),
    resolveDeadline: resolve.toISOString(),
  };
}

function makeCase(
  id: string,
  reasonCode: ReasonCode,
  amount: number,
  merchantId: string,
  txnId: string,
  claim: string,
  status: DisputeCase['status'],
  createdAt: string,
  evidence: DisputeCase['evidence'] = [],
  features: Features | null = null,
  decision: DisputeCase['decision'] = null,
  assignedAgent: string | null = null
): DisputeCase {
  return {
    id,
    reasonCode,
    amount,
    merchantId,
    txnId,
    structuredClaim: claim,
    status,
    createdAt,
    updatedAt: createdAt,
    evidence,
    features,
    decision,
    assignedAgent,
    regZ: regZDates(createdAt),
  };
}

export const SCENARIO_A: DisputeCase = makeCase(
  'D-2026-0847',
  'C08_goods_not_received',
  184.5,
  'MERCH-2201',
  'TXN-99821',
  'I never received my order. The tracking shows no delivery scan.',
  'resolved',
  '2026-07-25T10:00:00Z',
  [
    {
      id: 'E-1',
      source: 'carrier',
      label: 'Carrier delivery scan',
      payload: { delivered: false, lastScan: null, carrier: 'FedEx' },
      fetchedAt: '2026-07-25T10:00:15Z',
      sha256: 'a1b2c3d4e5f6',
      side: 'member',
      mocked: true,
    },
    {
      id: 'E-2',
      source: 'merchant_record',
      label: 'Merchant dispute rate',
      payload: { disputeRate: 0.047, portfolioAvg: 0.022, zScore: 2.1 },
      fetchedAt: '2026-07-25T10:00:12Z',
      sha256: 'b2c3d4e5f6a1',
      side: 'neutral',
      mocked: true,
    },
    {
      id: 'E-3',
      source: 'member_history',
      label: 'Member dispute history',
      payload: { totalDisputes: 1, tenure: 48, zScore: -0.3 },
      fetchedAt: '2026-07-25T10:00:10Z',
      sha256: 'c3d4e5f6a1b2',
      side: 'member',
      mocked: true,
    },
    {
      id: 'E-4',
      source: 'transaction_store',
      label: 'Transaction details',
      payload: {
        amount: 184.5,
        mcc: '5941',
        entryMode: 'card-present',
        deviceFingerprint: 'fp-unknown',
      },
      fetchedAt: '2026-07-25T10:00:08Z',
      sha256: 'd4e5f6a1b2c3',
      side: 'neutral',
      mocked: true,
    },
    {
      id: 'E-5',
      source: 'uploaded_document',
      label: 'Member receipt upload',
      payload: { filename: 'receipt_order_99821.pdf', pages: 1 },
      fetchedAt: '2026-07-25T10:00:05Z',
      sha256: 'e5f6a1b2c3d4',
      side: 'member',
      mocked: true,
    },
  ],
  {
    delivery_scan_present: false,
    delivery_signature_match: false,
    device_fingerprint_match: false,
    descriptor_mismatch: 0.0,
    member_dispute_rate_z: -0.3,
    merchant_dispute_rate_z: 2.1,
    prior_refund_attempt: false,
    amount_vs_history_z: 0.2,
    merchant_response_completeness: 0.0,
    claim_evidence_contradiction: 0.05,
  }
);

export const SCENARIO_B: DisputeCase = makeCase(
  'D-2026-0848',
  'C08_goods_not_received',
  340.0,
  'MERCH-3302',
  'TXN-99822',
  'I never received my package. I want a full refund.',
  'escalated',
  '2026-07-25T10:05:00Z',
  [
    {
      id: 'E-1',
      source: 'carrier',
      label: 'Carrier delivery scan',
      payload: {
        delivered: true,
        signedBy: 'J. DOE',
        signatureMatch: true,
        carrier: 'UPS',
      },
      fetchedAt: '2026-07-25T10:05:20Z',
      sha256: 'f6a1b2c3d4e5',
      side: 'merchant',
      mocked: true,
    },
    {
      id: 'E-2',
      source: 'transaction_store',
      label: 'Device fingerprint',
      payload: { deviceFingerprint: 'fp-member-known', match: true },
      fetchedAt: '2026-07-25T10:05:15Z',
      sha256: 'a2b3c4d5e6f7',
      side: 'merchant',
      mocked: true,
    },
    {
      id: 'E-3',
      source: 'member_history',
      label: 'Member dispute history',
      payload: { totalDisputes: 8, tenure: 24, zScore: 3.4 },
      fetchedAt: '2026-07-25T10:05:10Z',
      sha256: 'b3c4d5e6f7a2',
      side: 'neutral',
      mocked: true,
    },
    {
      id: 'E-4',
      source: 'transaction_store',
      label: 'Transaction details',
      payload: {
        amount: 340.0,
        mcc: '5941',
        entryMode: 'card-present',
        deviceFingerprint: 'fp-member-known',
      },
      fetchedAt: '2026-07-25T10:05:08Z',
      sha256: 'c4d5e6f7a2b3',
      side: 'neutral',
      mocked: true,
    },
    {
      id: 'E-5',
      source: 'merchant_record',
      label: 'Merchant response',
      payload: {
        policy: 'Standard return policy',
        response: 'Item delivered and signed for',
        disputeRate: 0.018,
      },
      fetchedAt: '2026-07-25T10:05:12Z',
      sha256: 'd5e6f7a2b3c4',
      side: 'merchant',
      mocked: true,
    },
  ],
  {
    delivery_scan_present: true,
    delivery_signature_match: true,
    device_fingerprint_match: true,
    descriptor_mismatch: 0.0,
    member_dispute_rate_z: 3.4,
    merchant_dispute_rate_z: -0.5,
    prior_refund_attempt: false,
    amount_vs_history_z: 0.8,
    merchant_response_completeness: 0.9,
    claim_evidence_contradiction: 0.9,
  }
);

export const SCENARIO_C: DisputeCase = makeCase(
  'D-2026-0849',
  'C31_not_as_described',
  920.0,
  'MERCH-4403',
  'TXN-99823',
  'The product I received looks nothing like what was advertised. Different color and material.',
  'routed',
  '2026-07-25T10:10:00Z',
  [
    {
      id: 'E-1',
      source: 'carrier',
      label: 'Carrier delivery scan',
      payload: { delivered: true, signedBy: null, carrier: 'USPS' },
      fetchedAt: '2026-07-25T10:10:20Z',
      sha256: 'e6f7a2b3c4d5',
      side: 'neutral',
      mocked: true,
    },
    {
      id: 'E-2',
      source: 'merchant_record',
      label: 'Merchant descriptor',
      payload: { descriptor: 'PREMIUM LEATHER JACKET', productCode: 'JKT-8821' },
      fetchedAt: '2026-07-25T10:10:15Z',
      sha256: 'f7a2b3c4d5e6',
      side: 'merchant',
      mocked: true,
    },
    {
      id: 'E-3',
      source: 'merchant_record',
      label: 'Merchant policy',
      payload: { returnPolicy: 'ambiguous', responseCompleteness: 0.4 },
      fetchedAt: '2026-07-25T10:10:12Z',
      sha256: 'a3b4c5d6e7f8',
      side: 'merchant',
      mocked: true,
    },
    {
      id: 'E-4',
      source: 'uploaded_document',
      label: 'Member photos',
      payload: { photos: 2, description: 'Different color and texture' },
      fetchedAt: '2026-07-25T10:10:05Z',
      sha256: 'b4c5d6e7f8a3',
      side: 'member',
      mocked: true,
    },
    {
      id: 'E-5',
      source: 'comms_log',
      label: 'Prior communication',
      payload: { refundRequested: true, merchantResponded: false },
      fetchedAt: '2026-07-25T10:10:08Z',
      sha256: 'c5d6e7f8a3b4',
      side: 'member',
      mocked: true,
    },
  ],
  {
    delivery_scan_present: true,
    delivery_signature_match: false,
    device_fingerprint_match: false,
    descriptor_mismatch: 0.72,
    member_dispute_rate_z: 0.1,
    merchant_dispute_rate_z: 0.8,
    prior_refund_attempt: true,
    amount_vs_history_z: 1.2,
    merchant_response_completeness: 0.4,
    claim_evidence_contradiction: 0.3,
  }
);

export const SCENARIO_D: DisputeCase = makeCase(
  'D-2026-0850',
  'F29_unrecognised_charge',
  76.2,
  'MERCH-5504',
  'TXN-99824',
  'I see a charge on my statement that I do not recognise at all.',
  'evidence_collected',
  '2026-07-25T10:15:00Z',
  [
    {
      id: 'E-1',
      source: 'transaction_store',
      label: 'Transaction details',
      payload: {
        amount: 76.2,
        mcc: '5812',
        merchantName: 'EATWELL CAFE',
        entryMode: 'card-present',
      },
      fetchedAt: '2026-07-25T10:15:10Z',
      sha256: 'd6e7f8a3b4c5',
      side: 'neutral',
      mocked: true,
    },
    {
      id: 'E-2',
      source: 'merchant_record',
      label: 'Merchant response pending',
      payload: { responseStatus: 'pending', deadlineHours: 24 },
      fetchedAt: '2026-07-25T10:15:12Z',
      sha256: 'e7f8a3b4c5d6',
      side: 'merchant',
      mocked: true,
    },
  ],
  {
    delivery_scan_present: false,
    delivery_signature_match: false,
    device_fingerprint_match: false,
    descriptor_mismatch: 0.5,
    member_dispute_rate_z: 0.0,
    merchant_dispute_rate_z: 0.3,
    prior_refund_attempt: false,
    amount_vs_history_z: -0.1,
    merchant_response_completeness: 0.0,
    claim_evidence_contradiction: 0.2,
  }
);

// Deterministic PRNG (mulberry32) so background cases — and therefore every
// ops-dashboard metric computed from them — are byte-identical on every load.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BACKGROUND_STATUSES: DisputeCase['status'][] = [
  'filed',
  'evidence_collected',
  'scoring',
  'narrated',
  'routed',
  'resolved',
];

function makeBackgroundCase(index: number): DisputeCase {
  const rand = mulberry32(index + 1);
  const id = `D-2026-${String(851 + index).padStart(4, '0')}`;
  const reasonCode = REASON_CODES[index % REASON_CODES.length];
  const amount = Math.round((50 + rand() * 950) * 100) / 100;
  const daysAgo = Math.floor(rand() * 14);
  const status = BACKGROUND_STATUSES[Math.floor(rand() * BACKGROUND_STATUSES.length)];
  const d = new Date('2026-07-25T10:00:00Z');
  d.setDate(d.getDate() - daysAgo);
  return makeCase(
    id,
    reasonCode,
    amount,
    `MERCH-${6000 + index}`,
    `TXN-${90000 + index}`,
    `Dispute for order ${id}`,
    status,
    d.toISOString()
  );
}

const REASON_CODES: ReasonCode[] = [
  'C08_goods_not_received',
  'C31_not_as_described',
  'F29_unrecognised_charge',
  'C05_cancelled_merchandise',
];

export const BACKGROUND_CASES: DisputeCase[] = Array.from({ length: 20 }, (_, i) =>
  makeBackgroundCase(i)
);

export const ALL_CASES: DisputeCase[] = [
  SCENARIO_A,
  SCENARIO_B,
  SCENARIO_C,
  SCENARIO_D,
  ...BACKGROUND_CASES,
];

export const INITIAL_CASES: Record<string, DisputeCase> = Object.fromEntries(
  ALL_CASES.map((c) => [c.id, c])
);
