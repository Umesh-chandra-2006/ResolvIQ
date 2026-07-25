import { ReasonCode } from '../types';

export const REASON_CODE_LABELS: Record<ReasonCode, string> = {
  C08_goods_not_received: 'Goods not received',
  C31_not_as_described: 'Not as described',
  F29_unrecognised_charge: 'Unrecognised charge',
  C05_cancelled_merchandise: 'Cancelled merchandise',
};

export const REASON_CODE_DESCRIPTIONS: Record<ReasonCode, string> = {
  C08_goods_not_received:
    'The cardmember claims they never received the purchased goods. The merchant is expected to provide proof of delivery (tracking with signature confirmation) to contest this claim.',
  C31_not_as_described:
    'The cardmember claims the goods received differ materially from the description at the time of purchase. Visual evidence and merchant product descriptions are key.',
  F29_unrecognised_charge:
    'The cardmember does not recognise the charge on their statement. Transaction details, merchant descriptor clarity, and cardmember presence evidence are evaluated.',
  C05_cancelled_merchandise:
    'The cardmember claims merchandise was returned or cancelled but a charge still appears. Return receipts, merchant confirmation, and refund status are key.',
};

export const POLICY_TEXT: Record<ReasonCode, string> = {
  C08_goods_not_received: `Under American Express chargeback reason code C08 (Goods Not Received), the cardmember claims merchandise was purchased but never delivered. For the merchant to contest, they must provide delivery confirmation with signature (for items over $750) or tracking showing delivery to the cardmember's address. If no delivery scan exists, the dispute is typically resolved in favor of the cardmember. If a signed delivery scan exists AND the device fingerprint matches the cardmember's known device, the claim may indicate friendly fraud and should be escalated for human review. Merchant dispute rate z-scores above 2.0 suggest a pattern of delivery issues.`,
  C31_not_as_described: `Under American Express chargeback reason code C31 (Not as Described), the cardmember claims goods received differ materially from the merchant's description. Key factors: descriptor mismatch score (0-1 scale comparing advertised vs received), merchant response completeness (did they provide product specs, photos, policy?), and whether the merchant's return policy is clear. A prior refund attempt by the cardmember strengthens their claim. Split resolution is common when evidence is ambiguous — contributions from both sides are weighted proportionally.`,
  F29_unrecognised_charge: `Under American Express chargeback reason code F29 (Unrecognised Charge), the cardmember does not recognise a transaction on their statement. Evaluate: merchant descriptor clarity, transaction entry mode (card-present vs card-not-present), whether the device fingerprint matches known devices, and the cardmember's transaction history. If the merchant can demonstrate card-present transaction with matching device, the charge may be legitimate. The 24-hour pre-adjudication window gives the merchant time to respond before formal adjudication.`,
  C05_cancelled_merchandise: `Under American Express chargeback reason code C05 (Cancelled Merchandise), the cardmember claims merchandise was returned or the transaction was cancelled, yet a charge remains. Evidence needed: return receipt or confirmation, merchant acknowledgment of return, refund processing status. If the merchant can show the return was outside their return window or the item was not actually returned, the dispute may be resolved in their favor.`,
};

export const CONTRIBUTION_LABELS: Record<string, string> = {
  delivery_scan_present: 'Delivery scan status',
  delivery_signature_match: 'Signature match',
  device_fingerprint_match: 'Device fingerprint match',
  descriptor_mismatch: 'Descriptor mismatch',
  member_dispute_rate_z: 'Member dispute history',
  merchant_dispute_rate_z: 'Merchant dispute rate',
  prior_refund_attempt: 'Prior refund attempt',
  amount_vs_history_z: 'Amount vs history',
  merchant_response_completeness: 'Merchant response completeness',
  claim_evidence_contradiction: 'Claim-evidence contradiction',
};
