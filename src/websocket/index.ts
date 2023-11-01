import { Server } from "socket.io";
import dotenv from "dotenv";
import { App as MicroWebSockets, TemplatedApp } from "uWebSockets.js";
import { ClientToServerEvents, ServerToClientEvents } from "./packets";
import createLogger from 'logging';
import { createToken } from "../sessions";

dotenv.config();

const log = createLogger('WebSocket');
const io = new Server<ClientToServerEvents, ServerToClientEvents>({
    transports: ["websocket", "polling"],
    cors: {
        allowedHeaders: ["Content-Type", "Authorization"],
        origin: process.env.CLIENT_ORIGIN, // TODO: change to harmonyhub.com
    }
});

export function setup(): TemplatedApp {
    log.info("Setting up websocket");
    const uws = MicroWebSockets();
    io.attachApp(uws);
    initEvents();
    return uws;
}

export function initEvents() {
    io.on("connection", (socket) => {
        socket.on('hh:create-session', (arg, cb) => {
            console.info("[create]", arg);
            let token = createToken();
            cb({ token: token })
        });
    
        socket.on('hh:join-session', (arg, cb) => {
            console.info("[join]", arg);
            cb({ success: true })
        })
    });
}