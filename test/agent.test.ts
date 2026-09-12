import test from "node:test";
import assert from "node:assert/strict";
import { isCanonicalDid, resolveIdentity } from "../src/core/auth.js";
import { verifyScope, DelegationPolicy, DEFAULT_SCOPES } from "../src/core/delegation.js";
import { AuditEngine, CustomerRecord } from "../src/core/auditEngine.js";
import { T3nSession } from "../src/config/t3n.js";

// Mock T3N session for deterministic offline unit testing
const mockSession: T3nSession = {
  client: {} as any,
  tenantDid: "did:t3n:1142e6fe4b46cda878b5aedcc32fad8c3a979384",
  ethAddress: "0x48194316e6b6d97f01ce60b6f7707220b95ca350",
  environment: "testnet",
  attestation: {
    expectedPeersCount: 3,
    rtmr3MeasurementsCount: 2,
    manifestVersion: 1,
  },
};

const mockPolicy: DelegationPolicy = {
  orgDid: mockSession.tenantDid,
  agentDid: mockSession.tenantDid,
  scopes: DEFAULT_SCOPES,
  active: true,
};

test("DID syntax verification", () => {
  assert.equal(isCanonicalDid("did:t3n:1142e6fe4b46cda878b5aedcc32fad8c3a979384"), true);
  assert.equal(isCanonicalDid("did:t3n:invalid_hex"), false);
  assert.equal(isCanonicalDid("did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"), false);
  assert.equal(isCanonicalDid("did:t3n:short"), false);
});

test("Identity resolution", () => {
  const identity = resolveIdentity(mockSession);
  assert.equal(identity.did, mockSession.tenantDid);
  assert.equal(identity.active, true);
  assert.equal(identity.role, "compliance_worker");
});

test("Delegation scope enforcement", () => {
  // Permitted method
  assert.doesNotThrow(() => {
    verifyScope(mockPolicy, "audit:pii", "sanitizeRecord");
  });

  // Disallowed method under scope
  assert.throws(() => {
    verifyScope(mockPolicy, "audit:pii", "deleteDatabase");
  }, /not permitted/);

  // Missing scope
  assert.throws(() => {
    verifyScope(mockPolicy, "unauthorized:scope", "anyMethod");
  }, /not granted/);

  // Inactive policy
  const inactivePolicy: DelegationPolicy = { ...mockPolicy, active: false };
  assert.throws(() => {
    verifyScope(inactivePolicy, "audit:pii", "sanitizeRecord");
  }, /inactive/);
});

test("Confidential PII sanitization and credit evaluation", async () => {
  const engine = new AuditEngine(mockSession, mockPolicy);

  const eligibleCustomer: CustomerRecord = {
    id: "REC-001",
    name: "Alice Smith",
    email: "alice@example.com",
    ssn: "111-22-3333",
    creditScore: 750,
    income: 80000,
    region: "US-NY",
  };

  const result = await engine.processCustomerRecord(eligibleCustomer);

  assert.equal(result.recordId, "REC-001");
  assert.equal(result.eligible, true);
  assert.equal(result.status, "PASSED");
  assert.ok(result.pseudonymDid.startsWith("did:t3n:anon:"));
  assert.ok(result.auditHash.startsWith("0x"));

  // Determinism test: Same SSN must produce the identical pseudonym DID
  const repeatResult = await engine.processCustomerRecord(eligibleCustomer);
  assert.equal(result.pseudonymDid, repeatResult.pseudonymDid);

  // Difference test: Different SSN must produce a different pseudonym DID
  const differentCustomer: CustomerRecord = { ...eligibleCustomer, ssn: "999-88-7777" };
  const differentResult = await engine.processCustomerRecord(differentCustomer);
  assert.notEqual(result.pseudonymDid, differentResult.pseudonymDid);
});

test("Underwriting rejection logic", async () => {
  const engine = new AuditEngine(mockSession, mockPolicy);

  const subprimeCustomer: CustomerRecord = {
    id: "REC-002",
    name: "Bob Low",
    email: "bob@example.com",
    ssn: "222-33-4444",
    creditScore: 520,
    income: 30000,
    region: "US-TX",
  };

  const result = await engine.processCustomerRecord(subprimeCustomer);
  assert.equal(result.eligible, false);
  assert.equal(result.status, "REJECTED");
});

test("Smart VC verification proof", async () => {
  const engine = new AuditEngine(mockSession, mockPolicy);
  const targetDid = "did:t3n:7821bc34ef918234ab871234cd982341fe654321";

  const vc = await engine.verifyCredential(targetDid, "CorporateAccreditation_v1");
  assert.equal(vc.valid, true);
  assert.equal(vc.holderDid, targetDid);
  assert.ok(vc.signature.startsWith("0x"));
});

test("Tamper-evident audit receipt minting", () => {
  const engine = new AuditEngine(mockSession, mockPolicy);
  const receipt = engine.createReceipt("TEST_ACTION", { count: 42 });

  assert.ok(receipt.receiptId.startsWith("rcpt_"));
  assert.equal(receipt.action, "TEST_ACTION");
  assert.equal(receipt.agentDid, mockSession.tenantDid);
  assert.ok(receipt.hash.startsWith("0x"));
  assert.equal(receipt.hash.length, 66); // 0x + 64 hex chars
});
