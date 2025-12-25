/**
 * Test utilities for JWT generation
 * Uses WebCrypto API to generate RSA key pairs and sign JWTs
 */

export interface TestKeyPair {
  privateKey: CryptoKey
  publicJwk: JsonWebKey & { kid: string; alg: string }
}

/**
 * Generate an RSA key pair for testing
 * Returns the private key and public key in JWK format
 */
export async function generateTestKeyPair(): Promise<TestKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  )

  const publicJwk = (await crypto.subtle.exportKey(
    'jwk',
    keyPair.publicKey
  )) as JsonWebKey & { kid: string; alg: string }
  publicJwk.kid = 'test-key-1'
  publicJwk.alg = 'RS256'

  return {
    privateKey: keyPair.privateKey,
    publicJwk,
  }
}

/**
 * Create a signed JWT for testing
 */
export async function createTestJwt(
  privateKey: CryptoKey,
  payload: Record<string, unknown> = {}
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const jwtPayload = {
    sub: 'test-user',
    iat: now,
    exp: now + 3600, // 1 hour from now
    ...payload,
  }

  return signJwtWithKid(jwtPayload, privateKey, 'test-key-1')
}

/**
 * Sign a JWT with a specific kid in the header
 */
async function signJwtWithKid(
  payload: Record<string, unknown>,
  privateKey: CryptoKey,
  kid: string
): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT', kid }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))

  const data = `${encodedHeader}.${encodedPayload}`
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(data)
  )

  const encodedSignature = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  )

  return `${data}.${encodedSignature}`
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}
