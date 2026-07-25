import { LedgerEntry } from '../types';

function canonicalJSON(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const GENESIS_PREV_HASH = '0'.repeat(64);

export class Ledger {
  private entries: LedgerEntry[] = [];

  getEntries(): LedgerEntry[] {
    return [...this.entries];
  }

  getEntriesForCase(caseId: string): LedgerEntry[] {
    return this.entries.filter((e) => e.caseId === caseId);
  }

  getLength(): number {
    return this.entries.length;
  }

  async append(
    caseId: string,
    actor: string,
    action: string,
    payload: Record<string, unknown>
  ): Promise<LedgerEntry> {
    const seq = this.entries.length + 1;
    const ts = new Date().toISOString();
    const prevHash =
      this.entries.length > 0
        ? this.entries[this.entries.length - 1].entryHash
        : GENESIS_PREV_HASH;

    const entryPayload = { caseId, actor, action, payload, modelVersion: 'scorer-v0.3' };
    const canonical = canonicalJSON(entryPayload);
    const entryHash = await sha256(prevHash + canonical);

    const entry: LedgerEntry = {
      seq,
      caseId,
      ts,
      actor,
      action,
      payload,
      prevHash,
      entryHash,
    };

    this.entries.push(entry);
    return entry;
  }

  async verifyChain(): Promise<{ valid: boolean; firstBreak: number | null }> {
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      const expectedPrevHash =
        i === 0 ? GENESIS_PREV_HASH : this.entries[i - 1].entryHash;

      if (entry.prevHash !== expectedPrevHash) {
        return { valid: false, firstBreak: i };
      }

      const entryPayload = {
        caseId: entry.caseId,
        actor: entry.actor,
        action: entry.action,
        payload: entry.payload,
        modelVersion: 'scorer-v0.3',
      };
      const canonical = canonicalJSON(entryPayload);
      const expectedHash = await sha256(entry.prevHash + canonical);

      if (entry.entryHash !== expectedHash) {
        return { valid: false, firstBreak: i };
      }
    }
    return { valid: true, firstBreak: null };
  }

  async verifySingle(index: number): Promise<boolean> {
    if (index < 0 || index >= this.entries.length) return false;
    const entry = this.entries[index];
    const expectedPrevHash =
      index === 0 ? GENESIS_PREV_HASH : this.entries[index - 1].entryHash;

    if (entry.prevHash !== expectedPrevHash) return false;

    const entryPayload = {
      caseId: entry.caseId,
      actor: entry.actor,
      action: entry.action,
      payload: entry.payload,
      modelVersion: 'scorer-v0.3',
    };
    const canonical = canonicalJSON(entryPayload);
    const expectedHash = await sha256(entry.prevHash + canonical);
    return entry.entryHash === expectedHash;
  }

  tamper(index: number, newPayload: Record<string, unknown>): void {
    if (index >= 0 && index < this.entries.length) {
      this.entries[index].payload = newPayload;
    }
  }

  reset(): void {
    this.entries = [];
  }

  loadFrom(entries: LedgerEntry[]): void {
    this.entries = [...entries];
  }
}

export const globalLedger = new Ledger();
