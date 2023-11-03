import { Server } from "socket.io";
import dotenv from "dotenv";
import { App as MicroWebSockets, TemplatedApp } from "uWebSockets.js";
import createLogger from 'logging';
import { createId, createSession, sessions, sockets, tryRemoveSession } from "../sessions";
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
            const room = createSession();
            const id = createId(room);
            log.info("[create]", id, room);
            sessions.get(room)!.push([socket, id]);
            sockets.set(socket, [room, id]);
            socket.join(room);
            cb({ room: room })
        });
    
        socket.on('hh:join-session', (props, cb) => {
            const session = sessions.get(props.room);
            if (!session) return cb({ success: false });
            const id = createId(props.room);
            log.info("[join]", id, props);
            session.push([socket, id]);
            sockets.set(socket, [props.room, id]);
            socket.join(props.room);
            cb({ success: true })
        });

        socket.on('hh:broadcast', (props) => {
            const session = sockets.get(socket);
            if (!session) return;
            const [room, id] = session;
            socket.broadcast.to(room).emit('hh:data', { id: id, ...props}, () => void 0);
        })

        socket.on('hh:request', (props, cb) => {
            const session = sockets.get(socket);
            if (!session) return;
            const [room, id] = session;
            let collaborators = sessions.get(room)!;
            let host = collaborators[0][0];
            if (!host) return cb({ data: null });
            host.emit('hh:data', { id: id, ...props}, cb);
        })

        socket.on('disconnect', () => {
            const session = sockets.get(socket);
            if (!session) return;
            const [room, id] = session;
            log.info("[disconnect]", id);
            socket.broadcast.to(room).emit('hh:user-disconnected', { id: id });
            const collaborators = sessions.get(room);
            if (!collaborators) return;
            const index = collaborators.findIndex(([_, _id]) => _id === id);
            if (index === -1) return;
            collaborators.splice(index, 1);
            tryRemoveSession(room);
        })
    });
}