export interface DelegationScope {
  scopeName: string;
  allowedFunctions: string[];
  maxDailyExecutions: number;
  validUntil: string;
}

export interface EnterpriseDelegationPolicy {
  orgDid: string;
  agentDid: string;
  scopes: DelegationScope[];
  status: "granted" | "revoked" | "expired";
}

// Default standard enterprise scopes for T3N-AuditShield
export const DEFAULT_ENTERPRISE_SCOPES: DelegationScope[] = [
  {
    scopeName: "audit:pii_sanitization",
    allowedFunctions: ["sanitizePii", "verifyZeroKnowledgeProof"],
    maxDailyExecutions: 5000,
    validUntil: "2027-12-31T23:59:59Z",
  },
  {
    scopeName: "audit:credential_verification",
    allowedFunctions: ["verifySmartVc", "checkKycStatus"],
    maxDailyExecutions: 2000,
    validUntil: "2027-12-31T23:59:59Z",
  },
  {
    scopeName: "audit:tamper_proof_receipts",
    allowedFunctions: ["generateAuditReceipt", "logTamperProofHash"],
    maxDailyExecutions: 10000,
    validUntil: "2027-12-31T23:59:59Z",
  },
];

/**
 * Check if the active agent possesses the required delegation scope to execute an action.
 */
export function assertDelegationScope(
  policy: EnterpriseDelegationPolicy,
  requiredScope: string,
  functionName: string
): boolean {
  if (policy.status !== "granted") {
    throw new Error(`Enterprise delegation policy for agent ${policy.agentDid} is ${policy.status}. Access denied.`);
  }

  const scope = policy.scopes.find((s) => s.scopeName === requiredScope);
  if (!scope) {
    throw new Error(`Missing required enterprise scope '${requiredScope}' for agent ${policy.agentDid}.`);
  }

  if (!scope.allowedFunctions.includes(functionName) && !scope.allowedFunctions.includes("*")) {
    throw new Error(
      `Function '${functionName}' is not permitted under scope '${requiredScope}'. Permitted: [${scope.allowedFunctions.join(", ")}]`
    );
  }

  return true;
}
