import express, { Request, Response, Application } from 'express';
import dotenv from "dotenv";
import http from 'http';
import cors from 'cors';
import createLogger from 'logging';
import { Server } from 'http';
import { createSession } from '../sessions';

dotenv.config();

const log = createLogger('WebServer');
const app: Application = express();

export function setup(): Server {
    log.info("Setting up webserver");
    app.use(express.json());
    app.use(cors({
        origin: process.env.CLIENT_ORIGIN,
        optionsSuccessStatus: 200
    }));
    initEndpoints();
    return http.createServer(app);
}

export function initEndpoints() {
    app.get('/', (req: Request, res: Response) => {
        res.send('Welcome to Express & TypeScript Server');
    });

    app.get('/new', (req: Request, res: Response) => {
        const token = createSession();
        res.send(token);
    });
}