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

let sessionInstance: T3nSession | null = null;

export async function getT3nSession(refresh = false): Promise<T3nSession> {
  if (sessionInstance && !refresh) {
    return sessionInstance;
  }

  const apiKey = process.env.T3N_API_KEY;
  if (!apiKey) {
    throw new Error("T3N_API_KEY environment variable is required.");
  }

  const env = (process.env.T3N_ENVIRONMENT || "testnet") as "testnet" | "production";
  setEnvironment(env);

  const wasmComponent = await loadWasmComponent();
  const ethAddress = eth_get_address(apiKey);
  const trustAnchor = await fetchTrustedManifest(env);

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
  };

  return sessionInstance;
}
