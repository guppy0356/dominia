import { describe, it, expect } from 'vitest'
import { env } from 'cloudflare:test'
import app from '../src/index'

describe('Dominia Routes', () => {
  describe('GET /entries', () => {
    it('should return 200 status', async () => {
      const res = await app.request('/entries', {}, env)
      expect(res.status).toBe(200)
    })

    it('should render entry count from database', async () => {
      const res = await app.request('/entries', {}, env)
      const html = await res.text()

      expect(html).toContain('Entries:')
      expect(html).toMatch(/Entries:\s*\d+/)
    })
  })
})
