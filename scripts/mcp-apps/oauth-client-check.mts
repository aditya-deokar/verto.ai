/**
 * OAuth client acceptance check.
 *
 * Verto is a public-client authorization server: it advertises
 * `token_endpoint_auth_methods_supported: ['none']` and proves possession
 * with PKCE S256 rather than authenticating the client. A Client ID Metadata
 * Document is usable here when it can make an unauthenticated token request,
 * which is not the same thing as preferring one.
 *
 * Reaches the network for the live cases, so it is not part of the default
 * gate. Run it after touching `src/mcp/auth/oauth-clients.ts`, or to check a
 * new host before connecting it:
 *
 *   npm run mcp:oauth:check
 */
import { supportsUnauthenticatedTokenRequest, validateOAuthClient } from '@/mcp/auth/oauth-clients';

const CHATGPT_CIMD = 'https://chatgpt.com/oauth/TUU_28OZgqlY/client.json';
const CHATGPT_REDIRECT = 'https://chatgpt.com/connector/oauth/TUU_28OZgqlY';

const cases: Array<[string, Record<string, unknown>, boolean]> = [
  ['no preference stated', {}, true],
  ['prefers none', { token_endpoint_auth_method: 'none' }, true],
  ['ChatGPT: prefers private_key_jwt, supports none',
    { token_endpoint_auth_method: 'private_key_jwt', token_endpoint_auth_methods_supported: ['none', 'private_key_jwt'] }, true],
  ['confidential client, no none offered',
    { token_endpoint_auth_method: 'client_secret_basic' }, false],
  ['confidential client, none not in supported list',
    { token_endpoint_auth_method: 'client_secret_basic', token_endpoint_auth_methods_supported: ['client_secret_post'] }, false],
  ['supported list is a string, not an array',
    { token_endpoint_auth_method: 'private_key_jwt', token_endpoint_auth_methods_supported: 'none' }, false],
  ['supported list holds non-strings',
    { token_endpoint_auth_method: 'private_key_jwt', token_endpoint_auth_methods_supported: [null, 0] }, false],
];

async function main() {
  let failed = 0;

  console.log('supportsUnauthenticatedTokenRequest()');
  for (const [label, metadata, expected] of cases) {
    const actual = supportsUnauthenticatedTokenRequest(metadata);
    const ok = actual === expected;
    if (!ok) failed++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(50)} expected=${expected} actual=${actual}`);
  }

  console.log('\nvalidateOAuthClient() against the live ChatGPT document');
  const accepted = await validateOAuthClient(CHATGPT_CIMD, CHATGPT_REDIRECT);
  const okAccept = accepted !== null;
  if (!okAccept) failed++;
  console.log(`  ${okAccept ? 'PASS' : 'FAIL'}  registered redirect_uri is accepted`);

  const wrongRedirect = await validateOAuthClient(CHATGPT_CIMD, 'https://evil.example/callback');
  const okReject = wrongRedirect === null;
  if (!okReject) failed++;
  console.log(`  ${okReject ? 'PASS' : 'FAIL'}  unregistered redirect_uri is rejected`);

  const httpRedirect = await validateOAuthClient(CHATGPT_CIMD, 'http://chatgpt.com/connector/oauth/TUU_28OZgqlY');
  const okHttp = httpRedirect === null;
  if (!okHttp) failed++;
  console.log(`  ${okHttp ? 'PASS' : 'FAIL'}  non-https redirect_uri is rejected`);

  const unknown = await validateOAuthClient('https://example.invalid/nope.json', CHATGPT_REDIRECT);
  const okUnknown = unknown === null;
  if (!okUnknown) failed++;
  console.log(`  ${okUnknown ? 'PASS' : 'FAIL'}  unreachable metadata document is rejected`);

  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

void main();
