import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bodyParser from 'body-parser';
import { read, write } from "./tools/json-files.js";

const app = express();
app.use(bodyParser.json());

// Configure Passport for Basic Authentication
passport.use(new BasicStrategy(
    async (userName, password, done) => {
        try {
            const users = await read("users.json");
            const user = users.find(u => u.userName === userName);
            if (!user) {
                console.log('User not found');
                return done(null, false);
            }
            const isMatch = await bcrypt.compare(password, user.password);
            return isMatch ? done(null, user) : (console.log('Wrong password'), done(null, false));
        } catch (error) {
            return done(error);
        }
    }
));

// Configure Passport for JWT Authentication
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'SecretKey'
};
passport.use(new JwtStrategy(jwtOptions, (jwt_payload, done) => {
    done(null, jwt_payload);
}));
app.use(passport.initialize());

// Authentication Endpoint
app.post('/authenticate', passport.authenticate('basic', { session: false }), (req, res) => {
    const token = jwt.sign({ subject: req.user.userName, roles: req.user.roles },
        'SecretKey', { expiresIn: '1d' });
    res.status(200).json({ token });
});

// Questions Retrieval Endpoint
app.get('/questions', async (req, res) => {
    try {
        const questions = await read("questions.json");
        res.json(questions.map(({ id, question, options }) => ({ id, question, options })));
    } catch (error) {
        res.status(404).json({ message: 'Questions not found', error });
    }
});

// Single Question Retrieval Endpoint
app.get('/questions/:questionId', async (req, res) => {
    try {
        const questions = await read("questions.json");
        const question = questions.find(q => q.id === req.params.questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json({ id: question.id, question: question.question, options: question.options });
    } catch (error) {
        res.status(404).json({ message: 'Error retrieving question', error });
    }
});

// Middleware for checking JWT Authentication
const isAuthenticated = passport.authenticate('jwt', { session: false });

// Endpoint for creating a new game session
app.post('/game-runs', isAuthenticated, async (req, res) => {
    let gameRuns = await read('game-runs.json');
    const newGameRun = { id: uuidv4(), userName: req.user.subject, createdAt: Date.now(), responses: {} };
    gameRuns.push(newGameRun);
    await write('game-runs.json', gameRuns);
    res.status(201).json({ runId: newGameRun.id, userName: newGameRun.userName });
});

// Endpoint for updating responses in a game run
app.put('/game-runs/:runId/responses', isAuthenticated, async (req, res) => {
    let gameRuns = await read('game-runs.json');
    const gameRun = gameRuns.find(run => run.id === req.params.runId);
    if (!gameRun || gameRun.userName !== req.user.subject) {
        return res.status(403).json({ message: 'Unauthorized or run not found' });
    }
    gameRun.responses[req.body.questionId] = req.body.answerIndex;
    await write('game-runs.json', gameRuns);
    res.json({ message: 'Responses updated', gameRun });
});

// Endpoint for getting game run results
app.get("/game-runs/:runId/results", isAuthenticated, async (req, res) => {
    let gameRuns = await read('game-runs.json');
    const gameRun = gameRuns.find(run => run.id === req.params.runId && run.userName === req.user.subject);
    if (!gameRun) {
        return res.status(403).json({ message: 'Run not found or unauthorized' });
    }
    let questions = await read('questions.json');
    const results = Object.keys(gameRun.responses).reduce((acc, key) => {
        const question = questions.find(q => q.id === key);
        acc[key] = question.correctAnswer === gameRun.responses[key];
        return acc;
    }, {});
    res.json({ id: gameRun.id, userName: gameRun.userName, createdAt: gameRun.createdAt, results });
});

export default app;
