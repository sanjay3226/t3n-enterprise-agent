# Developer Feedback & Bug Report: Refreshed T3N Docs

- **Environment**: Windows 11 x64, Node.js v24.19.0 (LTS), `@terminal3/t3n-sdk@5.2.0`
- **Tester DID**: `did:t3n:1142e6fe4b46cda878b5aedcc32fad8c3a979384`

---

### 1. Windows Subshell PATH Issue during `npm install`
- **Issue**: Running `npm install @terminal3/t3n-sdk@5.2.0 tsx` on Windows failed during the `esbuild` postinstall step:
  ```
  npm error code 1
  npm error path ...\node_modules\esbuild
  npm error command C:\WINDOWS\system32\cmd.exe /d /s /c node install.js
  npm error 'node' is not recognized as an internal or external command
  ```
  This happens when npm spawns a secondary `cmd.exe` shell that has not inherited newly set PATH variables or when unquoted semicolons exist in the user's PATH string.
- **Suggestion**: Add a note in the Prerequisites section reminding Windows developers to verify that the Node.js installation directory is present in both User and System PATH before running the quickstart commands.

---

### 2. Single-Display API Key Modal on Claim Page
- **Issue**: On `go.terminal3.io/adk-community`, the generated API key is shown in a modal that cannot be retrieved again once closed. If a developer accidentally clicks away or closes the tab, the key is lost, requiring manual intervention via Telegram.
- **Suggestion**: Add an explicit copy-confirmation step (e.g. "I have saved this key" checkbox) or provide a one-time `.env` download button.

---

### 3. Trust Anchor Manifest Caching in Quickstart
- **Issue**: The quickstart sample calls `await fetchTrustedManifest("testnet")` inline during client construction. For agents running in serverless or multi-invocation environments, this adds an unnecessary remote HTTP call (~400-800ms) on each cold start.
- **Suggestion**: Add a note in the documentation showing how to cache the manifest object with an in-memory TTL across client initializations.

---

### 4. Clarification on DID vs. Address
- **Issue**: Developers migrating from standard Web3 tooling might be confused by having both a derived Ethereum address and a `did:t3n:...` identifier in the quickstart.
- **Suggestion**: Include a brief callout clarifying that the derived address is used strictly for cryptographic handshake signing, while the `tenantDid` is the canonical identifier for permissions and contracts.
