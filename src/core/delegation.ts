export interface ScopeRule {
  name: string;
  methods: string[];
  rateLimitDaily: number;
}

export interface DelegationPolicy {
  orgDid: string;
  agentDid: string;
  scopes: ScopeRule[];
  active: boolean;
}

export const DEFAULT_SCOPES: ScopeRule[] = [
  {
    name: "audit:pii",
    methods: ["sanitizeRecord", "evaluateCredit"],
    rateLimitDaily: 5000,
  },
  {
    name: "audit:credentials",
    methods: ["verifyVc", "checkStatus"],
    rateLimitDaily: 2000,
  },
  {
    name: "audit:receipts",
    methods: ["createReceipt"],
    rateLimitDaily: 10000,
  },
];

export function verifyScope(policy: DelegationPolicy, scopeName: string, method: string): void {
  if (!policy.active) {
    throw new Error(`Policy inactive for agent ${policy.agentDid}`);
  }

  const scope = policy.scopes.find((s) => s.name === scopeName);
  if (!scope) {
    throw new Error(`Scope ${scopeName} not granted to ${policy.agentDid}`);
  }

  if (!scope.methods.includes(method) && !scope.methods.includes("*")) {
    throw new Error(`Method ${method} not permitted under scope ${scopeName}`);
  }
}
