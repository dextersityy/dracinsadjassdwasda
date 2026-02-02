# IMPEMENTATION PLAN: Proxy Support for API Calls

## Goal
Implement proxy support for external API calls (`public-api.ts` and `reelshort-api.ts`) to bypass IP/Domain bans. This will allow the application to route requests through a proxy server defined in the environment variables.

## User Review Required
> [!IMPORTANT]
> You will need a valid Proxy URL (HTTP/HTTPS) to use this feature.
> Format: `http://user:pass@host:port` or `http://host:port`.
> You must add this to your `.env.local` file as `PROXY_URL=...`.

## Proposed Changes ss

### Dependencies
#### [NEW] [undici](https://www.npmjs.com/package/undici)
- Used to create a `ProxyAgent` (Dispatcher) that is compatible with Node.js native `fetch`.

### Lib
#### [MODIFY] [lib/public-api.ts](file:///c:/bot%20tele/dracinajaaaa/lib/public-api.ts)
- Import `ProxyAgent` from `undici`.
- Check for `process.env.PROXY_URL`.
- If present, create a `dispatcher` and pass it to `fetch` calls.

#### [MODIFY] [lib/reelshort-api.ts](file:///c:/bot%20tele/dracinajaaaa/lib/reelshort-api.ts)
- Similar implementation as `public-api.ts`.

## Verification Plan
### Manual Verification
1.  Set a dummy or real `PROXY_URL` in `.env.local`.
2.  Run the application.
3.  Observe logs or functionality to ensure requests are successful (or fail with a proxy error if the proxy is invalid, proving it's being used).
