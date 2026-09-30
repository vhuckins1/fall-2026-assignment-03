import { describe, it, expect , beforeEach} from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { seed } from '../src/db/seed.js'

beforeEach(async () => {
  await seed(); // users 1-5, tickets 1-25, no time logs
});

describe('Part 2: Time Logs Tests', () => {
    // TODO: Student implementation - Part 2: Time Logging Tests
    // Log hours for a ticket (POST /tickets/:id/time)
    // Fetch total hours for a ticket (GET /tickets/:id/time)
    // Verify aggregation math
    it('sums multiple logs for one ticket', async () => {
      for (const hours of [2, 3, 4]) {
        const res = await request(app)
          .post('/tickets/1/time')
          .set('X-User-Id', '1')
          .send({ hours });
        console.log(res.status, res.body);
        expect(res.status).toBe(201);
      
      }

      const res = await request(app).get('/tickets/1/time');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ticket_id: 1, total_hours: 9 });
    });

    it('only counts logs for the requested ticket', async () => {
      await request(app)
        .post('/tickets/1/time')
        .set('X-User-Id', '1')
        .send({ hours: 5 });
      await request(app)
        .post('/tickets/2/time')
        .set('X-User-Id', '1')
        .send({ hours: 7 });

      const res = await request(app).get('/tickets/1/time');
      expect(res.body.total_hours).toBe(5);
    });

    it('returns 0 when a ticket has no logs', async () => {
      const res = await request(app).get('/tickets/1/time');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ticket_id: 1, total_hours: 0 });
    });

    it('returns 401 when X-User-Id is missing', async () => {
      const res = await request(app).post('/tickets/1/time').send({ hours: 2 });
      expect(res.status).toBe(401);
    });

    it('returns 400 for invalid hours', async () => {
      const res = await request(app)
        .post('/tickets/1/time')
        .set('X-User-Id', '1')
        .send({ hours: 'lots' });
      expect(res.status).toBe(400);
    });

    it('returns 404 for a ticket that does not exist', async () => {
      const res = await request(app).get('/tickets/99999/time');
      expect(res.status).toBe(404);
    });
  });
