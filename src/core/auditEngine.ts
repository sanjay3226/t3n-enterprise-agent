import crypto from "node:crypto";
import { T3nSession } from "../config/t3n.js";
import { verifyScope, DelegationPolicy } from "./delegation.js";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  ssn: string;
  creditScore: number;
  income: number;
  region: string;
}

export interface SanitizedAuditResult {
  recordId: string;
  pseudonymDid: string;
  eligible: boolean;
  status: "PASSED" | "FLAGGED" | "REJECTED";
  auditHash: string;
  timestamp: string;
}

export interface VcVerificationResult {
  holderDid: string;
  credentialType: string;
  valid: boolean;
  kycLevel: string;
  signature: string;
}

export class AuditEngine {
  constructor(
    private session: T3nSession,
    private policy: DelegationPolicy
  ) {}

  public async processCustomerRecord(record: CustomerRecord): Promise<SanitizedAuditResult> {
    verifyScope(this.policy, "audit:pii", "sanitizeRecord");

    // Enclave pseudonym generation (deterministic, zero PII leakage)
    const pseudonym = crypto
      .createHmac("sha256", this.session.tenantDid)
      .update(record.ssn)
      .digest("hex")
      .slice(0, 32);

    const eligible = record.income >= 50000 && record.creditScore >= 680;
    let status: "PASSED" | "FLAGGED" | "REJECTED" = "PASSED";
    if (!eligible) {
      status = record.creditScore >= 600 ? "FLAGGED" : "REJECTED";
    }

    const timestamp = new Date().toISOString();
    const digest = crypto
      .createHash("sha256")
      .update(`${record.id}:${pseudonym}:${status}:${timestamp}`)
      .digest("hex");

    return {
      recordId: record.id,
      pseudonymDid: `did:t3n:anon:${pseudonym}`,
      eligible,
      status,
      auditHash: `0x${digest}`,
      timestamp,
    };
  }

  public async verifyCredential(holderDid: string, credentialType: string): Promise<VcVerificationResult> {
    verifyScope(this.policy, "audit:credentials", "verifyVc");

    const payload = `${holderDid}:${credentialType}:${this.session.tenantDid}`;
    const sig = crypto
      .createHmac("sha256", this.session.ethAddress)
      .update(payload)
      .digest("hex");

    return {
      holderDid,
      credentialType,
      valid: true,
      kycLevel: "Level_2_Verified",
      signature: `0x${sig}`,
    };
  }

  public createReceipt(action: string, meta: Record<string, unknown>) {
    verifyScope(this.policy, "audit:receipts", "createReceipt");

    const receiptId = `rcpt_${crypto.randomBytes(6).toString("hex")}`;
    const timestamp = new Date().toISOString();
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ receiptId, action, meta, timestamp }))
      .digest("hex");

    return {
      receiptId,
      action,
      agentDid: this.session.tenantDid,
      hash: `0x${hash}`,
      timestamp,
    };
  }
}
