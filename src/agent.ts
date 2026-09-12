import { parseArgs } from "node:util";
import { getT3nSession } from "./config/t3n.js";
import { resolveIdentity } from "./core/auth.js";
import { DEFAULT_SCOPES, DelegationPolicy } from "./core/delegation.js";
import { AuditEngine, CustomerRecord } from "./core/auditEngine.js";

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      scenario: { type: "string", default: "all" },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
Usage: npm start -- [options]

Options:
  --scenario <all|pii|credentials|receipts>  Execution target (default: all)
  -h, --help                               Show help
`);
    return;
  }

  console.log("[t3n-agent] Connecting to T3N confidential enclave...");
  const t0 = Date.now();
  const session = await getT3nSession();
  const elapsed = Date.now() - t0;

  console.log(`[t3n-agent] Connected in ${elapsed}ms`);
  console.log(`[t3n-agent] Environment:     ${session.environment}`);
  console.log(`[t3n-agent] Tenant DID:      ${session.tenantDid}`);
  console.log(`[t3n-agent] Signing Address: ${session.ethAddress}`);
  console.log(`[t3n-agent] Enclave Trust:   Manifest v${session.attestation.manifestVersion || 1} (${session.attestation.expectedPeersCount} peers attested)`);

  const identity = resolveIdentity(session);
  console.log(`[t3n-agent] Identity:        ${identity.name} (${identity.role})`);

  const policy: DelegationPolicy = {
    orgDid: session.tenantDid,
    agentDid: session.tenantDid,
    scopes: DEFAULT_SCOPES,
    active: true,
  };

  const engine = new AuditEngine(session, policy);
  const scenario = values.scenario;

  // 1. PII Sanitization
  if (scenario === "all" || scenario === "pii") {
    console.log("\n[task:pii] Running zero-knowledge customer record evaluation...");
    const sampleRecord: CustomerRecord = {
      id: "REC-CORP-98421",
      name: "Johnathan Doe",
      email: "j.doe@example.com",
      ssn: "987-65-4321",
      creditScore: 745,
      income: 125000,
      region: "US-CA",
    };

    const audit = await engine.processCustomerRecord(sampleRecord);
    console.log(`[task:pii] Ingested record:   ${sampleRecord.id} (SSN: [REDACTED IN TEE])`);
    console.log(`[task:pii] Derived Pseudonym: ${audit.pseudonymDid}`);
    console.log(`[task:pii] Compliance Status: ${audit.status} (Eligible: ${audit.eligible})`);
    console.log(`[task:pii] Audit Digest:      ${audit.auditHash}`);
  }

  // 2. Smart VC Verification
  if (scenario === "all" || scenario === "credentials") {
    console.log("\n[task:vc] Validating Smart Verifiable Credential on-chain...");
    const holderDid = "did:t3n:7821bc34ef918234ab871234cd982341fe654321";
    const vc = await engine.verifyCredential(holderDid, "EnterpriseComplianceCertificate_v2");
    console.log(`[task:vc] Holder DID:         ${vc.holderDid}`);
    console.log(`[task:vc] Credential Type:    ${vc.credentialType}`);
    console.log(`[task:vc] Status:             ${vc.valid ? "VALID" : "INVALID"} (${vc.kycLevel})`);
    console.log(`[task:vc] Enclave Signature:  ${vc.signature.slice(0, 32)}...`);
  }

  // 3. Tamper-Evident Receipts
  if (scenario === "all" || scenario === "receipts") {
    console.log("\n[task:receipt] Minting tamper-evident execution receipt...");
    const receipt = engine.createReceipt("CORP_COMPLIANCE_RUN_01", {
      recordsEvaluated: 1,
      enclaveCluster: session.environment,
      executionMs: elapsed,
    });
    console.log(`[task:receipt] Receipt ID:    ${receipt.receiptId}`);
    console.log(`[task:receipt] Cryptographic: ${receipt.hash}`);
    console.log(`[task:receipt] Timestamp:    ${receipt.timestamp}`);
  }

  console.log("\n[t3n-agent] Run completed successfully with 0 errors.");
}

main().catch((err) => {
  console.error("[t3n-agent] Fatal error:", err.message);
  process.exit(1);
});
