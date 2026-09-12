import {
  T3nClient,
  setEnvironment,
  loadWasmComponent,
  fetchTrustedManifest,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
} from "@terminal3/t3n-sdk";

setEnvironment("testnet");

const T3N_API_KEY = process.env.T3N_API_KEY || "0x47d89ea8b355755a17c0d32a43928b45e7082d48b1613afa16920a7a4f8e6fa3";

async function main() {
  console.log("Loading WASM component...");
  const wasmComponent = await loadWasmComponent();
  const address = eth_get_address(T3N_API_KEY);
  console.log("Derived Ethereum address:", address);

  console.log("Connecting to T3N testnet enclave...");
  const t3n = new T3nClient({
    trustAnchor: await fetchTrustedManifest("testnet"),
    wasmComponent,
    handlers: {
      EthSign: metamask_sign(address, undefined, T3N_API_KEY),
    },
  });

  await t3n.handshake();
  console.log("Handshake successful!");

  const did = await t3n.authenticate(createEthAuthInput(address));
  const tenantDid = did.value;
  console.log("Connected as Tenant DID:", tenantDid);
}

main().catch((err) => {
  console.error("Error during T3N connection:", err);
});
