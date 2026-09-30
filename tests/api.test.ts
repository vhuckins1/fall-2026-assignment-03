import { describe, it, expect, beforeEach} from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { seed } from '../src/db/seed.js';

beforeEach(async () => {
  await seed();
})

describe('Part 1: API Integration Tests', () => {
    // TODO: Student implementation - Part 1: Integration Testing
    // Test user creation (POST /users)
    describe('POST /users ',  () => {
      it ('should create a user with valid info', async () => {
        const res = 
        await request(app)
        .post('/users')
        .set("X-User-Id", '1')
        .send({name : "vincent", email : "vhuckins@charlotte.edu"});
        expect(res.status).toBe(201);
      });

      it ('should fail with no info', async () => {
        const res = 
        await request(app)
        .post('/users')
        .set("X-User-Id", '1');
        expect(res.status).toBe(400);
      });

      it ('should fail with no email', async () => {
        const res = 
        await request(app)
        .post('/users')
        .set("X-User-Id", "1")
        .send({name : "vincent"});
        expect(res.status).toBe(400);
      });

      it ('should fail with no name', async () => {
        const res = 
        await request(app)
        .post('/users')
        .set("X-User-Id", "1")
        .send({email : "vhuckins@charlotte.edu"});
        expect(res.status).toBe(400);
      });

      it ('should fail with no user id', async () => {
        const res = 
        await request(app)
        .post('/users');
        expect(res.status).toBe(401);
      });

      it ('should fail with invalid user id', async () => {
        const res = 
        await request(app)
        .post('/users')
        .set("X-User-Id",'a');
        expect(res.status).toBe(401);
      });
    });

    // Test ticket creation (POST /tickets)


    describe('POST /tickets', () => {

      it('should create a ticket with valid info', async () => {
        const res =  
        await request(app)
        .post('/tickets')
        .set("X-User-Id", '1')
        .send({title : "ticket", description : "i am a ticket"});
        expect(res.status).toBe(201);
      });

      it('should fail without title', async () => {
        const res = 
        await request(app)
        .post('/tickets')
        .set("X-User-Id", '1')
        .send({description : "i am a ticket"});
        expect(res.status).toBe(400);
      });

      it('should fail without creator id', async () => {
        const res = await request(app)
        .post('/tickets')
        .send({title : "ticket", description : "i am a ticket"});
        expect(res.status).toBe(401);
      });

      it('should fail with invalid creator id', async () => {
        const res = await request(app)
        .post('/tickets')
        .send({title : "ticket", description : "i am a ticket"})
        .set("X-User-Id",'a');
        expect(res.status).toBe(401);
      });

      it('should pass with just title and creator id', async () => {
        const res = await
        request(app)
        .post('/tickets')
        .set("X-User-Id", '1')
        .send({title : "ticket"});
        expect(res.status).toBe(201);
      });
    });
    // Test auth middleware rejection (401 when X-User-Id is missing or invalid) (done in other parts)
    // Test 404 responses for non-existent users and tickets
    describe('/GET user and tickets 404 testing', () => {
      it('should send 404 when user not found', async () => {
        const res = await request(app).get('/users/30');
        expect(res.status).toBe(404);
      });

      it('should send 404 when user not found', async () => {
        const res = await request(app).get('/tickets/30');
        expect(res.status).toBe(404);
      });
    });
    // Test pagination and filtering on GET /tickets

    describe('/GET ticket filtering', () => {
      it('should return all tickets with no queries passed', async () => {
        const res = await request(app).get('/tickets');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(25);
      })

      it('should only show 5 with limit 5', async () => {
        const res = await request(app).get('/tickets?limit=5');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(5);
      });

      it('should only show 5 with offest 20 (skipping 20 out of 25)', async () => {
        const res = await request(app).get('/tickets?offset=20');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(5);
      });

      it('should get tickets 16 - 20 with offest 15 and limit 5', async () => {
        const res = await request(app).get('/tickets?offset=15&limit=5');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(5);
        const ids = res.body.map((ticket: { id: number }) => ticket.id);
        expect(ids).toEqual([16,17,18,19,20])
      });
    });
  });
