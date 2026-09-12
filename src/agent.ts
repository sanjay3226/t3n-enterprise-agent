import { getT3nSession } from "./config/t3n.js";
import { resolveIdentity } from "./core/auth.js";
import { DEFAULT_SCOPES, DelegationPolicy } from "./core/delegation.js";
import { AuditEngine, CustomerRecord } from "./core/auditEngine.js";

async function main() {
  console.log("[t3n-agent] Initializing session on testnet...");
  const t0 = Date.now();
  const session = await getT3nSession();
  console.log(`[t3n-agent] Authenticated in ${Date.now() - t0}ms`);
  console.log(`[t3n-agent] Tenant DID: ${session.tenantDid}`);
  console.log(`[t3n-agent] Eth Address: ${session.ethAddress}`);

  const identity = resolveIdentity(session);
  console.log(`[t3n-agent] Identity verified: ${identity.name} (${identity.role})`);

  const policy: DelegationPolicy = {
    orgDid: session.tenantDid,
    agentDid: session.tenantDid,
    scopes: DEFAULT_SCOPES,
    active: true,
  };

  const engine = new AuditEngine(session, policy);

  // 1. Process customer record (sanitizing PII inside TEE)
  console.log("\n[task 1/3] Processing customer record with PII sanitization...");
  const customer: CustomerRecord = {
    id: "REC-CORP-98421",
    name: "Johnathan Doe",
    email: "j.doe@example.com",
    ssn: "987-65-4321",
    creditScore: 745,
    income: 125000,
    region: "US-CA",
  };

  const audit = await engine.processCustomerRecord(customer);
  console.log(`[task 1/3] Result: ${audit.status} | Eligible: ${audit.eligible}`);
  console.log(`[task 1/3] Pseudonym DID: ${audit.pseudonymDid}`);
  console.log(`[task 1/3] Audit Hash: ${audit.auditHash}`);

  // 2. Verify Smart VC
  console.log("\n[task 2/3] Verifying Smart Verifiable Credential...");
  const targetDid = "did:t3n:7821bc34ef918234ab871234cd982341fe654321";
  const vc = await engine.verifyCredential(targetDid, "EnterpriseComplianceCertificate_v2");
  console.log(`[task 2/3] Credential: ${vc.credentialType} | Valid: ${vc.valid}`);
  console.log(`[task 2/3] KYC: ${vc.kycLevel} | Sig: ${vc.signature.slice(0, 24)}...`);

  // 3. Issue audit receipt
  console.log("\n[task 3/3] Generating tamper-evident audit receipt...");
  const receipt = engine.createReceipt("CORP_CREDENTIAL_AUDIT_BATCH_01", {
    recordsProcessed: 1,
    environment: session.environment,
  });
  console.log(`[task 3/3] Receipt ID: ${receipt.receiptId}`);
  console.log(`[task 3/3] Digest: ${receipt.hash}`);

  console.log("\n[t3n-agent] All agent tasks completed successfully.");
}

main().catch((err) => {
  console.error("[t3n-agent] Error:", err.message);
  process.exit(1);
});
