# T3N Refreshed Docs: Bug & Developer Friction Report

> **Prepared for:** Terminal 3 Network Developer Core Team  
> **Testing Environment:** Windows 11 x64, Node.js v24.19.0 (LTS), `@terminal3/t3n-sdk@5.2.0`  
> **Tester DID:** `did:t3n:1142e6fe4b46cda878b5aedcc32fad8c3a979384`

---

## 1. Bug: Subshell Execution & npm Install Friction on Windows

### Description:
During initialization (`npm install @terminal3/t3n-sdk@5.2.0 tsx`), child processes spawned by npm on Windows can fail with:
```
npm error code 1
npm error path F:\t3n-enterprise-agent\node_modules\esbuild
npm error command C:\WINDOWS\system32\cmd.exe /d /s /c node install.js
npm error 'node' is not recognized as an internal or external command
```
This occurs when the executing subshell has not re-sourced the updated system PATH or when PATH contains unquoted directory segments with spaces (e.g. `C:\Program Files\nodejs`).

### Suggested Docs Improvement:
Add a dedicated note in the **Prerequisites** or **Set Up Dev Env** section:
> *"On Windows systems, ensure `C:\Program Files\nodejs` is added to both System and User PATH variables and run terminal sessions with administrative rights, or use `npx --yes` to avoid esbuild subshell path lookup issues."*

---

## 2. Friction Point: API Key Claim UX & One-Time Display Risk

### Description:
On the claim page (`https://go.terminal3.io/adk-community`), the API Key is presented once in a modal. If a developer accidentally clicks away, closes the tab, or has a browser popup blocker, the key is permanently lost, requiring them to reach out via Telegram (`@wardumb`) to re-issue credits.

### Suggested Product Improvement:
1. Include an explicit **"Confirm you have copied the API key"** checkbox before allowing the user to dismiss the modal.
2. Provide a temporary 10-minute download of a `.env.local` file containing both `T3N_API_KEY` and `T3N_TENANT_DID`.

---

## 3. Performance & DX: TrustAnchor Manifest Caching Recommendation

### Description:
In the Quickstart walkthrough:
```typescript
const t3n = new T3nClient({
  trustAnchor: await fetchTrustedManifest("testnet"),
  ...
});
```
`fetchTrustedManifest("testnet")` makes a remote network call to fetch the TDX attestation bundle manifest every time a client instance is instantiated. In serverless or multi-invocation enterprise environments, this introduces unnecessary network latency (~400ms–800ms) on each cold start.

### Suggested Docs Improvement:
Add an optimization callout in the **Tips** section:
> *"In production enterprise applications, cache the result of `fetchTrustedManifest(env)` in memory with a sensible TTL (e.g., 1 hour) across client initializations rather than fetching on every request."*

---

## 4. Documentation Clarity: DID vs. Address Distinction

### Description:
The quickstart demonstrates:
```typescript
const address = eth_get_address(T3N_API_KEY);
const did = await t3n.authenticate(createEthAuthInput(address));
const tenantDid = did.value;
```
For developers new to decentralized identity, seeing an Ethereum address derived from the API key alongside a `did:t3n:...` identifier can cause confusion over which value to use for delegation, access control, and smart contracts.

### Suggested Docs Improvement:
Include a 1-sentence tip:
> *"The derived Ethereum address is the cryptographic signing keypair used for the handshake, while `tenantDid` is your permanent canonical on-chain identity across all T3N contracts and permissions."*
