import {
  T3nClient,
  setEnvironment,
  loadWasmComponent,
  fetchTrustedManifest,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
} from "@terminal3/t3n-sdk";
import dotenv from "dotenv";

dotenv.config();

export interface T3nSession {
  client: T3nClient;
  tenantDid: string;
  ethAddress: string;
  environment: "testnet" | "production";
}

let cachedSession: T3nSession | null = null;

/**
 * Initialize and authenticate an enterprise T3N client session.
 * Connects directly to the TEE confidential computing enclave.
 */
export async function getT3nSession(forceRefresh = false): Promise<T3nSession> {
  if (cachedSession && !forceRefresh) {
    return cachedSession;
  }

  const apiKey = process.env.T3N_API_KEY;
  if (!apiKey) {
    throw new Error("Missing T3N_API_KEY in environment variables. Please check your .env file.");
  }

  const env = (process.env.T3N_ENVIRONMENT || "testnet") as "testnet" | "production";
  setEnvironment(env);

  // 1. Load cryptographic WASM component
  const wasmComponent = await loadWasmComponent();
  const ethAddress = eth_get_address(apiKey);

  // 2. Fetch trust anchor manifest to verify TDX attestation
  const trustAnchor = await fetchTrustedManifest(env);

  // 3. Initialize T3nClient with enclave attestation verification
  const client = new T3nClient({
    trustAnchor,
    wasmComponent,
    handlers: {
      EthSign: metamask_sign(ethAddress, undefined, apiKey),
    },
  });

  // 4. Perform secure session handshake with the enclave
  await client.handshake();

  // 5. Authenticate and resolve Tenant DID
  const didResult = await client.authenticate(createEthAuthInput(ethAddress));
  const tenantDid = didResult.value;

  cachedSession = {
    client,
    tenantDid,
    ethAddress,
    environment: env,
  };

  return cachedSession;
}
