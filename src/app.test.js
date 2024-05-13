import request from 'supertest';
import app from './app'; 

let token; 

beforeAll(async () => {
    const authResponse = await request(app)
        .post('/authenticate')
        .auth('Max', '123')
        .expect(200);

    token = authResponse.body.token;
});

describe('API Test Suite', () => {
    test('POST /authenticate - Authenticate User', async () => {
        const response = await request(app)
            .post('/authenticate')
            .auth('Max', '123')
            .expect(200);

        expect(response.body).toHaveProperty('token'); 
    });

    test('GET /questions - Fetch All Questions', async () => {
        const response = await request(app)
            .get('/questions')
            .set('Authorization', `Bearer ${token}`) 
            .expect(200);

        expect(response.body).toBeInstanceOf(Array); 
    });

    test('GET /questions/{questionId} - Fetch Specific Question', async () => {
        const response = await request(app)
            .get('/questions/0c09e601-3f13-4d46-8895-6a03fff9d669')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveProperty('id', '0c09e601-3f13-4d46-8895-6a03fff9d669'); 
    });

    test('POST /game-runs - Create Game Run', async () => {
        const response = await request(app)
            .post('/game-runs')
            .set('Authorization', `Bearer ${token}`)
            .expect(201); 

        expect(response.body).toHaveProperty('runId');
        expect(response.body).toHaveProperty('userName'); 
    });

    test('PUT /game-runs/{runId}/responses - Update Game Run Responses', async () => {
        const gameRunResponse = await request(app)
            .post('/game-runs')
            .set('Authorization', `Bearer ${token}`)
            .expect(201);

        const { runId } = gameRunResponse.body; 

        const response = await request(app)
            .put(`/game-runs/${runId}/responses`)
            .set('Authorization', `Bearer ${token}`)
            .send({ runId: '227757b1-553a-451d-b810-2b13af849795', answerIndex: '0' })
            .expect(200);

        expect(response.body).toHaveProperty('gameRun.id', runId);
    });

    test('GET /game-runs/{runId}/results - Fetch Game Run Results', async () => {
        const gameRunResponse = await request(app)
            .post('/game-runs')
            .set('Authorization', `Bearer ${token}`)
            .expect(201);

        const { runId } = gameRunResponse.body; 

        const response = await request(app)
            .get(`/game-runs/${runId}/results`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveProperty('id', runId); 
    });
});
