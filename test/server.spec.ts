import request from 'supertest'
import { createApp } from '../src/server'

const app = createApp()

describe('status', () => {
  it('should get status', async () => {
    const res = await request(app).get('/status')
    expect(res).toBeGreaterThan(0)
  })
})
