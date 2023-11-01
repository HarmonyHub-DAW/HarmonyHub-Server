import { Server } from "socket.io";
import dotenv from "dotenv";
import { App as MicroWebSockets, TemplatedApp } from "uWebSockets.js";
import createLogger from 'logging';
import { createSession, sessions, sockets, tryRemoveSession } from "../sessions";
import { ClientToServerEvents, ServerToClientEvents } from "./packets";

dotenv.config();

const log = createLogger('WebSocket');

export const io = new Server<ClientToServerEvents, ServerToClientEvents>({
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
        socket.on('hh:create-session', (_, cb) => {
            let room = createSession();
            log.info("[create]", socket.id, room);
            sessions.get(room)!.push(socket);
            sockets.set(socket, room);
            socket.join(room);
            cb({ room: room })
        });
    
        socket.on('hh:join-session', (props, cb) => {
            log.info("[join]", socket.id, props);
            let session = sessions.get(props.room);
            if (!session) return cb({ success: false });
            session.push(socket);
            sockets.set(socket, props.room);
            socket.join(props.room);
            cb({ success: true })
        });

        socket.on('hh:broadcast', (props) => {
            // broadcast to all sockets in the room
            socket.broadcast.emit('hh:broadcast', props);
        })

        socket.on('hh:request', (props, cb) => {
            let room = sockets.get(socket)!;
            let collaborators = sessions.get(room)!;
            let host = collaborators[0];
            if (!host) return cb({ data: null });
            host.emit('hh:request', props, cb);
        })

        socket.on('disconnect', () => {
            log.info("[disconnect]", socket.id);
            let room = sockets.get(socket);
            if (!room) return;
            let collaborators = sessions.get(room);
            if (!collaborators) return;
            let index = collaborators.indexOf(socket);
            if (index === -1) return;
            collaborators.splice(index, 1);
            tryRemoveSession(room);
        })
    });
}