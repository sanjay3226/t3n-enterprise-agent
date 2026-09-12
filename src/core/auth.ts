import { T3nSession } from "../config/t3n.js";

export interface AgentIdentity {
  did: string;
  ethAddress: string;
  name: string;
  role: string;
  active: boolean;
}

export function isCanonicalDid(did: string): boolean {
  return /^did:t3n:[0-9a-fA-F]{40}$/.test(did);
}

export function resolveIdentity(session: T3nSession, customDid?: string): AgentIdentity {
  const did = customDid || session.tenantDid;

  if (!isCanonicalDid(did)) {
    throw new Error(`Invalid DID format: ${did}`);
  }

  return {
    did,
    ethAddress: session.ethAddress,
    name: "T3N Enterprise Auditor",
    role: "compliance_worker",
    active: true,
  };
}
