import { getT3nSession } from "./config/t3n.js";
import { verifyAgentIdentity } from "./core/auth.js";
import { DEFAULT_ENTERPRISE_SCOPES, EnterpriseDelegationPolicy } from "./core/delegation.js";
import { AuditEngine, SensitiveCustomerRecord } from "./core/auditEngine.js";

async function runEnterpriseAgent() {
  console.log("===============================================================");
  console.log(" 🛡️  T3N-AuditShield: Enterprise Compliance & Privacy Guardian ");
  console.log("    Powered by Terminal 3 Network (T3N) Confidential Enclaves  ");
  console.log("===============================================================\n");

  console.log("[1/5] Initializing connection to T3N confidential enclave...");
  const startTime = Date.now();
  const session = await getT3nSession();
  const elapsed = Date.now() - startTime;

  console.log(`[✓] Connected in ${elapsed}ms!`);
  console.log(`    • Environment:       ${session.environment}`);
  console.log(`    • Tenant DID:        ${session.tenantDid}`);
  console.log(`    • Derived Address:   ${session.ethAddress}`);

  console.log("\n[2/5] Verifying Agent Identity & Cryptographic Roots...");
  const identity = verifyAgentIdentity(session);
  console.log(`[✓] Agent Identity Verified: ${identity.name}`);
  console.log(`    • Role:              ${identity.role}`);
  console.log(`    • Status:            ${identity.status}`);

  console.log("\n[3/5] Setting up Enterprise Member Delegation Policy...");
  const policy: EnterpriseDelegationPolicy = {
    orgDid: session.tenantDid,
    agentDid: session.tenantDid,
    scopes: DEFAULT_ENTERPRISE_SCOPES,
    status: "granted",
  };
  console.log(`[✓] Scopes Granted:`);
  for (const scope of policy.scopes) {
    console.log(`    • ${scope.scopeName.padEnd(30)} (Max daily: ${scope.maxDailyExecutions})`);
  }

  const engine = new AuditEngine(session, policy);

  console.log("\n[4/5] Executing Scenario 1: Zero-Knowledge Customer PII Sanitization");
  const sampleCustomerRecord: SensitiveCustomerRecord = {
    recordId: "REC-CORP-98421",
    fullName: "Johnathan Doe-Smith",
    email: "j.doe.smith@confidential-corp.example.com",
    taxIdOrSsn: "987-65-4321",
    creditScore: 745,
    annualIncomeUsd: 125000,
    jurisdiction: "US-CA",
  };

  console.log("    • Ingesting sensitive customer record (Raw SSN / PII)...");
  const auditResult = await engine.auditCustomerRecord(sampleCustomerRecord);
  console.log("    • Sanitization & Confidential Evaluation Complete:");
  console.log(`      - Record ID:             ${auditResult.recordId}`);
  console.log(`      - Derived Pseudonym DID: ${auditResult.pseudonymDid}`);
  console.log(`      - Compliance Verdict:    ${auditResult.complianceRating} (Eligible: ${auditResult.isEligibleForCredit})`);
  console.log(`      - Cryptographic Hash:    ${auditResult.auditHash}`);
  console.log(`      - Enclave Attestation:   ${auditResult.teeAttestationVerified ? "VERIFIED (Intel TDX)" : "FAILED"}`);

  console.log("\n[5/5] Executing Scenario 2: Smart Verifiable Credential (VC) Verification");
  const holderTargetDid = "did:t3n:7821bc34ef918234ab871234cd982341fe654321";
  const vcResult = await engine.verifyEnterpriseCredential(holderTargetDid, "EnterpriseComplianceCertificate_v2");
  console.log(`    • Target Holder DID:       ${vcResult.holderDid}`);
  console.log(`    • Credential Type:         ${vcResult.credentialType}`);
  console.log(`    • Verification Status:     ${vcResult.isValid ? "VALID & ACTIVE" : "INVALID"}`);
  console.log(`    • KYC Verification Level:  ${vcResult.verifiedAttributes.kycLevel}`);
  console.log(`    • Proof Signature:         ${vcResult.proofSignature.slice(0, 32)}...`);

  console.log("\n[BONUS] Generating Tamper-Proof Audit Receipt for Ledger Storage...");
  const receipt = engine.generateAuditReceipt("CORP_CREDENTIAL_AUDIT_BATCH_01", {
    recordsProcessed: 1,
    durationMs: elapsed,
    enclaveCluster: "testnet-us-east",
  });
  console.log(`[✓] Audit Receipt Generated:`);
  console.log(`    • Receipt ID:        ${receipt.receiptId}`);
  console.log(`    • Receipt Hash:      ${receipt.tamperProofHash}`);
  console.log(`    • Timestamp:         ${receipt.timestamp}`);

  console.log("\n===============================================================");
  console.log(" 🚀 T3N-AuditShield Execution Finished Successfully with 0 Errors ");
  console.log("===============================================================\n");
}

runEnterpriseAgent().catch((err) => {
  console.error("\n❌ Fatal error in T3N Enterprise Agent:", err);
  process.exit(1);
});
