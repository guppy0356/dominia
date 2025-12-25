import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { env, fetchMock } from 'cloudflare:test'
import app from '../src/index'
import { generateTestKeyPair, createTestJwt, type TestKeyPair } from './helpers/jwt'

const TEST_JWKS_HOST = 'https://test-jwks.local'

const createTestEnv = () => ({
  ...env,
  JWKS_URI: `${TEST_JWKS_HOST}/.well-known/jwks.json`,
})

describe('GET /entries', () => {
  describe('without authentication', () => {
    it('should return 401 without authorization header', async () => {
      const res = await app.request('/entries', {}, createTestEnv())

      expect(res.status).toBe(401)
    })
  })

  describe('with valid authentication', () => {
    let keyPair: TestKeyPair

    beforeAll(async () => {
      keyPair = await generateTestKeyPair()
    })

    beforeEach(() => {
      fetchMock.activate()
      fetchMock.disableNetConnect()
      fetchMock.enableNetConnect(/localhost:8765/)

      // Mock JWKS endpoint
      fetchMock
        .get(TEST_JWKS_HOST)
        .intercept({ path: '/.well-known/jwks.json' })
        .reply(200, { keys: [keyPair.publicJwk] })
    })

    afterEach(() => {
      fetchMock.assertNoPendingInterceptors()
      fetchMock.deactivate()
    })

    it('should return 200 with valid JWT', async () => {
      const token = await createTestJwt(keyPair.privateKey)
      const res = await app.request(
        '/entries',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        createTestEnv()
      )

      expect(res.status).toBe(200)
      const html = await res.text()
      expect(html).toContain('Entries:')
      expect(html).toMatch(/Entries:\s*\d+/)
    })
  })
})
