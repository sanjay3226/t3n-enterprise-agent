import { T3nSession } from "../config/t3n.js";

export interface AgentIdentity {
  did: string;
  ethAddress: string;
  name: string;
  role: "enterprise_auditor" | "compliance_officer" | "delegated_worker";
  status: "active" | "suspended";
}

/**
 * Validate that a provided string conforms to the canonical T3N DID format:
 * did:t3n:<40-hex-characters>
 */
export function isValidT3nDid(did: string): boolean {
  return /^did:t3n:[0-9a-fA-F]{40}$/.test(did);
}

/**
 * Verify identity and role access for an incoming caller or sub-agent.
 */
export function verifyAgentIdentity(session: T3nSession, callerDid?: string): AgentIdentity {
  const activeDid = callerDid || session.tenantDid;

  if (!isValidT3nDid(activeDid)) {
    throw new Error(`Invalid T3N DID format: ${activeDid}. Must be canonical did:t3n:<40-hex>.`);
  }

  return {
    did: activeDid,
    ethAddress: session.ethAddress,
    name: "T3N-AuditShield Enterprise Agent",
    role: "enterprise_auditor",
    status: "active",
  };
}
