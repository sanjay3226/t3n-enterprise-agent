import {
  T3nClient,
  setEnvironment,
  loadWasmComponent,
  fetchTrustedManifest,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
  TrustAnchor,
} from "@terminal3/t3n-sdk";
import dotenv from "dotenv";

dotenv.config();

export interface EnclaveAttestationInfo {
  manifestVersion?: number;
  signedAt?: string;
  expectedPeersCount: number;
  rtmr3MeasurementsCount: number;
}

export interface T3nSession {
  client: T3nClient;
  tenantDid: string;
  ethAddress: string;
  environment: "testnet" | "production";
  attestation: EnclaveAttestationInfo;
}

let sessionInstance: T3nSession | null = null;

export async function getT3nSession(refresh = false): Promise<T3nSession> {
  if (sessionInstance && !refresh) {
    return sessionInstance;
  }

  const apiKey = process.env.T3N_API_KEY;
  if (!apiKey) {
    throw new Error("T3N_API_KEY environment variable is required. Check .env file.");
  }

  const env = (process.env.T3N_ENVIRONMENT || "testnet") as "testnet" | "production";
  setEnvironment(env);

  const wasmComponent = await loadWasmComponent();
  const ethAddress = eth_get_address(apiKey);
  const trustAnchor = (await fetchTrustedManifest(env)) as TrustAnchor;

  const client = new T3nClient({
    trustAnchor,
    wasmComponent,
    handlers: {
      EthSign: metamask_sign(ethAddress, undefined, apiKey),
    },
  });

  await client.handshake();
  const did = await client.authenticate(createEthAuthInput(ethAddress));

  sessionInstance = {
    client,
    tenantDid: did.value,
    ethAddress,
    environment: env,
    attestation: {
      manifestVersion: trustAnchor.source?.manifest_version,
      signedAt: trustAnchor.source?.signed_at,
      expectedPeersCount: trustAnchor.expected_peer_ids?.length || 0,
      rtmr3MeasurementsCount: trustAnchor.rtmr3_allowlist?.length || 0,
    },
  };

  return sessionInstance;
}
